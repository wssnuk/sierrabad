import { prisma } from "@/lib/prisma";
import { runGlobalMaintenance } from "../manager/session/actions";
import { signOut } from "@/lib/auth";
import TopBar from "@/components/TopBar";
import Footer from "@/components/Footer";
import DeleteSessionButton from "./DeleteSessionButton";
import LastEditedBadge from "@/components/LastEditedBadge";
import AutoRefresh from "./AutoRefresh";

const fontStack =
  "'Noto Sans Thai', Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

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
  await runGlobalMaintenance();

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


  const [topFrequentRaw, leastRecentRaw] = await Promise.all([
    prisma.checkIn.groupBy({
      by: ["memberId"],
      _count: { memberId: true },
      orderBy: { _count: { memberId: "desc" } },
      take: 5,
    }),
    prisma.checkIn.groupBy({
      by: ["memberId"],
      _max: { checkedInAt: true },
      orderBy: { _max: { checkedInAt: "asc" } },
      take: 5,
    }),
  ]);

  const statMemberIds = Array.from(
    new Set([
      ...topFrequentRaw.map((r) => r.memberId),
      ...leastRecentRaw.map((r) => r.memberId),
    ])
  );
  const statMembers = await prisma.member.findMany({
    where: { id: { in: statMemberIds } },
  });
  const memberNameById = new Map(statMembers.map((m) => [m.id, m.name]));

  const topFrequent = topFrequentRaw.map((r) => ({
    name: memberNameById.get(r.memberId) ?? "?",
    count: r._count.memberId,
  }));
  const leastRecent = leastRecentRaw.map((r) => ({
    name: memberNameById.get(r.memberId) ?? "?",
    lastSeen: r._max.checkedInAt,
  }));

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="anonymous"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700;800&display=swap"
        rel="stylesheet"
      />
      <div
        className="min-h-screen bg-gradient-to-b from-[#FBF8FF] to-[#F3EAFF] p-4 sm:p-6"
        style={{ fontFamily: fontStack }}
      >
        <AutoRefresh intervalMs={15000} />
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
          <div className="flex gap-2 flex-wrap">
            <a
              href="/admin/managers"
              className="px-4 py-2.5 rounded-xl bg-purple-900 text-white text-sm font-bold shadow hover:shadow-md transition-shadow"
            >
              จัดการบัญชีผู้จัดการ
            </a>
            <a
              href="/admin/settings"
              className="px-4 py-2.5 rounded-xl bg-white border border-purple-200 text-purple-700 text-sm font-bold hover:bg-purple-50 transition-colors"
            >
              ตั้งค่าระบบ
            </a>
            <a
              href="/manager/session"
              className="px-4 py-2.5 rounded-xl bg-white border border-purple-200 text-purple-700 text-sm font-bold hover:bg-purple-50 transition-colors"
            >
              โหมดผู้จัดการก๊วน
            </a>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/login" });
              }}
            >
              <button className="px-4 py-2.5 rounded-xl bg-gray-100 text-gray-600 text-sm font-bold hover:bg-gray-200 transition-colors">
                ออกจากระบบ
              </button>
            </form>
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

        {/* Member activity insights */}
        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-amber-300">
            <h2 className="flex items-center gap-2 font-bold text-[#3B0764] mb-4 text-lg">
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="#D97706" strokeWidth="1.8">
                <path d="M12 2l2.6 6.6L21 9l-5 4.4L17.5 21 12 17.3 6.5 21 8 13.4 3 9l6.4-.4L12 2Z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              สมาชิกมาบ่อยสุด
            </h2>
            {topFrequent.length === 0 ? (
              <p className="text-sm text-gray-400">ยังไม่มีข้อมูล</p>
            ) : (
              <ol className="space-y-2.5">
                {topFrequent.map((m, i) => (
                  <li key={i} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                        {i + 1}
                      </span>
                      <span className="font-medium text-gray-700">{m.name}</span>
                    </span>
                    <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full">
                      {m.count} ครั้ง
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-rose-300">
            <h2 className="flex items-center gap-2 font-bold text-[#3B0764] mb-4 text-lg">
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="#E11D48" strokeWidth="1.8">
                <circle cx="12" cy="12" r="8.5" />
                <path d="M12 8v4.5l3 2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              หายไปนานสุด
            </h2>
            {leastRecent.length === 0 ? (
              <p className="text-sm text-gray-400">ยังไม่มีข้อมูล</p>
            ) : (
              <ol className="space-y-2.5">
                {leastRecent.map((m, i) => (
                  <li key={i} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-rose-100 text-rose-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                        {i + 1}
                      </span>
                      <span className="font-medium text-gray-700">{m.name}</span>
                    </span>
                    <span className="text-xs font-semibold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full">
                      {m.lastSeen
                        ? new Date(m.lastSeen).toLocaleDateString("th-TH", {
                            day: "numeric",
                            month: "short",
                            timeZone: "Asia/Bangkok",
                          })
                        : "-"}
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </div>
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
                  <th className="pb-2 pr-3">แก้ไขล่าสุด</th>
                  <th className="pb-2"></th>
                </tr>
              </thead>
              <tbody>
                {recentSessions.map((s, i) => (
                  <tr key={s.id} className={i % 2 === 0 ? "bg-purple-50/40" : ""}>
                    <td className="py-2.5 pr-3 font-medium pl-2 rounded-l-lg">
                      <a
                        href={`/manager/session?id=${s.id}`}
                        className="text-purple-700 hover:underline"
                      >
                        {s.courtName}
                      </a>
                    </td>
                    <td className="py-2.5 pr-3 text-gray-600">
                      {new Date(s.date).toLocaleDateString("th-TH", {
                        day: "numeric",
                        month: "short",
                        year: "2-digit",
                        timeZone: "Asia/Bangkok",
                      })}{" "}
                      ·{" "}
                      {new Date(s.date).toLocaleTimeString("th-TH", {
                        hour: "2-digit",
                        minute: "2-digit",
                        timeZone: "Asia/Bangkok",
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
                    <td className="py-2.5 pr-3">
                      <LastEditedBadge
                        name={s.lastEditedBy}
                        at={s.lastEditedAt}
                      />
                    </td>
                    <td className="py-2.5 rounded-r-lg pr-2 text-right">
                      <DeleteSessionButton sessionId={s.id} />
                    </td>
                  </tr>
                ))}
                {recentSessions.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-gray-400">
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
    </>
  );
}
