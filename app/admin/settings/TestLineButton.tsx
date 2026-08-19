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
        {isPending ? "กำลังส่ง..." : "ทดสอบส่งข้อความ LINE"}
      </button>
      {result && (
        <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2 mt-2">
          {result}
        </p>
      )}
    </div>
  );
}
