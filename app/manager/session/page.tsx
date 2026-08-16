import { prisma } from "@/lib/prisma";
import { getTodaySession, createSession, checkInMember, closeSession } from "./actions";
import EditableSessionName from "./EditableSessionName";
import GameAssignForm from "./GameAssignForm";
import GameCard from "./GameCard";
import CheckInFeeCell from "./CheckInFeeCell";
import ActualsForm from "./ActualsForm";
import { CourtIcon, PeopleIcon, ShuttleIcon } from "./Icons";

const appleFont =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

const cardAccents = [
  "border-l-4 border-purple-300",
  "border-l-4 border-fuchsia-300",
  "border-l-4 border-indigo-300",
  "border-l-4 border-violet-300",
];

export default async function SessionPage() {
  const session = await getTodaySession();
  const allMembers = await prisma.member.findMany({
    orderBy: { name: "asc" },
  });

  if (!session) {
    return (
      <div
        className="min-h-screen bg-gradient-to-b from-[#FBF8FF] to-[#F3EAFF] p-6 flex items-center justify-center"
        style={{ fontFamily: appleFont }}
      >
        <div className="bg-white rounded-[28px] shadow-2xl p-10 max-w-md w-full">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-fuchsia-500 flex items-center justify-center mb-6 shadow-lg shadow-purple-200">
            <ShuttleIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[#3B0764] mb-1">
            เปิดก๊วนวันนี้
          </h1>
          <p className="text-sm text-gray-500 mb-8">
            ยังไม่มีก๊วนที่เปิดอยู่วันนี้ กรอกข้อมูลด้านล่างเพื่อเริ่มต้น
          </p>
          <form action={createSession} className="space-y-5">
            <div>
              <label className="flex items-center gap-1.5 text-sm font-bold text-purple-700 mb-2">
                <CourtIcon className="w-4 h-4" />
                ชื่อสนาม
              </label>
              <input
                name="courtName"
                required
                placeholder="เช่น สนามกล้าไทย"
                className="w-full px-4 py-3.5 rounded-xl border border-purple-100 bg-purple-50 text-base"
              />
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-sm font-bold text-purple-700 mb-2">
                <ShuttleIcon className="w-4 h-4" />
                ราคาลูกแบดต่อลูก (บาท)
              </label>
              <input
                name="shuttlePrice"
                type="number"
                required
                placeholder="เช่น 90"
                className="w-full px-4 py-3.5 rounded-xl border border-purple-100 bg-purple-50 text-base"
              />
            </div>
            <button
              type="submit"
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-purple-500 text-white font-bold text-base shadow-lg shadow-purple-200 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all"
            >
              เปิดก๊วน
            </button>
          </form>
          <a
            href="/manager"
            className="block text-center text-sm text-purple-600 font-semibold mt-6"
          >
            ← กลับหน้าหลัก
          </a>
        </div>
      </div>
    );
  }

  const checkedInIds = new Set(session.checkIns.map((c) => c.memberId));
  const notCheckedIn = allMembers.filter((m) => !checkedInIds.has(m.id));

  const gamesShuttleTotal = session.games.reduce(
    (sum, g) => sum + g.shuttleCount,
    0
  );
  const totalShuttles = session.actualShuttleCount ?? gamesShuttleTotal;
  const shuttleCost = totalShuttles * session.shuttlePrice;
  const memberCount = session.checkIns.length;
  const shuttleShare = memberCount > 0 ? Math.round(shuttleCost / memberCount) : 0;

  const courtFeeCollected = session.checkIns.reduce(
    (sum, c) => sum + (c.courtFeeOverride ?? c.member.courtFee),
    0
  );

  const gameCountByMember: Record<string, number> = {};
  session.games.forEach((g) => {
    g.players.forEach((p) => {
      gameCountByMember[p.memberId] = (gameCountByMember[p.memberId] || 0) + 1;
    });
  });

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-[#FBF8FF] to-[#F3EAFF] p-6"
      style={{ fontFamily: appleFont }}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <EditableSessionName
              sessionId={session.id}
              courtName={session.courtName}
            />
            <p className="text-sm text-gray-500 mt-1">
              วันนี้ · ค่าลูกละ ฿{session.shuttlePrice}
            </p>
          </div>
          <a href="/manager" className="text-sm text-purple-600 font-semibold">
            ← กลับหน้าหลัก
          </a>
        </div>

        {/* Check-in */}
        <div className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-indigo-300">
          <h2 className="flex items-center gap-2 font-bold text-[#3B0764] mb-4 text-lg">
            <PeopleIcon className="w-5 h-5 text-indigo-500" />
            เช็คอินสมาชิก ({memberCount} คน)
          </h2>
          <div className="flex flex-wrap gap-2 mb-4">
            {session.checkIns.map((c) => (
              <span
                key={c.id}
                className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-semibold"
              >
                {c.member.name} ({gameCountByMember[c.memberId] || 0} เกมส์)
              </span>
            ))}
            {memberCount === 0 && (
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
        <div className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-fuchsia-300">
          <h2 className="flex items-center gap-2 font-bold text-[#3B0764] mb-4 text-lg">
            <ShuttleIcon className="w-5 h-5 text-fuchsia-500" />
            จัดคู่ลงเกมส์ใหม่
          </h2>
          <GameAssignForm
            sessionId={session.id}
            members={session.checkIns.map((c) => c.member)}
            nextMatchNumber={session.games.length + 1}
          />
        </div>

        {/* Games list — editable colorful cards */}
        <div className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-violet-300">
          <h2 className="font-bold text-[#3B0764] mb-4 text-lg">
            เกมส์ที่เล่นแล้ว ({session.games.length} เกมส์)
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {session.games.map((g, i) => (
              <GameCard
                key={g.id}
                game={g}
                members={session.checkIns.map((c) => c.member)}
                accentClass={cardAccents[i % cardAccents.length]}
              />
            ))}
            {session.games.length === 0 && (
              <p className="text-sm text-gray-400 col-span-2">ยังไม่มีเกมส์</p>
            )}
          </div>
        </div>

        {/* Detailed member summary — editable, exact figures */}
        <div className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-purple-300">
          <h2 className="font-bold text-[#3B0764] mb-4 text-lg">
            สรุปสมาชิกแบบละเอียด
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 border-b">
                  <th className="pb-2 pr-3">ชื่อ</th>
                  <th className="pb-2 pr-3">เล่นไปแล้ว</th>
                  <th className="pb-2 pr-3">ค่าสนาม (แก้ไขได้)</th>
                  <th className="pb-2 pr-3">ส่วนแบ่งค่าลูก</th>
                  <th className="pb-2">รวมที่ต้องจ่าย</th>
                </tr>
              </thead>
              <tbody>
                {session.checkIns.map((c, i) => (
                  <tr
                    key={c.id}
                    className={i % 2 === 0 ? "bg-purple-50/40" : ""}
                  >
                    <td className="py-2.5 pr-3 font-medium rounded-l-lg pl-2">
                      {c.member.name}
                    </td>
                    <td className="py-2.5 pr-3 text-gray-600">
                      {gameCountByMember[c.memberId] || 0} เกมส์
                    </td>
                    <td className="py-2.5 pr-3">
                      <CheckInFeeCell
                        checkInId={c.id}
                        fee={c.courtFeeOverride ?? c.member.courtFee}
                      />
                    </td>
                    <td className="py-2.5 pr-3 text-gray-600">
                      ฿{shuttleShare}
                    </td>
                    <td className="py-2.5 font-bold text-purple-700 rounded-r-lg">
                      ฿{(c.courtFeeOverride ?? c.member.courtFee) + shuttleShare}
                    </td>
                  </tr>
                ))}
                {memberCount === 0 && (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-gray-400">
                      ยังไม่มีสมาชิกเช็คอิน
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Profit / Loss reconciliation */}
        <ActualsForm
          sessionId={session.id}
          actualCourtFeePaid={session.actualCourtFeePaid}
          actualShuttleCount={session.actualShuttleCount}
          courtFeeCollected={courtFeeCollected}
        />

        {/* Summary */}
        <div className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-indigo-300">
          <h2 className="font-bold text-[#3B0764] mb-4 text-lg">
            สรุปค่าใช้จ่ายรวม
          </h2>
          <div className="flex justify-between text-sm py-1.5">
            <span>
              ค่าลูกแบด ({totalShuttles} ลูก × ฿{session.shuttlePrice})
            </span>
            <span>฿{shuttleCost}</span>
          </div>
          <div className="flex justify-between text-sm py-1.5">
            <span>หารเฉลี่ยต่อคน (จาก {memberCount} คน)</span>
            <span>฿{shuttleShare} / คน</span>
          </div>
          <form action={closeSession.bind(null, session.id)}>
            <button
              type="submit"
              className="w-full mt-4 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-purple-500 text-white font-bold text-base shadow-lg shadow-purple-200 hover:shadow-xl transition-all"
            >
              ปิดก๊วน &amp; ส่งสรุปเข้า LINE
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
