"use client";

import { useState } from "react";
import { updateMember } from "./actions";

type Member = { id: string; name: string; courtFee: number };

export default function MemberRow({ member }: { member: Member }) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <tr className="border-b border-dashed bg-purple-50/50">
        <td className="py-3" colSpan={2}>
          <form
            action={async (formData) => {
              await updateMember(member.id, formData);
              setEditing(false);
            }}
            className="flex gap-2 items-center flex-wrap"
          >
            <input
              name="name"
              defaultValue={member.name}
              required
              className="flex-1 min-w-[120px] px-3 py-2.5 rounded-lg border border-purple-200 bg-white text-sm"
            />
            <input
              name="courtFee"
              type="number"
              defaultValue={member.courtFee}
              className="w-28 px-3 py-2.5 rounded-lg border border-purple-200 bg-white text-sm"
            />
            <button
              type="submit"
              className="px-3.5 py-2.5 rounded-lg bg-purple-600 text-white text-xs font-bold"
            >
              บันทึก
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="px-3.5 py-2.5 rounded-lg bg-gray-100 text-gray-600 text-xs font-bold"
            >
              ยกเลิก
            </button>
          </form>
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-b border-dashed">
      <td className="py-2.5">{member.name}</td>
      <td className="py-2.5">
        <div className="flex items-center justify-between gap-2">
          <span className="font-semibold text-purple-700">
            ฿{member.courtFee}
          </span>
          <button
            onClick={() => setEditing(true)}
            className="text-xs text-purple-500 font-semibold hover:text-purple-700 transition-colors"
          >
            แก้ไข
          </button>
        </div>
      </td>
    </tr>
  );
}
