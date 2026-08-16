"use client";

import { useState } from "react";
import { updateManagerPassword } from "./actions";

type Manager = { id: string; name: string; username: string };

export default function ManagerRow({ manager }: { manager: Manager }) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <div className="py-3 border-b border-dashed bg-purple-50/50 rounded-lg px-2">
        <p className="font-medium text-sm mb-2">
          {manager.name}{" "}
          <span className="text-xs text-gray-400">({manager.username})</span>
        </p>
        <form
          action={async (formData: FormData) => {
            await updateManagerPassword(manager.id, formData);
            setEditing(false);
          }}
          className="flex gap-2 flex-wrap"
        >
          <input
            name="password"
            type="password"
            placeholder="รหัสผ่านใหม่"
            required
            className="flex-1 min-w-[140px] px-3 py-2 rounded-lg border border-purple-200 bg-white text-sm"
          />
          <button
            type="submit"
            className="px-3.5 py-2 rounded-lg bg-purple-600 text-white text-xs font-bold"
          >
            บันทึกรหัสใหม่
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="px-3.5 py-2 rounded-lg bg-gray-100 text-gray-600 text-xs font-bold"
          >
            ยกเลิก
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between py-2.5 border-b border-dashed">
      <div>
        <p className="font-medium text-sm">{manager.name}</p>
        <p className="text-xs text-gray-500">ชื่อผู้ใช้งาน: {manager.username}</p>
      </div>
      <button
        onClick={() => setEditing(true)}
        className="text-xs text-purple-500 font-semibold hover:text-purple-700 transition-colors"
      >
        เปลี่ยนรหัสผ่าน
      </button>
    </div>
  );
}
