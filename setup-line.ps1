$ErrorActionPreference = "Stop"

# ===== 1) lib/line.ts =====
@'
import { prisma } from "@/lib/prisma";

export async function getLineSettings() {
  return prisma.settings.findUnique({ where: { id: "singleton" } });
}

export async function sendLineSummary(text: string) {
  const settings = await getLineSettings();
  const token = settings?.lineChannelAccessToken;
  const groupId = settings?.lineGroupId;

  if (!token || !groupId) {
    console.warn("lineChannelAccessToken หรือ lineGroupId ยังไม่ได้ตั้งค่า ข้ามการแจ้งเตือน");
    return;
  }

  try {
    const res = await fetch("https://api.line.me/v2/bot/message/push", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        to: groupId,
        messages: [{ type: "text", text }],
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error("LINE push failed:", res.status, body);
    }
  } catch (err) {
    console.error("LINE push error:", err);
  }
}
'@ | Set-Content -Path "lib\line.ts" -Encoding utf8
Write-Host "✅ เขียนไฟล์ lib/line.ts สำเร็จ" -ForegroundColor Green


# ===== 2) app/admin/settings/actions.ts =====
@'
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
    "🏸 ทดสอบการเชื่อมต่อ Telegram จากระบบ SierraBad สำเร็จแล้ว!"
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
      `https://api.telegram.org/bot${trimmed}/getUpdates`
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
    "🏸 ทดสอบการเชื่อมต่อ LINE จากระบบ SierraBad สำเร็จแล้ว!"
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
'@ | Set-Content -Path "app\admin\settings\actions.ts" -Encoding utf8
Write-Host "✅ เขียนไฟล์ app/admin/settings/actions.ts สำเร็จ" -ForegroundColor Green


# ===== 3) app/admin/settings/LineSettingsForm.tsx (ไฟล์ใหม่) =====
@'
"use client";

import { useState } from "react";
import { updateLineSettings } from "./actions";

export default function LineSettingsForm({
  initialToken,
  initialGroupId,
}: {
  initialToken: string;
  initialGroupId: string;
}) {
  const [token, setToken] = useState(initialToken);
  const [groupId, setGroupId] = useState(initialGroupId);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    const formData = new FormData();
    formData.set("lineChannelAccessToken", token);
    formData.set("lineGroupId", groupId);
    await updateLineSettings(formData);
    setIsSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <form onSubmit={handleSave} className="space-y-3 mb-4">
      <div>
        <label className="block text-xs font-bold text-lime-700 mb-1.5">
          Channel Access Token
        </label>
        <input
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="วาง Channel access token ที่นี่"
          className="w-full px-4 py-2.5 rounded-xl border border-lime-100 bg-lime-50/60 text-sm font-mono"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-lime-700 mb-1.5">
          Group ID
        </label>
        <input
          value={groupId}
          onChange={(e) => setGroupId(e.target.value)}
          placeholder="Uxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
          className="w-full px-4 py-2.5 rounded-xl border border-lime-100 bg-lime-50/60 text-sm font-mono"
        />
      </div>

      {saved && (
        <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
          บันทึกการตั้งค่าสำเร็จแล้ว
        </p>
      )}

      <button
        type="submit"
        disabled={isSaving}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-lime-600 to-lime-500 text-white font-bold text-sm shadow hover:shadow-md transition-shadow disabled:opacity-60"
      >
        {isSaving ? "กำลังบันทึก..." : "บันทึกการตั้งค่า LINE"}
      </button>
    </form>
  );
}
'@ | Set-Content -Path "app\admin\settings\LineSettingsForm.tsx" -Encoding utf8
Write-Host "✅ เขียนไฟล์ app/admin/settings/LineSettingsForm.tsx สำเร็จ" -ForegroundColor Green


# ===== 4) app/admin/settings/TestLineButton.tsx (ไฟล์ใหม่) =====
@'
"use client";

import { useState, useTransition } from "react";
import { testLineMessage } from "./actions";

export default function TestLineButton() {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<string | null>(null);

  function handleTest() {
    setResult(null);
    startTransition(async () => {
      await testLineMessage();
      setResult("ส่งข้อความทดสอบแล้ว เช็คในกลุ่ม LINE ของคุณ");
    });
  }

  return (
    <div className="mt-2">
      <button
        onClick={handleTest}
        disabled={isPending}
        className="w-full py-2.5 rounded-xl bg-white border-2 border-lime-300 text-lime-700 font-bold text-sm hover:bg-lime-50 transition-colors disabled:opacity-60"
      >
        {isPending ? "กำลังส่ง..." : "🟢 ทดสอบส่งข้อความ LINE"}
      </button>
      {result && (
        <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2 mt-2">
          {result}
        </p>
      )}
    </div>
  );
}
'@ | Set-Content -Path "app\admin\settings\TestLineButton.tsx" -Encoding utf8
Write-Host "✅ เขียนไฟล์ app/admin/settings/TestLineButton.tsx สำเร็จ" -ForegroundColor Green


