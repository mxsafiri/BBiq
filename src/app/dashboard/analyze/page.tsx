'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import {
  MapPin, ChevronRight, Search, Loader2, X,
  ChevronDown, Zap, TriangleAlert,
} from 'lucide-react';

const MapDisplay = dynamic(
  () => import('@/components/ui/map-display').then(m => m.MapDisplay),
  { ssr: false, loading: () => <div className="w-full h-full bg-[#0d0d0d] animate-pulse" /> }
);

const ROAD_TYPES = [
  { value: 'highway',   label: 'Motorway / Highway', sub: 'High speed · 60–100 km/h' },
  { value: 'arterial',  label: 'Main Road',           sub: 'Busy urban traffic' },
  { value: 'collector', label: 'Secondary Road',      sub: 'Moderate flow' },
  { value: 'local',     label: 'Local Street',        sub: 'Quiet side road' },
];

const SIZES = [
  { value: '4x3',  label: '4×3m',  sub: 'Small' },
  { value: '6x4',  label: '6×4m',  sub: 'Medium' },
  { value: '8x4',  label: '8×4m',  sub: 'Standard' },
  { value: '12x4', label: '12×4m', sub: 'Large' },
  { value: '14x5', label: '14×5m', sub: 'Mega' },
];

const ANGLES = [
  { v: 'perpendicular', l: 'Faces traffic head-on',    sub: 'Best visibility' },
  { v: 'angled-45',     l: 'Angled 45° to road',       sub: 'Good visibility' },
  { v: 'parallel',      l: 'Runs along the road',      sub: 'Lower visibility' },
  { v: 'corner',        l: 'On a corner / junction',   sub: 'Multi-direction' },
];

// OSM highway type → our road type
function osmTypeToRoadType(osmClass: string, osmType: string): string | null {
  if (osmClass !== 'highway') return null;
  if (['motorway', 'motorway_link', 'trunk', 'trunk_link'].includes(osmType)) return 'highway';
  if (['primary', 'primary_link', 'secondary', 'secondary_link'].includes(osmType)) return 'arterial';
  if (['tertiary', 'tertiary_link'].includes(osmType)) return 'collector';
  if (['residential', 'unclassified', 'service', 'living_street', 'road'].includes(osmType)) return 'local';
  return null;
}

