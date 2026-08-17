import { prisma } from "@/lib/prisma";
import { runSessionMaintenance } from "../manager/session/actions";
import TopBar from "@/components/TopBar";
import Footer from "@/components/Footer";
import DeleteSessionButton from "./DeleteSessionButton";

const fontStack =
  "var(--font-thai), var(--font-inter), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

function StatCard({
  label,
  value,
  accent,
  icon,
}: {
  label: string;
  value: string | number;
  accent: string;
  icon: React.ReactNode;
}) {
  return (
    <div className={`bg-white rounded-2xl shadow-md p-5 border-l-4 ${accent}`}>
      <div className="flex items-center gap-3 mb-2">
        <span className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0">
          {icon}
        </span>
        <p className="text-xs font-semibold text-gray-500">{label}</p>
      </div>
      <p className="text-2xl font-bold text-[#3B0764]">{value}</p>
    </div>
  );
}

export default async function AdminDashboard() {
  await runSessionMaintenance();

  const [managersCount, membersCount, totalSessions, closedSessions, todayOpenSession, recentSessions] =
    await Promise.all([
      prisma.user.count({ where: { role: "MANAGER" } }),
      prisma.member.count(),
      prisma.session.count(),
      prisma.session.count({ where: { status: "CLOSED" } }),
      prisma.session.findFirst({ where: { status: "OPEN" } }),
      prisma.session.findMany({
        include: { checkIns: true, games: true },
        orderBy: { date: "desc" },
        take: 6,
      }),
    ]);

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-[#FBF8FF] to-[#F3EAFF] p-4 sm:p-6"
      style={{ fontFamily: fontStack }}
    >
      <TopBar zone="โซนผู้ดูแลระบบ · Dashboard" />

      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#3B0764]">
              ภาพรวมระบบ
            </h1>
            <p className="text-sm text-gray-500">
              มอนิเตอร์การจัดก๊วนและผู้จัดการทั้งหมดในระบบ
            </p>
          </div>
          <div className="flex gap-2">
            <a
              href="/admin/managers"
              className="px-4 py-2.5 rounded-xl bg-purple-900 text-white text-sm font-bold shadow hover:shadow-md transition-shadow"
            >
              จัดการบัญชีผู้จัดการ
            </a>
            <a
              href="/manager/session"
              className="px-4 py-2.5 rounded-xl bg-white border border-purple-200 text-purple-700 text-sm font-bold hover:bg-purple-50 transition-colors"
            >
              โหมดผู้จัดการก๊วน
            </a>
          </div>
        </div>

        {/* Stat grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <StatCard
            label="ผู้จัดการก๊วน"
            value={managersCount}
            accent="border-purple-300"
            icon={
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="#7C3AED" strokeWidth="1.8">
                <circle cx="9" cy="8" r="3" />
                <path d="M2.5 20c0-3.3 2.9-6 6.5-6s6.5 2.7 6.5 6" strokeLinecap="round" />
              </svg>
            }
          />
          <StatCard
            label="สมาชิกทั้งหมด"
            value={membersCount}
            accent="border-indigo-300"
            icon={
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="#6366F1" strokeWidth="1.8">
                <circle cx="12" cy="8" r="3.2" />
                <path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6" strokeLinecap="round" />
              </svg>
            }
          />
          <StatCard
            label="ก๊วนที่ปิดแล้ว"
            value={closedSessions}
            accent="border-fuchsia-300"
            icon={
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="#C026D3" strokeWidth="1.8">
                <path d="M3 12a9 9 0 1 0 3-6.7" strokeLinecap="round" />
                <path d="M3 4v5h5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            }
          />
          <StatCard
            label="สถานะวันนี้"
            value={todayOpenSession ? "กำลังจัดก๊วน" : "ยังไม่เปิด"}
            accent={todayOpenSession ? "border-emerald-300" : "border-gray-300"}
            icon={
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="#059669" strokeWidth="1.8">
                <circle cx="12" cy="12" r="8.5" />
                <path d="M12 8v4.5l3 2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            }
          />
        </div>

        {/* Recent sessions overview table */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="font-bold text-[#3B0764] mb-4 text-lg">
            ก๊วนล่าสุดในระบบ
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 border-b">
                  <th className="pb-2 pr-3">สนาม</th>
                  <th className="pb-2 pr-3">วันที่ / เวลา</th>
                  <th className="pb-2 pr-3">สมาชิก</th>
                  <th className="pb-2 pr-3">แมทช์</th>
                  <th className="pb-2 pr-3">สถานะ</th>
                  <th className="pb-2"></th>
                </tr>
              </thead>
              <tbody>
                {recentSessions.map((s, i) => (
                  <tr key={s.id} className={i % 2 === 0 ? "bg-purple-50/40" : ""}>
                    <td className="py-2.5 pr-3 font-medium pl-2 rounded-l-lg">
                      {s.status === "OPEN" ? (
                        <a
                          href={`/manager/session?id=${s.id}`}
                          className="text-purple-700 hover:underline"
                        >
                          {s.courtName}
                        </a>
                      ) : (
                        s.courtName
                      )}
                    </td>
                    <td className="py-2.5 pr-3 text-gray-600">
                      {new Date(s.date).toLocaleDateString("th-TH", {
                        day: "numeric",
                        month: "short",
                        year: "2-digit",
                      })}{" "}
                      ·{" "}
                      {new Date(s.date).toLocaleTimeString("th-TH", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="py-2.5 pr-3 text-gray-600">
                      {s.checkIns.length} คน
                    </td>
                    <td className="py-2.5 pr-3 text-gray-600">
                      {s.games.length} แมทช์
                    </td>
                    <td className="py-2.5 pr-3">
                      <span
                        className={
                          "px-2.5 py-1 rounded-full text-xs font-semibold " +
                          (s.status === "OPEN"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-gray-100 text-gray-600")
                        }
                      >
                        {s.status === "OPEN" ? "กำลังจัด" : "ปิดแล้ว"}
                      </span>
                    </td>
                    <td className="py-2.5 rounded-r-lg pr-2 text-right">
                      <DeleteSessionButton sessionId={s.id} />
                    </td>
                  </tr>
                ))}
                {recentSessions.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-gray-400">
                      ยังไม่มีข้อมูลก๊วนในระบบ
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <a
            href="/manager/history"
            className="inline-block mt-4 text-sm text-purple-600 font-semibold hover:text-purple-800"
          >
            ดูประวัติทั้งหมด →
          </a>
        </div>

        <Footer />
      </div>
    </div>
  );
}