# ===== 5) app/admin/settings/page.tsx =====
@'
import TopBar from "@/components/TopBar";
import Footer from "@/components/Footer";
import ChangePasswordForm from "./ChangePasswordForm";
import TestTelegramButton from "./TestTelegramButton";
import TelegramSettingsForm from "./TelegramSettingsForm";
import LineSettingsForm from "./LineSettingsForm";
import TestLineButton from "./TestLineButton";
import TestEmailButton from "./TestEmailButton";
import { getTelegramSettingsForForm, updateEmailSettings } from "./actions";

const fontStack =
  "'Noto Sans Thai', Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

export default async function AdminSettingsPage() {
  const settings = await getTelegramSettingsForForm();

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="anonymous"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700;800&display=swap"
        rel="stylesheet"
      />
      <div
        className="min-h-screen flex flex-col bg-gradient-to-b from-[#FBF8FF] to-[#F3EAFF] p-4 sm:p-6"
        style={{ fontFamily: fontStack }}
      >
        <TopBar zone="ตั้งค่าระบบ" backHref="/admin" backLabel="กลับ Dashboard" />

        <div className="max-w-2xl mx-auto w-full flex-1 space-y-6">
          <h1 className="text-xl sm:text-2xl font-bold text-[#3B0764]">
            ตั้งค่าระบบ
          </h1>

          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="font-bold text-[#3B0764] mb-1">
              เปลี่ยนรหัสผ่านของตัวเอง
            </h2>
            <p className="text-xs text-gray-500 mb-4">
              ต้องกรอกรหัสผ่านเดิมให้ถูกต้องก่อนถึงจะเปลี่ยนได้
            </p>
            <ChangePasswordForm />
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="flex items-center gap-2 font-bold text-[#3B0764] mb-1">
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-sky-500" fill="currentColor">
                <path d="M21.5 4.5 2.7 11.9c-1.2.5-1.2 1.2-.2 1.5l4.8 1.5 1.8 5.6c.2.6.5.8.9.8.5 0 .7-.2 1-.5l2.4-2.3 4.9 3.6c.9.5 1.6.2 1.8-.8l3.3-15.4c.3-1.2-.5-1.8-1.9-1.4Z" />
              </svg>
              การแจ้งเตือนผ่าน Telegram
            </h2>
            <p className="text-xs text-gray-500 mb-4">
              เมื่อตั้งค่าแล้ว ระบบจะส่งสรุปก๊วนเข้า Telegram ทุกครั้งที่กด &quot;ปิดก๊วน&quot;
            </p>

            <div className="bg-sky-50/60 border border-sky-100 rounded-xl px-4 py-3 mb-4 text-xs text-sky-800 leading-relaxed space-y-1.5">
              <p className="font-bold">วิธีตั้งค่า (ทำครั้งเดียว ใช้เวลา ~1 นาที):</p>
              <p>
                1. เปิด Telegram แชทหา{" "}
                <span className="font-semibold">@BotFather</span> พิมพ์{" "}
                <span className="font-mono bg-white px-1 rounded">/newbot</span>{" "}
                แล้วตั้งชื่อบอทตามที่ต้องการ
              </p>
              <p>
                2. BotFather จะให้ &quot;Token&quot; มา (ยาวประมาณ 45 ตัวอักษร)
                คัดลอกมาแปะช่อง &quot;Bot Token&quot; ด้านล่าง
              </p>
              <p>
                3. เพิ่มบอทเข้ากลุ่ม/แชทที่ต้องการรับแจ้งเตือน แล้วส่งข้อความ
                อะไรก็ได้ในนั้น 1 ครั้ง
              </p>
              <p>
                4. กดปุ่ม &quot;ดึง Chat ID อัตโนมัติ&quot; ด้านล่าง — ระบบจะหา
                Chat ID ให้เอง ไม่ต้องเปิดลิงก์หรืออ่าน JSON เอง
              </p>
            </div>

            <TelegramSettingsForm
              initialToken={settings?.telegramBotToken ?? ""}
              initialChatId={settings?.telegramChatId ?? ""}
            />

            <TestTelegramButton />

            <div className="border-t border-gray-100 my-6" />

            <h2 className="flex items-center gap-2 font-bold text-[#3B0764] mb-1">
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-lime-600" fill="currentColor">
                <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.813 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08 0 0-.14.848-.171 1.027-.053.303-.242 1.186 1.031.647 1.273-.54 6.867-4.045 9.375-6.93C23.15 14.606 24 12.548 24 10.314" />
              </svg>
              การแจ้งเตือนผ่าน LINE
            </h2>
            <p className="text-xs text-gray-500 mb-4">
              ใช้ Channel access token และ Group ID จาก LINE Developers Console —
              กรอกครั้งเดียวที่นี่ ไม่ต้องไปตั้งค่าใน Vercel อีกต่อไป
            </p>

            <div className="bg-lime-50/60 border border-lime-100 rounded-xl px-4 py-3 mb-4 text-xs text-lime-800 leading-relaxed space-y-1.5">
              <p className="font-bold">วิธีหา 2 ค่านี้:</p>
              <p>
                1. เข้า{" "}
                <span className="font-semibold">developers.line.biz/console</span>{" "}
                → เลือก Provider/Channel → แท็บ Messaging API
              </p>
              <p>
                2. หัวข้อ &quot;Channel access token&quot; → กด Issue/Reissue →
                คัดลอกมาแปะช่องด้านล่าง
              </p>
              <p>
                3. Group ID หาได้จาก log ตอนบอทถูกเพิ่มเข้ากลุ่ม หรือจากระบบ
                webhook ที่มีอยู่แล้วในโปรเจกต์
              </p>
            </div>

            <LineSettingsForm
              initialToken={settings?.lineChannelAccessToken ?? ""}
              initialGroupId={settings?.lineGroupId ?? ""}
            />

            <TestLineButton />
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="flex items-center gap-2 font-bold text-[#3B0764] mb-1">
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="m3 7 9 6 9-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              รายงานสรุปทางอีเมล
            </h2>
            <p className="text-xs text-gray-500 mb-4">
              เมื่อตั้งค่าแล้ว ระบบจะส่งรายงานสรุปแบบละเอียด (รายแมทช์
              เบอร์ลูก เรตคอร์ท และยอดจ่ายแต่ละคน) เข้าอีเมลนี้อัตโนมัติ
              ทุกครั้งที่มีการปิดก๊วน
            </p>

            <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl px-4 py-3 mb-4 text-xs text-emerald-800 leading-relaxed space-y-1.5">
              <p className="font-bold">วิธีตั้งค่า (ทำครั้งเดียว ใช้เวลา ~2 นาที):</p>
              <p>
                1. สมัครบัญชีฟรีที่{" "}
                <span className="font-semibold">resend.com</span> ด้วยอีเมลที่
                ต้องการรับรายงาน
              </p>
              <p>
                2. ในเมนู &quot;API Keys&quot; แล้วกด &quot;Create API
                Key&quot; คัดลอก Key มาแปะด้านล่าง
              </p>
              <p>
                3. ใส่อีเมลเดียวกันที่ใช้สมัคร Resend ในช่อง
                &quot;อีเมลรับรายงาน&quot; (บัญชีฟรีจะส่งได้เฉพาะอีเมลของ
                ตัวเองเท่านั้น จนกว่าจะยืนยันโดเมนของตัวเอง)
              </p>
            </div>

            <form action={updateEmailSettings} className="space-y-3 mb-4">
              <div>
                <label className="block text-xs font-bold text-emerald-700 mb-1.5">
                  Resend API Key
                </label>
                <input
                  name="resendApiKey"
                  defaultValue={settings?.resendApiKey ?? ""}
                  placeholder="re_xxxxxxxxxxxxxxxxxxxxxxxx"
                  className="w-full px-4 py-2.5 rounded-xl border border-emerald-100 bg-emerald-50/60 text-sm font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-emerald-700 mb-1.5">
                  อีเมลรับรายงาน
                </label>
                <input
                  name="notificationEmail"
                  type="email"
                  defaultValue={settings?.notificationEmail ?? ""}
                  placeholder="you@example.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-emerald-100 bg-emerald-50/60 text-sm"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-bold text-sm shadow hover:shadow-md transition-shadow"
              >
                บันทึกการตั้งค่า
              </button>
            </form>

            <TestEmailButton />
          </div>
        </div>

        <div className="w-full max-w-2xl mx-auto">
          <Footer />
        </div>
      </div>
    </>
  );
}
'@ | Set-Content -Path "app\admin\settings\page.tsx" -Encoding utf8
Write-Host "✅ เขียนไฟล์ app/admin/settings/page.tsx สำเร็จ" -ForegroundColor Green

Write-Host "`n🎉 เขียนไฟล์ครบทั้ง 5 ไฟล์เรียบร้อยแล้ว" -ForegroundColor Cyan