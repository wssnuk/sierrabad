"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sendTelegramMessage } from "@/lib/telegram";
import { revalidatePath } from "next/cache";

export type ChangePasswordState = { error?: string; success?: boolean };

export async function changeMyPassword(
  _prevState: ChangePasswordState,
  formData: FormData
): Promise<ChangePasswordState> {
  const username = (formData.get("username") as string)?.trim();
  const oldPassword = formData.get("oldPassword") as string;
  const newPassword = formData.get("newPassword") as string;

  if (!username || !oldPassword || !newPassword) {
    return { error: "กรุณากรอกข้อมูลให้ครบทุกช่อง" };
  }
  if (newPassword.length < 4) {
    return { error: "รหัสผ่านใหม่ควรมีความยาวอย่างน้อย 4 ตัวอักษร" };
  }

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) {
    return { error: "ไม่พบชื่อผู้ใช้งานนี้ในระบบ" };
  }

  const valid = await bcrypt.compare(oldPassword, user.password);
  if (!valid) {
    return { error: "รหัสผ่านเดิมไม่ถูกต้อง" };
  }

  const hashed = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashed },
  });

  return { success: true };
}

export async function getTelegramSettingsForForm() {
  return prisma.settings.findUnique({ where: { id: "singleton" } });
}

export async function updateTelegramSettings(formData: FormData) {
  const telegramBotToken = (formData.get("telegramBotToken") as string)?.trim() || null;
  const telegramChatId = (formData.get("telegramChatId") as string)?.trim() || null;

  await prisma.settings.upsert({
    where: { id: "singleton" },
    update: { telegramBotToken, telegramChatId },
    create: { id: "singleton", telegramBotToken, telegramChatId },
  });

  revalidatePath("/admin/settings");
}

export async function testTelegramMessage() {
  await sendTelegramMessage(
    "🏸 ทดสอบการเชื่อมต่อ Telegram จากระบบ SierraBad สำเร็จแล้ว!"
  );
}
