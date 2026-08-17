import { prisma } from "@/lib/prisma";
import { CourtIcon, PeopleIcon, ShuttleIcon, CoinIcon } from "../session/Icons";
import DeleteHistoryButton from "./DeleteHistoryButton";
import { cleanupOldHistory } from "./actions";
import Footer from "@/components/Footer";

const fontStack =
  "var(--font-thai), var(--font-inter), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

export default async function HistoryPage() {
  await cleanupOldHistory();

  const sessions = await prisma.session.findMany({
    where: { status: "CLOSED" },
    include: {
      checkIns: { include: { member: true } },
      games: true,
    },
    orderBy: { date: "desc" },
    take: 30,
  });

  return (
    <div
      className="min-h-screen flex flex-col bg-gradient-to-b from-[#FBF8FF] to-[#F3EAFF] p-4 sm:p-6"
      style={{ fontFamily: fontStack }}
    >
      <div className="max-w-3xl mx-auto w-full flex-1">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-xl sm:text-2xl font-bold text-[#3B0764]">
            ประวัติการจัดก๊วน
          </h1>
          <a href="/manager" className="text-sm text-purple-600 font-semibold">
            ← กลับหน้าหลัก
          </a>
        </div>
        <p className="text-xs text-gray-400 mb-6">
          เก็บประวัติย้อนหลังไม่เกิน 7 วัน ระบบจะลบให้อัตโนมัติ
        </p>

        <div className="space-y-4">
          {sessions.map((s) => {
            const totalShuttles =
              s.actualShuttleCount ??
              s.games.reduce((sum, g) => sum + g.shuttleCount, 0);
            const courtFeeCollected = s.checkIns.reduce(
              (sum, c) => sum + (c.courtFeeOverride ?? c.member.courtFee),
              0
            );
            const profit =
              s.actualCourtFeePaid !== null && s.actualCourtFeePaid !== undefined
                ? courtFeeCollected - s.actualCourtFeePaid
                : null;
            const dateLabel = new Date(s.date).toLocaleDateString("th-TH", {
              day: "numeric",
              month: "long",
              year: "numeric",
            });
            const timeLabel = new Date(s.date).toLocaleTimeString("th-TH", {
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div
                key={s.id}
                className="bg-white rounded-2xl shadow-md p-5 border-l-4 border-purple-300"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <CourtIcon className="w-4 h-4 text-purple-500" />
                    <h2 className="font-bold text-[#3B0764]">{s.courtName}</h2>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400">{dateLabel} · {timeLabel} น.</span>
                    <DeleteHistoryButton sessionId={s.id} />
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="bg-purple-50 rounded-xl py-2.5">
                    <PeopleIcon className="w-4 h-4 text-purple-500 mx-auto mb-1" />
                    <p className="text-xs text-gray-500">สมาชิก</p>
                    <p className="font-bold text-sm text-purple-700">
                      {s.checkIns.length} คน
                    </p>
                  </div>
                  <div className="bg-fuchsia-50 rounded-xl py-2.5">
                    <ShuttleIcon className="w-4 h-4 text-fuchsia-500 mx-auto mb-1" />
                    <p className="text-xs text-gray-500">ลูกที่ใช้</p>
                    <p className="font-bold text-sm text-fuchsia-700">
                      {totalShuttles} ลูก
                    </p>
                  </div>
                  <div className="bg-indigo-50 rounded-xl py-2.5">
                    <CoinIcon className="w-4 h-4 text-indigo-500 mx-auto mb-1" />
                    <p className="text-xs text-gray-500">เก็บค่าสนาม</p>
                    <p className="font-bold text-sm text-indigo-700">
                      ฿{courtFeeCollected}
                    </p>
                  </div>
                  <div
                    className={
                      "rounded-xl py-2.5 " +
                      (profit === null
                        ? "bg-gray-50"
                        : profit >= 0
                        ? "bg-emerald-50"
                        : "bg-red-50")
                    }
                  >
                    <p className="text-xs text-gray-500 mb-1 mt-1">กำไร/ขาดทุน</p>
                    <p
                      className={
                        "font-bold text-sm " +
                        (profit === null
                          ? "text-gray-400"
                          : profit >= 0
                          ? "text-emerald-600"
                          : "text-red-500")
                      }
                    >
                      {profit === null
                        ? "ไม่มีข้อมูล"
                        : `${profit >= 0 ? "+" : ""}฿${profit}`}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
          {sessions.length === 0 && (
            <div className="bg-white rounded-2xl shadow-md p-10 text-center text-gray-400">
              ยังไม่มีประวัติก๊วนที่ปิดแล้ว
            </div>
          )}
        </div>
      </div>

      <div className="w-full max-w-3xl mx-auto">
        <Footer />
      </div>
    </div>
  );
}
