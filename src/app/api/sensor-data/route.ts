import { NextResponse } from 'next/server';
import type { SensorReading } from '@/lib/types';
import { google } from 'googleapis';

// In-memory store for demonstration purposes.
let sensorReadings: SensorReading[] = [];

const MAX_READINGS = 24; // Corresponds to a 24-hour cycle if data is sent hourly.

async function sendDailyReportToGoogleSheets(data: SensorReading[]) {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    const sheetName = "Daily Sensor Data"; // You can change this or make it dynamic

    // Prepare header row if the sheet is new or empty
    const header = ['Timestamp', 'Temperature (°C)', 'Humidity (%)'];
    
    // Prepare data rows
    const rows = data.map(reading => [
      reading.timestamp,
      reading.temperature,
      reading.humidity,
    ]);

    // Check if sheet exists, create if not
    const spreadsheetInfo = await sheets.spreadsheets.get({ spreadsheetId });
    const sheetExists = spreadsheetInfo.data.sheets?.some(s => s.properties?.title === sheetName);

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
