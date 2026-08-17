"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { createGame } from "./actions";
import { CourtIcon, ShuttleIcon, TagIcon, PeopleIcon } from "./Icons";

type Member = { id: string; name: string };

const fontStack =
  "var(--font-thai), var(--font-inter), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

function SubmitGameButton({ isFull, remaining }: { isFull: boolean; remaining: number }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={!isFull || pending}
      className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-purple-500 text-white font-bold text-base shadow-lg shadow-purple-200 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
    >
      {pending ? "กำลังบันทึก..." : isFull ? "บันทึกเกมส์" : `เลือกอีก ${remaining} คน`}
    </button>
  );
}

export default function GameAssignForm({
  sessionId,
  members,
  nextMatchNumber,
}: {
  sessionId: string;
  members: Member[];
  nextMatchNumber: number;
}) {
  const [selected, setSelected] = useState<string[]>([]);

  function toggle(id: string) {
    if (selected.includes(id)) {
      setSelected(selected.filter((m) => m !== id));
      return;
    }
    if (selected.length < 4) {
      setSelected([...selected, id]);
    }
  }

  const selectedNames = members
    .filter((m) => selected.includes(m.id))
    .map((m) => m.name);
  const isFull = selected.length === 4;

  return (
    <form
      action={createGame}
      onSubmit={() => setSelected([])}
      className="space-y-5"
      style={{ fontFamily: fontStack }}
    >
      <input type="hidden" name="sessionId" value={sessionId} />
      {selected.map((id) => (
        <input key={id} type="hidden" name="players" value={id} />
      ))}

      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="flex items-center gap-1.5 text-xs font-bold text-purple-700 mb-1.5">
            <CourtIcon className="w-3.5 h-3.5" />
            ชื่อแมทช์ / คอร์ท
          </label>
          <input
            name="courtName"
            placeholder={`ไม่ใส่ก็ได้ (เป็น "แมทช์ ${nextMatchNumber}")`}
            className="w-full px-4 py-3.5 rounded-xl border border-purple-100 bg-purple-50 text-base"
          />
        </div>
        <div>
          <label className="flex items-center gap-1.5 text-xs font-bold text-purple-700 mb-1.5">
            <ShuttleIcon className="w-3.5 h-3.5" />
            จำนวนลูกที่ใช้
          </label>
          <input
            name="shuttleCount"
            type="number"
            defaultValue={1}
            min={1}
            className="w-full px-4 py-3.5 rounded-xl border border-purple-100 bg-purple-50 text-base text-center"
          />
        </div>
      </div>

      <div>
        <label className="flex items-center gap-1.5 text-xs font-bold text-pink-600 mb-1.5">
          <TagIcon className="w-3.5 h-3.5" />
          เบอร์/เลขลูกแบดที่เบิก (ไม่บังคับ)
        </label>
        <input
          name="shuttleNumber"
          placeholder="เช่น 12, 13"
          className="w-full px-4 py-3.5 rounded-xl border border-pink-100 bg-pink-50/60 text-base"
        />
      </div>

      <div>
        <label className="flex items-center gap-1.5 text-xs font-bold text-gray-500 mb-2.5">
          <PeopleIcon className="w-3.5 h-3.5" />
          แตะเลือกผู้เล่นให้ครบ 4 คน ({selected.length}/4)
        </label>
        <div className="flex flex-wrap gap-2">
          {members.map((m) => {
            const idx = selected.indexOf(m.id);
            const active = idx !== -1;
            return (
              <button
                type="button"
                key={m.id}
                onClick={() => toggle(m.id)}
                disabled={!active && selected.length >= 4}
                className={
                  "px-4 py-3 rounded-xl text-sm font-semibold border-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed " +
                  (active
                    ? "bg-gradient-to-r from-purple-600 to-fuchsia-500 border-transparent text-white shadow-md shadow-purple-200"
                    : "bg-white border-purple-100 text-gray-600 hover:border-purple-300")
                }
              >
                {active && `${idx + 1}. `}
                {m.name}
              </button>
            );
          })}
          {members.length === 0 && (
            <p className="text-sm text-gray-400">ยังไม่มีสมาชิกเช็คอิน</p>
          )}
        </div>
      </div>

      <div className="text-center py-3.5 bg-gradient-to-r from-purple-50 to-fuchsia-50 rounded-2xl">
        <p className="text-xs font-bold text-purple-700 mb-1">ผู้เล่นที่เลือก</p>
        <p className="text-sm text-gray-600 font-medium">
          {selectedNames.length ? selectedNames.join(" · ") : "ยังไม่เลือก"}
        </p>
      </div>

      <SubmitGameButton isFull={isFull} remaining={4 - selected.length} />
    </form>
  );
}
