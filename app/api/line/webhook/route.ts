import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  console.log("LINE webhook event เต็ม:", JSON.stringify(body));
  return NextResponse.json({ ok: true });
}
