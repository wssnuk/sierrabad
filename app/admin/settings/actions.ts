"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sendTelegramMessage } from "@/lib/telegram";
import { sendLineSummary } from "@/lib/line";
import { sendTestEmail as sendTestEmailLib } from "@/lib/email";
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
    return { error: "รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 4 ตัวอักษร" };
  }

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) {
    return { error: "ไม่พบผู้ใช้ในระบบ" };
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
    "ทดสอบการเชื่อมต่อ Telegram จากระบบ SierraBad สำเร็จแล้ว!"
  );
}

export type FetchChatIdResult = { chatId?: string; error?: string };

export async function fetchLatestChatId(
  token: string
): Promise<FetchChatIdResult> {
  const trimmed = token?.trim();
  if (!trimmed) {
    return { error: "กรุณากรอก Bot Token ก่อน" };
  }

  try {
    const res = await fetch(
      "https://api.telegram.org/bot" + trimmed + "/getUpdates"
    );
    const data = await res.json();

    if (!data.ok) {
      return { error: "Token ไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง" };
    }

    const updates = data.result as Array<{
      message?: { chat?: { id: number } };
      channel_post?: { chat?: { id: number } };
    }>;

    if (!updates || updates.length === 0) {
      return {
        error:
          "ยังไม่พบข้อความ กรุณาส่งข้อความหาบอทหรือกลุ่มที่ต้องการก่อน 1 ครั้ง แล้วกดปุ่มนี้อีกที",
      };
    }

    const last = updates[updates.length - 1];
    const chatId = last.message?.chat?.id ?? last.channel_post?.chat?.id;

    if (!chatId) {
      return {
        error: "ไม่พบ Chat ID กรุณาลองส่งข้อความใหม่แล้วกดปุ่มนี้อีกครั้ง",
      };
    }

    return { chatId: String(chatId) };
  } catch {
    return { error: "เชื่อมต่อ Telegram ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง" };
  }
}

export async function updateLineSettings(formData: FormData) {
  const lineChannelAccessToken =
    (formData.get("lineChannelAccessToken") as string)?.trim() || null;
  const lineGroupId = (formData.get("lineGroupId") as string)?.trim() || null;

  await prisma.settings.upsert({
    where: { id: "singleton" },
    update: { lineChannelAccessToken, lineGroupId },
    create: { id: "singleton", lineChannelAccessToken, lineGroupId },
  });

  revalidatePath("/admin/settings");
}

export async function testLineMessage() {
  await sendLineSummary(
    "ทดสอบการเชื่อมต่อ LINE จากระบบ SierraBad สำเร็จแล้ว!"
  );
}

export async function getEmailSettingsForForm() {
  return prisma.settings.findUnique({ where: { id: "singleton" } });
}

export async function updateEmailSettings(formData: FormData) {
  const resendApiKey = (formData.get("resendApiKey") as string)?.trim() || null;
  const notificationEmail =
    (formData.get("notificationEmail") as string)?.trim() || null;

  await prisma.settings.upsert({
    where: { id: "singleton" },
    update: { resendApiKey, notificationEmail },
    create: { id: "singleton", resendApiKey, notificationEmail },
  });

  revalidatePath("/admin/settings");
}

export async function testEmailAction() {
  return sendTestEmailLib();
}
