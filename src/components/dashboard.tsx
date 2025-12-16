'use client';

import { useState, useEffect, useRef } from 'react';
import type { SensorReading } from '@/lib/types';
import Gauge from './gauge';
import DataChart from './data-chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Thermometer, Droplets, WifiOff } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// ================== PROTOTYPE DATA ==================
const generateInitialPrototypeData = (count = 12): SensorReading[] => {
  const now = new Date();
  return Array.from({ length: count }, (_, i) => {
    const timestamp = new Date(now.getTime() - (count - 1 - i) * 60 * 60 * 1000);
    return {
      temperature: parseFloat((Math.random() * 15 + 15).toFixed(1)),
      humidity: parseFloat((Math.random() * 40 + 40).toFixed(1)),
      timestamp: timestamp.toISOString(),
    };
  });
};

export default function Dashboard() {
  const [data, setData] = useState<SensorReading[]>([]);
  const [isPrototyping, setIsPrototyping] = useState(false);

  // supaya report 1x per hari saja
  const lastReportDateRef = useRef<string | null>(null);

  // ================== TRIGGER REPORT ==================
  const triggerReport = async (history: SensorReading[]) => {
    const today = new Date().toISOString().slice(0, 10);

    // proteksi: jangan kirim dua kali di hari yang sama
    if (lastReportDateRef.current === today) {
      return;
    }

    try {
      await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: today,
          data: history,
        }),
      });

      console.log('Daily report sent to Google Sheets');
      lastReportDateRef.current = today;
    } catch (err) {
      console.error('Failed to send daily report', err);
    }
  };

  // ================== FETCH SENSOR ==================
useEffect(() => {
  const fetchData = async () => {
    try {
      const r = await fetch("/api/sensor");
      const json = await r.json();
      setData(json);
      setIsPrototyping(false);
    } catch {
      if (data.length === 0) {
        setData(generateInitialPrototypeData());
        setIsPrototyping(true);
      }
    }
  };

  fetchData();
  const interval = setInterval(fetchData, 5000);
  return () => clearInterval(interval);
}, []);

  const currentReading =
    data[data.length - 1] || { temperature: 0, humidity: 0, timestamp: '' };

  // ================== RENDER ==================
  return (
    <div className="space-y-8">
      {isPrototyping && (
        <Alert variant="default" className="bg-accent/20 border-accent/50 text-accent-foreground/80">
          <WifiOff className="h-4 w-4" />
          <AlertTitle className="text-accent-foreground/90">Prototyping Mode</AlertTitle>
          <AlertDescription>
            No connection to the sensor. Displaying randomly generated data for demonstration.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Temperature</CardTitle>
            <Thermometer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Gauge value={currentReading.temperature} unit="°C" maxValue={50} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Humidity</CardTitle>
            <Droplets className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Gauge value={currentReading.humidity} unit="%" maxValue={100} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historical Data</CardTitle>
        </CardHeader>
        <CardContent>
          <DataChart data={data} />
        </CardContent>
      </Card>
    </div>
  );
}
