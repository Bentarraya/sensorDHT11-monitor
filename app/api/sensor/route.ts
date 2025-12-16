// app/api/sensor/route.ts
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

interface HourlyData {
  temperature: number;
  humidity: number;
  timestamp: string;
}

let hourlyBuffer: HourlyData[] = [];
let lastSeen: string | null = null;

export async function POST(req: Request) {
  try {
    const { temperature, humidity } = await req.json();

    if (typeof temperature !== "number" || typeof humidity !== "number") {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const entry: HourlyData = {
      temperature,
      humidity,
      timestamp: new Date().toISOString(),
    };

    hourlyBuffer.push(entry);
    lastSeen = entry.timestamp;

    // maksimal 24 data (1 hari)
    if (hourlyBuffer.length >= 24) {
      // trigger auto report (fire and forget)
      fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: entry.timestamp.slice(0, 10),
          data: hourlyBuffer,
        }),
      }).catch(() => {});

      hourlyBuffer = [];
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}

export async function GET() {
  return NextResponse.json({
    latest: hourlyBuffer.at(-1) ?? null,
    lastSeen,
    count: hourlyBuffer.length,
  });
}
