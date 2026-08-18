"use client";

import { useState } from "react";
import { testEmailAction } from "./actions";

export default function TestEmailButton() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );
  const [errorMsg, setErrorMsg] = useState("");

  async function handleTest() {
    setStatus("sending");
    const result = await testEmailAction();
    if (result.error) {
      setErrorMsg(result.error);
      setStatus("error");
    } else {
      setStatus("sent");
      setTimeout(() => setStatus("idle"), 4000);
    }
  }

  return (
    <div>
      <button
        onClick={handleTest}
        disabled={status === "sending"}
        className="w-full py-3 rounded-xl bg-white border-2 border-emerald-400 text-emerald-600 font-bold text-sm hover:bg-emerald-50 transition-colors disabled:opacity-60"
      >
        {status === "sending"
          ? "กำลังส่ง..."
          : status === "sent"
          ? "ส่งอีเมลทดสอบแล้ว ✓ ลองเช็คกล่องจดหมาย"
          : "ส่งอีเมลทดสอบ"}
      </button>
      {status === "error" && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mt-2">
          {errorMsg}
        </p>
      )}
    </div>
  );
}
