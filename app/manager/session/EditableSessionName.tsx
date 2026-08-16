"use client";

import { useState } from "react";
import { updateSessionName } from "./actions";

export default function EditableSessionName({
  sessionId,
  courtName,
}: {
  sessionId: string;
  courtName: string;
}) {
  const [editing, setEditing] = useState(false);

  if (!editing) {
    return (
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold text-[#3B0764]">{courtName}</h1>
        <button
          onClick={() => setEditing(true)}
          className="text-purple-300 hover:text-purple-600 transition-colors"
          aria-label="แก้ไขชื่อสนาม"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path d="M12 20h9" strokeLinecap="round" />
            <path
              d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <form
      action={async (formData) => {
        await updateSessionName(sessionId, formData);
        setEditing(false);
      }}
      className="flex items-center gap-2"
    >
      <input
        name="courtName"
        defaultValue={courtName}
        autoFocus
        className="text-xl font-bold text-[#3B0764] px-3 py-1.5 rounded-lg border-2 border-purple-300 bg-white outline-none"
      />
      <button
        type="submit"
        className="px-3 py-1.5 rounded-lg bg-purple-600 text-white text-sm font-bold"
      >
        บันทึก
      </button>
      <button
        type="button"
        onClick={() => setEditing(false)}
        className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 text-sm font-bold"
      >
        ยกเลิก
      </button>
    </form>
  );
}
