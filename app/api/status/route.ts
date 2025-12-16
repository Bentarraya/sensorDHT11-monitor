import { NextResponse } from "next/server";
import { lastUpdate } from "@/lib/device-status";

export const dynamic = "force-dynamic";

export async function GET() {
  const online = Date.now() - lastUpdate < 10000; // 10 detik
  return NextResponse.json({ online, lastUpdate });
}
