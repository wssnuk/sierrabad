import { Resend } from "resend";
import { prisma } from "@/lib/prisma";

type SessionWithData = {
  id: string;
  courtName: string;
  date: Date;
  shuttlePrice: number;
  actualCourtFeePaid: number | null;
  lastEditedBy: string | null;
  checkIns: {
    id: string;
    memberId: string;
    courtFeeOverride: number | null;
    member: { id: string; name: string; courtFee: number };
  }[];
  games: {
    id: string;
    courtName: string;
    shuttleCount: number;
    shuttleNumber: string | null;
    players: { member: { name: string } }[];
  }[];
};

function buildSessionReportHtml(session: SessionWithData) {
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

  const totalShuttles = session.games.reduce(
    (sum, g) => sum + g.shuttleCount,
    0
  );
  const shuttleCost = totalShuttles * session.shuttlePrice;
  const courtFeeCollected = session.checkIns.reduce(
    (sum, c) => sum + (c.courtFeeOverride ?? c.member.courtFee),
    0
  );
  const profit =
    session.actualCourtFeePaid !== null
      ? courtFeeCollected - session.actualCourtFeePaid
      : null;

  const memberRows = session.checkIns
    .map((c) => {
      const fee = c.courtFeeOverride ?? c.member.courtFee;
      const games = gameCountByMember[c.member.name] || 0;
      const khid = Math.round((shuttleShareByMember[c.member.name] || 0) * 4);
      const shuttleCostForMember = Math.round(
        (shuttleShareByMember[c.member.name] || 0) * session.shuttlePrice
      );
      const total = fee + shuttleCostForMember;
      return `<tr>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;">${c.member.name}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:center;">${games}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:center;">${khid} ขีด</td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;">฿${fee}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;font-weight:bold;color:#7C3AED;">฿${total}</td>
      </tr>`;
    })
    .join("");

  const matchRows = session.games
    .map((g, i) => {
      const players = g.players.map((p) => p.member.name).join(", ");
      return `<tr>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;">${g.courtName || `แมทช์ ${i + 1}`}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;">${players}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:center;">${g.shuttleCount} ลูก</td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:center;">${g.shuttleNumber || "-"}</td>
      </tr>`;
    })
    .join("");

  return `
  <div style="font-family: 'Noto Sans Thai', Arial, sans-serif; max-width: 640px; margin: 0 auto; color: #1f2937;">
    <div style="background: linear-gradient(135deg, #2A0A4A, #9333EA); padding: 24px; border-radius: 16px 16px 0 0; color: white;">
      <h1 style="margin:0; font-size: 20px;">🏸 สรุปก๊วน ${session.courtName}</h1>
      <p style="margin: 4px 0 0; opacity: 0.9; font-size: 14px;">วันที่ ${dateLabel}</p>
    </div>

    <div style="background: #FBF8FF; padding: 20px 24px;">
      <div style="display:flex; gap:12px; margin-bottom: 20px; flex-wrap: wrap;">
        <div style="background:white; border-radius:12px; padding:12px 16px; flex:1; min-width:120px;">
          <div style="font-size:11px; color:#6b7280;">สมาชิก</div>
          <div style="font-size:18px; font-weight:bold; color:#7C3AED;">${session.checkIns.length} คน</div>
        </div>
        <div style="background:white; border-radius:12px; padding:12px 16px; flex:1; min-width:120px;">
          <div style="font-size:11px; color:#6b7280;">แมทช์</div>
          <div style="font-size:18px; font-weight:bold; color:#7C3AED;">${session.games.length} แมทช์</div>
        </div>
        <div style="background:white; border-radius:12px; padding:12px 16px; flex:1; min-width:120px;">
          <div style="font-size:11px; color:#6b7280;">ลูกที่ใช้</div>
          <div style="font-size:18px; font-weight:bold; color:#7C3AED;">${totalShuttles} ลูก (฿${shuttleCost})</div>
        </div>
      </div>

      <h2 style="font-size:15px; color:#3B0764; margin-bottom:8px;">📋 สรุปรายคน</h2>
      <table style="width:100%; border-collapse:collapse; background:white; border-radius:12px; overflow:hidden; margin-bottom:20px;">
        <thead>
          <tr style="background:#F3E8FF;">
            <th style="padding:8px 12px; text-align:left; font-size:12px;">ชื่อ</th>
            <th style="padding:8px 12px; text-align:center; font-size:12px;">แมทช์</th>
            <th style="padding:8px 12px; text-align:center; font-size:12px;">ขีดที่ใช้</th>
            <th style="padding:8px 12px; text-align:right; font-size:12px;">ค่าสนาม</th>
            <th style="padding:8px 12px; text-align:right; font-size:12px;">รวม</th>
          </tr>
        </thead>
        <tbody>${memberRows}</tbody>
      </table>

      <h2 style="font-size:15px; color:#3B0764; margin-bottom:8px;">🎯 รายละเอียดแมทช์</h2>
      <table style="width:100%; border-collapse:collapse; background:white; border-radius:12px; overflow:hidden; margin-bottom:20px;">
        <thead>
          <tr style="background:#FCE7F3;">
            <th style="padding:8px 12px; text-align:left; font-size:12px;">แมทช์</th>
            <th style="padding:8px 12px; text-align:left; font-size:12px;">ผู้เล่น</th>
            <th style="padding:8px 12px; text-align:center; font-size:12px;">ลูกที่ใช้</th>
            <th style="padding:8px 12px; text-align:center; font-size:12px;">เบอร์ลูก</th>
          </tr>
        </thead>
        <tbody>${matchRows}</tbody>
      </table>

      <h2 style="font-size:15px; color:#3B0764; margin-bottom:8px;">💰 สรุปการเงิน (แอดมิน/ผู้จัดการเท่านั้น)</h2>
      <table style="width:100%; border-collapse:collapse; background:white; border-radius:12px; overflow:hidden; margin-bottom:20px;">
        <tr>
          <td style="padding:8px 12px; border-bottom:1px solid #eee;">เก็บจากสมาชิก</td>
          <td style="padding:8px 12px; border-bottom:1px solid #eee; text-align:right; font-weight:bold;">฿${courtFeeCollected}</td>
        </tr>
        <tr>
          <td style="padding:8px 12px; border-bottom:1px solid #eee;">ค่าสนามที่จ่ายจริง</td>
          <td style="padding:8px 12px; border-bottom:1px solid #eee; text-align:right; font-weight:bold;">${
            session.actualCourtFeePaid !== null
              ? `฿${session.actualCourtFeePaid}`
              : "ยังไม่กรอก"
          }</td>
        </tr>
        <tr>
          <td style="padding:8px 12px;">กำไร/ขาดทุน</td>
          <td style="padding:8px 12px; text-align:right; font-weight:bold; color:${
            profit === null ? "#6b7280" : profit >= 0 ? "#059669" : "#dc2626"
          };">${
            profit === null ? "ยังไม่กรอกยอดจริง" : `${profit >= 0 ? "+" : ""}฿${profit}`
          }</td>
        </tr>
      </table>

      <p style="font-size:12px; color:#9ca3af; text-align:center; margin-top:24px;">
        ปิดก๊วนโดย ${session.lastEditedBy ?? "ไม่ทราบชื่อ"} · ระบบ SierraBad
      </p>
    </div>
  </div>`;
}

