'use client';

import { useState, useEffect } from 'react';
import type { SensorReading } from '@/lib/types';
import Gauge from './gauge';
import DataChart from './data-chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Thermometer, Droplets, WifiOff } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const generateInitialPrototypeData = (count = 12): SensorReading[] => {
    const now = new Date();
    // Generate data for the last `count` hours to populate the chart
    return Array.from({ length: count }, (_, i) => {
        const timestamp = new Date(now.getTime() - (count - 1 - i) * 60 * 60 * 1000);
        return {
            temperature: parseFloat((Math.random() * 15 + 15).toFixed(1)), // 15-30°C
            humidity: parseFloat((Math.random() * 40 + 40).toFixed(1)),    // 40-80%
            timestamp: timestamp.toISOString(),
        }
    });
};

export default function Dashboard() {
  const [data, setData] = useState<SensorReading[]>([]);
  const [isPrototyping, setIsPrototyping] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/sensor');
        if (!response.ok) throw new Error('Network error');

        const json = await response.json();

        let readings: SensorReading[] = [];

        if (json.latest) {
          readings = [json.latest];
        }

        if (readings.length === 0) {
          if (data.length === 0) {
            setData(generateInitialPrototypeData());
            setIsPrototyping(true);
          }
        } else {
          setData(readings);
          setIsPrototyping(false);
        }

      } catch (error) {
        console.error('Failed to fetch sensor data:', error);
        // Fallback to prototyping data on error if no data is present
        if (data.length === 0) {
            setData(generateInitialPrototypeData());
            setIsPrototyping(true);
        }
      }
    };
    
    fetchData(); // Initial fetch
    const interval = setInterval(fetchData, 5000); // Poll for new data every 5 seconds

    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount to setup polling and initial state

  const currentReading = data[data.length - 1] || { temperature: 0, humidity: 0, timestamp: '' };

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
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Temperature</CardTitle>
            <Thermometer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Gauge value={currentReading.temperature} unit="°C" maxValue={50} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
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
