import { prisma } from "@/lib/prisma";
import {
  getTodaySession,
  createSession,
  checkInMember,
  createGame,
  closeSession,
} from "./actions";

export default async function SessionPage() {
  const session = await getTodaySession();
  const allMembers = await prisma.member.findMany({
    orderBy: { name: "asc" },
  });

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FBF8FF] to-[#F3EAFF] p-6 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow p-8 max-w-md w-full">
          <h1 className="text-xl font-bold text-[#3B0764] mb-1">
            เปิดก๊วนวันนี้
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            ยังไม่มีก๊วนที่เปิดอยู่วันนี้ สร้างใหม่ได้เลย
          </p>
          <form action={createSession} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-purple-700 mb-1.5">
                ชื่อสนาม
              </label>
              <input
                name="courtName"
                required
                placeholder="เช่น สนามกล้าไทย"
                className="w-full px-4 py-2.5 rounded-xl border border-purple-100 bg-purple-50 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-purple-700 mb-1.5">
                ราคาลูกแบดต่อลูก (บาท)
              </label>
              <input
                name="shuttlePrice"
                type="number"
                required
                placeholder="เช่น 90"
                className="w-full px-4 py-2.5 rounded-xl border border-purple-100 bg-purple-50 text-sm"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 text-white font-bold text-sm"
            >
              เปิดก๊วน
            </button>
          </form>
          <a
            href="/manager"
            className="block text-center text-sm text-purple-600 font-semibold mt-4"
          >
            ← กลับหน้าหลัก
          </a>
        </div>
        <p className="mt-6 flex items-center justify-center gap-2 text-xs text-purple-400/70 tracking-wide">
          <span className="font-semibold text-purple-500/80">SierraBad</span>
          <span className="opacity-50">·</span>
          <span>© 2569 บริษัท เซียร่า จำกัด</span>
          <span className="opacity-50">·</span>
          <span>สงวนลิขสิทธิ์ทุกประการ</span>
        </p>
      </div>
    );
  }

  const checkedInIds = new Set(session.checkIns.map((c) => c.memberId));
  const checkedInMembers = session.checkIns.map((c) => c.member);
  const notCheckedIn = allMembers.filter((m) => !checkedInIds.has(m.id));

  const totalShuttles = session.games.reduce(
    (sum, g) => sum + g.shuttleCount,
    0
  );
  const shuttleCost = totalShuttles * session.shuttlePrice;
  const gameCountByMember: Record<string, number> = {};
  session.games.forEach((g) => {
    g.players.forEach((p) => {
      gameCountByMember[p.memberId] = (gameCountByMember[p.memberId] || 0) + 1;
    });
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FBF8FF] to-[#F3EAFF] p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#3B0764]">
              {session.courtName}
            </h1>
            <p className="text-sm text-gray-500">
              วันนี้ · ค่าลูกละ ฿{session.shuttlePrice}
            </p>
          </div>
          <a href="/manager" className="text-sm text-purple-600 font-semibold">
            ← กลับหน้าหลัก
          </a>
        </div>

        {/* Check-in */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="font-bold text-[#3B0764] mb-4">
            เช็คอินสมาชิก ({checkedInMembers.length} คน)
          </h2>
          <div className="flex flex-wrap gap-2 mb-4">
            {checkedInMembers.map((m) => (
              <span
                key={m.id}
                className="px-3 py-1.5 rounded-lg bg-purple-100 text-purple-700 text-xs font-semibold"
              >
                {m.name} ({gameCountByMember[m.id] || 0} เกมส์)
              </span>
            ))}
            {checkedInMembers.length === 0 && (
              <p className="text-sm text-gray-400">ยังไม่มีใครเช็คอิน</p>
            )}
          </div>
          {notCheckedIn.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-4 border-t border-dashed">
              {notCheckedIn.map((m) => (
                <form
                  key={m.id}
                  action={checkInMember.bind(null, session.id, m.id)}
                >
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-lg border border-purple-200 text-purple-600 text-xs font-semibold hover:bg-purple-50"
                  >
                    + {m.name}
                  </button>
                </form>
              ))}
            </div>
          )}
        </div>

        {/* Create Game */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="font-bold text-[#3B0764] mb-4">จัดคู่ลงเกมส์ใหม่</h2>
          <form action={createGame} className="space-y-4">
            <input type="hidden" name="sessionId" value={session.id} />
            <div className="flex gap-3">
              <input
                name="courtName"
                placeholder="คอร์ท เช่น A"
                required
                className="flex-1 px-4 py-2.5 rounded-xl border border-purple-100 bg-purple-50 text-sm"
              />
              <input
                name="shuttleCount"
                type="number"
                defaultValue={1}
                min={1}
                placeholder="จำนวนลูกที่ใช้"
                className="w-40 px-4 py-2.5 rounded-xl border border-purple-100 bg-purple-50 text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-bold text-purple-700 mb-2">ทีม 1</p>
                <div className="space-y-1.5">
                  {checkedInMembers.map((m) => (
                    <label key={m.id} className="flex items-center gap-2 text-sm">
                      <input type="checkbox" name="team1" value={m.id} />
                      {m.name}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-purple-700 mb-2">ทีม 2</p>
                <div className="space-y-1.5">
                  {checkedInMembers.map((m) => (
                    <label key={m.id} className="flex items-center gap-2 text-sm">
                      <input type="checkbox" name="team2" value={m.id} />
                      {m.name}
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 text-white font-bold text-sm"
            >
              บันทึกเกมส์
            </button>
          </form>
        </div>

        {/* Games list */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="font-bold text-[#3B0764] mb-4">
            เกมส์ที่เล่นแล้ว ({session.games.length} เกมส์)
          </h2>
          <div className="space-y-2">
            {session.games.map((g) => (
              <div
                key={g.id}
                className="flex items-center justify-between text-sm py-2 border-b border-dashed"
              >
                <span>
                  คอร์ท {g.courtName}:{" "}
                  {g.players
                    .filter((p) => p.team === 1)
                    .map((p) => p.member.name)
                    .join(", ")}{" "}
                  vs{" "}
                  {g.players
                    .filter((p) => p.team === 2)
                    .map((p) => p.member.name)
                    .join(", ")}
                </span>
                <span className="text-purple-600 font-semibold">
                  {g.shuttleCount} ลูก
                </span>
              </div>
            ))}
            {session.games.length === 0 && (
              <p className="text-sm text-gray-400">ยังไม่มีเกมส์</p>
            )}
          </div>
        </div>

        {/* Summary */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="font-bold text-[#3B0764] mb-4">สรุปค่าใช้จ่าย</h2>
          <div className="flex justify-between text-sm py-1.5">
            <span>
              ค่าลูกแบด ({totalShuttles} ลูก × ฿{session.shuttlePrice})
            </span>
            <span>฿{shuttleCost}</span>
          </div>
          <div className="flex justify-between text-sm py-1.5">
            <span>หารเฉลี่ยต่อคน (จาก {checkedInMembers.length} คน)</span>
            <span>
              ~฿
              {checkedInMembers.length > 0
                ? Math.round(shuttleCost / checkedInMembers.length)
                : 0}{" "}
              / คน
            </span>
          </div>
          <form action={closeSession.bind(null, session.id)}>
            <button
              type="submit"
              className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 text-white font-bold text-sm shadow hover:shadow-md transition-shadow"
            >
              ปิดก๊วน
            </button>
          </form>
        </div>

        <p className="flex items-center justify-center gap-2 text-xs text-purple-400/70 tracking-wide pt-4 pb-2">
          <span className="font-semibold text-purple-500/80">SierraBad</span>
          <span className="opacity-50">·</span>
          <span>© 2569 บริษัท เซียร่า จำกัด</span>
          <span className="opacity-50">·</span>
          <span>สงวนลิขสิทธิ์ทุกประการ</span>
        </p>
      </div>
    </div>
  );
}
