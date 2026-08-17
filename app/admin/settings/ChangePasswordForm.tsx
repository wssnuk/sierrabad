"use client";

import { useActionState } from "react";
import { changeMyPassword, type ChangePasswordState } from "./actions";

const initialState: ChangePasswordState = {};

export default function ChangePasswordForm() {
  const [state, formAction, isPending] = useActionState(
    changeMyPassword,
    initialState
  );

  return (
    <form action={formAction} className="space-y-3">
      <input
        name="username"
        placeholder="ชื่อผู้ใช้งานของคุณ (username)"
        required
        className="w-full px-4 py-2.5 rounded-xl border border-purple-100 bg-purple-50 text-sm"
      />
      <input
        name="oldPassword"
        type="password"
        placeholder="รหัสผ่านเดิม"
        required
        className="w-full px-4 py-2.5 rounded-xl border border-purple-100 bg-purple-50 text-sm"
      />
      <input
        name="newPassword"
        type="password"
        placeholder="รหัสผ่านใหม่"
        required
        className="w-full px-4 py-2.5 rounded-xl border border-purple-100 bg-purple-50 text-sm"
      />

      {state.error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
          เปลี่ยนรหัสผ่านสำเร็จแล้ว
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 text-white font-bold text-sm shadow hover:shadow-md transition-shadow disabled:opacity-60"
      >
        {isPending ? "กำลังบันทึก..." : "เปลี่ยนรหัสผ่าน"}
      </button>
    </form>
  );
}
