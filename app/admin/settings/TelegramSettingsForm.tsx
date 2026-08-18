"use client";

import { useState, useTransition } from "react";
import { updateTelegramSettings, fetchLatestChatId } from "./actions";

export default function TelegramSettingsForm({
  initialToken,
  initialChatId,
}: {
  initialToken: string;
  initialChatId: string;
}) {
  const [token, setToken] = useState(initialToken);
  const [chatId, setChatId] = useState(initialChatId);
  const [fetchMsg, setFetchMsg] = useState<{ text: string; ok: boolean } | null>(
    null
  );
  const [isFetching, startFetch] = useTransition();
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function handleAutoFetch() {
    setFetchMsg(null);
    startFetch(async () => {
      const result = await fetchLatestChatId(token);
      if (result.error) {
        setFetchMsg({ text: result.error, ok: false });
      } else if (result.chatId) {
        setChatId(result.chatId);
        setFetchMsg({ text: `ดึง Chat ID สำเร็จ: ${result.chatId}`, ok: true });
      }
    });
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    const formData = new FormData();
    formData.set("telegramBotToken", token);
    formData.set("telegramChatId", chatId);
    await updateTelegramSettings(formData);
    setIsSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <form onSubmit={handleSave} className="space-y-3 mb-4">
      <div>
        <label className="block text-xs font-bold text-sky-700 mb-1.5">
          Bot Token
        </label>
        <input
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="เช่น 123456789:AAExxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
          className="w-full px-4 py-2.5 rounded-xl border border-sky-100 bg-sky-50/60 text-sm font-mono"
        />
      </div>

      <button
        type="button"
        onClick={handleAutoFetch}
        disabled={isFetching}
        className="w-full py-2.5 rounded-xl bg-white border-2 border-sky-300 text-sky-700 font-bold text-sm hover:bg-sky-50 transition-colors disabled:opacity-60"
      >
        {isFetching ? "กำลังค้นหา..." : "🔍 ดึง Chat ID อัตโนมัติ"}
      </button>
      {fetchMsg && (
        <p
          className={
            "text-xs rounded-lg px-3 py-2 " +
            (fetchMsg.ok
              ? "text-emerald-700 bg-emerald-50 border border-emerald-100"
              : "text-amber-700 bg-amber-50 border border-amber-100")
          }
        >
          {fetchMsg.text}
        </p>
      )}

      <div>
        <label className="block text-xs font-bold text-sky-700 mb-1.5">
          Chat ID
        </label>
        <input
          value={chatId}
          onChange={(e) => setChatId(e.target.value)}
          placeholder="กดปุ่มด้านบนเพื่อดึงอัตโนมัติ หรือกรอกเอง"
          className="w-full px-4 py-2.5 rounded-xl border border-sky-100 bg-sky-50/60 text-sm font-mono"
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
        className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-600 to-sky-500 text-white font-bold text-sm shadow hover:shadow-md transition-shadow disabled:opacity-60"
      >
        {isSaving ? "กำลังบันทึก..." : "บันทึกการตั้งค่า"}
      </button>
    </form>
  );
}
