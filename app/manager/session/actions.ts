"use server";

import { prisma } from "@/lib/prisma";
import { sendLineSummary } from "@/lib/line";
import { revalidatePath } from "next/cache";

function todayRange() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

export async function getTodaySession() {
  const { start, end } = todayRange();
  return prisma.session.findFirst({
    where: { date: { gte: start, lte: end }, status: "OPEN" },
    include: {
      checkIns: { include: { member: true } },
      games: {
        include: { players: { include: { member: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { date: "desc" },
  });
}

export async function createSession(formData: FormData) {
  const courtName = formData.get("courtName") as string;
  const shuttlePrice = Number(formData.get("shuttlePrice")) || 0;

  await prisma.session.create({
    data: { courtName, shuttlePrice, status: "OPEN" },
  });

  revalidatePath("/manager/session");
}

export async function updateSessionSettings(
  sessionId: string,
  formData: FormData
) {
  const courtName = formData.get("courtName") as string;
  const shuttlePrice = Number(formData.get("shuttlePrice"));
  if (!courtName) return;

  await prisma.session.update({
    where: { id: sessionId },
    data: { courtName, shuttlePrice: shuttlePrice || 0 },
  });
  revalidatePath("/manager/session");
}

export async function checkInMember(sessionId: string, memberId: string) {
  const existing = await prisma.checkIn.findFirst({
    where: { sessionId, memberId },
  });
  if (!existing) {
    await prisma.checkIn.create({ data: { sessionId, memberId } });
  }
  revalidatePath("/manager/session");
}

export async function addAndCheckInMember(sessionId: string, formData: FormData) {
  const name = (formData.get("name") as string)?.trim();
  const courtFee = Number(formData.get("courtFee")) || 0;
  if (!name) return;

  const member = await prisma.member.create({ data: { name, courtFee } });
  await prisma.checkIn.create({ data: { sessionId, memberId: member.id } });

  revalidatePath("/manager/session");
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

  if (!courtName) {
    const count = await prisma.game.count({ where: { sessionId } });
    courtName = `แมทช์ ${count + 1}`;
  }

  const game = await prisma.game.create({
    data: { sessionId, courtName, shuttleCount, shuttleNumber },
  });

  if (players.length > 0) {
    await prisma.gamePlayer.createMany({
      data: players.map((memberId) => ({ gameId: game.id, memberId, team: 0 })),
    });
  }

  revalidatePath("/manager/session");
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

  await prisma.game.update({
    where: { id: gameId },
    data: { courtName, shuttleCount, shuttleNumber },
  });

  await prisma.gamePlayer.deleteMany({ where: { gameId } });
  if (uniquePlayers.length > 0) {
    await prisma.gamePlayer.createMany({
      data: uniquePlayers.map((memberId) => ({ gameId, memberId, team: 0 })),
    });
  }

  revalidatePath("/manager/session");
}

export async function deleteGame(gameId: string) {
  await prisma.gamePlayer.deleteMany({ where: { gameId } });
  await prisma.game.delete({ where: { id: gameId } });
  revalidatePath("/manager/session");
}

export async function updateCheckInFee(checkInId: string, formData: FormData) {
  const value = formData.get("courtFeeOverride");
  const courtFeeOverride =
    value === null || value === "" ? null : Number(value);

  await prisma.checkIn.update({
    where: { id: checkInId },
    data: { courtFeeOverride },
  });

  revalidatePath("/manager/session");
}

export async function updateActuals(sessionId: string, formData: FormData) {
  const actualCourtFeePaidRaw = formData.get("actualCourtFeePaid");
  const actualShuttleCountRaw = formData.get("actualShuttleCount");

  await prisma.session.update({
    where: { id: sessionId },
    data: {
      actualCourtFeePaid:
        actualCourtFeePaidRaw === null || actualCourtFeePaidRaw === ""
          ? null
          : Number(actualCourtFeePaidRaw),
      actualShuttleCount:
        actualShuttleCountRaw === null || actualShuttleCountRaw === ""
          ? null
          : Number(actualShuttleCountRaw),
    },
  });

  revalidatePath("/manager/session");
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

  const totalShuttles =
    session.actualShuttleCount ??
    session.games.reduce((sum, g) => sum + g.shuttleCount, 0);
  const shuttleCost = totalShuttles * session.shuttlePrice;
  const memberCount = session.checkIns.length;
  const courtFeeCollected = session.checkIns.reduce(
    (sum, c) => sum + (c.courtFeeOverride ?? c.member.courtFee),
    0
  );
  const shuttleShare =
    memberCount > 0 ? Math.round(shuttleCost / memberCount) : 0;

  const gameCountByMember: Record<string, number> = {};
  session.games.forEach((g) => {
    g.players.forEach((p) => {
      gameCountByMember[p.memberId] = (gameCountByMember[p.memberId] || 0) + 1;
    });
  });

  const dateLabel = new Date(session.date).toLocaleDateString("th-TH", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Note: this summary intentionally excludes actual paid amounts and
  // profit/loss figures — those are for admin/manager eyes only, not
  // shared with members via LINE.
  const memberLines = session.checkIns
    .map((c) => {
      const fee = c.courtFeeOverride ?? c.member.courtFee;
      const games = gameCountByMember[c.memberId] || 0;
      const total = fee + shuttleShare;
      return `• ${c.member.name} — ${games} เกมส์ · รวม ฿${total}`;
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
  if (message) {
    await sendLineSummary(message);
  }
}

export async function closeSession(sessionId: string) {
  await prisma.session.update({
    where: { id: sessionId },
    data: { status: "CLOSED" },
  });
  revalidatePath("/manager/session");
  revalidatePath("/manager");
  revalidatePath("/manager/history");
}
