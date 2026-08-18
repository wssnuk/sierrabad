"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { sendLineSummary } from "@/lib/line";
import { sendSessionSummaryTelegram } from "@/lib/telegram";
import { sendSessionSummaryEmail } from "@/lib/email";
import { revalidatePath } from "next/cache";

function todayRange() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

const sessionInclude = {
  checkIns: { include: { member: true } },
  games: {
    include: { players: { include: { member: true } } },
    orderBy: { createdAt: "asc" as const },
  },
};

async function getEditorName() {
  const authSession = await auth();
  return authSession?.user?.name ?? "ไม่ทราบชื่อ";
}

async function deleteSessionCascade(sessionId: string) {
  const games = await prisma.game.findMany({
    where: { sessionId },
    select: { id: true },
  });
  const gameIds = games.map((g) => g.id);
  if (gameIds.length > 0) {
    await prisma.gamePlayer.deleteMany({ where: { gameId: { in: gameIds } } });
    await prisma.game.deleteMany({ where: { sessionId } });
  }
  await prisma.checkIn.deleteMany({ where: { sessionId } });
  await prisma.session.delete({ where: { id: sessionId } });
}

// Closes any session left OPEN from a previous day, regardless of owner —
// this is safe to run globally since an abandoned session should always
// be closed no matter whose it was.
export async function runGlobalMaintenance() {
  const { start } = todayRange();
  await prisma.session.updateMany({
    where: { status: "OPEN", date: { lt: start } },
    data: { status: "CLOSED" },
  });
}

// Duplicate-detection is scoped to a single manager's own sessions —
// two different managers legitimately having separate OPEN sessions today
// is normal now, not a duplicate.
async function dedupeForOwner(ownerName: string) {
  const { start, end } = todayRange();
  const openCount = await prisma.session.count({
    where: {
      status: "OPEN",
      date: { gte: start, lte: end },
      createdBy: ownerName,
    },
  });
  if (openCount <= 1) return;

  const openSessions = await prisma.session.findMany({
    where: {
      status: "OPEN",
      date: { gte: start, lte: end },
      createdBy: ownerName,
    },
    include: { checkIns: true, games: true },
    orderBy: { date: "asc" },
  });

  const sorted = [...openSessions].sort(
    (a, b) =>
      b.checkIns.length + b.games.length - (a.checkIns.length + a.games.length)
  );
  const keepId = sorted[0].id;

  for (const s of openSessions) {
    if (s.id !== keepId) {
      await deleteSessionCascade(s.id);
    }
  }
}

// With no id: returns the CURRENT manager's own open session for today
// only — never another manager's. Admins get the same private view here;
// they see everyone else's sessions only through the admin dashboard,
// which passes an explicit id.
// With an id: returns that specific session regardless of owner (used by
// admin dashboard links and by a manager returning to their own session).
export async function getSession(sessionId?: string) {
  await runGlobalMaintenance();

  if (sessionId) {
    return prisma.session.findUnique({
      where: { id: sessionId },
      include: sessionInclude,
    });
  }

  const ownerName = await getEditorName();
  await dedupeForOwner(ownerName);

  const { start, end } = todayRange();
  return prisma.session.findFirst({
    where: {
      date: { gte: start, lte: end },
      status: "OPEN",
      createdBy: ownerName,
    },
    include: sessionInclude,
    orderBy: { date: "desc" },
  });
}

export async function createSession(formData: FormData) {
  const courtName = formData.get("courtName") as string;
  const shuttlePrice = Number(formData.get("shuttlePrice")) || 0;

  const { start, end } = todayRange();
  const editorName = await getEditorName();
  const existing = await prisma.session.findFirst({
    where: {
      status: "OPEN",
      date: { gte: start, lte: end },
      createdBy: editorName,
    },
  });
  if (existing) {
    revalidatePath("/manager/session");
    revalidatePath("/admin");
    return;
  }

  await prisma.session.create({
    data: {
      courtName,
      shuttlePrice,
      status: "OPEN",
      createdBy: editorName,
      lastEditedBy: editorName,
      lastEditedAt: new Date(),
    },
  });

  revalidatePath("/manager/session");
  revalidatePath("/admin");
}

export async function updateSessionSettings(
  sessionId: string,
  formData: FormData
) {
  const courtName = formData.get("courtName") as string;
  const shuttlePrice = Number(formData.get("shuttlePrice"));
  if (!courtName) return;

  const editorName = await getEditorName();

  await prisma.session.update({
    where: { id: sessionId },
    data: {
      courtName,
      shuttlePrice: shuttlePrice || 0,
      lastEditedBy: editorName,
      lastEditedAt: new Date(),
    },
  });
  revalidatePath("/manager/session");
  revalidatePath("/admin");
}

