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
      <div className="bg-surface border border-border/80 px-3 py-2 text-xs font-mono">
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
    <ResponsiveContainer width="100%" height={120}>
      <BarChart data={chartData} barCategoryGap="20%">
        <XAxis
          dataKey="hour"
          tick={{ fill: 'rgba(147,197,253,0.5)', fontSize: 9, fontFamily: 'monospace' }}
          axisLine={false}
          tickLine={false}
          interval={3}
        />
        <YAxis hide />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(59,130,246,0.08)' }} />
        <Bar dataKey="vehicles" radius={[2, 2, 0, 0]}>
          {chartData.map((entry, i) => {
            const intensity = entry.vehicles / maxVehicles;
            const isPeak = intensity > 0.7;
            return (
              <Cell
                key={i}
                fill={isPeak ? '#3b82f6' : `rgba(59,130,246,${0.2 + intensity * 0.5})`}
              />
            );
          })}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
