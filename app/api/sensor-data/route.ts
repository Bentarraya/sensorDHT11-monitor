import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

interface SensorReading {
  deviceId: string;
  temperature: number;
  humidity: number;
  timestamp: string;
}

// In-memory (Vercel ephemeral, only for testing)
let readings: SensorReading[] = [];

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { deviceId, temperature, humidity } = body;

    if (!deviceId)
      return NextResponse.json({ error: "Missing deviceId" }, { status: 400 });
    if (typeof temperature !== "number")
      return NextResponse.json({ error: "Invalid temperature" }, { status: 400 });
    if (typeof humidity !== "number")
      return NextResponse.json({ error: "Invalid humidity" }, { status: 400 });

    const newReading: SensorReading = {
      deviceId,
      temperature: parseFloat(temperature.toFixed(1)),
      humidity: parseFloat(humidity.toFixed(1)),
      timestamp: new Date().toISOString(),
    };

    readings.push(newReading);

    return NextResponse.json(
      { success: true, reading: newReading },
      { status: 201 }
    );
  } catch (err) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
}

export async function GET() {
  return NextResponse.json({ count: readings.length, readings });
}e === sheetName);

    if (!sheetExists) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [{
            addSheet: {
              properties: { title: sheetName }
            }
          }]
        }
      });
    }

    // Append a separator for the new report
    const reportDate = new Date().toLocaleString('en-US', { timeZone: 'UTC' });
    await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: `${sheetName}!A1`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
            values: [[`Report for ${reportDate}`], []], // Add a title and a blank row
        },
    });


    // Append header and data
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${sheetName}!A1`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [header, ...rows],
      },
    });

    console.log(`Successfully sent ${data.length} records to Google Sheets.`);
  } catch (error) {
    console.error('Error sending data to Google Sheets:', error);
    // We throw the error so the calling function can see it, but we don't block the API response.
    throw error;
  }
}

export async function GET() {
  return NextResponse.json(sensorReadings);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { temperature, humidity } = body;

    if (typeof temperature !== 'number' || typeof humidity !== 'number') {
      return NextResponse.json({ error: 'Invalid data format. Temperature and humidity must be numbers.' }, { status: 400 });
    }

    const newReading: SensorReading = {
      temperature: parseFloat(temperature.toFixed(1)),
      humidity: parseFloat(humidity.toFixed(1)),
      timestamp: new Date().toISOString(),
    };

    sensorReadings.push(newReading);

    // When the number of readings exceeds the max, trigger the report and reset.
    if (sensorReadings.length > MAX_READINGS) {
      const dataForReport = sensorReadings.slice(0, MAX_READINGS);
      
      // Asynchronously send the report without blocking the response.
      sendDailyReportToGoogleSheets(dataForReport).catch(console.error);
      
      // Reset the readings, keeping only the latest one to start the new cycle.
      sensorReadings = [sensorReadings[sensorReadings.length - 1]];
    }

    return NextResponse.json(newReading, { status: 201 });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to process request.' }, { status: 500 });
  }
}