export async function checkInMember(sessionId: string, memberId: string) {
  const editorName = await getEditorName();

  await Promise.all([
    prisma.checkIn.upsert({
      where: { sessionId_memberId: { sessionId, memberId } },
      update: {},
      create: { sessionId, memberId },
    }),
    prisma.session.update({
      where: { id: sessionId },
      data: { lastEditedBy: editorName, lastEditedAt: new Date() },
    }),
  ]);

  revalidatePath("/manager/session");
  revalidatePath("/admin");
}

export async function addAndCheckInMember(sessionId: string, formData: FormData) {
  const name = (formData.get("name") as string)?.trim();
  const courtFee = Number(formData.get("courtFee")) || 0;
  if (!name) return;

  const editorName = await getEditorName();
  const member = await prisma.member.create({ data: { name, courtFee } });

  await Promise.all([
    prisma.checkIn.create({ data: { sessionId, memberId: member.id } }),
    prisma.session.update({
      where: { id: sessionId },
      data: { lastEditedBy: editorName, lastEditedAt: new Date() },
    }),
  ]);

  revalidatePath("/manager/session");
  revalidatePath("/admin");
  revalidatePath("/manager/members");
}

export async function createGame(formData: FormData) {
  const sessionId = formData.get("sessionId") as string;
  let courtName = (formData.get("courtName") as string)?.trim();
  const shuttleCount = Number(formData.get("shuttleCount")) || 1;
  const shuttleNumber =
    (formData.get("shuttleNumber") as string)?.trim() || null;
  const players = Array.from(
    new Set(formData.getAll("players") as string[])
  );

  const editorName = await getEditorName();

  if (!courtName) {
    const count = await prisma.game.count({ where: { sessionId } });
    courtName = `แมทช์ ${count + 1}`;
  }

  const [game] = await Promise.all([
    prisma.game.create({
      data: { sessionId, courtName, shuttleCount, shuttleNumber },
    }),
    prisma.session.update({
      where: { id: sessionId },
      data: { lastEditedBy: editorName, lastEditedAt: new Date() },
    }),
  ]);

  if (players.length > 0) {
    await prisma.gamePlayer.createMany({
      data: players.map((memberId) => ({ gameId: game.id, memberId, team: 0 })),
    });
  }

  revalidatePath("/manager/session");
  revalidatePath("/admin");
}

export async function updateGame(
  gameId: string,
  playerIds: string[],
  formData: FormData
) {
  const courtName = (formData.get("courtName") as string)?.trim() || "แมทช์";
  const shuttleCount = Number(formData.get("shuttleCount")) || 1;
  const shuttleNumber =
    (formData.get("shuttleNumber") as string)?.trim() || null;
  const uniquePlayers = Array.from(new Set(playerIds));

  const editorName = await getEditorName();

  const [game] = await Promise.all([
    prisma.game.update({
      where: { id: gameId },
      data: { courtName, shuttleCount, shuttleNumber },
    }),
    prisma.gamePlayer.deleteMany({ where: { gameId } }),
  ]);

  await Promise.all([
    uniquePlayers.length > 0
      ? prisma.gamePlayer.createMany({
          data: uniquePlayers.map((memberId) => ({
            gameId,
            memberId,
            team: 0,
          })),
        })
      : Promise.resolve(),
    prisma.session.update({
      where: { id: game.sessionId },
      data: { lastEditedBy: editorName, lastEditedAt: new Date() },
    }),
  ]);

  revalidatePath("/manager/session");
  revalidatePath("/admin");
}

export async function deleteGame(gameId: string) {
  const [game, editorName] = await Promise.all([
    prisma.game.findUnique({ where: { id: gameId }, select: { sessionId: true } }),
    getEditorName(),
  ]);

  await Promise.all([
    prisma.gamePlayer.deleteMany({ where: { gameId } }),
    game
      ? prisma.session.update({
          where: { id: game.sessionId },
          data: { lastEditedBy: editorName, lastEditedAt: new Date() },
        })
      : Promise.resolve(),
  ]);
  await prisma.game.delete({ where: { id: gameId } });

  revalidatePath("/manager/session");
  revalidatePath("/admin");
}

export async function updateCheckInFee(checkInId: string, formData: FormData) {
  const value = formData.get("courtFeeOverride");
  const courtFeeOverride =
    value === null || value === "" ? null : Number(value);

  const editorName = await getEditorName();

  const checkIn = await prisma.checkIn.update({
    where: { id: checkInId },
    data: { courtFeeOverride },
  });

  await prisma.session.update({
    where: { id: checkIn.sessionId },
    data: { lastEditedBy: editorName, lastEditedAt: new Date() },
  });

  revalidatePath("/manager/session");
  revalidatePath("/admin");
}

