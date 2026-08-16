export async function sendLineSummary(text: string) {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  const groupId = process.env.LINE_GROUP_ID;

  if (!token || !groupId) {
    console.warn("LINE_CHANNEL_ACCESS_TOKEN หรือ LINE_GROUP_ID ยังไม่ได้ตั้งค่า ข้ามการแจ้งเตือน");
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
