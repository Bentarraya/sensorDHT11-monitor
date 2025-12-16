// app/api/sensor/route.ts
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

let latest: any = null;
let lastSeen: string | null = null;

export async function POST(req: Request) {
  try {
    const { temperature, humidity } = await req.json();

    if (typeof temperature !== "number" || typeof humidity !== "number") {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    latest = {
      temperature,
      humidity,
      timestamp: new Date().toISOString(),
    };

    lastSeen = latest.timestamp;

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}

export async function GET() {
  return NextResponse.json({
    latest,
    lastSeen,
  });
}
