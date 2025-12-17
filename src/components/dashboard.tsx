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
  const [isOnline, setIsOnline] = useState(false);

  const lastReportDateRef = useRef<string | null>(null);

  // ================== TRIGGER REPORT ==================
  const triggerReport = async (history: SensorReading[]) => {
    const today = new Date().toISOString().slice(0, 10);

    if (lastReportDateRef.current === today) return;

    try {
      await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: today, data: history })
      });

      console.log("[REPORT] Daily report sent");
      lastReportDateRef.current = today;
    } catch (err) {
      console.error("Report failed:", err);
    }
  };


  // ================== FETCH DATA SENSOR ==================
  const fetchData = async () => {
    try {
      const res = await fetch("/api/sensor");
      const json = await res.json();

      if (!json.latest) {
        if (data.length === 0) {
          setData(generateInitialPrototypeData());
          setIsPrototyping(true);
        }
        return;
      }

      setIsPrototyping(false);
      setData(json.readings);

      // laporan otomatis kalau sudah 24 data
      if (json.readings.length >= 24) {
        triggerReport(json.readings);
      }

    } catch (err) {
      console.error("Fetch sensor failed:", err);
      if (data.length === 0) {
        setData(generateInitialPrototypeData());
        setIsPrototyping(true);
      }
    }
  };

  const [latest, setLatest] = useState<SensorReading | null>(null);

  useEffect(() => {
  const fetchLatest = async () => {
    try {
      const res = await fetch("/api/sensor/latest");
      const json = await res.json();
      if (json) setLatest(json);
    } catch (e) {
      console.error("Failed to fetch latest sensor");
    }
  };

  fetchLatest();
  const i = setInterval(fetchLatest, 5000);
  return () => clearInterval(i);
}, []);



  // ================== FETCH STATUS ONLINE ==================
  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/status");
      const json = await res.json();
      setIsOnline(json.online);
    } catch {
      setIsOnline(false);
    }
  };


  // ================== EFFECT LOOP ==================
  useEffect(() => {
    fetchData();
    fetchStatus();

    const intervalA = setInterval(fetchData, 5000);
    const intervalB = setInterval(fetchStatus, 5000);

    return () => {
      clearInterval(intervalA);
      clearInterval(intervalB);
    };
  }, []);


  const currentReading = latest ?? { temperature: 0, humidity: 0 };



  // ================== RENDER ==================
  return (
    <div className="space-y-8">

      {/* ESP STATUS */}
      <div className="text-sm">
        {isOnline ? (
          <span className="text-green-400 font-semibold">● ESP Online</span>
        ) : (
          <span className="text-red-400 font-semibold">● ESP Offline</span>
        )}
      </div>


      {isPrototyping && (
        <Alert variant="default" className="bg-accent/20 border-accent/50 text-accent-foreground/80">
          <WifiOff className="h-4 w-4" />
          <AlertTitle>Prototyping Mode</AlertTitle>
          <AlertDescription>
            Showing simulated data because device is offline.
          </AlertDescription>
        </Alert>
      )}


      {/* GAUGES */}
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


      {/* CHART */}
      <Card>
        <CardHeader><CardTitle>Historical Data</CardTitle></CardHeader>
        <CardContent>
          <DataChart data={data} />
        </CardContent>
      </Card>


      {/* MANUAL REPORT BUTTON */}
      <button
        className="px-4 py-2 mt-4 rounded bg-blue-500 text-white"
        onClick={async () => {
          await fetch("/api/report");
          alert("Report sent!");
        }}
      >
        Generate Report
      </button>

    </div>
  );
  }
