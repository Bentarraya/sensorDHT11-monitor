import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

interface SensorReading {
  deviceId: string;
  temperature: number;
  humidity: number;
  timestamp: string;
}

let readings: SensorReading[] = [];

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { deviceId, temperature, humidity } = body;

    if (!deviceId || typeof temperature !== "number" || typeof humidity !== "number") {
      return NextResponse.json({ error: true }, { status: 400 });
    }

    const reading: SensorReading = {
      deviceId,
      temperature,
      humidity,
      timestamp: new Date().toISOString(),
    };

    readings.push(reading);

    // BALASAN SUPER RINGAN BIAR ESP TIDAK CRASH
    return NextResponse.json({ ok: true }, { status: 201 });

  } catch {
    return NextResponse.json({ error: true }, { status: 400 });
  }
}

export async function GET() {
  return NextResponse.json({ readings });
}ding);

    return NextResponse.json({ success: true, reading }, { status: 201 });

  } catch (err) {
    return NextResponse.json(
      { error: "Invalid JSON" },
      { status: 400 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ readings });
}