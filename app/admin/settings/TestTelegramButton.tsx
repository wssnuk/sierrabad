"use client";

import { useState } from "react";
import { testTelegramMessage } from "./actions";

export default function TestTelegramButton() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");

  async function handleTest() {
    setStatus("sending");
    await testTelegramMessage();
    setStatus("sent");
    setTimeout(() => setStatus("idle"), 3000);
  }

  return (
    <button
      onClick={handleTest}
      disabled={status === "sending"}
      className="w-full py-3 rounded-xl bg-white border-2 border-sky-400 text-sky-600 font-bold text-sm hover:bg-sky-50 transition-colors disabled:opacity-60"
    >
      {status === "sending"
        ? "กำลังส่ง..."
        : status === "sent"
        ? "ส่งข้อความทดสอบแล้ว ✓ ลองเช็คที่ Telegram"
        : "ส่งข้อความทดสอบ"}
    </button>
  );
}
