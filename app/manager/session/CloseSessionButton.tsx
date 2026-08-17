"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { closeSession } from "./actions";

export default function CloseSessionButton({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClose() {
    const confirmed = confirm(
      "ยืนยันปิดก๊วนวันนี้ใช่หรือไม่?\nหลังปิดแล้วจะไม่สามารถแก้ไขข้อมูลก๊วนนี้ได้อีก"
    );
    if (!confirmed) return;

    setLoading(true);
    await closeSession(sessionId);
    router.push("/manager/history");
  }

  return (
    <button
      onClick={handleClose}
      disabled={loading}
      className="w-full py-5 rounded-2xl bg-gradient-to-r from-rose-600 to-rose-500 text-white font-bold text-lg shadow-xl shadow-rose-200 hover:shadow-2xl hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-60 disabled:cursor-wait"
    >
      {loading ? "กำลังปิดก๊วน..." : "ปิดก๊วนวันนี้"}
    </button>
  );
}
