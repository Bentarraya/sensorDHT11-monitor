import { NextResponse } from "next/server";
import { lastUpdate, markUpdate } from "@/lib/device-status";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export async function GET() {
  try {
    // Ambil 24 data terakhir untuk chart
    const readingsUrl =
      `${process.env.SUPABASE_URL}/rest/v1/readings` +
      `?select=*&order=timestamp.desc&limit=24`;

    const res = await fetch(readingsUrl, {
      headers: {
        apikey: process.env.SUPABASE_ANON_KEY!,
        Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY!}`
      }
    });

    const readings = await res.json();

    // kalau kosong → jangan bikin error
    if (!Array.isArray(readings)) {
      return NextResponse.json({ readings: [], latest: null, online: false });
    }

    // Latest data (baru masuk)
    const latest = readings[0] ?? null;

    // Update waktu terakhir ESP kirim data
    if (latest) markUpdate(); // ← INI PENTING BUAT INDIKATOR ONLINE

    // Hitung status ESP
    const online = Date.now() - lastUpdate < 10000; // 10 detik

    // Kirim data ke dashboard
    return NextResponse.json({
      readings: readings.reverse(),  // biar chart dari lama → baru
      latest,
      online
    });

  } catch (error) {
    console.error("Sensor API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch sensor data", readings: [], latest: null },
      { status: 500 }
    );
  }
}
