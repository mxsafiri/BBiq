'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import {
  ArrowLeft, RefreshCw, MapPin, Info, FileDown,
  Car, Footprints, Eye, Star,
  Landmark, Building2, ShoppingCart, Bus, BedDouble, Coffee, GraduationCap, HeartPulse,
  Users, TrendingUp, Calendar, Clock,
} from 'lucide-react';
import type { AnalysisDetail } from '@/db/queries';
import { PeakHoursChart } from '@/components/ui/peak-hours-chart';
import { Sparkline } from '@/components/ui/sparkline';
import { PEAK_HOURS } from '@/lib/mock-data';

const MapDisplay = dynamic(
  () => import('@/components/ui/map-display').then(m => m.MapDisplay),
  { ssr: false, loading: () => <div className="w-full h-full bg-background animate-pulse" /> }
);

function fmtTZS(n: number) {
  if (n >= 1_000_000) return `TZS ${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000)     return `TZS ${(n / 1_000).toFixed(0)}K`;
  return `TZS ${n}`;
}

const CATEGORY_ICON: Record<string, any> = {
  Landmark, Finance: Building2, Retail: ShoppingCart, Transport: Bus,
  Hospitality: BedDouble, Food: Coffee, Education: GraduationCap, Healthcare: HeartPulse,
  Government: Building2, Other: MapPin,
};

function ScoreCard({
  label, value, icon: Icon, description, accent = 'primary',
}: {
  label: string;
  value: number; // 0-1
  icon: any;
  description: string;
  accent?: 'primary' | 'gold';
}) {
  const pct = Math.round(value * 100);
  const isGold = accent === 'gold';
  return (
    <div className="bg-surface/70 border border-border p-3 md:p-4">
      <div className="flex items-start gap-3">
        <div className={`w-9 h-9 rounded flex items-center justify-center shrink-0 ${
          isGold ? 'bg-gold/15 border border-gold/40' : 'bg-primary/15 border border-primary-soft/40'
        }`}>
          <Icon size={16} className={isGold ? 'text-gold' : 'text-primary-soft'} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[9px] font-mono text-fg-muted uppercase tracking-widest leading-tight">{label}</div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className={`text-2xl font-bold font-mono ${isGold ? 'text-gold' : 'text-fg'}`}>{pct}</span>
            <span className="text-[9px] font-mono text-fg-dim">/100</span>
          </div>
        </div>
      </div>
      <div className="mt-2 h-1 bg-surface-2/60 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${isGold ? 'bg-gold' : 'bg-primary-soft'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="text-[10px] font-mono text-fg-muted mt-2 leading-snug">{description}</div>
    </div>
  );
}

function NearbyRow({ place }: { place: { name: string; category: string; distance: string; weight: number } }) {
  const Icon = CATEGORY_ICON[place.category] ?? MapPin;
  const pct = Math.round(place.weight * 100);
  return (
    <div className="px-4 py-2.5 flex items-center gap-3">
      <div className="w-7 h-7 rounded bg-surface-2/60 border border-border flex items-center justify-center shrink-0">
        <Icon size={12} className="text-primary-soft" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[11px] font-mono text-fg truncate">{place.name}</div>
        <div className="text-[9px] font-mono text-fg-muted">{place.category} · {place.distance}</div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <div className="w-14 h-1 rounded-full bg-surface-2 overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-primary to-primary-glow" style={{ width: `${pct}%` }} />
        </div>
        <span className="text-[10px] font-mono text-fg-muted w-7 text-right">{pct}%</span>
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

  // Sparkline series for the pricing card — synthesize a gentle trend that ends at 100%
  const sparkValues = [62, 58, 67, 71, 65, 78, 82, 76, 88, 92, 86, 100];

  return (
    <div className="space-y-4 md:space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <Link href="/dashboard" className="text-[9px] font-mono text-fg-dim hover:text-primary-soft flex items-center gap-1 transition-colors mb-1">
            <ArrowLeft size={9} />BACK
          </Link>
          <div className="flex items-center gap-2">
            <MapPin size={12} className="text-primary-soft" />
            <h1 className="text-base md:text-lg font-bold font-mono text-fg uppercase tracking-wider truncate">
              {a.locationName}
            </h1>
            <span className="hidden md:inline-flex items-center gap-1.5 ml-2 text-[10px] font-mono text-fg-muted">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              LIVE
            </span>
          </div>
          <div className="text-[10px] font-mono text-fg-dim mt-1">
            LAT: {a.lat.toFixed(4)}°  ·  LONG: {a.lng.toFixed(4)}°
          </div>
        </div>
        <div className={`shrink-0 px-3 py-1.5 text-[10px] md:text-xs font-mono font-bold border tracking-widest ${
          a.scoreGrade === 'PREMIUM' ? 'bg-primary/20 text-primary-glow border-primary-soft/40' :
          a.scoreGrade === 'HIGH'    ? 'bg-surface-2/40 text-primary-glow border-border' :
          'bg-surface/50 text-fg-muted border-border'
        }`}>
          {a.scoreGrade}
        </div>
      </div>

      {/* Main grid */}
      <div className="flex flex-col lg:grid lg:grid-cols-[1fr_340px] gap-4 md:gap-5">
        {/* Left column */}
        <div className="space-y-4 md:space-y-5">
          {/* Peak Traffic Hours */}
          <div className="bg-surface/70 border border-border p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-3">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono text-fg uppercase tracking-wider">Peak Traffic Hours</span>
                <Info size={10} className="text-fg-dim" />
              </div>
              <div className="flex items-center gap-3 text-[9px] font-mono text-fg-muted">
                <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-primary-glow" /> 07:00–09:00</span>
                <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-primary" /> 17:00–19:00</span>
              </div>
            </div>
            <div className="text-[10px] font-mono text-fg-dim mb-2">Average hourly traffic volume</div>
            <PeakHoursChart data={peakHours} />
          </div>

          {/* Map */}
          <div className="bg-surface/70 border border-border overflow-hidden">
            <div className="h-9 border-b border-border flex items-center justify-between px-4">
              <div className="flex items-center gap-2">
                <MapPin size={11} className="text-primary-soft" />
                <span className="text-[10px] font-mono text-fg uppercase tracking-wider">Location Overview</span>
              </div>
            </div>
            <div style={{ height: 220 }}>
              <MapDisplay lat={a.lat} lng={a.lng} />
            </div>
          </div>

          {/* Score Breakdown */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <span className="text-[10px] font-mono text-fg uppercase tracking-wider">Score Breakdown</span>
              <Info size={10} className="text-fg-dim" />
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <ScoreCard label="Traffic Score"     value={a.trafficScore}     icon={Car}        description="High traffic volume and congestion" />
              <ScoreCard label="Foot Activity"     value={a.footScore}        icon={Footprints} description="Strong footfall from nearby hotspots" />
              <ScoreCard label="Visibility Factor" value={a.visibilityFactor} icon={Eye}        description="Good visibility from multiple angles" />
              <ScoreCard label="Composite Score"   value={a.compositeScore}   icon={Star}       description="Overall billboard effectiveness" accent="gold" />
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4 md:space-y-5">
          {/* Pricing Engine — gold accent */}
          <div className="relative bg-surface/70 border border-gold/40 p-4 overflow-hidden">
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-gold/5 via-transparent to-transparent" />
            <div className="relative">
              <div className="flex items-center gap-1.5 mb-3">
                <span className="text-[10px] font-mono text-fg uppercase tracking-widest">Pricing Engine</span>
                <Info size={10} className="text-fg-dim" />
              </div>
              <div className="text-[9px] font-mono text-fg-muted uppercase tracking-widest mb-1">Suggested Monthly Rate</div>
              <div className="flex items-end justify-between gap-3 mb-3">
                <span className="text-3xl font-bold font-mono text-gold leading-none">{fmtTZS(a.suggestedPriceTzs)}</span>
                <div className="flex-1 max-w-[120px] -mb-1">
                  <Sparkline values={sparkValues} stroke="#F4A261" fill="#F4A261" height={32} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="border border-border bg-background/60 px-3 py-2 text-center">
                  <div className="text-[9px] font-mono text-fg-muted mb-0.5 uppercase tracking-widest">Low Estimate</div>
                  <div className="text-xs font-mono text-fg">{fmtTZS(a.priceLowTzs)}</div>
                </div>
                <div className="border border-border bg-background/60 px-3 py-2 text-center">
                  <div className="text-[9px] font-mono text-fg-muted mb-0.5 uppercase tracking-widest">High Estimate</div>
                  <div className="text-xs font-mono text-fg">{fmtTZS(a.priceHighTzs)}</div>
                </div>
              </div>
              <div className="space-y-1.5 text-[10px] font-mono">
                <Row k="Monthly impressions" v={a.monthlyImpressions.toLocaleString()} />
                <Row k="CPM rate"            v={`TZS ${a.cpmRateTzs.toLocaleString()}`} />
                <Row k="Market tier"         v={<span className="text-gold">{a.scoreGrade}</span>} />
              </div>
            </div>
          </div>

          {/* Nearby Activity */}
          {a.nearbyPlaces.length > 0 && (
            <div className="bg-surface/70 border border-border">
              <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono text-fg uppercase tracking-wider">Nearby Activity</span>
                  <Info size={10} className="text-fg-dim" />
                </div>
                <span className="text-[9px] font-mono text-fg-dim">{a.nearbyPlaces.length} sites</span>
              </div>
              <div className="divide-y divide-border/40">
                {a.nearbyPlaces.slice(0, 6).map((place) => (
                  <NearbyRow key={place.name} place={place} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom KPI strip */}
      <div className="bg-surface/70 border border-border p-3 md:p-4 grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 items-center">
        <BottomKPI icon={Users}      label="Total Impressions (Est.)" value={a.monthlyImpressions.toLocaleString()} sub="/month" />
        <BottomKPI icon={TrendingUp} label="Avg. Daily Impressions"   value={a.dailyImpressions.toLocaleString()}   sub="/day" />
        <BottomKPI icon={Calendar}   label="Peak Day"                 value="Saturday" />
        <BottomKPI icon={Clock}      label="Best Time"                value="5PM – 7PM" />
        <button className="md:ml-auto md:w-auto col-span-2 md:col-span-1 w-full flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-white font-mono text-xs font-bold hover:bg-primary-soft transition-colors border border-primary-soft/40">
          <FileDown size={12} /> EXPORT PDF REPORT
        </button>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between text-fg-muted">
      <span>{k}</span>
      <span className="text-fg">{v}</span>
    </div>
  );
}

function BottomKPI({ icon: Icon, label, value, sub }: { icon: any; label: string; value: string; sub?: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded bg-primary/15 border border-primary-soft/40 flex items-center justify-center shrink-0">
        <Icon size={14} className="text-primary-soft" />
      </div>
      <div className="min-w-0">
        <div className="text-[9px] font-mono text-fg-muted uppercase tracking-widest leading-tight">{label}</div>
        <div className="text-sm font-mono text-fg leading-tight mt-0.5">
          {value}{sub && <span className="text-fg-dim text-[10px] ml-1">{sub}</span>}
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
