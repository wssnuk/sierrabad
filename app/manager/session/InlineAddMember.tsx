"use client";

import { useState } from "react";
import { addAndCheckInMember } from "./actions";
import SubmitButton from "./SubmitButton";

export default function InlineAddMember({
  sessionId,
  existingNames,
}: {
  sessionId: string;
  existingNames: string[];
}) {
  const [name, setName] = useState("");
  const trimmed = name.trim();
  const isDuplicate = trimmed !== "" && existingNames.some((n) => n.trim() === trimmed);

  return (
    <form
      action={addAndCheckInMember.bind(null, sessionId)}
      className="flex gap-2 flex-wrap items-start"
    >
      <div className="flex-1 min-w-[140px]">
        <input
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="ชื่อ-นามสกุล / ชื่อเล่น"
          required
          className={
            "w-full px-3 py-2.5 rounded-lg border text-sm outline-none " +
            (isDuplicate
              ? "border-amber-400 bg-amber-50"
              : "border-purple-100 bg-purple-50")
          }
        />
        {isDuplicate && (
          <p className="text-xs text-amber-600 mt-1 font-medium">
            ⚠ มีชื่อนี้ในระบบอยู่แล้ว ลองตั้งชื่อให้ต่างกัน
            (เช่น ใส่นามสกุลย่อ) เพื่อไม่ให้คิดเงินหรือนับเกมส์ผิดพลาด
          </p>
        )}
      </div>
      <input
        name="courtFee"
        type="number"
        placeholder="ค่าสนาม (บาท)"
        className="w-32 px-3 py-2.5 rounded-lg border border-purple-100 bg-purple-50 text-sm"
      />
      <SubmitButton
        pendingText="กำลังเพิ่ม..."
        className="px-4 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-purple-500 text-white text-sm font-bold"
      >
        เพิ่ม + เช็คอิน
      </SubmitButton>
    </form>
  );
}
