import { prisma } from "@/lib/prisma";

export async function getLineSettings() {
  return prisma.settings.findUnique({ where: { id: "singleton" } });
}

export async function sendLineSummary(text: string) {
  const settings = await getLineSettings();
  const token = settings?.lineChannelAccessToken;
  const groupId = settings?.lineGroupId;

  if (!token || !groupId) {
    console.warn("lineChannelAccessToken เธซเธฃเธทเธญ lineGroupId เธขเธฑเธเนเธกเนเนเธ”เนเธ•เธฑเนเธเธเนเธฒ เธเนเธฒเธกเธเธฒเธฃเนเธเนเธเน€เธ•เธทเธญเธ");
    return;
  }

  try {
    const res = await fetch("https://api.line.me/v2/bot/message/push", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        to: groupId,
        messages: [{ type: "text", text }],
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error("LINE push failed:", res.status, body);
    }
  } catch (err) {
    console.error("LINE push error:", err);
  }
}
