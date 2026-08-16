"use client";

import { useState } from "react";
import { updateGame, deleteGame } from "./actions";
import { PencilIcon, ShuttleIcon, TagIcon, TrashIcon } from "./Icons";

type Member = { id: string; name: string };
type GamePlayerData = { memberId: string; member: Member };
type GameData = {
  id: string;
  courtName: string;
  shuttleCount: number;
  shuttleNumber: string | null;
  players: GamePlayerData[];
};

export default function GameCard({
  game,
  members,
  accentClass,
}: {
  game: GameData;
  members: Member[];
  accentClass: string;
}) {
  const [editing, setEditing] = useState(false);
  const [selected, setSelected] = useState<string[]>(
    game.players.map((p) => p.memberId)
  );

  function toggle(id: string) {
    if (selected.includes(id)) {
      setSelected(selected.filter((m) => m !== id));
      return;
    }
    if (selected.length < 4) setSelected([...selected, id]);
  }

  function handleDelete() {
    if (confirm(`ลบ "${game.courtName}" ใช่หรือไม่? การลบไม่สามารถย้อนกลับได้`)) {
      deleteGame(game.id);
    }
  }

  if (!editing) {
    return (
      <div
        className={
          "rounded-2xl bg-gradient-to-br from-white to-purple-50 p-4 shadow-sm " +
          accentClass
        }
      >
        <div className="flex items-center justify-between mb-2">
          <span className="font-bold text-purple-800 text-sm">
            {game.courtName}
          </span>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-100 text-purple-700">
              <ShuttleIcon className="w-3 h-3" />
              {game.shuttleCount} ลูก
            </span>
            <button
              onClick={() => setEditing(true)}
              className="text-purple-300 hover:text-purple-600 transition-colors"
              aria-label="แก้ไขเกมส์"
            >
              <PencilIcon className="w-4 h-4" />
            </button>
            <button
              onClick={handleDelete}
              className="text-red-300 hover:text-red-500 transition-colors"
              aria-label="ลบเกมส์"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
        <p className="text-sm text-gray-600 mb-1">
          {game.players.map((p) => p.member.name).join(" · ")}
        </p>
        {game.shuttleNumber && (
          <p className="text-xs text-pink-600 font-medium flex items-center gap-1">
            <TagIcon className="w-3 h-3" />
            เบอร์ลูก: {game.shuttleNumber}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={"rounded-2xl bg-white p-4 shadow-md " + accentClass}>
      <form
        action={async (formData: FormData) => {
          await updateGame(game.id, selected, formData);
          setEditing(false);
        }}
        className="space-y-3"
      >
        <div className="flex gap-2">
          <input
            name="courtName"
            defaultValue={game.courtName}
            className="flex-1 px-3 py-2 rounded-lg border border-purple-200 text-sm"
          />
          <input
            name="shuttleCount"
            type="number"
            defaultValue={game.shuttleCount}
            min={1}
            className="w-16 px-2 py-2 rounded-lg border border-purple-200 text-sm text-center"
          />
        </div>
        <input
          name="shuttleNumber"
          defaultValue={game.shuttleNumber ?? ""}
          placeholder="เบอร์ลูก"
          className="w-full px-3 py-2 rounded-lg border border-pink-200 text-sm"
        />
        <div className="flex flex-wrap gap-1.5">
          {members.map((m) => {
            const active = selected.includes(m.id);
            return (
              <button
                type="button"
                key={m.id}
                onClick={() => toggle(m.id)}
                disabled={!active && selected.length >= 4}
                className={
                  "px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all disabled:opacity-40 " +
                  (active
                    ? "bg-purple-600 border-purple-600 text-white"
                    : "bg-white border-purple-200 text-gray-600")
                }
              >
                {m.name}
              </button>
            );
          })}
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={selected.length !== 4}
            className="flex-1 py-2 rounded-lg bg-purple-600 text-white text-xs font-bold disabled:opacity-40"
          >
            บันทึก ({selected.length}/4)
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="px-3 py-2 rounded-lg bg-gray-100 text-gray-600 text-xs font-bold"
          >
            ยกเลิก
          </button>
        </div>
      </form>
    </div>
  );
}
