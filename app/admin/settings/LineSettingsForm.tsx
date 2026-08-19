"use client";

import { useState } from "react";
import { updateLineSettings } from "./actions";

export default function LineSettingsForm({
  initialToken,
  initialGroupId,
}: {
  initialToken: string;
  initialGroupId: string;
}) {
  const [token, setToken] = useState(initialToken);
  const [groupId, setGroupId] = useState(initialGroupId);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    const formData = new FormData();
    formData.set("lineChannelAccessToken", token);
    formData.set("lineGroupId", groupId);
    await updateLineSettings(formData);
    setIsSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <form onSubmit={handleSave} className="space-y-3 mb-4">
      <div>
        <label className="block text-xs font-bold text-lime-700 mb-1.5">
          Channel Access Token
        </label>
        <input
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="วาง Channel access token ที่นี่"
          className="w-full px-4 py-2.5 rounded-xl border border-lime-100 bg-lime-50/60 text-sm font-mono"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-lime-700 mb-1.5">
          Group ID
        </label>
        <input
          value={groupId}
          onChange={(e) => setGroupId(e.target.value)}
          placeholder="Uxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
          className="w-full px-4 py-2.5 rounded-xl border border-lime-100 bg-lime-50/60 text-sm font-mono"
        />
      </div>

      {saved && (
        <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
          บันทึกการตั้งค่าสำเร็จแล้ว
        </p>
      )}

      <button
        type="submit"
        disabled={isSaving}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-lime-600 to-lime-500 text-white font-bold text-sm shadow hover:shadow-md transition-shadow disabled:opacity-60"
      >
        {isSaving ? "กำลังบันทึก..." : "บันทึกการตั้งค่า LINE"}
      </button>
    </form>
  );
}
