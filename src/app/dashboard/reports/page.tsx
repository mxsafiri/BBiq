import Link from 'next/link';
import { ArrowRight, FileText, MapPin } from 'lucide-react';
import { getAnalyses } from '@/db/queries';

function fmtPrice(n: number) {
  return n >= 1_000_000 ? `TZS ${(n / 1_000_000).toFixed(1)}M` : `TZS ${(n / 1_000).toFixed(0)}K`;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-TZ', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default async function ReportsPage() {
  const analyses = await getAnalyses();

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-4 h-px bg-primary" />
            <span className="text-[10px] font-mono text-fg-muted uppercase tracking-widest">All Reports</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold font-mono text-fg tracking-wide">
            ANALYSIS <span className="text-primary">REPORTS</span>
          </h1>
          <p className="text-xs font-mono text-fg-muted mt-1">
            {analyses.length} report{analyses.length === 1 ? '' : 's'} generated
          </p>
        </div>
      </div>

      {analyses.length === 0 ? (
        <div className="bg-surface/60 border border-border px-5 py-16 text-center">
          <FileText size={28} className="mx-auto text-fg-dim mb-3" />
          <div className="text-xs font-mono text-fg-muted">No reports yet.</div>
          <Link href="/dashboard/analyze" className="text-xs font-mono text-primary-soft hover:text-primary-glow mt-3 inline-block transition-colors">
            Run your first analysis →
          </Link>
        </div>
      ) : (
        <div className="bg-surface/60 border border-border overflow-x-auto">
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-3 font-normal text-[10px] text-fg-muted uppercase tracking-widest">Location</th>
                <th className="text-left px-4 py-3 font-normal text-[10px] text-fg-muted uppercase tracking-widest hidden md:table-cell">Date</th>
                <th className="text-right px-4 py-3 font-normal text-[10px] text-fg-muted uppercase tracking-widest hidden md:table-cell">Impressions/day</th>
                <th className="text-right px-4 py-3 font-normal text-[10px] text-fg-muted uppercase tracking-widest">Price/mo</th>
                <th className="text-center px-4 py-3 font-normal text-[10px] text-fg-muted uppercase tracking-widest">Score</th>
                <th className="text-center px-4 py-3 font-normal text-[10px] text-fg-muted uppercase tracking-widest">Tier</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {analyses.map(a => (
                <tr key={a.id} className="hover:bg-surface transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <MapPin size={11} className="text-primary shrink-0" />
                      <span className="text-fg truncate">{a.locationName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-fg-muted hidden md:table-cell">{fmtDate(a.createdAt)}</td>
                  <td className="px-4 py-3 text-right text-fg hidden md:table-cell">{a.dailyImpressions.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-fg">{fmtPrice(a.suggestedPriceTzs)}</td>
                  <td className="px-4 py-3 text-center text-primary-soft">{Math.round(a.compositeScore * 100)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-[9px] px-1.5 py-0.5 border ${
                      a.scoreGrade === 'PREMIUM' ? 'text-primary-glow border-primary/40 bg-primary/10' :
                      a.scoreGrade === 'HIGH'    ? 'text-primary-soft border-border bg-surface-2/40' :
                      'text-fg-muted border-border'
                    }`}>{a.scoreGrade}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/dashboard/results?id=${a.id}`} className="text-fg-muted hover:text-primary-soft transition-colors inline-flex items-center gap-1">
                      View <ArrowRight size={10} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
