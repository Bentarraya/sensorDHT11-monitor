'use client';

import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import type { SensorReading } from '@/lib/types';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { format } from 'date-fns';
import type { ChartConfig } from '@/components/ui/chart';

interface DataChartProps {
  data: SensorReading[];
}

const chartConfig = {
  temperature: {
    label: "Temperature (°C)",
    color: "hsl(var(--chart-1))",
  },
  humidity: {
    label: "Humidity (%)",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;


export default function DataChart({ data }: DataChartProps) {
  if (!data || data.length === 0) {
    return <div className="flex items-center justify-center h-[400px] text-muted-foreground">Waiting for sensor data...</div>;
  }
  
  const formattedData = data.map(reading => ({
    ...reading,
    timestamp: format(new Date(reading.timestamp), 'HH:mm'),
  }));

  return (
    <div className="h-[400px] w-full">
      <ChartContainer config={chartConfig} className="h-full w-full">
        <LineChart data={formattedData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="timestamp"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
          />
          <YAxis
            yAxisId="left"
            orientation="left"
            stroke="hsl(var(--chart-1))"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value) => `${value}°C`}
            tick={{ fill: "hsl(var(--chart-1))", fontSize: 12 }}
            domain={['dataMin - 2', 'dataMax + 2']}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            stroke="hsl(var(--chart-2))"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value) => `${value}%`}
            tick={{ fill: "hsl(var(--chart-2))", fontSize: 12 }}
            domain={[0, 100]}
          />
          <Tooltip
            cursor={{ stroke: 'hsl(var(--border))', strokeWidth: 1, strokeDasharray: '3 3' }}
            content={<ChartTooltipContent
                indicator="line"
                labelFormatter={(label) => `Time: ${label}`}
            />}
          />
          <Legend content={<ChartLegendContent />} />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="temperature"
            name="Temperature"
            stroke={chartConfig.temperature.color}
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 6, fill: 'hsl(var(--background))', stroke: chartConfig.temperature.color }}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="humidity"
            name="Humidity"
            stroke={chartConfig.humidity.color}
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 6, fill: 'hsl(var(--background))', stroke: chartConfig.humidity.color }}
          />
        </LineChart>
      </ChartContainer>
    </div>
  );
}
