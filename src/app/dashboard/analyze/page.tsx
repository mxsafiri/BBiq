'use client';

import { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { MapPin, ChevronRight, Ruler, Compass, ArrowUp, Search, Loader2, X } from 'lucide-react';

const MapDisplay = dynamic(
  () => import('@/components/ui/map-display').then(m => m.MapDisplay),
  { ssr: false, loading: () => <div className="w-full h-full bg-[#0d0d0d] animate-pulse rounded-none" /> }
);

const ROAD_TYPES = [
  { value: 'highway',   label: 'Highway' },
  { value: 'arterial',  label: 'Arterial' },
  { value: 'collector', label: 'Collector' },
  { value: 'local',     label: 'Local St.' },
];

const SIZES = [
  { value: '4x3',  label: '4×3m — Small' },
  { value: '6x4',  label: '6×4m — Medium' },
  { value: '8x4',  label: '8×4m — Standard' },
  { value: '12x4', label: '12×4m — Large' },
  { value: '14x5', label: '14×5m — Mega' },
];

const ANGLES = [
  { v: 'perpendicular', l: 'Perpendicular' },
  { v: 'angled-45',     l: 'Angled 45°' },
  { v: 'parallel',      l: 'Parallel' },
  { v: 'corner',        l: 'Corner' },
];

async function geocode(query: string): Promise<{ lat: number; lng: number; display: string } | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&countrycodes=tz`;
    const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
    const data = await res.json();
    if (!data[0]) return null;
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon), display: data[0].display_name };
  } catch {
    return null;
  }
}

export default function AnalyzePage() {
  const router = useRouter();
  const [lat, setLat]             = useState(-6.8161);
  const [lng, setLng]             = useState(39.2894);
  const [address, setAddress]     = useState('Askari Monument Junction, Dar es Salaam');
  const [search, setSearch]       = useState('');
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [roadType, setRoadType]   = useState('arterial');
  const [size, setSize]           = useState('8x4');
  const [height, setHeight]       = useState('6');
  const [angle, setAngle]         = useState('perpendicular');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError]         = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  const handleLocationChange = useCallback((newLat: number, newLng: number) => {
    setLat(newLat);
    setLng(newLng);
    setAddress(`${newLat.toFixed(4)}°, ${newLng.toFixed(4)}°`);
  }, []);

  const runSearch = async () => {
    const q = search.trim();
    if (!q) return;
    setSearching(true);
    setSearchError('');
    const result = await geocode(q);
    setSearching(false);
    if (!result) {
      setSearchError('Location not found — try a different query');
      return;
    }
    setLat(result.lat);
    setLng(result.lng);
    setAddress(result.display.split(',').slice(0, 3).join(','));
    setSearch('');
    searchRef.current?.blur();
  };

  const handleSearchKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') runSearch();
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setError('');
    try {
      const res = await fetch('/api/analyses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: address, address, lat, lng, roadType, size, height, angle }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Analysis failed');
      }
      const { id } = await res.json();
      router.push(`/dashboard/results?id=${id}`);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
      setIsAnalyzing(false);
    }
  };

  return (
    /* Mobile: natural scroll. Desktop: fills viewport minus header+padding */
    <div className="flex flex-col lg:h-[calc(100vh-96px)]">

      {/* ── Page header ── */}
      <div className="flex items-center justify-between pb-3 shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <div className="w-3 h-px bg-primary" />
            <span className="text-[9px] font-mono text-fg-muted uppercase tracking-widest">New Analysis</span>
          </div>
          <h1 className="text-lg font-bold font-mono text-fg leading-tight">
            LOCATION <span className="text-primary">ANALYSIS</span>
          </h1>
        </div>
        <span className="text-[9px] font-mono text-fg-dim text-right leading-relaxed hidden sm:block">
          Tap map to pin<br />or search below
        </span>
      </div>

      {/* ── Main body ── */}
      <div className="flex flex-col lg:flex-row gap-3 lg:flex-1 lg:min-h-0">

        {/* MAP COLUMN — fixed height on mobile, flex-fill on desktop */}
        <div className="
          flex flex-col overflow-hidden border border-border bg-[#0d0d0d]
          h-[48vw] min-h-[240px] max-h-[420px]
          lg:h-auto lg:max-h-none lg:flex-1 lg:min-h-0
        ">
          {/* Search bar */}
          <div className="flex items-center gap-2 px-3 py-2 border-b border-border shrink-0">
            <div className="flex-1 flex items-center gap-1.5 bg-surface/60 border border-border/60 px-2 py-2 focus-within:border-primary/50 transition-colors">
              <Search size={11} className="text-fg-muted shrink-0" />
              <input
                ref={searchRef}
                className="flex-1 bg-transparent text-[11px] font-mono text-fg outline-none placeholder:text-fg-dim min-w-0"
                placeholder="Search address… (Enter)"
                value={search}
                onChange={e => { setSearch(e.target.value); setSearchError(''); }}
                onKeyDown={handleSearchKey}
              />
              {search && (
                <button onClick={() => setSearch('')} className="text-fg-dim hover:text-fg transition-colors p-0.5">
                  <X size={10} />
                </button>
              )}
            </div>
            <button
              onClick={runSearch}
              disabled={searching || !search.trim()}
              className="flex items-center gap-1 px-3 py-2 bg-primary/90 hover:bg-primary active:bg-primary text-white text-[10px] font-mono transition-colors disabled:opacity-40 shrink-0"
            >
              {searching ? <Loader2 size={10} className="animate-spin" /> : <Search size={10} />}
              <span className="hidden sm:inline ml-0.5">GO</span>
            </button>
          </div>

          {searchError && (
            <div className="px-3 py-1.5 bg-primary/10 border-b border-primary/20 text-[10px] font-mono text-primary-glow shrink-0">
              {searchError}
            </div>
          )}

          {/* Map fills remaining height */}
          <div className="flex-1 min-h-0">
            <MapDisplay
              lat={lat}
              lng={lng}
              interactive
              onLocationChange={handleLocationChange}
            />
          </div>

          {/* Coordinate footer */}
          <div className="flex items-center justify-between px-3 py-1.5 border-t border-border bg-surface/40 shrink-0">
            <div className="flex items-center gap-1.5 min-w-0">
              <MapPin size={9} className="text-primary shrink-0" />
              <span className="text-[9px] font-mono text-fg-muted truncate">{address}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0 ml-2">
              <span className="text-[8px] font-mono text-fg-dim whitespace-nowrap">{lat.toFixed(4)}°</span>
              <span className="text-[8px] font-mono text-fg-dim whitespace-nowrap">{lng.toFixed(4)}°</span>
            </div>
          </div>
        </div>

        {/* FORM PANEL — stacks below map on mobile, sidebar on desktop */}
        <div className="w-full lg:w-[300px] flex flex-col gap-3 lg:overflow-y-auto shrink-0">

          {/* Road type — 4-col on mobile, 2-col on desktop */}
          <div className="border border-border bg-surface/60 p-4">
            <label className="text-[9px] font-mono text-fg-muted uppercase tracking-widest block mb-3">
              Road Type
            </label>
            <div className="grid grid-cols-4 lg:grid-cols-2 gap-1.5">
              {ROAD_TYPES.map(rt => (
                <button
                  key={rt.value}
                  onClick={() => setRoadType(rt.value)}
                  className={`py-2.5 px-1 text-[9px] font-mono transition-all text-center leading-tight ${
                    roadType === rt.value
                      ? 'bg-primary/20 text-primary-glow border border-primary/50'
                      : 'text-fg-muted border border-border/60 active:bg-surface hover:text-fg'
                  }`}
                >
                  {rt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Size + height on one row for mobile */}
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
            <div className="border border-border bg-surface/60 p-3 lg:p-4">
              <label className="text-[9px] font-mono text-fg-muted uppercase tracking-widest flex items-center gap-1 mb-2">
                <Ruler size={9} />Size
              </label>
              <select
                className="w-full bg-background border border-border/60 text-[10px] font-mono text-fg py-2 px-2 outline-none focus:border-primary/50 transition-colors"
                value={size}
                onChange={e => setSize(e.target.value)}
              >
                {SIZES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>

            <div className="border border-border bg-surface/60 p-3 lg:p-4">
              <label className="text-[9px] font-mono text-fg-muted uppercase tracking-widest flex items-center gap-1 mb-2">
                <ArrowUp size={9} />Height (m)
              </label>
              <input
                type="number" min="2" max="30"
                className="w-full bg-background border border-border/60 text-[11px] font-mono text-fg py-2 px-2 outline-none focus:border-primary/50 transition-colors"
                value={height}
                onChange={e => setHeight(e.target.value)}
              />
            </div>
          </div>

          {/* Facing angle */}
          <div className="border border-border bg-surface/60 p-4">
            <label className="text-[9px] font-mono text-fg-muted uppercase tracking-widest flex items-center gap-1 mb-3">
              <Compass size={9} />Facing Angle
            </label>
            <div className="grid grid-cols-4 lg:grid-cols-2 gap-1.5">
              {ANGLES.map(({ v, l }) => (
                <button
                  key={v}
                  onClick={() => setAngle(v)}
                  className={`py-2.5 px-1 text-[9px] font-mono transition-all text-center leading-tight ${
                    angle === v
                      ? 'bg-primary/20 text-primary-glow border border-primary/50'
                      : 'text-fg-dim border border-border/60 active:bg-surface hover:text-fg'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Label */}
          <div className="border border-border bg-surface/60 p-4">
            <label className="text-[9px] font-mono text-fg-muted uppercase tracking-widest flex items-center gap-1 mb-2">
              <MapPin size={9} />Label
            </label>
            <input
              className="w-full bg-transparent border-b border-border/60 text-[11px] font-mono text-fg py-1.5 outline-none focus:border-primary/50 transition-colors placeholder:text-fg-dim"
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="e.g. Kariakoo junction"
            />
          </div>

          {error && (
            <div className="border border-primary/40 bg-primary/5 px-3 py-2.5 text-[11px] font-mono text-primary-glow">
              {error}
            </div>
          )}

          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="w-full py-4 bg-primary hover:bg-primary/90 active:scale-[0.99] text-white font-mono text-xs tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isAnalyzing ? (
              <><Loader2 size={12} className="animate-spin" />ANALYZING…</>
            ) : (
              <>RUN ANALYSIS <ChevronRight size={13} /></>
            )}
          </button>

          <p className="text-[9px] font-mono text-fg-dim text-center pb-4 lg:pb-2">
            Live · Google Routes + Foursquare
          </p>
        </div>
      </div>
    </div>
  );
}