export async function sendSessionSummaryEmail(sessionId: string) {
  const settings = await prisma.settings.findUnique({
    where: { id: "singleton" },
  });
  if (!settings?.resendApiKey || !settings?.notificationEmail) return;

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
    month: "short",
    year: "numeric",
    timeZone: "Asia/Bangkok",
  });

  try {
    const resend = new Resend(settings.resendApiKey);
    const result = await resend.emails.send({
      from: "SierraBad <onboarding@resend.dev>",
      to: settings.notificationEmail,
      subject: `🏸 สรุปก๊วน ${session.courtName} — ${dateLabel}`,
      html: buildSessionReportHtml(session),
    });
    // Resend's SDK resolves (doesn't throw) on API-level rejections — it
    // returns { error } instead. Must check this explicitly or failures
    // go completely unnoticed.
    if (result.error) {
      console.error(
        "[email] Resend rejected the session summary:",
        result.error
      );
    }
  } catch (err) {
    // Email is a secondary/optional channel — a failure here should never
    // block the close-session flow itself, but we still want it logged.
    console.error("[email] Failed to send session summary email:", err);
  }
}

export async function sendTestEmail() {
  const settings = await prisma.settings.findUnique({
    where: { id: "singleton" },
  });
  if (!settings?.resendApiKey || !settings?.notificationEmail) {
    return { error: "กรุณากรอก API Key และอีเมลก่อน" };
  }

  try {
    const resend = new Resend(settings.resendApiKey);
    const result = await resend.emails.send({
      from: "SierraBad <onboarding@resend.dev>",
      to: settings.notificationEmail,
      subject: "🏸 ทดสอบระบบส่งอีเมลจาก SierraBad",
      html: "<p>ทดสอบการเชื่อมต่อ Resend สำเร็จแล้ว! ระบบพร้อมส่งสรุปก๊วนเข้าอีเมลอัตโนมัติหลังปิดก๊วน</p>",
    });
    if (result.error) {
      return { error: result.error.message };
    }
    return { success: true };
  } catch {
    return { error: "ส่งอีเมลไม่สำเร็จ กรุณาตรวจสอบ API Key" };
  }
}
