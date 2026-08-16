"use client";

import { useActionState } from "react";
import { authenticate } from "./actions";
import Footer from "@/components/Footer";

const fontStack =
  "'Noto Sans Thai', Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

export default function LoginPage() {
  const [errorMessage, formAction, isPending] = useActionState(
    authenticate,
    undefined
  );

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
        className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#FBF8FF] to-[#F3EAFF] p-4"
        style={{ fontFamily: fontStack }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 max-w-4xl w-full bg-white rounded-[28px] overflow-hidden shadow-2xl">
          {/* Hero */}
          <div className="relative bg-gradient-to-br from-[#2A0A4A] via-[#6D28D9] to-[#9333EA] p-10 md:p-12 flex flex-col items-center justify-center text-white text-center overflow-hidden">
            <div
              className="absolute inset-0 opacity-[0.08] pointer-events-none"
              style={{
                backgroundImage:
                  "radial-gradient(circle, #fff 1px, transparent 1px)",
                backgroundSize: "22px 22px",
              }}
            />
            <div className="absolute -top-20 -right-16 w-64 h-64 rounded-full bg-white/10 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-14 w-72 h-72 rounded-full bg-fuchsia-300/20 blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center">
              <div className="h-24 mb-10 flex items-center justify-center">
                <img
                  src="/logo-white.png"
                  alt="SierraBad"
                  className="h-full w-auto object-contain drop-shadow-[0_8px_24px_rgba(0,0,0,0.35)]"
                />
              </div>
              <h1 className="text-2xl font-bold leading-snug mb-3">
                แพลตฟอร์มบริหารจัดการ
                <br />
                ก๊วนแบดมินตันมืออาชีพ
              </h1>
              <p className="text-sm leading-relaxed opacity-90 max-w-xs">
                จัดก๊วน เช็คอิน จับคู่เกมส์ คิดค่าลูก-ค่าสนาม
                และแจ้งเตือนสรุปผลอัตโนมัติเข้า LINE OA — ครบในที่เดียว
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="p-10 md:p-12 flex flex-col justify-center">
            <h2 className="text-xl font-bold text-[#3B0764] mb-1">
              เข้าสู่ระบบ
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              สำหรับผู้ดูแลระบบและผู้จัดการก๊วน
            </p>

            <form action={formAction} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#6D28D9] mb-1.5">
                  ชื่อผู้ใช้งาน (Username)
                </label>
                <input
                  name="username"
                  type="text"
                  placeholder="เช่น staff"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-purple-100 bg-purple-50 text-sm focus:outline-none focus:border-purple-400 focus:bg-white transition"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#6D28D9] mb-1.5">
                  รหัสผ่าน (Password)
                </label>
                <input
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-purple-100 bg-purple-50 text-sm focus:outline-none focus:border-purple-400 focus:bg-white transition"
                />
              </div>

              {errorMessage && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                  {errorMessage}
                </p>
              )}

              <button
                type="submit"
                disabled={isPending}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-purple-500 text-white font-bold text-sm shadow-lg shadow-purple-300 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-60"
              >
                {isPending ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
              </button>
            </form>

            <div className="mt-5 p-3 bg-purple-50 border border-dashed border-purple-200 rounded-xl text-xs text-gray-500 leading-relaxed">
              บัญชีผู้ใช้งานทั้งหมด (Admin และผู้จัดการก๊วน)
              ถูกสร้างและดูแลโดยผู้ดูแลระบบเท่านั้น
            </div>
          </div>
        </div>

        <div className="w-full max-w-4xl">
          <Footer />
        </div>
      </div>
    </>
  );
}
