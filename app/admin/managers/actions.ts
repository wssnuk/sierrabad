"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createManager(formData: FormData) {
  const username = (formData.get("username") as string)?.trim();
  const password = formData.get("password") as string;
  const name = (formData.get("name") as string)?.trim();
  if (!username || !password || !name) return;

  const hashed = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: { username, password: hashed, name, role: "MANAGER" },
  });

  revalidatePath("/admin/managers");
}

export async function updateManagerPassword(userId: string, formData: FormData) {
  const password = formData.get("password") as string;
  if (!password) return;

  const hashed = await bcrypt.hash(password, 10);
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashed },
  });

  revalidatePath("/admin/managers");
}
