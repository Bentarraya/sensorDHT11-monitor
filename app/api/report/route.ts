import { NextResponse } from "next/server";
import { google } from "googleapis";

export async function GET() {
  try {
    const supabaseUrl = `${process.env.SUPABASE_URL}/rest/v1/readings?select=*&order=timestamp.desc&limit=24`;

    const result = await fetch(supabaseUrl, {
      headers: {
        apikey: process.env.SUPABASE_ANON_KEY!,
        Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY!}`
      }
    });

    const data = await result.json();

    if (!Array.isArray(data) || data.length === 0) {
      return NextResponse.json({ error: "No data to report" }, { status: 400 });
    }

    // === GOOGLE SHEETS ===
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"]
    });

    const sheets = google.sheets({ version: "v4", auth });

    const rows = data.map((r) => [
      r.timestamp,
      r.temperature,
      r.humidity,
      r.deviceId
    ]);

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID!,
      range: "DailyReport!A1",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [
          ["Timestamp", "Temperature", "Humidity", "Device"],
          ...rows,
          [],
          [`Report generated at ${new Date().toLocaleString()}`]
        ],
      }
    });

    return NextResponse.json({ success: true, rows: data.length });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Report failed" }, { status: 500 });
  }
      }
