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

    if (!deviceId) {
      return NextResponse.json({ error: "Missing deviceId" }, { status: 400 });
    }

    if (typeof temperature !== "number") {
      return NextResponse.json({ error: "Invalid temperature" }, { status: 400 });
    }

    if (typeof humidity !== "number") {
      return NextResponse.json({ error: "Invalid humidity" }, { status: 400 });
    }

    const reading: SensorReading = {
      deviceId,
      temperature: parseFloat(temperature.toFixed(1)),
      humidity: parseFloat(humidity.toFixed(1)),
      timestamp: new Date().toISOString(),
    };

    readings.push(reading);

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