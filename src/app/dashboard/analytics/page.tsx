import { BarChart3, MapPin, Eye, DollarSign, TrendingUp } from 'lucide-react';
import { getAnalyticsSummary } from '@/db/queries';

function fmtPrice(n: number) {
  if (n >= 1_000_000_000) return `TZS ${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000)     return `TZS ${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)         return `TZS ${(n / 1_000).toFixed(0)}K`;
  return `TZS ${n}`;
}

function fmtBig(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}K`;
  return n.toLocaleString();
}

const GRADE_ORDER = ['PREMIUM', 'HIGH', 'MEDIUM', 'LOW'];

export default async function AnalyticsPage() {
  const a = await getAnalyticsSummary();

  const totalGrades = a.scoreDistribution.reduce((s, g) => s + g.count, 0);
  const sortedGrades = GRADE_ORDER
    .map(grade => a.scoreDistribution.find(g => g.grade === grade) ?? { grade, count: 0 })
    .filter(g => totalGrades > 0);

  const KPIS = [
    { label: 'Total Analyses',       value: String(a.totalAnalyses), icon: BarChart3 },
    { label: 'Unique Locations',     value: String(a.totalLocations), icon: MapPin },
    { label: 'Avg Composite Score',  value: a.totalAnalyses ? Math.round(a.avgCompositeScore * 100) + '/100' : '—', icon: TrendingUp },
    { label: 'Total Impressions/mo', value: fmtBig(a.totalImpressions), icon: Eye },
    { label: 'Revenue Potential/mo', value: fmtPrice(a.totalRevenuePotential), icon: DollarSign },
  ];

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-4 h-px bg-primary" />
          <span className="text-[10px] font-mono text-fg-muted uppercase tracking-widest">Aggregate Insights</span>
        </div>
        <h1 className="text-xl md:text-2xl font-bold font-mono text-fg tracking-wide">
          PORTFOLIO <span className="text-primary">ANALYTICS</span>
        </h1>
        <p className="text-xs font-mono text-fg-muted mt-1">
          Cross-location patterns from {a.totalAnalyses} analyses
        </p>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
        {KPIS.map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-surface/60 border border-border p-3 md:p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[8px] md:text-[9px] font-mono text-fg-muted uppercase tracking-widest leading-tight">{label}</span>
              <Icon size={11} className="text-primary shrink-0" />
            </div>
            <div className="text-base md:text-lg font-bold font-mono text-fg">{value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5">
        {/* Score distribution */}
        <div className="bg-surface/60 border border-border p-4">
          <div className="text-[10px] font-mono text-fg uppercase tracking-wider mb-3">Score Tier Distribution</div>
          {sortedGrades.length === 0 ? (
            <div className="text-xs font-mono text-fg-muted py-4 text-center">No data yet.</div>
          ) : (
            <div className="space-y-3">
              {sortedGrades.map(g => {
                const pct = totalGrades ? Math.round((g.count / totalGrades) * 100) : 0;
                const color = g.grade === 'PREMIUM' ? 'bg-primary'      :
                              g.grade === 'HIGH'    ? 'bg-primary-soft' :
                              g.grade === 'MEDIUM'  ? 'bg-gold'         :
                                                      'bg-fg-dim';
                return (
                  <div key={g.grade}>
                    <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                      <span className="text-fg-muted uppercase tracking-widest">{g.grade}</span>
                      <span className="text-fg">{g.count} <span className="text-fg-dim">· {pct}%</span></span>
                    </div>
                    <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top categories */}
        <div className="bg-surface/60 border border-border p-4">
          <div className="text-[10px] font-mono text-fg uppercase tracking-wider mb-3">Most Common Nearby Categories</div>
          {a.topCategories.length === 0 ? (
            <div className="text-xs font-mono text-fg-muted py-4 text-center">No nearby places recorded yet.</div>
          ) : (
            <div className="space-y-2">
              {a.topCategories.map((c, i) => {
                const max = a.topCategories[0].count;
                const pct = max ? (c.count / max) * 100 : 0;
                return (
                  <div key={c.category} className="flex items-center gap-3">
                    <span className="text-[9px] font-mono text-fg-dim w-4 shrink-0">{i + 1}</span>
                    <span className="text-xs font-mono text-fg w-24 shrink-0">{c.category}</span>
                    <div className="flex-1 h-1.5 bg-surface-2 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-[10px] font-mono text-fg-muted w-8 text-right shrink-0">{c.count}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
