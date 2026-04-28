'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { PEAK_HOURS } from '@/lib/mock-data';

interface HourEntry { hour: string; vehicles: number }

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-surface border border-border px-3 py-2 text-xs font-mono shadow-lg">
        <p className="text-primary-glow">{label}:00</p>
        <p className="text-white">{payload[0].value.toLocaleString()} vehicles</p>
      </div>
    );
  }
  return null;
};

export function PeakHoursChart({ data }: { data?: HourEntry[] }) {
  const chartData = data ?? PEAK_HOURS;
  const maxVehicles = Math.max(...chartData.map(d => d.vehicles));

  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={chartData} barCategoryGap="18%">
        <defs>
          <linearGradient id="barGradPeak" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#ff8fa0" stopOpacity={1}   />
            <stop offset="100%" stopColor="#e31837" stopOpacity={0.85}/>
          </linearGradient>
          <linearGradient id="barGradMid" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#ff4d6a" stopOpacity={0.85}/>
            <stop offset="100%" stopColor="#e31837" stopOpacity={0.55}/>
          </linearGradient>
          <linearGradient id="barGradLow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#e31837" stopOpacity={0.4}/>
            <stop offset="100%" stopColor="#2a2a2a" stopOpacity={0.35}/>
          </linearGradient>
          <filter id="barGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <XAxis
          dataKey="hour"
          tick={{ fill: 'rgba(148,163,184,0.6)', fontSize: 9, fontFamily: 'monospace' }}
          axisLine={false}
          tickLine={false}
          interval={3}
        />
        <YAxis
          tick={{ fill: 'rgba(148,163,184,0.45)', fontSize: 9, fontFamily: 'monospace' }}
          axisLine={false}
          tickLine={false}
          width={28}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(227,24,55,0.06)' }} />
        <Bar dataKey="vehicles" radius={[3, 3, 0, 0]}>
          {chartData.map((entry, i) => {
            const intensity = entry.vehicles / maxVehicles;
            const fill = intensity > 0.75 ? 'url(#barGradPeak)' :
                         intensity > 0.4  ? 'url(#barGradMid)'  :
                                            'url(#barGradLow)';
            return (
              <Cell
                key={i}
                fill={fill}
                filter={intensity > 0.75 ? 'url(#barGlow)' : undefined}
              />
            );
          })}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
