'use client';

import { Area, AreaChart, ResponsiveContainer } from 'recharts';

export function Sparkline({
  values,
  stroke = '#F4A261',
  fill = '#F4A261',
  height = 36,
}: {
  values: number[];
  stroke?: string;
  fill?: string;
  height?: number;
}) {
  const data = values.map((v, i) => ({ i, v }));
  const id = `spark-${stroke.replace('#', '')}`;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={fill} stopOpacity={0.55} />
            <stop offset="100%" stopColor={fill} stopOpacity={0}    />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="v"
          stroke={stroke}
          strokeWidth={1.5}
          fill={`url(#${id})`}
          dot={false}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
