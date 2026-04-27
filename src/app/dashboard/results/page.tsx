'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ArrowLeft, Eye, DollarSign, Clock, Zap, MapPin, RefreshCw } from 'lucide-react';
import type { AnalysisDetail } from '@/db/queries';
import { PeakHoursChart } from '@/components/ui/peak-hours-chart';
import { PEAK_HOURS } from '@/lib/mock-data';

const MapDisplay = dynamic(
  () => import('@/components/ui/map-display').then(m => m.MapDisplay),
  { ssr: false, loading: () => <div className="w-full h-full bg-[#060f1e] animate-pulse" /> }
);

function fmtTZS(n: number) {
  if (n >= 1_000_000) return `TZS ${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000)     return `TZS ${(n / 1_000).toFixed(0)}K`;
  return `TZS ${n}`;
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  const pct = Math.round(value * 100);
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[9px] font-mono text-fg-muted uppercase tracking-widest">{label}</span>
        <span className="text-[9px] font-mono text-primary-glow">{pct}</span>
      </div>
      <div className="h-1.5 bg-surface-2/60 rounded-full overflow-hidden">
        <div className="h-full rounded-full bg-primary-soft transition-all duration-1000" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function ResultsContent() {
  const params = useSearchParams();
  const id = params.get('id');

  const [analysis, setAnalysis] = useState<AnalysisDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) { setLoading(false); setError('No analysis ID provided.'); return; }
    fetch(`/api/analyses/${id}`)
      .then(r => { if (!r.ok) throw new Error('Analysis not found'); return r.json(); })
      .then(data => { setAnalysis(data); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <RefreshCw size={20} className="text-primary-soft animate-spin" />
        <div className="text-xs font-mono text-fg-muted">LOADING ANALYSIS…</div>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <div className="text-xs font-mono text-red-400">{error || 'Analysis not found.'}</div>
        <Link href="/dashboard/analyze" className="text-xs font-mono text-primary-soft hover:text-primary-glow transition-colors">
          ← Run a new analysis
        </Link>
      </div>
    );
  }

  const a = analysis;
  const peakHours = Array.isArray(a.peakHours) && a.peakHours.length ? a.peakHours : PEAK_HOURS;

  const METRICS = [
    { label: 'Daily Impressions',  value: a.dailyImpressions.toLocaleString(),      icon: Eye,       sub: `${(a.weeklyImpressions / 1000).toFixed(0)}K/week` },
    { label: 'Suggested Price',    value: fmtTZS(a.suggestedPriceTzs),              icon: DollarSign, sub: 'per month' },
    { label: 'Exposure Time',      value: `${a.exposureTimeSeconds}s`,               icon: Clock,      sub: 'avg per vehicle' },
    { label: 'Composite Score',    value: `${Math.round(a.compositeScore * 100)}/100`, icon: Zap,      sub: a.scoreGrade },
  ];

  return (
    <div className="space-y-4 md:space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <Link href="/dashboard/analyze" className="text-[9px] font-mono text-fg-muted hover:text-primary-soft flex items-center gap-1 transition-colors mb-1">
            <ArrowLeft size={9} />BACK TO ANALYZE
          </Link>
          <h1 className="text-xl font-bold font-mono text-white">
            ANALYSIS <span className="text-primary-soft">RESULTS</span>
          </h1>
          <div className="flex items-center gap-1.5 mt-1">
            <MapPin size={10} className="text-primary-soft shrink-0" />
            <span className="text-xs font-mono text-fg-muted truncate">{a.locationName}</span>
          </div>
        </div>
        <div className={`shrink-0 px-2 md:px-3 py-1 text-[10px] md:text-xs font-mono font-bold border ${
          a.scoreGrade === 'PREMIUM' ? 'bg-primary/20 text-primary-glow border-primary-soft/40' :
          a.scoreGrade === 'HIGH'    ? 'bg-surface-2/40 text-primary-glow border-border' :
          'bg-surface/50 text-fg-muted border-border'
        }`}>
          {a.scoreGrade}
        </div>
      </div>

      {/* Top metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {METRICS.map(({ label, value, icon: Icon, sub }) => (
          <div key={label} className="bg-surface/80 border border-border p-3 md:p-4">
            <div className="flex items-center justify-between mb-2 md:mb-3">
              <span className="text-[8px] md:text-[9px] font-mono text-fg-muted uppercase tracking-widest leading-tight">{label}</span>
              <Icon size={11} className="text-primary-soft shrink-0" />
            </div>
            <div className="text-base md:text-lg font-bold font-mono text-white">{value}</div>
            <div className="text-[9px] font-mono text-fg-muted mt-0.5">{sub}</div>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className="flex flex-col lg:grid lg:grid-cols-[1fr_320px] gap-4 md:gap-5">

        {/* Left */}
        <div className="space-y-4">
          <div className="bg-surface/80 border border-border p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-3">
              <span className="text-[10px] font-mono text-white/70 uppercase tracking-wider">Peak Traffic Hours</span>
              <div className="flex items-center gap-2 text-[9px] font-mono text-fg-muted">
                <span>▲ 07:00–09:00</span><span>·</span><span>▲ 17:00–19:00</span>
              </div>
            </div>
            <PeakHoursChart data={peakHours} />
          </div>

          <div className="bg-[#060f1e] border border-border overflow-hidden" style={{ height: 220 }}>
            <div className="h-7 border-b border-border flex items-center px-3 gap-2 shrink-0">
              <div className="w-1.5 h-1.5 rounded-full bg-primary-soft" />
              <span className="text-[9px] font-mono text-fg-muted uppercase tracking-widest">Location Overview</span>
            </div>
            <div style={{ height: 193 }}>
              <MapDisplay lat={a.lat} lng={a.lng} />
            </div>
          </div>

          <div className="bg-surface/80 border border-border p-4 space-y-3">
            <span className="text-[10px] font-mono text-white/70 uppercase tracking-wider block">Score Breakdown</span>
            <ScoreBar label="Traffic Score"    value={a.trafficScore} />
            <ScoreBar label="Foot Activity"    value={a.footScore} />
            <ScoreBar label="Visibility Factor" value={a.visibilityFactor} />
            <ScoreBar label="Composite Score"  value={a.compositeScore} />
          </div>
        </div>

        {/* Right */}
        <div className="space-y-4">
          <div className="bg-surface/80 border border-primary-soft/40 p-4">
            <div className="text-[9px] font-mono text-fg-muted uppercase tracking-widest mb-3">Pricing Engine</div>
            <div className="text-2xl font-bold font-mono text-white mb-1">{fmtTZS(a.suggestedPriceTzs)}</div>
            <div className="text-[9px] font-mono text-fg-muted mb-4">suggested monthly rate</div>
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="border border-border bg-[#060f1e] px-3 py-2 text-center">
                <div className="text-[9px] font-mono text-fg-muted mb-1">LOW</div>
                <div className="text-xs font-mono text-primary-glow">{fmtTZS(a.priceLowTzs)}</div>
              </div>
              <div className="border border-border bg-[#060f1e] px-3 py-2 text-center">
                <div className="text-[9px] font-mono text-fg-muted mb-1">HIGH</div>
                <div className="text-xs font-mono text-primary-glow">{fmtTZS(a.priceHighTzs)}</div>
              </div>
            </div>
            <div className="space-y-2 text-[10px] font-mono">
              {[
                ['Monthly impressions', a.monthlyImpressions.toLocaleString()],
                ['CPM rate',            `TZS ${a.cpmRateTzs.toLocaleString()}`],
                ['Market tier',         a.scoreGrade],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between text-fg-muted">
                  <span>{k}</span><span className="text-white">{v}</span>
                </div>
              ))}
            </div>
          </div>

          {a.nearbyPlaces.length > 0 && (
            <div className="bg-surface/80 border border-border">
              <div className="px-4 py-3 border-b border-border">
                <span className="text-[10px] font-mono text-white/70 uppercase tracking-wider">Nearby Activity</span>
              </div>
              <div className="divide-y divide-border/20">
                {a.nearbyPlaces.slice(0, 6).map((place) => (
                  <div key={place.name} className="px-4 py-2.5 flex items-center justify-between">
                    <div className="min-w-0">
                      <div className="text-[10px] font-mono text-white/80 truncate">{place.name}</div>
                      <div className="text-[9px] font-mono text-fg-muted">{place.category} · {place.distance}</div>
                    </div>
                    <div className="w-10 h-1 rounded-full bg-surface-2 shrink-0 ml-2">
                      <div className="h-full rounded-full bg-primary-soft" style={{ width: `${place.weight * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button className="w-full py-2.5 border border-border/80 text-xs font-mono text-primary-glow hover:bg-surface/50 transition-colors">
            EXPORT PDF REPORT
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-64">
        <RefreshCw size={20} className="text-primary-soft animate-spin" />
      </div>
    }>
      <ResultsContent />
    </Suspense>
  );
}
