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
