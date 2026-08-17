import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import {
  getSession,
  createSession,
  checkInMember,
  addAndCheckInMember,
} from "./actions";
import EditableSessionName from "./EditableSessionName";
import GameAssignForm from "./GameAssignForm";
import GameCard from "./GameCard";
import CheckInFeeCell from "./CheckInFeeCell";
import ActualsForm from "./ActualsForm";
import SubmitButton from "./SubmitButton";
import CloseSessionButton from "./CloseSessionButton";
import { CourtIcon, PeopleIcon, ShuttleIcon } from "./Icons";
import Footer from "@/components/Footer";
import LastEditedBadge from "@/components/LastEditedBadge";

const fontStack =
  "var(--font-thai), var(--font-inter), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

const cardAccents = [
  "border-l-4 border-purple-300",
  "border-l-4 border-fuchsia-300",
  "border-l-4 border-indigo-300",
  "border-l-4 border-violet-300",
];

function formatShuttles(n: number) {
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

export default async function SessionPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  const [session, allMembers, authSession] = await Promise.all([
    getSession(id),
    prisma.member.findMany({ orderBy: { name: "asc" } }),
    auth(),
  ]);
  const role = (authSession?.user as { role?: string } | undefined)?.role;
  const isAdmin = role === "ADMIN";

  if (!session) {
    return (
      <div
        className="min-h-screen bg-gradient-to-b from-[#FBF8FF] to-[#F3EAFF] p-6 flex flex-col items-center justify-center"
        style={{ fontFamily: fontStack }}
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
                ชื่อสนาม / ชื่อก๊วน
              </label>
              <input
                name="courtName"
                required
                placeholder="เช่น สนามกล้าไทย หรือ ก๊วนวันพุธ"
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
            <SubmitButton
              pendingText="กำลังเปิดก๊วน..."
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-purple-500 text-white font-bold text-base shadow-lg shadow-purple-200 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all"
            >
              เปิดก๊วน
            </SubmitButton>
          </form>
          <a
            href="/manager"
            className="block text-center text-sm text-purple-600 font-semibold mt-6"
          >
            ← กลับหน้าหลัก
          </a>
        </div>
        <div className="w-full max-w-md">
          <Footer />
        </div>
      </div>
    );
  }

  const checkedInIds = new Set(session.checkIns.map((c) => c.memberId));
  const notCheckedIn = allMembers.filter((m) => !checkedInIds.has(m.id));

  const totalShuttles =
    session.actualShuttleCount ??
    session.games.reduce((sum, g) => sum + g.shuttleCount, 0);
  const shuttleCost = totalShuttles * session.shuttlePrice;
  const memberCount = session.checkIns.length;

  const courtFeeCollected = session.checkIns.reduce(
    (sum, c) => sum + (c.courtFeeOverride ?? c.member.courtFee),
    0
  );

  // Each game has exactly 4 players, so a fair per-player share of that
  // game's shuttles is shuttleCount / 4 — summed across every game a
  // member actually played in (not split equally among everyone).
  const gameCountByMember: Record<string, number> = {};
  const shuttleUsageByMember: Record<string, number> = {};
  session.games.forEach((g) => {
    const perPlayer = g.shuttleCount / 4;
    g.players.forEach((p) => {
      gameCountByMember[p.memberId] = (gameCountByMember[p.memberId] || 0) + 1;
      shuttleUsageByMember[p.memberId] =
        (shuttleUsageByMember[p.memberId] || 0) + perPlayer;
    });
  });

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-[#FBF8FF] to-[#F3EAFF] p-6"
      style={{ fontFamily: fontStack }}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <EditableSessionName
            sessionId={session.id}
            courtName={session.courtName}
            shuttlePrice={session.shuttlePrice}
          />
          <div className="flex items-center gap-3">
            {isAdmin && (
              <LastEditedBadge
                name={session.lastEditedBy}
                at={session.lastEditedAt}
              />
            )}
            <a href="/manager" className="text-sm text-purple-600 font-semibold">
              ← กลับหน้าหลัก
            </a>
          </div>
        </div>

        {/* Check-in */}
        <div className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-indigo-300">
          <h2 className="flex items-center gap-2 font-bold text-[#3B0764] mb-3 text-lg">
            <PeopleIcon className="w-5 h-5 text-indigo-500" />
            เช็คอินสมาชิก ({memberCount} คน)
          </h2>

          <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl px-4 py-3 mb-4 text-xs text-indigo-700 leading-relaxed">
            วิธีใช้: แตะชื่อสมาชิกด้านล่างเพื่อดึงเข้าเล่นวันนี้
            หากยังไม่มีชื่อในระบบ ให้กรอกในช่อง &quot;สมาชิกใหม่ที่มาวันนี้&quot;
            ด้านล่างสุดแล้วกด &quot;เพิ่ม + เช็คอิน&quot; ได้เลย
          </div>

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
            <div className="flex flex-wrap gap-2 pt-4 border-t border-dashed mb-4">
              {notCheckedIn.map((m) => (
                <form
                  key={m.id}
                  action={checkInMember.bind(null, session.id, m.id)}
                >
                  <SubmitButton
                    pendingText="กำลังเช็คอิน..."
                    className="px-3 py-1.5 rounded-lg border border-purple-200 text-purple-600 text-xs font-semibold hover:bg-purple-50 transition-colors"
                  >
                    + {m.name}
                  </SubmitButton>
                </form>
              ))}
            </div>
          )}

          <div className="pt-4 border-t border-dashed">
            <p className="text-xs font-bold text-gray-500 mb-2">
              สมาชิกใหม่ที่มาวันนี้ (ยังไม่เคยลงทะเบียน)
            </p>
            <form
              action={addAndCheckInMember.bind(null, session.id)}
              className="flex gap-2 flex-wrap"
            >
              <input
                name="name"
                placeholder="ชื่อ-นามสกุล / ชื่อเล่น"
                required
                className="flex-1 min-w-[140px] px-3 py-2.5 rounded-lg border border-purple-100 bg-purple-50 text-sm"
              />
              <input
                name="courtFee"
                type="number"
                placeholder="ค่าสนาม (บาท)"
                className="w-32 px-3 py-2.5 rounded-lg border border-purple-100 bg-purple-50 text-sm"
              />
              <SubmitButton
                pendingText="กำลังเพิ่ม..."
                className="px-4 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-purple-500 text-white text-sm font-bold"
              >
                เพิ่ม + เช็คอิน
              </SubmitButton>
            </form>
          </div>
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

        {/* Games list */}
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

        {/* Detailed member summary — proportional to actual matches played */}
        <div className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-purple-300">
          <h2 className="font-bold text-[#3B0764] mb-1 text-lg">
            สรุปสมาชิกแบบละเอียด
          </h2>
          <p className="text-xs text-gray-500 mb-4">
            ค่าลูกคิดตามจำนวนแมทช์ที่แต่ละคนลงเล่นจริง ไม่ได้หารเท่ากันทุกคน
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 border-b">
                  <th className="pb-2 pr-3">ชื่อ</th>
                  <th className="pb-2 pr-3">เล่นไปแล้ว</th>
                  <th className="pb-2 pr-3">ค่าสนาม (แก้ไขได้)</th>
                  <th className="pb-2 pr-3">ลูกที่ใช้ (ค่าลูก)</th>
                  <th className="pb-2">รวมที่ต้องจ่าย</th>
                </tr>
              </thead>
              <tbody>
                {session.checkIns.map((c, i) => {
                  const shuttlesUsed = shuttleUsageByMember[c.memberId] || 0;
                  const memberShuttleCost = Math.round(
                    shuttlesUsed * session.shuttlePrice
                  );
                  const fee = c.courtFeeOverride ?? c.member.courtFee;
                  return (
                    <tr
                      key={c.id}
                      className={i % 2 === 0 ? "bg-purple-50/40" : ""}
                    >
                      <td className="py-2.5 pr-3 font-medium rounded-l-lg pl-2">
                        {c.member.name}
                      </td>
                      <td className="py-2.5 pr-3 text-gray-600">
                        {gameCountByMember[c.memberId] || 0} แมทช์
                      </td>
                      <td className="py-2.5 pr-3">
                        <CheckInFeeCell checkInId={c.id} fee={fee} />
                      </td>
                      <td className="py-2.5 pr-3 text-gray-600">
                        {formatShuttles(shuttlesUsed)} ลูก (฿{memberShuttleCost})
                      </td>
                      <td className="py-2.5 font-bold text-purple-700 rounded-r-lg">
                        ฿{fee + memberShuttleCost}
                      </td>
                    </tr>
                  );
                })}
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

        {/* Combined cost summary + profit/loss + LINE send */}
        <ActualsForm
          sessionId={session.id}
          actualCourtFeePaid={session.actualCourtFeePaid}
          actualShuttleCount={session.actualShuttleCount}
          courtFeeCollected={courtFeeCollected}
          totalShuttles={totalShuttles}
          shuttlePrice={session.shuttlePrice}
        />

        {/* Close session — standalone, prominent, at the very bottom */}
        <CloseSessionButton sessionId={session.id} />

        <Footer />
      </div>
    </div>
  );
}
