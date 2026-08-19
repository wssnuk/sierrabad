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
    return { error: "เธเธฃเธธเธ“เธฒเธเธฃเธญเธเธเนเธญเธกเธนเธฅเนเธซเนเธเธฃเธเธ—เธธเธเธเนเธญเธ" };
  }
  if (newPassword.length < 4) {
    return { error: "เธฃเธซเธฑเธชเธเนเธฒเธเนเธซเธกเนเธ•เนเธญเธเธกเธตเธเธงเธฒเธกเธขเธฒเธงเธญเธขเนเธฒเธเธเนเธญเธข 4 เธ•เธฑเธงเธญเธฑเธเธฉเธฃ" };
  }

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) {
    return { error: "เนเธกเนเธเธเธเธนเนเนเธเนเนเธเธฃเธฐเธเธ" };
  }

  const valid = await bcrypt.compare(oldPassword, user.password);
  if (!valid) {
    return { error: "เธฃเธซเธฑเธชเธเนเธฒเธเน€เธ”เธดเธกเนเธกเนเธ–เธนเธเธ•เนเธญเธ" };
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
    "๐ธ เธ—เธ”เธชเธญเธเธเธฒเธฃเน€เธเธทเนเธญเธกเธ•เนเธญ Telegram เธเธฒเธเธฃเธฐเธเธ SierraBad เธชเธณเน€เธฃเนเธเนเธฅเนเธง!"
  );
}

export type FetchChatIdResult = { chatId?: string; error?: string };

export async function fetchLatestChatId(
  token: string
): Promise<FetchChatIdResult> {
  const trimmed = token?.trim();
  if (!trimmed) {
    return { error: "เธเธฃเธธเธ“เธฒเธเธฃเธญเธ Bot Token เธเนเธญเธ" };
  }

  try {
    const res = await fetch(
      `https://api.telegram.org/bot${trimmed}/getUpdates`
    );
    const data = await res.json();

    if (!data.ok) {
      return { error: "Token เนเธกเนเธ–เธนเธเธ•เนเธญเธ เธเธฃเธธเธ“เธฒเธ•เธฃเธงเธเธชเธญเธเธญเธตเธเธเธฃเธฑเนเธ" };
    }

    const updates = data.result as Array<{
      message?: { chat?: { id: number } };
      channel_post?: { chat?: { id: number } };
    }>;

    if (!updates || updates.length === 0) {
      return {
        error:
          "เธขเธฑเธเนเธกเนเธเธเธเนเธญเธเธงเธฒเธก เธเธฃเธธเธ“เธฒเธชเนเธเธเนเธญเธเธงเธฒเธกเธซเธฒเธเธญเธ—เธซเธฃเธทเธญเธเธฅเธธเนเธกเธ—เธตเนเธ•เนเธญเธเธเธฒเธฃเธเนเธญเธ 1 เธเธฃเธฑเนเธ เนเธฅเนเธงเธเธ”เธเธธเนเธกเธเธตเนเธญเธตเธเธ—เธต",
      };
    }

    const last = updates[updates.length - 1];
    const chatId = last.message?.chat?.id ?? last.channel_post?.chat?.id;

    if (!chatId) {
      return {
        error: "เนเธกเนเธเธ Chat ID เธเธฃเธธเธ“เธฒเธฅเธญเธเธชเนเธเธเนเธญเธเธงเธฒเธกเนเธซเธกเนเนเธฅเนเธงเธเธ”เธเธธเนเธกเธเธตเนเธญเธตเธเธเธฃเธฑเนเธ",
      };
    }

    return { chatId: String(chatId) };
  } catch {
    return { error: "เน€เธเธทเนเธญเธกเธ•เนเธญ Telegram เนเธกเนเธชเธณเน€เธฃเนเธ เธเธฃเธธเธ“เธฒเธฅเธญเธเนเธซเธกเนเธญเธตเธเธเธฃเธฑเนเธ" };
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
    "๐ธ เธ—เธ”เธชเธญเธเธเธฒเธฃเน€เธเธทเนเธญเธกเธ•เนเธญ LINE เธเธฒเธเธฃเธฐเธเธ SierraBad เธชเธณเน€เธฃเนเธเนเธฅเนเธง!"
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
