import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

interface SensorPacket {
  deviceId: string;
  temperature: number;
  humidity: number;
  timestamp: string;
}

let latest: SensorPacket | null = null;

// ====================== POST ==========================
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { deviceId, temperature, humidity } = body;

    if (!deviceId || typeof temperature !== "number" || typeof humidity !== "number") {
      return NextResponse.json({ ok: false, msg: "Invalid payload" }, { status: 400 });
    }

    latest = {
      deviceId,
      temperature: Number(temperature.toFixed(1)),
      humidity: Number(humidity.toFixed(1)),
      timestamp: new Date().toISOString(),
    };

    // BALIKAN SUPER RINGAN → ANTI CRASH ESP8266
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, msg: "Invalid JSON" }, { status: 400 });
  }
}

// ====================== GET ===========================
export async function GET() {
  if (!latest) {
    return NextResponse.json({ ok: false, msg: "No data yet" });
  }

  return NextResponse.json(latest); // <-- web fetch ini untuk display
}