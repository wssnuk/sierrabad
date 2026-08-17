"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function deleteSessionHistory(sessionId: string) {
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

  revalidatePath("/manager/history");
}

// Automatically clears out closed history older than 7 days so the list
// doesn't grow forever. Runs lazily whenever the history page loads.
export async function cleanupOldHistory() {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 7);

  const oldSessions = await prisma.session.findMany({
    where: { status: "CLOSED", date: { lt: cutoff } },
    select: { id: true },
  });
  const ids = oldSessions.map((s) => s.id);
  if (ids.length === 0) return;

  const games = await prisma.game.findMany({
    where: { sessionId: { in: ids } },
    select: { id: true },
  });
  const gameIds = games.map((g) => g.id);

  if (gameIds.length > 0) {
    await prisma.gamePlayer.deleteMany({ where: { gameId: { in: gameIds } } });
    await prisma.game.deleteMany({ where: { sessionId: { in: ids } } });
  }
  await prisma.checkIn.deleteMany({ where: { sessionId: { in: ids } } });
  await prisma.session.deleteMany({ where: { id: { in: ids } } });
}
