"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function addMember(formData: FormData) {
  const name = formData.get("name") as string;
  const courtFee = Number(formData.get("courtFee")) || 0;
  if (!name) return;

  await prisma.member.create({
    data: { name, courtFee },
  });

  revalidatePath("/manager/members");
}

export async function updateMember(memberId: string, formData: FormData) {
  const name = formData.get("name") as string;
  const courtFee = Number(formData.get("courtFee")) || 0;
  if (!name) return;

  await prisma.member.update({
    where: { id: memberId },
    data: { name, courtFee },
  });

  revalidatePath("/manager/members");
}

// Removes a member entirely, including their check-ins and game
// participation across every session (past and present). Used both from
// the Members management page and directly from the session page, so
// deleting a duplicate or mistaken entry from either place stays in sync.
export async function deleteMember(memberId: string) {
  await prisma.gamePlayer.deleteMany({ where: { memberId } });
  await prisma.checkIn.deleteMany({ where: { memberId } });
  await prisma.member.delete({ where: { id: memberId } });

  revalidatePath("/manager/members");
  revalidatePath("/manager/session");
}