async function reverseGeocode(lat: number, lng: number): Promise<{ roadType: string | null; name: string }> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=17`;
    const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
    const data = await res.json();
    const roadType = osmTypeToRoadType(data.class ?? '', data.type ?? '');
    const name = data.display_name
      ? data.display_name.split(',').slice(0, 3).join(',')
      : `${lat.toFixed(4)}°, ${lng.toFixed(4)}°`;
    return { roadType, name };
  } catch {
    return { roadType: null, name: `${lat.toFixed(4)}°, ${lng.toFixed(4)}°` };
  }
}

async function geocodeSearch(query: string): Promise<{ lat: number; lng: number; display: string } | null> {
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

  const [lat, setLat]     = useState(-6.8161);
  const [lng, setLng]     = useState(39.2894);
  const [address, setAddress] = useState('Askari Monument Junction, Dar es Salaam');

  const [search, setSearch]       = useState('');
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  const [roadType, setRoadType]         = useState('arterial');
  const [roadTypeAuto, setRoadTypeAuto] = useState(false); // was it auto-detected?
  const [detecting, setDetecting]       = useState(false);

  const [size, setSize]     = useState('8x4');
  const [height, setHeight] = useState('6');
  const [angle, setAngle]   = useState('perpendicular');

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isAnalyzing, setIsAnalyzing]   = useState(false);
  const [error, setError]               = useState('');

  const searchRef    = useRef<HTMLInputElement>(null);
  const detectTimer  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstRender = useRef(true);

  // Auto-detect road type whenever pin moves (debounced, skip first render)
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    if (detectTimer.current) clearTimeout(detectTimer.current);
    detectTimer.current = setTimeout(async () => {
      setDetecting(true);
      const { roadType: detected, name } = await reverseGeocode(lat, lng);
      setDetecting(false);
      if (detected) { setRoadType(detected); setRoadTypeAuto(true); }
      else setRoadTypeAuto(false);
      // Only update address if it still looks like raw coords
      setAddress(prev =>
        /^-?\d+\.\d+°/.test(prev) ? name : prev
      );
    }, 600);
  }, [lat, lng]);

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
    const result = await geocodeSearch(q);
    setSearching(false);
    if (!result) { setSearchError('Location not found — try a different query'); return; }
    setLat(result.lat);
    setLng(result.lng);
    setAddress(result.display.split(',').slice(0, 3).join(','));
    setSearch('');
    searchRef.current?.blur();
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
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Analysis failed'); }
      const { id } = await res.json();
      router.push(`/dashboard/results?id=${id}`);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col lg:h-[calc(100vh-96px)]">

      {/* Header */}
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
          Pin the map · road type<br />auto-detects from location
        </span>
      </div>

      <div className="flex flex-col lg:flex-row gap-3 lg:flex-1 lg:min-h-0">

        {/* ── MAP ── */}
        <div className="
          flex flex-col overflow-hidden border border-border bg-[#0d0d0d]
          h-[48vw] min-h-[240px] max-h-[420px]
          lg:h-auto lg:max-h-none lg:flex-1 lg:min-h-0
        ">
          {/* Search */}
          <div className="flex items-center gap-2 px-3 py-2 border-b border-border shrink-0">
            <div className="flex-1 flex items-center gap-1.5 bg-surface/60 border border-border/60 px-2 py-2 focus-within:border-primary/50 transition-colors">
              <Search size={11} className="text-fg-muted shrink-0" />
              <input
                ref={searchRef}
                className="flex-1 bg-transparent text-[11px] font-mono text-fg outline-none placeholder:text-fg-dim min-w-0"
                placeholder="Search address… (Enter)"
                value={search}
                onChange={e => { setSearch(e.target.value); setSearchError(''); }}
                onKeyDown={e => e.key === 'Enter' && runSearch()}
              />
              {search && (
                <button onClick={() => setSearch('')} className="text-fg-dim hover:text-fg p-0.5">
                  <X size={10} />
                </button>
              )}
            </div>
            <button
              onClick={runSearch}
              disabled={searching || !search.trim()}
              className="flex items-center gap-1 px-3 py-2 bg-primary/90 hover:bg-primary text-white text-[10px] font-mono transition-colors disabled:opacity-40 shrink-0"
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

          <div className="flex-1 min-h-0">
            <MapDisplay lat={lat} lng={lng} interactive onLocationChange={handleLocationChange} />
          </div>

          <div className="flex items-center justify-between px-3 py-1.5 border-t border-border bg-surface/40 shrink-0">
            <div className="flex items-center gap-1.5 min-w-0">
              <MapPin size={9} className="text-primary shrink-0" />
              <span className="text-[9px] font-mono text-fg-muted truncate">{address}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0 ml-2">
              <span className="text-[8px] font-mono text-fg-dim">{lat.toFixed(4)}°</span>
              <span className="text-[8px] font-mono text-fg-dim">{lng.toFixed(4)}°</span>
            </div>
          </div>
        </div>

        {/* ── FORM ── */}
        <div className="w-full lg:w-[300px] flex flex-col gap-3 lg:overflow-y-auto shrink-0">

          {/* ── Road Type ── */}
          <div className="border border-border bg-surface/60 p-4">
            <div className="flex items-center justify-between mb-3">
              <label className="text-[9px] font-mono text-fg-muted uppercase tracking-widest">
                Road Type
              </label>
              {detecting ? (
                <span className="flex items-center gap-1 text-[9px] font-mono text-fg-dim">
                  <Loader2 size={9} className="animate-spin" /> Detecting…
                </span>
              ) : roadTypeAuto ? (
                <span className="flex items-center gap-1 text-[9px] font-mono text-success">
                  <Zap size={9} /> Auto-detected
                </span>
              ) : (
                <span className="text-[9px] font-mono text-fg-dim">Manual</span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {ROAD_TYPES.map(rt => (
                <button
                  key={rt.value}
                  onClick={() => { setRoadType(rt.value); setRoadTypeAuto(false); }}
                  className={`text-left px-3 py-2.5 transition-all ${
                    roadType === rt.value
                      ? 'bg-primary/20 border border-primary/50'
                      : 'border border-border/60 hover:border-border active:bg-surface'
                  }`}
                >
                  <div className={`text-[10px] font-mono font-medium leading-tight ${
                    roadType === rt.value ? 'text-primary-glow' : 'text-fg'
                  }`}>{rt.label}</div>
                  <div className="text-[9px] font-mono text-fg-dim mt-0.5 leading-tight">{rt.sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* ── Billboard Specs ── */}
          <div className="border border-border bg-surface/60 p-4">
            <label className="text-[9px] font-mono text-fg-muted uppercase tracking-widest block mb-3">
              Billboard Specs
            </label>

            {/* Size — visual button row */}
            <div className="mb-3">
              <div className="text-[9px] font-mono text-fg-dim mb-2">Size</div>
              <div className="flex gap-1.5 flex-wrap">
                {SIZES.map(s => (
                  <button
                    key={s.value}
                    onClick={() => setSize(s.value)}
                    className={`px-2.5 py-1.5 text-[9px] font-mono transition-all leading-tight text-center ${
                      size === s.value
                        ? 'bg-primary/20 text-primary-glow border border-primary/50'
                        : 'text-fg-dim border border-border/60 hover:text-fg active:bg-surface'
                    }`}
                  >
                    <div>{s.label}</div>
                    <div className="text-[8px] opacity-60">{s.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Height — slider */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <div className="text-[9px] font-mono text-fg-dim">Height from ground</div>
                <div className="text-[11px] font-mono text-fg font-medium">{height}m</div>
              </div>
              <input
                type="range" min="2" max="20" step="1"
                value={height}
                onChange={e => setHeight(e.target.value)}
                className="w-full accent-primary cursor-pointer"
              />
              <div className="flex justify-between text-[8px] font-mono text-fg-dim mt-0.5">
                <span>2m</span><span>Street level</span><span>20m</span>
              </div>
            </div>
          </div>

          {/* ── Label ── */}
          <div className="border border-border bg-surface/60 px-4 py-3">
            <label className="text-[9px] font-mono text-fg-muted uppercase tracking-widest flex items-center gap-1 mb-2">
              <MapPin size={9} />Location Label
            </label>
            <input
              className="w-full bg-transparent border-b border-border/60 text-[11px] font-mono text-fg py-1 outline-none focus:border-primary/50 transition-colors placeholder:text-fg-dim"
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="e.g. Kariakoo junction"
            />
          </div>

          {/* ── Advanced toggle ── */}
          <button
            onClick={() => setShowAdvanced(v => !v)}
            className="flex items-center justify-between px-4 py-2.5 border border-border/60 bg-surface/30 hover:border-border text-[9px] font-mono text-fg-dim hover:text-fg-muted transition-all"
          >
            <span className="uppercase tracking-widest">Advanced Options</span>
            <ChevronDown
              size={11}
              className={`transition-transform duration-200 ${showAdvanced ? 'rotate-180' : ''}`}
            />
          </button>

          {showAdvanced && (
            <div className="border border-border bg-surface/60 p-4">
              <div className="flex items-center gap-1.5 mb-3">
                <TriangleAlert size={9} className="text-gold" />
                <label className="text-[9px] font-mono text-fg-muted uppercase tracking-widest">
                  Facing Angle
                </label>
              </div>
              <div className="grid grid-cols-1 gap-1.5">
                {ANGLES.map(({ v, l, sub }) => (
                  <button
                    key={v}
                    onClick={() => setAngle(v)}
                    className={`flex items-center justify-between px-3 py-2.5 text-left transition-all ${
                      angle === v
                        ? 'bg-primary/20 border border-primary/50'
                        : 'border border-border/60 hover:border-border active:bg-surface'
                    }`}
                  >
                    <span className={`text-[10px] font-mono ${angle === v ? 'text-primary-glow' : 'text-fg'}`}>
                      {l}
                    </span>
                    <span className="text-[9px] font-mono text-fg-dim">{sub}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="border border-primary/40 bg-primary/5 px-3 py-2.5 text-[11px] font-mono text-primary-glow">
              {error}
            </div>
          )}

          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing || detecting}
            className="w-full py-4 bg-primary hover:bg-primary/90 active:scale-[0.99] text-white font-mono text-xs tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isAnalyzing ? (
              <><Loader2 size={12} className="animate-spin" />ANALYZING…</>
            ) : detecting ? (
              <><Loader2 size={12} className="animate-spin" />DETECTING ROAD…</>
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
