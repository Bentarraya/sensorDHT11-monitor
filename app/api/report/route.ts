// app/api/report/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { date, data } = await req.json();

    if (!date || !Array.isArray(data)) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/sheets/upload`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sheetName: date,
        rows: data,
      }),
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
