import { auth, signOut } from "@/lib/auth";

export default async function ManagerPage() {
  const session = await auth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-purple-50">
      <div className="text-center max-w-sm">
        <h1 className="text-2xl font-bold text-purple-900 mb-2">
          ยินดีต้อนรับ, {session?.user?.name ?? "ผู้จัดการก๊วน"}
        </h1>
        <p className="text-gray-500 mb-6 text-sm">
          เข้าสู่ระบบสำเร็จแล้ว! หน้า Manager Dashboard เต็มรูปแบบกำลังพัฒนาต่อ
        </p>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/login" });
          }}
        >
          <button className="px-5 py-2.5 rounded-xl bg-purple-600 text-white text-sm font-bold">
            ออกจากระบบ
          </button>
        </form>
      </div>
    </div>
  );
}

