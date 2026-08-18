import { prisma } from "@/lib/prisma";

export async function getTelegramSettings() {
  return prisma.settings.findUnique({ where: { id: "singleton" } });
}

async function sendTelegramHtml(text: string) {
  const settings = await getTelegramSettings();
  if (!settings?.telegramBotToken || !settings?.telegramChatId) return;

  try {
    const res = await fetch(
      `https://api.telegram.org/bot${settings.telegramBotToken}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: settings.telegramChatId,
          text,
          parse_mode: "HTML",
        }),
      }
    );
    const data = await res.json();
    if (!data.ok) {
      console.error("[telegram] API rejected message:", data);
    }
  } catch (err) {
    // Telegram is a secondary/optional channel — a failure here should
    // never block the rest of the app from working.
    console.error("[telegram] Failed to send message:", err);
  }
}

export async function sendTelegramMessage(text: string) {
  // Plain short summary (used elsewhere, e.g. matches the LINE message).
  // Escapes nothing since it's sent without parse_mode.
  const settings = await getTelegramSettings();
  if (!settings?.telegramBotToken || !settings?.telegramChatId) return;

  try {
    const res = await fetch(
      `https://api.telegram.org/bot${settings.telegramBotToken}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: settings.telegramChatId, text }),
      }
    );
    const data = await res.json();
    if (!data.ok) {
      console.error("[telegram] API rejected message:", data);
    }
  } catch (err) {
    console.error("[telegram] Failed to send message:", err);
  }
}

// Telegram's HTML parse_mode only supports a small tag set (b, i, u, s, a,
// code, pre) — no tables/CSS like the email report. We approximate the
// same level of detail using bold section headers and monospaced <pre>
// blocks so columns still line up.
function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function padEnd(s: string, len: number) {
  return s.length >= len ? s.slice(0, len) : s + " ".repeat(len - s.length);
}

export async function sendSessionSummaryTelegram(sessionId: string) {
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: {
      checkIns: { include: { member: true } },
      games: { include: { players: { include: { member: true } } } },
    },
  });
  if (!session) return;

  const dateLabel = new Date(session.date).toLocaleDateString("th-TH", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Bangkok",
  });

  const gameCountByMember: Record<string, number> = {};
  const shuttleShareByMember: Record<string, number> = {};
  session.games.forEach((g) => {
    const perPlayer = g.shuttleCount / 4;
    g.players.forEach((p) => {
      gameCountByMember[p.member.name] =
        (gameCountByMember[p.member.name] || 0) + 1;
      shuttleShareByMember[p.member.name] =
        (shuttleShareByMember[p.member.name] || 0) + perPlayer;
    });
  });

  const totalShuttles = session.games.reduce((sum, g) => sum + g.shuttleCount, 0);
  const shuttleCost = totalShuttles * session.shuttlePrice;
  const courtFeeCollected = session.checkIns.reduce(
    (sum, c) => sum + (c.courtFeeOverride ?? c.member.courtFee),
    0
  );

  const matchLines = session.games
    .map((g, i) => {
      const players = g.players.map((p) => esc(p.member.name)).join(", ");
      const numberPart = g.shuttleNumber ? ` · เบอร์ ${esc(g.shuttleNumber)}` : "";
      return `<b>${esc(g.courtName || `แมทช์ ${i + 1}`)}</b>\n${players}\n🏸 ${g.shuttleCount} ลูก${numberPart}`;
    })
    .join("\n\n");

  const memberTableRows = session.checkIns
    .map((c) => {
      const fee = c.courtFeeOverride ?? c.member.courtFee;
      const games = gameCountByMember[c.member.name] || 0;
      const khid = Math.round((shuttleShareByMember[c.member.name] || 0) * 4);
      const shuttleCostForMember = Math.round(
        (shuttleShareByMember[c.member.name] || 0) * session.shuttlePrice
      );
      const total = fee + shuttleCostForMember;
      return `${padEnd(c.member.name, 10)} ${String(games).padStart(2)}แมทช์ ${String(khid).padStart(2)}ขีด ฿${String(total).padStart(4)}`;
    })
    .join("\n");

  const profit =
    session.actualCourtFeePaid !== null
      ? courtFeeCollected - session.actualCourtFeePaid
      : null;

  const text =
    `🏸 <b>สรุปก๊วน ${esc(session.courtName)}</b>\n` +
    `📅 ${dateLabel}\n\n` +
    `👥 สมาชิก: ${session.checkIns.length} คน\n` +
    `🎯 แมทช์: ${session.games.length} แมทช์\n` +
    `🏸 ลูกแบดที่ใช้: ${totalShuttles} ลูก (฿${shuttleCost})\n\n` +
    `<b>🎯 รายละเอียดแมทช์</b>\n` +
    (matchLines || "ไม่มีแมทช์") +
    `\n\n<b>📋 สรุปรายคน</b>\n` +
    `<pre>${esc(memberTableRows) || "-"}</pre>\n` +
    `💰 เก็บจากสมาชิกรวม: ฿${courtFeeCollected}\n` +
    (session.actualCourtFeePaid !== null
      ? `💵 ค่าสนามจ่ายจริง: ฿${session.actualCourtFeePaid}\n` +
        `📊 กำไร/ขาดทุน: ${profit !== null && profit >= 0 ? "+" : ""}฿${profit}\n`
      : "") +
    (session.lastEditedBy ? `\n✅ ปิดก๊วนโดย ${esc(session.lastEditedBy)}` : "");

  await sendTelegramHtml(text);
}
