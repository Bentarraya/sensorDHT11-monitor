import { NextResponse } from "next/server";

export async function GET() {
  const res = await fetch(
    `${process.env.SUPABASE_URL}/rest/v1/readings_raw?select=temperature,humidity,timestamp&order=timestamp.desc&limit=1`,
    {
      headers: {
        apikey: process.env.SUPABASE_ANON_KEY!,
        Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY}`,
      },
      cache: "no-store",
    }
  );

  if (!res.ok) {
    return NextResponse.json({ error: "Failed to fetch latest" }, { status: 500 });
  }

  const data = await res.json();
  return NextResponse.json(data[0] ?? null);
}
