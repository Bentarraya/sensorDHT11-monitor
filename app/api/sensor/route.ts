import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

let readings: any[] = []; // history sensor (aman buat dashboard)

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { deviceId, temperature, humidity } = body;

    if (!deviceId || typeof temperature !== "number" || typeof humidity !== "number") {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const packet = {
      deviceId,
      temperature,
      humidity,
      timestamp: new Date().toISOString(),
    };

    readings.push(packet);

    if (readings.length > 48) readings.shift(); // biar ga bengkak di memory

    return NextResponse.json({ ok: true }); // aman buat ESP
  } catch (err) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}

export async function GET() {
  return NextResponse.json(readings);
}
