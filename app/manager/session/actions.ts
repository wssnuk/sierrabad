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
      games: { include: { players: { include: { member: true } } } },
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

export async function checkInMember(sessionId: string, memberId: string) {
  const existing = await prisma.checkIn.findFirst({
    where: { sessionId, memberId },
  });
  if (!existing) {
    await prisma.checkIn.create({ data: { sessionId, memberId } });
  }
  revalidatePath("/manager/session");
}

export async function createGame(formData: FormData) {
  const sessionId = formData.get("sessionId") as string;
  const courtName = formData.get("courtName") as string;
  const shuttleCount = Number(formData.get("shuttleCount")) || 1;
  const team1 = formData.getAll("team1") as string[];
  const team2 = formData.getAll("team2") as string[];

  const game = await prisma.game.create({
    data: { sessionId, courtName, shuttleCount },
  });

  const players = [
    ...team1.map((memberId) => ({ gameId: game.id, memberId, team: 1 })),
    ...team2.map((memberId) => ({ gameId: game.id, memberId, team: 2 })),
  ];

  if (players.length > 0) {
    await prisma.gamePlayer.createMany({ data: players });
  }

  revalidatePath("/manager/session");
}

export async function closeSession(sessionId: string) {
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: {
      checkIns: { include: { member: true } },
      games: { include: { players: { include: { member: true } } } },
    },
  });

  if (session) {
    const totalShuttles = session.games.reduce(
      (sum, g) => sum + g.shuttleCount,
      0
    );
    const shuttleCost = totalShuttles * session.shuttlePrice;
    const memberCount = session.checkIns.length;
    const perPerson = memberCount > 0 ? Math.round(shuttleCost / memberCount) : 0;

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

    const memberLines = session.checkIns
      .map(
        (c) => `- ${c.member.name}: ${gameCountByMember[c.member.id] || 0} เกมส์`
      )
      .join("\n");

    const message =
      `สรุปก๊วน ${session.courtName}\n` +
      `วันที่ ${dateLabel}\n\n` +
      `สมาชิกที่มา: ${memberCount} คน\n` +
      `เกมส์ทั้งหมด: ${session.games.length} เกมส์\n` +
      `ลูกแบดที่ใช้: ${totalShuttles} ลูก (฿${shuttleCost})\n` +
      `เฉลี่ยต่อคน: ~฿${perPerson}\n\n` +
      `รายชื่อและจำนวนเกมส์:\n${memberLines || "-"}`;

    await sendLineSummary(message);
  }

  await prisma.session.update({
    where: { id: sessionId },
    data: { status: "CLOSED" },
  });
  revalidatePath("/manager/session");
  revalidatePath("/manager");
}
