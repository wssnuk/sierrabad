import { prisma } from "@/lib/prisma";

export async function getTelegramSettings() {
  return prisma.settings.findUnique({ where: { id: "singleton" } });
}

export async function sendTelegramMessage(text: string) {
  const settings = await getTelegramSettings();
  if (!settings?.telegramBotToken || !settings?.telegramChatId) return;

  try {
    await fetch(
      `https://api.telegram.org/bot${settings.telegramBotToken}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: settings.telegramChatId,
          text,
        }),
      }
    );
  } catch {
    // Telegram is a secondary/optional channel — a failure here should
    // never block the rest of the app from working.
  }
}
