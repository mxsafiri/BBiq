import Link from 'next/link';
import { ArrowRight, TrendingUp, Eye, DollarSign, MapPin } from 'lucide-react';
import { getAnalyses } from '@/db/queries';

function fmtPrice(n: number) {
  return n >= 1_000_000 ? `TZS ${(n / 1_000_000).toFixed(1)}M` : `TZS ${(n / 1_000).toFixed(0)}K`;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-TZ', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default async function DashboardPage() {
  const analyses = await getAnalyses();

  const totalLocations = analyses.length;
  const avgImpressions = analyses.length
    ? Math.round(analyses.reduce((s, a) => s + a.dailyImpressions, 0) / analyses.length)
    : 0;
  const totalRevenuePotential = analyses.reduce((s, a) => s + a.suggestedPriceTzs, 0);
  const premiumCount = analyses.filter(a => a.scoreGrade === 'PREMIUM' || a.scoreGrade === 'HIGH').length;
  const marketCoverage = analyses.length ? Math.round((premiumCount / analyses.length) * 100) : 0;

  const STATS = [
    { label: 'Locations Analyzed', value: String(totalLocations || '—'), sub: totalLocations ? `${analyses.length} total runs` : 'No analyses yet', icon: MapPin },
    { label: 'Avg Daily Impressions', value: avgImpressions ? `${(avgImpressions / 1000).toFixed(1)}K` : '—', sub: 'across all analyses', icon: Eye },
    { label: 'Revenue Potential', value: totalRevenuePotential ? fmtPrice(totalRevenuePotential) : '—', sub: 'combined monthly', icon: DollarSign },
    { label: 'High-Value Locations', value: premiumCount ? `${marketCoverage}%` : '—', sub: 'HIGH or PREMIUM tier', icon: TrendingUp },
  ];

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-4 h-px bg-primary-soft" />
            <span className="text-[10px] font-mono text-fg-muted uppercase tracking-widest">Platform Overview</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold font-mono text-fg tracking-wide">
            BILLBOARD <span className="text-primary-soft">INTELLIGENCE</span>
          </h1>
          <p className="text-xs font-mono text-fg-muted mt-1">
            Data-backed outdoor advertising intelligence for Tanzania
          </p>
        </div>
        <Link
          href="/dashboard/analyze"
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white font-mono text-xs hover:bg-primary-soft transition-colors border border-primary-soft/40 w-full sm:w-auto"
        >
          ANALYZE LOCATION <ArrowRight size={12} />
        </Link>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {STATS.map(({ label, value, sub, icon: Icon }) => (
          <div key={label} className="bg-surface/60 border border-border p-3 md:p-4">
            <div className="flex items-start justify-between mb-2 md:mb-3">
              <span className="text-[8px] md:text-[9px] font-mono text-fg-muted uppercase tracking-widest leading-tight">{label}</span>
              <Icon size={11} className="text-primary-soft shrink-0 ml-1" />
            </div>
            <div className="text-lg md:text-xl font-bold font-mono text-fg">{value}</div>
            <div className="text-[9px] font-mono text-fg-dim mt-0.5 leading-tight">{sub}</div>
          </div>
        ))}
      </div>

      {/* Recent analyses */}
      <div className="bg-surface/60 border border-border">
        <div className="px-4 md:px-5 py-3 border-b border-border flex items-center justify-between">
          <span className="text-xs font-mono text-fg uppercase tracking-wider">Recent Analyses</span>
          <span className="text-[9px] font-mono text-fg-dim">{analyses.length} total</span>
        </div>

        {analyses.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <div className="text-xs font-mono text-fg-dim">No analyses yet.</div>
            <Link href="/dashboard/analyze" className="text-xs font-mono text-primary-soft hover:text-primary-glow mt-2 block transition-colors">
              Run your first analysis →
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {analyses.map((a) => (
              <Link key={a.id} href={`/dashboard/results?id=${a.id}`} className="block px-4 md:px-5 py-3 md:py-4 hover:bg-surface transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-6 h-6 rounded-full bg-surface-2 border border-border flex items-center justify-center shrink-0">
                      <MapPin size={10} className="text-primary-soft" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-mono text-fg truncate">{a.locationName}</div>
                      <div className="text-[9px] font-mono text-fg-dim mt-0.5">{fmtDate(a.createdAt)}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className={`text-[8px] font-mono px-1.5 py-0.5 border ${
                      a.scoreGrade === 'PREMIUM' ? 'text-primary-glow border-primary-soft/40 bg-primary/15' :
                      a.scoreGrade === 'HIGH'    ? 'text-primary-soft border-border bg-surface-2/40' :
                      'text-fg-muted border-border'
                    }`}>{a.scoreGrade}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-2 pl-[34px]">
                  <div>
                    <div className="text-xs font-mono text-primary-soft">{a.dailyImpressions.toLocaleString()}</div>
                    <div className="text-[8px] font-mono text-fg-dim">impr/day</div>
                  </div>
                  <div>
                    <div className="text-xs font-mono text-fg">{fmtPrice(a.suggestedPriceTzs)}</div>
                    <div className="text-[8px] font-mono text-fg-dim">suggested/mo</div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-12 h-1.5 rounded-full bg-surface-2">
                      <div className="h-full rounded-full bg-primary-soft" style={{ width: `${a.compositeScore * 100}%` }} />
                    </div>
                    <span className="text-[9px] font-mono text-fg-muted">{Math.round(a.compositeScore * 100)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="border border-border bg-surface/40 px-4 md:px-6 py-4 md:py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="text-sm font-mono text-fg font-bold">Ready to analyze a new location?</div>
          <div className="text-xs font-mono text-fg-muted mt-0.5">
            Drop a pin anywhere in Dar es Salaam — get impressions + pricing in seconds.
          </div>
        </div>
        <Link
          href="/dashboard/analyze"
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-white font-mono text-xs hover:bg-primary-soft transition-colors whitespace-nowrap w-full sm:w-auto"
        >
          START ANALYSIS <ArrowRight size={12} />
        </Link>
      </div>
    </div>
  );
}
