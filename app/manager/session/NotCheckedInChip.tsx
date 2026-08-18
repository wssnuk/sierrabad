"use client";

import { useState } from "react";
import { checkInMember } from "./actions";
import { deleteMember } from "../members/actions";
import SubmitButton from "./SubmitButton";

export default function NotCheckedInChip({
  sessionId,
  memberId,
  name,
}: {
  sessionId: string;
  memberId: string;
  name: string;
}) {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (
      !confirm(
        `ต้องการลบสมาชิก "${name}" ออกจากระบบถาวรใช่หรือไม่?\nจะลบออกจากหน้าจัดการสมาชิกและประวัติทุกที่ด้วย กู้คืนไม่ได้`
      )
    )
      return;
    setDeleting(true);
    await deleteMember(memberId);
  }

  return (
    <span className="inline-flex items-stretch rounded-lg border border-purple-200 overflow-hidden">
      <form action={checkInMember.bind(null, sessionId, memberId)}>
        <SubmitButton
          pendingText="กำลังเช็คอิน..."
          className="px-3 py-1.5 text-purple-600 text-xs font-semibold hover:bg-purple-50 transition-colors"
        >
          + {name}
        </SubmitButton>
      </form>
      <button
        type="button"
        onClick={handleDelete}
        disabled={deleting}
        className="px-2 border-l border-purple-100 text-red-300 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
        aria-label={`ลบ ${name} ออกจากระบบถาวร`}
        title="ลบสมาชิกออกจากระบบถาวร"
      >
        <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3" stroke="currentColor" strokeWidth="2">
          <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
        </svg>
      </button>
    </span>
  );
}
