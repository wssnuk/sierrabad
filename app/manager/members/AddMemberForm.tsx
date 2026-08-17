"use client";

import { useState } from "react";
import { addMember } from "./actions";

export default function AddMemberForm({
  existingNames,
}: {
  existingNames: string[];
}) {
  const [name, setName] = useState("");
  const trimmed = name.trim();
  const isDuplicate = trimmed !== "" && existingNames.some((n) => n.trim() === trimmed);

  return (
    <form action={addMember} className="flex gap-3 flex-wrap items-start">
      <div className="flex-1 min-w-[180px]">
        <input
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="ชื่อ-นามสกุล / ชื่อเล่น"
          required
          className={
            "w-full px-4 py-2.5 rounded-xl border text-sm outline-none " +
            (isDuplicate
              ? "border-amber-400 bg-amber-50"
              : "border-purple-100 bg-purple-50")
          }
        />
        {isDuplicate && (
          <p className="text-xs text-amber-600 mt-1 font-medium">
            ⚠ มีชื่อนี้ในระบบอยู่แล้ว ลองตั้งชื่อให้ต่างกัน
            เพื่อไม่ให้คิดเงินหรือนับเกมส์ผิดพลาด
          </p>
        )}
      </div>
      <input
        name="courtFee"
        type="number"
        placeholder="ค่าสนามต่อครั้ง (บาท)"
        className="w-full sm:w-48 px-4 py-2.5 rounded-xl border border-purple-100 bg-purple-50 text-sm"
      />
      <button
        type="submit"
        className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 text-white font-bold text-sm shadow hover:shadow-md transition-shadow"
      >
        บันทึก
      </button>
    </form>
  );
}
