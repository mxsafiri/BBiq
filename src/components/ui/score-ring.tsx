'use client';

interface ScoreRingProps {
  score: number; // 0–1
  label: string;
  size?: number;
}

export function ScoreRing({ score, label, size = 80 }: ScoreRingProps) {
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = circumference - score * circumference;
  const pct = Math.round(score * 100);

  const color =
    pct >= 75 ? '#3b82f6' : pct >= 50 ? '#60a5fa' : pct >= 30 ? '#93c5fd' : '#1e40af';

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(59,130,246,0.15)"
          strokeWidth={6}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={6}
          strokeDasharray={circumference}
          strokeDashoffset={progress}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
      </svg>
      <div
        className="absolute font-mono font-bold text-white"
        style={{ fontSize: size * 0.22, marginTop: -(size * 0.55) }}
      >
        {pct}
      </div>
      <span className="text-[10px] font-mono text-fg-muted uppercase tracking-wider">{label}</span>
    </div>
  );
}
