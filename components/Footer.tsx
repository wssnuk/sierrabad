export default function Footer() {
  return (
    <div className="relative mt-10 pt-6 pb-5 overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.35] pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, #E9D5FF 0px, #E9D5FF 1px, transparent 1px, transparent 14px)",
        }}
      />
      <div className="relative text-center space-y-1">
        <p className="text-xs font-bold text-purple-600">
          © 2569 SierraBad · บริษัท เซียร่า จำกัด · สงวนลิขสิทธิ์ทุกประการ
        </p>
        <p className="text-[10px] text-purple-300/80">
          ห้ามคัดลอกหรือนำระบบนี้ไปใช้โดยไม่ได้รับอนุญาต
        </p>
      </div>
    </div>
  );
}
