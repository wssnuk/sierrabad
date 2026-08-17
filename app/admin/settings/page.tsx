import TopBar from "@/components/TopBar";
import Footer from "@/components/Footer";
import ChangePasswordForm from "./ChangePasswordForm";
import TestTelegramButton from "./TestTelegramButton";
import { getTelegramSettingsForForm, updateTelegramSettings } from "./actions";

const fontStack =
  "'Noto Sans Thai', Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

export default async function AdminSettingsPage() {
  const settings = await getTelegramSettingsForForm();

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
        className="min-h-screen flex flex-col bg-gradient-to-b from-[#FBF8FF] to-[#F3EAFF] p-4 sm:p-6"
        style={{ fontFamily: fontStack }}
      >
        <TopBar zone="โซนผู้ดูแลระบบ" backHref="/admin" backLabel="กลับ Dashboard" />

        <div className="max-w-2xl mx-auto w-full flex-1 space-y-6">
          <h1 className="text-xl sm:text-2xl font-bold text-[#3B0764]">
            ตั้งค่าระบบ
          </h1>

          {/* Password change */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="font-bold text-[#3B0764] mb-1">
              เปลี่ยนรหัสผ่านของฉัน
            </h2>
            <p className="text-xs text-gray-500 mb-4">
              ต้องกรอกรหัสผ่านเดิมให้ถูกต้องก่อนถึงจะเปลี่ยนได้
            </p>
            <ChangePasswordForm />
          </div>

          {/* Telegram integration */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="flex items-center gap-2 font-bold text-[#3B0764] mb-1">
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-sky-500" fill="currentColor">
                <path d="M21.5 4.5 2.7 11.9c-1.2.5-1.2 1.2-.2 1.5l4.8 1.5 1.8 5.6c.2.6.5.8.9.8.5 0 .7-.2 1-.5l2.4-2.3 4.9 3.6c.9.5 1.6.2 1.8-.8l3.3-15.4c.3-1.2-.5-1.8-1.9-1.4Z" />
              </svg>
              แจ้งเตือนผ่าน Telegram
            </h2>
            <p className="text-xs text-gray-500 mb-4">
              เมื่อตั้งค่าแล้ว ระบบจะส่งสรุปก๊วนเข้า Telegram พร้อมกับ LINE
              ทุกครั้งที่กด &quot;ส่งสรุปเข้า LINE&quot; ในหน้าจัดก๊วน
            </p>

            <div className="bg-sky-50/60 border border-sky-100 rounded-xl px-4 py-3 mb-4 text-xs text-sky-800 leading-relaxed space-y-1.5">
              <p className="font-bold">วิธีตั้งค่า (ทำครั้งเดียว ใช้เวลา ~2 นาที):</p>
              <p>
                1. เปิด Telegram แชทหา{" "}
                <span className="font-semibold">@BotFather</span> พิมพ์{" "}
                <span className="font-mono bg-white px-1 rounded">/newbot</span>{" "}
                แล้วตั้งชื่อบอทตามที่ต้องการ
              </p>
              <p>
                2. BotFather จะให้ &quot;Token&quot; มา (ยาวประมาณ 45 ตัวอักษร)
                คัดลอกมาใส่ช่อง &quot;Bot Token&quot; ด้านล่าง
              </p>
              <p>
                3. เพิ่มบอทเข้ากลุ่ม/แชทที่ต้องการรับแจ้งเตือน แล้วส่งข้อความ
                อะไรก็ได้ในนั้น 1 ครั้ง
              </p>
              <p>
                4. เปิดลิงก์นี้ในเบราว์เซอร์ (แทนที่ YOUR_TOKEN ด้วย Token
                จริง):{" "}
                <span className="font-mono bg-white px-1 rounded break-all">
                  https://api.telegram.org/botYOUR_TOKEN/getUpdates
                </span>{" "}
                แล้วมองหาตัวเลข &quot;chat&quot;:&quot;id&quot;: ตัวนั้นคือ
                Chat ID
              </p>
            </div>

            <form action={updateTelegramSettings} className="space-y-3 mb-4">
              <div>
                <label className="block text-xs font-bold text-sky-700 mb-1.5">
                  Bot Token
                </label>
                <input
                  name="telegramBotToken"
                  defaultValue={settings?.telegramBotToken ?? ""}
                  placeholder="เช่น 123456789:AAExxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  className="w-full px-4 py-2.5 rounded-xl border border-sky-100 bg-sky-50/60 text-sm font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-sky-700 mb-1.5">
                  Chat ID
                </label>
                <input
                  name="telegramChatId"
                  defaultValue={settings?.telegramChatId ?? ""}
                  placeholder="เช่น -1001234567890"
                  className="w-full px-4 py-2.5 rounded-xl border border-sky-100 bg-sky-50/60 text-sm font-mono"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-600 to-sky-500 text-white font-bold text-sm shadow hover:shadow-md transition-shadow"
              >
                บันทึกการตั้งค่า
              </button>
            </form>

            <TestTelegramButton />
          </div>
        </div>

        <div className="w-full max-w-2xl mx-auto">
          <Footer />
        </div>
      </div>
    </>
  );
}
