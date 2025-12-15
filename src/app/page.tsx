'use client';

import Dashboard from '@/components/dashboard';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Activity } from 'lucide-react';

export default function Home() {
  const [startTime, setStartTime] = useState('');
  const [dataCount, setDataCount] = useState(0);

  useEffect(() => {
    // This is a placeholder for when the cycle starts.
    // In a real scenario, this would be fetched or set when a new cycle begins.
    setStartTime(format(new Date(), 'HH:mm'));

    const fetchSensorData = async () => {
      try {
        const response = await fetch('/api/sensor-data');
        if (response.ok) {
          const readings = await response.json();
          setDataCount(readings.length);
        }
      } catch (error) {
        console.error('Failed to fetch sensor data count:', error);
      }
    };
    
    fetchSensorData();
    const interval = setInterval(fetchSensorData, 5000); // Poll for new data count

    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen bg-background text-foreground p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <header>
          <h1 className="text-3xl md:text-4xl font-headline font-bold text-foreground flex items-center gap-3">
            <Activity className="h-8 w-8 text-primary" />
            <span>DHT11 Monitor</span>
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            ESP01 • Siklus Harian Otomatis
          </p>
          <div className="text-sm text-muted-foreground mt-2 space-x-4">
            <span>Siklus dimulai: {startTime}</span>
            <span>|</span>
            <span>Data tercatat: {dataCount > 24 ? "24/24" : `${dataCount}/24`} jam</span>
          </div>
        </header>
        
        <Dashboard />

      </div>
    </main>
  );
}
