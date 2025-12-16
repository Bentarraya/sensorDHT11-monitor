import { NextResponse } from "next/server";

export async function GET() {
  const url = `${process.env.SUPABASE_URL}/rest/v1/readings?select=*&order=timestamp.desc&limit=24`;

  const res = await fetch(url, {
    headers: {
      apikey: process.env.SUPABASE_ANON_KEY!,
      Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY}`
    }
  });

  const data = await res.json();

  // reverse supaya chart dari data lama ke terbaru
  return NextResponse.json(data.reverse());
}
