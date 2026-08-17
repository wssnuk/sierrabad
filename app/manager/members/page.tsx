import { prisma } from "@/lib/prisma";
import MemberRow from "./MemberRow";
import AddMemberForm from "./AddMemberForm";
import Footer from "@/components/Footer";

const fontStack =
  "'Noto Sans Thai', Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

export default async function MembersPage() {
  const members = await prisma.member.findMany({
    orderBy: { createdAt: "desc" },
  });

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
      <div className="max-w-3xl mx-auto w-full flex-1">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-[#3B0764]">
            จัดการสมาชิก
          </h1>
          <a href="/manager" className="text-sm text-purple-600 font-semibold">
            ← กลับหน้าหลัก
          </a>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-5 sm:p-6 mb-6">
          <h2 className="font-bold text-[#3B0764] mb-4">+ เพิ่มสมาชิกใหม่</h2>
          <AddMemberForm existingNames={members.map((m) => m.name)} />
        </div>

        <div className="bg-white rounded-2xl shadow-md p-5 sm:p-6">
          <h2 className="font-bold text-[#3B0764] mb-4">
            รายชื่อสมาชิกทั้งหมด ({members.length} คน)
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[300px]">
              <thead>
                <tr className="text-left text-xs text-gray-500 border-b">
                  <th className="pb-2">ชื่อ</th>
                  <th className="pb-2">ค่าสนามต่อครั้ง</th>
                </tr>
              </thead>
              <tbody>
                {members.map((m) => (
                  <MemberRow key={m.id} member={m} />
                ))}
                {members.length === 0 && (
                  <tr>
                    <td colSpan={2} className="py-6 text-center text-gray-400">
                      ยังไม่มีสมาชิก
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="w-full max-w-3xl mx-auto">
        <Footer />
      </div>
    </div>
    </>
  );
}
