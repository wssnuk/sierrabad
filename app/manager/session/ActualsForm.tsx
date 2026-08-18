"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { updateActuals, sendLineNow } from "./actions";
import { ScaleIcon, CoinIcon, ShuttleIcon } from "./Icons";

function SaveActualsButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-bold text-sm shadow hover:shadow-md transition-shadow disabled:opacity-60"
    >
      {pending ? "กำลังบันทึก..." : "บันทึกยอดจริง"}
    </button>
  );
}

function SendLineButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-fuchsia-500 to-purple-600 text-white font-bold text-sm shadow-lg shadow-purple-200 hover:shadow-xl transition-all disabled:opacity-60 flex items-center justify-center gap-2.5"
    >
      {pending ? (
        "กำลังส่ง..."
      ) : (
        <>
          <span className="flex items-center gap-1.5">
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
              <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.037 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
            </svg>
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
              <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
            </svg>
          </span>
          <span>ส่งสรุปเข้า LINE + Telegram</span>
        </>
      )}
    </button>
  );
}

export default function ActualsForm({
  sessionId,
  actualCourtFeePaid,
  courtFeeCollected,
  totalShuttles,
  shuttlePrice,
}: {
  sessionId: string;
  actualCourtFeePaid: number | null;
  courtFeeCollected: number;
  totalShuttles: number;
  shuttlePrice: number;
}) {
  const [saved, setSaved] = useState(actualCourtFeePaid);
  const shuttleCost = totalShuttles * shuttlePrice;

  const profit =
    saved !== null && saved !== undefined ? courtFeeCollected - saved : null;

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-emerald-300">
      <h2 className="flex items-center gap-2 font-bold text-[#3B0764] mb-1 text-lg">
        <ScaleIcon className="w-5 h-5 text-emerald-600" />
        สรุปค่าใช้จ่าย &amp; กำไร-ขาดทุน
      </h2>
      <p className="text-xs text-gray-500 mb-4">
        เห็นได้เฉพาะแอดมินและผู้จัดการเท่านั้น — ไม่ถูกส่งไป LINE
      </p>

      <div className="flex items-center justify-between text-sm py-2.5 px-3 bg-fuchsia-50/60 rounded-xl mb-4">
        <span className="flex items-center gap-1.5 text-fuchsia-700 font-medium">
          <ShuttleIcon className="w-3.5 h-3.5" />
          ลูกแบดที่ใช้ทั้งหมด (คำนวณจากแมทช์อัตโนมัติ)
        </span>
        <span className="font-bold text-fuchsia-700">
          {totalShuttles} ลูก · ฿{shuttleCost}
        </span>
      </div>

      <form
        action={async (formData: FormData) => {
          await updateActuals(sessionId, formData);
          const v = formData.get("actualCourtFeePaid");
          setSaved(v === null || v === "" ? null : Number(v));
        }}
        className="mb-4"
      >
        <label className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 mb-1.5">
          <CoinIcon className="w-3.5 h-3.5" />
          ค่าสนามที่จ่ายจริง (บาท)
        </label>
        <input
          name="actualCourtFeePaid"
          type="number"
          defaultValue={actualCourtFeePaid ?? ""}
          placeholder="เช่น 800"
          className="w-full px-4 py-3 rounded-xl border border-emerald-100 bg-emerald-50/60 text-base mb-3"
        />
        <SaveActualsButton />
      </form>

      <div className="grid grid-cols-2 gap-3 text-center mb-5">
        <div className="bg-gray-50 rounded-xl py-3">
          <p className="text-xs text-gray-500 mb-1">เก็บจากสมาชิก</p>
          <p className="font-bold text-gray-700">฿{courtFeeCollected}</p>
        </div>
        <div
          className={
            "rounded-xl py-3 " +
            (profit === null
              ? "bg-gray-50"
              : profit >= 0
              ? "bg-emerald-50"
              : "bg-red-50")
          }
        >
          <p className="text-xs text-gray-500 mb-1">กำไร/ขาดทุน</p>
          <p
            className={
              "font-bold " +
              (profit === null
                ? "text-gray-400"
                : profit >= 0
                ? "text-emerald-600"
                : "text-red-500")
            }
          >
            {profit === null
              ? "ยังไม่กรอกยอดจริง"
              : `${profit >= 0 ? "+" : ""}฿${profit}`}
          </p>
        </div>
      </div>

      <form action={sendLineNow.bind(null, sessionId)}>
        <SendLineButton />
      </form>
    </div>
  );
}
