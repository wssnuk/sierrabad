import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();

  for (const event of body.events ?? []) {
    if (event.source?.type === "group") {
      console.log("LINE Group ID พบแล้ว:", event.source.groupId);
    }
  }

  return NextResponse.json({ ok: true });
}
