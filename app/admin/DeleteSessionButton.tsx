"use client";

import { useState } from "react";
import { adminDeleteSession } from "./actions";

export default function DeleteSessionButton({ sessionId }: { sessionId: string }) {
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (
      !confirm("ต้องการลบก๊วนนี้ใช่หรือไม่? ข้อมูลจะหายถาวรและกู้คืนไม่ได้")
    )
      return;
    setLoading(true);
    await adminDeleteSession(sessionId);
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-red-300 hover:text-red-500 transition-colors disabled:opacity-50"
      aria-label="ลบก๊วนนี้"
    >
      <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 7h16" strokeLinecap="round" />
        <path d="M9 7V4.5A1.5 1.5 0 0 1 10.5 3h3A1.5 1.5 0 0 1 15 4.5V7" strokeLinejoin="round" />
        <path d="M6 7l1 13a2 2 0 0 0 2 1.8h6a2 2 0 0 0 2-1.8l1-13" strokeLinejoin="round" />
        <path d="M10 11v6M14 11v6" strokeLinecap="round" />
      </svg>
    </button>
  );
}
