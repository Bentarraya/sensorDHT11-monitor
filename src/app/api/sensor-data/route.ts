import { NextResponse } from 'next/server';
import type { SensorReading } from '@/lib/types';

// In-memory store for demonstration purposes.
// In a real application, you would use a database.
let sensorReadings: SensorReading[] = [];

const MAX_READINGS = 24; // Corresponds to a 24-hour cycle if data is sent hourly.

// The "daily report" function is complex and requires external service integration (Google Sheets API) and secure auth.
// This is a placeholder for where that logic would be triggered.
async function sendDailyReportToGoogleSheets(data: SensorReading[]) {
  console.log('Simulating: Sending daily report to Google Sheets...');
  // In a real implementation, you would:
  // 1. Authenticate with Google Sheets API (e.g., using OAuth2 or a service account).
  // 2. Format the data as needed for the sheet.
  // 3. Make an API call to append/update the spreadsheet.
  console.log(`Simulating: Sent ${data.length} records.`);
  console.log('Simulating: Report sent.');
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

    // This condition simulates the 24h cycle.
    // When the number of readings exceeds the max, we trigger the report and reset the data.
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
