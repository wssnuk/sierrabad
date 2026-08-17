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
      className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-purple-500 text-white font-bold text-sm shadow-lg shadow-purple-200 hover:shadow-xl transition-all disabled:opacity-60"
    >
      {pending ? "กำลังส่ง..." : "ส่งสรุปเข้า LINE"}
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
