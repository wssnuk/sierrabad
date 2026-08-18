import { CourtIcon, PeopleIcon, ShuttleIcon } from "./Icons";
import Footer from "@/components/Footer";

type SessionData = {
  id: string;
  courtName: string;
  date: Date;
  shuttlePrice: number;
  actualCourtFeePaid: number | null;
  lastEditedBy: string | null;
  lastEditedAt: Date | null;
  checkIns: {
    id: string;
    memberId: string;
    courtFeeOverride: number | null;
    member: { id: string; name: string; courtFee: number };
  }[];
  games: {
    id: string;
    courtName: string;
    shuttleCount: number;
    shuttleNumber: string | null;
    players: { member: { id: string; name: string } }[];
  }[];
};

const fontStack =
  "'Noto Sans Thai', Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

const cardAccents = [
  "border-l-4 border-purple-300",
  "border-l-4 border-fuchsia-300",
  "border-l-4 border-indigo-300",
  "border-l-4 border-violet-300",
];

export default function ClosedSessionView({
  session,
  backHref,
}: {
  session: SessionData;
  backHref: string;
}) {
  const gameCountByMember: Record<string, number> = {};
  const shuttleUsageByMember: Record<string, number> = {};
  session.games.forEach((g) => {
    const perPlayer = g.shuttleCount / 4;
    g.players.forEach((p) => {
      gameCountByMember[p.member.id] = (gameCountByMember[p.member.id] || 0) + 1;
      shuttleUsageByMember[p.member.id] =
        (shuttleUsageByMember[p.member.id] || 0) + perPlayer;
    });
  });

  const totalShuttles = session.games.reduce((sum, g) => sum + g.shuttleCount, 0);
  const shuttleCost = totalShuttles * session.shuttlePrice;
  const courtFeeCollected = session.checkIns.reduce(
    (sum, c) => sum + (c.courtFeeOverride ?? c.member.courtFee),
    0
  );
  const profit =
    session.actualCourtFeePaid !== null
      ? courtFeeCollected - session.actualCourtFeePaid
      : null;

  const dateLabel = new Date(session.date).toLocaleDateString("th-TH", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Bangkok",
  });
  const closedTimeLabel = session.lastEditedAt
    ? new Date(session.lastEditedAt).toLocaleString("th-TH", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Bangkok",
      })
    : null;

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-[#FBF8FF] to-[#F3EAFF] p-6"
      style={{ fontFamily: fontStack }}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-[#3B0764]">
                {session.courtName}
              </h1>
              <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 text-[11px] font-bold">
                ดูข้อมูลอย่างเดียว — ก๊วนนี้ปิดแล้ว
              </span>
            </div>
            <p className="text-sm text-gray-500">
              วันที่ {dateLabel} · ค่าลูกละ ฿{session.shuttlePrice}
              {closedTimeLabel && session.lastEditedBy && (
                <> · ปิดก๊วนเมื่อ {closedTimeLabel} โดย {session.lastEditedBy}</>
              )}
            </p>
          </div>
          <a href={backHref} className="text-sm text-purple-600 font-semibold">
            ← กลับ
          </a>
        </div>

        {/* Member list */}
        <div className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-indigo-300">
          <h2 className="flex items-center gap-2 font-bold text-[#3B0764] mb-3 text-lg">
            <PeopleIcon className="w-5 h-5 text-indigo-500" />
            สมาชิกที่มาเล่น ({session.checkIns.length} คน)
          </h2>
          <div className="flex flex-wrap gap-2">
            {session.checkIns.map((c) => (
              <span
                key={c.id}
                className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-semibold"
              >
                {c.member.name} ({gameCountByMember[c.memberId] || 0} เกมส์)
              </span>
            ))}
            {session.checkIns.length === 0 && (
              <p className="text-sm text-gray-400">ไม่มีข้อมูลสมาชิก</p>
            )}
          </div>
        </div>

        {/* Games list — read only */}
        <div className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-violet-300">
          <h2 className="font-bold text-[#3B0764] mb-4 text-lg">
            เกมส์ที่เล่นไปแล้ว ({session.games.length} เกมส์)
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {session.games.map((g, i) => (
              <div
                key={g.id}
                className={`bg-gradient-to-br from-white to-purple-50/40 rounded-xl p-4 ${cardAccents[i % cardAccents.length]}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="font-bold text-purple-700">{g.courtName}</p>
                  <span className="px-2.5 py-1 rounded-full bg-purple-50 text-purple-600 text-[11px] font-bold flex items-center gap-1">
                    <ShuttleIcon className="w-3 h-3" />
                    {g.shuttleCount} ลูก
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  {g.players.map((p) => p.member.name).join(" · ")}
                </p>
                {g.shuttleNumber && (
                  <p className="text-xs text-pink-500 mt-1.5">
                    เบอร์ลูก: {g.shuttleNumber}
                  </p>
                )}
              </div>
            ))}
            {session.games.length === 0 && (
              <p className="text-sm text-gray-400 col-span-2">ไม่มีข้อมูลเกมส์</p>
            )}
          </div>
        </div>

        {/* Member summary table — read only */}
        <div className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-purple-300">
          <h2 className="font-bold text-[#3B0764] mb-1 text-lg">
            สรุปสมาชิกแบบละเอียด
          </h2>
          <p className="text-xs text-gray-500 mb-4">
            (1 ขีด = ค่าลูกที่คิดจากแมทช์ที่ลงเล่นจริง หารเท่ากัน 4 คนต่อแมทช์)
          </p>
          <div className="overflow-x-auto -mx-2 px-2">
            <table className="w-full text-sm min-w-[560px]">
              <thead>
                <tr className="text-left text-xs font-bold text-purple-700 bg-gradient-to-r from-purple-100 via-fuchsia-100 to-indigo-100">
                  <th className="py-3 pr-3 pl-3 rounded-l-xl">ชื่อ</th>
                  <th className="py-3 pr-3">เล่นไปแล้ว</th>
                  <th className="py-3 pr-3">ค่าสนาม</th>
                  <th className="py-3 pr-3">ขีดที่ใช้ (ค่าลูก)</th>
                  <th className="py-3 pr-3 rounded-r-xl">รวมที่ต้องจ่าย</th>
                </tr>
              </thead>
              <tbody>
                {session.checkIns.map((c, i) => {
                  const shuttlesUsed = shuttleUsageByMember[c.memberId] || 0;
                  const memberShuttleCost = Math.round(
                    shuttlesUsed * session.shuttlePrice
                  );
                  const khid = Math.round(shuttlesUsed * 4);
                  const fee = c.courtFeeOverride ?? c.member.courtFee;
                  return (
                    <tr key={c.id} className={i % 2 === 0 ? "bg-purple-50/40" : ""}>
                      <td className="py-2.5 pr-3 font-medium rounded-l-lg pl-2">
                        {c.member.name}
                      </td>
                      <td className="py-2.5 pr-3 text-gray-600">
                        {gameCountByMember[c.memberId] || 0} แมทช์
                      </td>
                      <td className="py-2.5 pr-3 text-gray-600">฿{fee}</td>
                      <td className="py-2.5 pr-3 text-gray-600">
                        {khid} ขีด (฿{memberShuttleCost})
                      </td>
                      <td className="py-2.5 font-bold text-purple-700 rounded-r-lg">
                        ฿{fee + memberShuttleCost}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Financial summary — read only */}
        <div className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-emerald-300">
          <h2 className="font-bold text-[#3B0764] mb-4 text-lg">
            สรุปค่าใช้จ่าย &amp; กำไร-ขาดทุน
          </h2>
          <div className="flex items-center justify-between text-sm py-2.5 px-3 bg-fuchsia-50/60 rounded-xl mb-3">
            <span className="flex items-center gap-1.5 text-fuchsia-700 font-medium">
              <ShuttleIcon className="w-3.5 h-3.5" />
              ลูกแบดที่ใช้ทั้งหมด
            </span>
            <span className="font-bold text-fuchsia-700">
              {totalShuttles} ลูก · ฿{shuttleCost}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-gray-50 rounded-xl py-3">
              <p className="text-xs text-gray-500 mb-1">เก็บจากสมาชิก</p>
              <p className="font-bold text-gray-700">฿{courtFeeCollected}</p>
            </div>
            <div className="bg-gray-50 rounded-xl py-3">
              <p className="text-xs text-gray-500 mb-1">ค่าสนามจ่ายจริง</p>
              <p className="font-bold text-gray-700">
                {session.actualCourtFeePaid !== null
                  ? `฿${session.actualCourtFeePaid}`
                  : "ไม่มีข้อมูล"}
              </p>
            </div>
            <div
              className={
                "rounded-xl py-3 " +
                (profit === null
                  ? "bg-gray-50"
                  : profit >= 0
                  ? "bg-emerald-50"
                  : "bg-red-50")
              }
            >
              <p className="text-xs text-gray-500 mb-1">กำไร/ขาดทุน</p>
              <p
                className={
                  "font-bold " +
                  (profit === null
                    ? "text-gray-400"
                    : profit >= 0
                    ? "text-emerald-600"
                    : "text-red-500")
                }
              >
                {profit === null ? "ไม่มีข้อมูล" : `${profit >= 0 ? "+" : ""}฿${profit}`}
              </p>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
}
