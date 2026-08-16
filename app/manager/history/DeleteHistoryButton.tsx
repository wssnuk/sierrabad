"use client";

import { deleteSessionHistory } from "./actions";
import { TrashIcon } from "../session/Icons";

export default function DeleteHistoryButton({ sessionId }: { sessionId: string }) {
  function handleDelete() {
    if (confirm("ต้องการลบประวัติก๊วนนี้ใช่หรือไม่? ข้อมูลจะหายถาวรและกู้คืนไม่ได้")) {
      deleteSessionHistory(sessionId);
    }
  }

  return (
    <button
      onClick={handleDelete}
      className="text-red-300 hover:text-red-500 transition-colors flex-shrink-0"
      aria-label="ลบประวัติ"
    >
      <TrashIcon className="w-4 h-4" />
    </button>
  );
}
