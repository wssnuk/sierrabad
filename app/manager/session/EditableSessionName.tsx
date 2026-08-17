"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { updateSessionSettings } from "./actions";
import { PencilIcon } from "./Icons";

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="px-3 py-2 rounded-lg bg-purple-600 text-white text-xs font-bold disabled:opacity-60"
    >
      {pending ? "กำลังบันทึก..." : "บันทึก"}
    </button>
  );
}

export default function EditableSessionName({
  sessionId,
  courtName,
  shuttlePrice,
}: {
  sessionId: string;
  courtName: string;
  shuttlePrice: number;
}) {
  const [editing, setEditing] = useState(false);

  if (!editing) {
    return (
      <div className="flex items-center gap-2">
        <div>
          <h1 className="text-2xl font-bold text-[#3B0764]">{courtName}</h1>
          <p className="text-sm text-gray-500">วันนี้ · ค่าลูกละ ฿{shuttlePrice}</p>
        </div>
        <button
          onClick={() => setEditing(true)}
          className="text-purple-300 hover:text-purple-600 transition-colors self-start mt-1"
          aria-label="แก้ไขชื่อก๊วนและราคาลูกแบด"
        >
          <PencilIcon className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <form
      action={async (formData) => {
        await updateSessionSettings(sessionId, formData);
        setEditing(false);
      }}
      className="flex items-end gap-2 flex-wrap"
    >
      <div>
        <label className="block text-[11px] font-bold text-purple-500 mb-1">
          ชื่อสนาม / ชื่อก๊วน
        </label>
        <input
          name="courtName"
          defaultValue={courtName}
          autoFocus
          className="text-base font-bold text-[#3B0764] px-3 py-1.5 rounded-lg border-2 border-purple-300 bg-white outline-none w-44"
        />
      </div>
      <div>
        <label className="block text-[11px] font-bold text-purple-500 mb-1">
          ราคาลูกแบด/ลูก
        </label>
        <input
          name="shuttlePrice"
          type="number"
          defaultValue={shuttlePrice}
          className="text-base font-bold text-[#3B0764] px-3 py-1.5 rounded-lg border-2 border-purple-300 bg-white outline-none w-24"
        />
      </div>
      <SaveButton />
      <button
        type="button"
        onClick={() => setEditing(false)}
        className="px-3 py-2 rounded-lg bg-gray-100 text-gray-600 text-xs font-bold"
      >
        ยกเลิก
      </button>
    </form>
  );
}
