'use client';
import React from 'react';

interface GaugeProps {
  value: number;
  maxValue: number;
  unit: string;
}

const Gauge: React.FC<GaugeProps> = ({ value, maxValue, unit }) => {
  const safeValue = value || 0;
  const percentage = Math.min(Math.max(safeValue / maxValue, 0), 1);

  const getTrackColor = (percent: number) => {
    if (percent > 0.8) return 'hsl(var(--destructive))';
    if (percent > 0.5) return 'hsl(var(--accent))';
    return 'hsl(var(--primary))';
  }

  const trackColor = getTrackColor(percentage);

  return (
    <div className="flex h-40 items-center justify-center">
      <div className="relative h-full w-full max-w-[250px]">
        <svg className="h-full w-full" viewBox="0 0 120 65">
          <path
            d="M 10 60 A 50 50 0 0 1 110 60"
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="12"
            strokeLinecap="round"
          />
          <path
            d="M 10 60 A 50 50 0 0 1 110 60"
            fill="none"
            stroke={trackColor}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={157} // perimeter of semi-circle: pi * r = pi * 50
            strokeDashoffset={157 * (1 - percentage)}
            style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
          />
          <text
            x="60"
            y="50"
            textAnchor="middle"
            dominantBaseline="text-bottom"
            className="fill-foreground text-2xl font-bold font-mono"
          >
            {safeValue.toFixed(1)}
             <tspan dy="-0.2em" className="text-lg font-medium">{unit}</tspan>
          </text>
        </svg>
      </div>
    </div>
  );
};
export default Gauge;
