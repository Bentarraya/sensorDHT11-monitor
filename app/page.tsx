"use client";

import Dashboard from "@/components/dashboard";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Activity } from "lucide-react";

export default function Home() {
  const [startTime, setStartTime] = useState("");
  const [dataCount, setDataCount] = useState(0);

  // state untuk realtime sensor
  const [sensor, setSensor] = useState({
    temperature: null,
    humidity: null,
    deviceId: "",
    timestamp: "",
  });

  useEffect(() => {
    setStartTime(format(new Date(), "HH:mm"));

    const loadSensor = async () => {
      try {
        // FETCH KE ROUTE YANG BENAR: /api/sensor
        const res = await fetch("/api/sensor", { cache: "no-store" });
        const json = await res.json();

        // kalau belum ada data ESP → skip
        if (!json || !json.temperature) return;

        setSensor({
          temperature: json.temperature,
          humidity: json.humidity,
          deviceId: json.deviceId,
          timestamp: json.timestamp,
        });

        // hitung total data (dummy)
        setDataCount((prev) => (prev < 24 ? prev + 1 : 24));
      } catch (err) {
        console.error("FETCH SENSOR ERROR:", err);
      }
    };

    loadSensor();
    const interval = setInterval(loadSensor, 2000); // update tiap 2 detik

    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen bg-background text-foreground p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <header>
          <h1 className="text-3xl md:text-4xl font-headline font-bold text-foreground flex items-center gap-3">
            <Activity className="h-3 w-8 text-primary" />
            <span>DHT11 Monitor</span>
          </h1>

          <p className="text-muted-foreground mt-2 max-w-2xl">
            ESP01 • Realtime Monitoring
          </p>

          <div className="text-sm text-muted-foreground mt-2 space-x-4">
            <span>Siklus dimulai: {startTime}</span>
            <span>|</span>
            <span>Data tercatat: {dataCount}/24 jam</span>
          </div>

          <div className="text-sm text-muted-foreground mt-2">
            <span>Suhu: {sensor.temperature ?? "-"} °C</span>
            <span className="mx-2">•</span>
            <span>Kelembaban: {sensor.humidity ?? "-"} %</span>
            <span className="mx-2">•</span>
            <span>Update: {sensor.timestamp ? format(new Date(sensor.timestamp), "HH:mm:ss") : "-"}</span>
          </div>
        </header>

        <Dashboard sensor={sensor} />
      </div>
    </main>
  );
}
