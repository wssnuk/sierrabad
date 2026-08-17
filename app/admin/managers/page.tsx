import { prisma } from "@/lib/prisma";
import { createManager } from "./actions";
import ManagerRow from "./ManagerRow";
import TopBar from "@/components/TopBar";
import Footer from "@/components/Footer";

const fontStack =
  "var(--font-thai), var(--font-inter), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

export default async function ManagersPage() {
  const managers = await prisma.user.findMany({
    where: { role: "MANAGER" },
    orderBy: { username: "asc" },
  });

  return (
    <div
      className="min-h-screen flex flex-col bg-gradient-to-b from-[#FBF8FF] to-[#F3EAFF] p-4 sm:p-6"
      style={{ fontFamily: fontStack }}
    >
      <TopBar zone="โซนผู้ดูแลระบบ" backHref="/admin" backLabel="กลับ Dashboard" />

      <div className="max-w-2xl mx-auto w-full flex-1">
        <h1 className="text-xl sm:text-2xl font-bold text-[#3B0764] mb-6">
          จัดการบัญชีผู้จัดการก๊วน
        </h1>

        <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
          <h2 className="font-bold text-[#3B0764] mb-4">
            + สร้างบัญชีผู้จัดการใหม่
          </h2>
          <form action={createManager} className="space-y-3">
            <input
              name="name"
              placeholder="ชื่อ-นามสกุล"
              required
              className="w-full px-4 py-2.5 rounded-xl border border-purple-100 bg-purple-50 text-sm"
            />
            <input
              name="username"
              placeholder="ชื่อผู้ใช้งาน (username)"
              required
              className="w-full px-4 py-2.5 rounded-xl border border-purple-100 bg-purple-50 text-sm"
            />
            <input
              name="password"
              type="password"
              placeholder="รหัสผ่าน"
              required
              className="w-full px-4 py-2.5 rounded-xl border border-purple-100 bg-purple-50 text-sm"
            />
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 text-white font-bold text-sm shadow hover:shadow-md transition-shadow"
            >
              สร้างบัญชี
            </button>
          </form>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="font-bold text-[#3B0764] mb-4">
            ผู้จัดการทั้งหมด ({managers.length} คน)
          </h2>
          <div className="space-y-1">
            {managers.map((m) => (
              <ManagerRow key={m.id} manager={m} />
            ))}
            {managers.length === 0 && (
              <p className="text-sm text-gray-400">ยังไม่มีผู้จัดการ</p>
            )}
          </div>
        </div>
      </div>

      <div className="w-full max-w-2xl mx-auto">
        <Footer />
      </div>
    </div>
  );
}
