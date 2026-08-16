import { auth, signOut } from "@/lib/auth";

export default async function ManagerPage() {
  const session = await auth();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#FBF8FF] to-[#F3EAFF] p-6">
      <div className="max-w-md mx-auto text-center pt-16 flex-1 w-full">
        <div className="h-10 mb-8 flex items-center justify-center">
          <img
            src="/logo.png"
            alt="SierraBad"
            className="h-full w-auto object-contain"
          />
        </div>

        <h1 className="text-2xl font-bold text-purple-900 mb-2">
          ยินดีต้อนรับ, {session?.user?.name ?? "ผู้จัดการก๊วน"}
        </h1>
        <p className="text-gray-500 mb-8 text-sm">เลือกเมนูที่ต้องการใช้งาน</p>

        <div className="space-y-4">
          <a
            href="/manager/session"
            className="group flex items-center gap-4 w-full p-5 rounded-2xl bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg shadow-purple-200 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all text-left"
          >
            <span className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="w-6 h-6"
                stroke="#fff"
                strokeWidth="1.8"
              >
                <path d="M12 3 8 10l4 11 4-11-4-7Z" strokeLinejoin="round" />
                <path d="M8 10h8" />
                <path d="M9.4 6.5h5.2" strokeWidth="1.4" />
              </svg>
            </span>
            <span>
              <span className="block font-bold text-base">จัดก๊วนวันนี้</span>
              <span className="block text-xs opacity-85 mt-0.5">
                เช็คอิน จัดคู่เกมส์ สรุปค่าใช้จ่าย
              </span>
            </span>
          </a>

          <a
            href="/manager/members"
            className="group flex items-center gap-4 w-full p-5 rounded-2xl bg-white border border-purple-100 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all text-left"
          >
            <span className="flex-shrink-0 w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="w-6 h-6"
                stroke="#7C3AED"
                strokeWidth="1.8"
              >
                <circle cx="12" cy="8" r="3.2" />
                <path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6" strokeLinecap="round" />
              </svg>
            </span>
            <span>
              <span className="block font-bold text-base text-purple-900">
                จัดการสมาชิก
              </span>
              <span className="block text-xs text-gray-500 mt-0.5">
                เพิ่มสมาชิกและตั้งค่าสนามรายคน
              </span>
            </span>
          </a>
        </div>

        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/login" });
          }}
          className="mt-8"
        >
          <button className="px-5 py-2.5 rounded-xl bg-gray-100 text-gray-600 text-sm font-bold hover:bg-gray-200 transition-colors">
            ออกจากระบบ
          </button>
        </form>
      </div>

      <p className="flex items-center justify-center gap-2 text-xs text-purple-400/70 tracking-wide pt-10 pb-4">
        <span className="font-semibold text-purple-500/80">SierraBad</span>
        <span className="opacity-50">·</span>
        <span>© 2569 บริษัท เซียร่า จำกัด</span>
        <span className="opacity-50">·</span>
        <span>สงวนลิขสิทธิ์ทุกประการ</span>
      </p>
    </div>
  );
}