export async function updateActuals(sessionId: string, formData: FormData) {
  const actualCourtFeePaidRaw = formData.get("actualCourtFeePaid");

  const editorName = await getEditorName();

  await prisma.session.update({
    where: { id: sessionId },
    data: {
      actualCourtFeePaid:
        actualCourtFeePaidRaw === null || actualCourtFeePaidRaw === ""
          ? null
          : Number(actualCourtFeePaidRaw),
      lastEditedBy: editorName,
      lastEditedAt: new Date(),
    },
  });

  revalidatePath("/manager/session");
  revalidatePath("/admin");
}

export async function removeCheckIn(checkInId: string) {
  const checkIn = await prisma.checkIn.delete({ where: { id: checkInId } });
  await prisma.session.update({
    where: { id: checkIn.sessionId },
    data: { lastEditedBy: await getEditorName(), lastEditedAt: new Date() },
  });
  revalidatePath("/manager/session");
  revalidatePath("/admin");
}

// Each game always has exactly 4 players, so each player's fair share of
// that game's shuttles is shuttleCount / 4. Summed across all games they
// actually played — not split equally among everyone checked in.
function computeMemberShuttleUsage(
  games: { shuttleCount: number; players: { memberId: string }[] }[]
) {
  const usage: Record<string, number> = {};
  games.forEach((g) => {
    const perPlayer = g.shuttleCount / 4;
    g.players.forEach((p) => {
      usage[p.memberId] = (usage[p.memberId] || 0) + perPlayer;
    });
  });
  return usage;
}

async function buildLineSummary(sessionId: string) {
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: {
      checkIns: { include: { member: true } },
      games: { include: { players: { include: { member: true } } } },
    },
  });

  if (!session) return null;

  const totalShuttles = session.games.reduce(
    (sum, g) => sum + g.shuttleCount,
    0
  );
  const shuttleCost = totalShuttles * session.shuttlePrice;
  const memberCount = session.checkIns.length;
  const courtFeeCollected = session.checkIns.reduce(
    (sum, c) => sum + (c.courtFeeOverride ?? c.member.courtFee),
    0
  );

  const gameCountByMember: Record<string, number> = {};
  const shuttleUsage = computeMemberShuttleUsage(session.games);
  session.games.forEach((g) => {
    g.players.forEach((p) => {
      gameCountByMember[p.memberId] = (gameCountByMember[p.memberId] || 0) + 1;
    });
  });

  const dateLabel = new Date(session.date).toLocaleDateString("th-TH", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Bangkok",
  });

  const memberLines = session.checkIns
    .map((c) => {
      const fee = c.courtFeeOverride ?? c.member.courtFee;
      const games = gameCountByMember[c.memberId] || 0;
      const shuttles = shuttleUsage[c.memberId] || 0;
      const shuttleCostForMember = Math.round(shuttles * session.shuttlePrice);
      const khid = Math.round(shuttles * 4);
      const total = fee + shuttleCostForMember;
      return `• ${c.member.name} — ${games} แมทช์ · ${khid} ขีด · รวม ฿${total}`;
    })
    .join("\n");

  return (
    `🏸 สรุปก๊วน ${session.courtName}\n` +
    `📅 วันที่ ${dateLabel}\n\n` +
    `👥 สมาชิกที่มา: ${memberCount} คน\n` +
    `🎯 จำนวนแมทช์: ${session.games.length} แมทช์\n` +
    `🏸 ลูกแบดที่ใช้: ${totalShuttles} ลูก (฿${shuttleCost})\n` +
    `💰 ยอดรวมค่าสนาม: ฿${courtFeeCollected}\n\n` +
    `📋 สรุปแต่ละคน:\n${memberLines || "-"}`
  );
}

export async function sendLineNow(sessionId: string) {
  const message = await buildLineSummary(sessionId);
  await Promise.all([
    message ? sendLineSummary(message) : Promise.resolve(),
    sendSessionSummaryTelegram(sessionId),
  ]);
}

export async function closeSession(sessionId: string) {
  const editorName = await getEditorName();

  await prisma.session.update({
    where: { id: sessionId },
    data: {
      status: "CLOSED",
      lastEditedBy: editorName,
      lastEditedAt: new Date(),
    },
  });

  // Auto-email the summary report. Never let an email failure block the
  // close-session flow — the session is already closed at this point.
  try {
    await sendSessionSummaryEmail(sessionId);
  } catch (err) {
    console.error("[closeSession] email step failed:", err);
  }

  revalidatePath("/manager/session");
  revalidatePath("/manager");
  revalidatePath("/manager/history");
  revalidatePath("/admin");
}
