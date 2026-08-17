"use client";

import { useState } from "react";
import { removeCheckIn } from "./actions";

export default function CheckInChip({
  checkInId,
  name,
  gameCount,
}: {
  checkInId: string;
  name: string;
  gameCount: number;
}) {
  const [loading, setLoading] = useState(false);

  async function handleRemove() {
    if (
      !confirm(
        `ต้องการลบ "${name}" ออกจากรายชื่อเช็คอินวันนี้ใช่หรือไม่?`
      )
    )
      return;
    setLoading(true);
    await removeCheckIn(checkInId);
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-semibold">
      {name} ({gameCount} เกมส์)
      <button
        onClick={handleRemove}
        disabled={loading}
        className="text-indigo-300 hover:text-red-500 transition-colors disabled:opacity-50"
        aria-label={`ลบ ${name} ออกจากเช็คอิน`}
      >
        <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5" stroke="currentColor" strokeWidth="2">
          <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
        </svg>
      </button>
    </span>
  );
}
