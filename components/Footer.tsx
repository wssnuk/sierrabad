export default function Footer() {
  return (
    <div className="relative mt-10 pt-8 pb-6 overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.35] pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, #E9D5FF 0px, #E9D5FF 1px, transparent 1px, transparent 14px)",
        }}
      />
      <div className="relative text-center space-y-1.5">
        <p className="text-xs font-bold text-purple-600">
          © 2569 สงวนลิขสิทธิ์โดย บริษัท เซียร่า จำกัด
        </p>
        <p className="text-xs text-purple-400">
          สนับสนุนโดย บริษัท เซียร่า จำกัด
        </p>
        <p className="text-[11px] text-purple-300">
          ดูแลระบบโดยทีม SierraBad
        </p>
        <p className="text-[10px] text-purple-300/70 pt-1">
          ห้ามคัดลอกหรือนำข้อมูล/ระบบนี้ไปใช้โดยไม่ได้รับอนุญาต
        </p>
      </div>
    </div>
  );
}
