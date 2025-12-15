import { NextResponse } from "next/server";
import { google } from "googleapis";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { cycleDate, readings, summary } = body;

    if (!cycleDate || !Array.isArray(readings)) {
      return NextResponse.json(
        { error: "Invalid payload" },
        { status: 400 }
      );
    }

    // GOOGLE AUTH
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });
    const spreadsheetId = process.env.GOOGLE_SHEET_ID!;
    const sheetName = cycleDate;

    // CHECK IF SHEET EXISTS
    const info = await sheets.spreadsheets.get({ spreadsheetId });
    const sheetExists = info.data.sheets?.some(
      (s) => s.properties?.title === sheetName
    );

    // ADD SHEET IF NOT EXISTS
    if (!sheetExists) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: { title: sheetName },
              },
            },
          ],
        },
      });

      // HEADER
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${sheetName}!A1`,
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [
            ["Timestamp", "Temperature", "Humidity", "Summary"],
          ],
        },
      });
    }

    // FORMAT DATA ROWS
    const rows = readings.map((r: any, i: number) => [
      r.timestamp,
      r.temperature,
      r.humidity,
      i === 0 ? summary || "" : "",
    ]);

    // INSERT ROWS
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${sheetName}!A1`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: rows },
    });

    return NextResponse.json({
      success: true,
      message: `Uploaded ${rows.length} rows to Google Sheets.`,
    });
  } catch (err) {
    console.error("Sheets Error:", err);
    return NextResponse.json(
      { error: "Failed to upload to Google Sheets" },
      { status: 500 }
    );
  }
}