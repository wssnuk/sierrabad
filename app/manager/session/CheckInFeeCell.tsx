"use client";

import { useState } from "react";
import { updateCheckInFee } from "./actions";
import { PencilIcon } from "./Icons";

export default function CheckInFeeCell({
  checkInId,
  fee,
}: {
  checkInId: string;
  fee: number;
}) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <form
        action={async (formData: FormData) => {
          await updateCheckInFee(checkInId, formData);
          setEditing(false);
        }}
        className="flex items-center gap-1.5"
      >
        <input
          name="courtFeeOverride"
          type="number"
          defaultValue={fee}
          autoFocus
          className="w-20 px-2 py-1.5 rounded-lg border border-purple-300 text-sm"
        />
        <button
          type="submit"
          className="px-2.5 py-1.5 rounded-lg bg-purple-600 text-white text-xs font-bold"
        >
          ตกลง
        </button>
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="px-2.5 py-1.5 rounded-lg bg-gray-100 text-gray-600 text-xs font-bold"
        >
          ยกเลิก
        </button>
      </form>
    );
  }

  return (
    <button
      onClick={() => setEditing(true)}
      className="flex items-center gap-1.5 text-gray-600 hover:text-purple-700 transition-colors"
    >
      ฿{fee}
      <PencilIcon className="w-3 h-3 opacity-50" />
    </button>
  );
}
