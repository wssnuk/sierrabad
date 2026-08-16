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
