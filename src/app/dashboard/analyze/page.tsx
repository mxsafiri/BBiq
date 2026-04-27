'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { MapPin, ChevronRight, Ruler, Compass, ArrowUp } from 'lucide-react';

const MapDisplay = dynamic(
  () => import('@/components/ui/map-display').then(m => m.MapDisplay),
  { ssr: false, loading: () => <div className="w-full h-full bg-[#060f1e] animate-pulse" /> }
);

const ROAD_TYPES = [
  { value: 'highway',   label: 'Highway / Expressway' },
  { value: 'arterial',  label: 'Arterial Road' },
  { value: 'collector', label: 'Collector Road' },
  { value: 'local',     label: 'Local Street' },
];

const SIZES = [
  { value: '4x3',  label: '4m × 3m (Small)' },
  { value: '6x4',  label: '6m × 4m (Medium)' },
  { value: '8x4',  label: '8m × 4m (Standard)' },
  { value: '12x4', label: '12m × 4m (Large)' },
  { value: '14x5', label: '14m × 5m (Mega)' },
];

export default function AnalyzePage() {
  const router = useRouter();
  const [lat, setLat]       = useState(-6.8161);
  const [lng, setLng]       = useState(39.2894);
  const [address, setAddress] = useState('Askari Monument Junction, Dar es Salaam');
  const [roadType, setRoadType] = useState('arterial');
  const [size, setSize]     = useState('8x4');
  const [height, setHeight] = useState('6');
  const [angle, setAngle]   = useState('perpendicular');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError]   = useState('');

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
    <div className="space-y-4 md:space-y-5">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-4 h-px bg-blue-400" />
          <span className="text-[10px] font-mono text-blue-400/60 uppercase tracking-widest">New Analysis</span>
        </div>
        <h1 className="text-xl font-bold font-mono text-white">
          LOCATION <span className="text-blue-400">ANALYSIS</span>
        </h1>
        <p className="text-xs font-mono text-blue-300/50 mt-1">
          Click the map to place your billboard or fill the form below.
        </p>
      </div>

      <div className="flex flex-col lg:grid lg:grid-cols-[1fr_340px] gap-4 md:gap-5">

        {/* Map */}
        <div className="space-y-3">
          <div className="border border-blue-900/40 bg-[#060f1e] overflow-hidden" style={{ height: 320 }}>
            <div className="h-8 bg-[#060f1e] border-b border-blue-900/40 flex items-center px-3 gap-2 shrink-0">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              <span className="text-[9px] font-mono text-blue-300/50 uppercase tracking-widest">OpenStreetMap · Click to Place</span>
            </div>
            <div style={{ height: 288 }}>
              <MapDisplay
                lat={lat}
                lng={lng}
                interactive
                onLocationChange={(newLat, newLng) => {
                  setLat(newLat);
                  setLng(newLng);
                  setAddress(`${newLat.toFixed(4)}°, ${newLng.toFixed(4)}°`);
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="border border-blue-900/40 bg-[#0d1f3c]/60 px-3 py-2">
              <div className="text-[9px] font-mono text-blue-400/50 uppercase tracking-widest mb-1">Latitude</div>
              <div className="text-sm font-mono text-white">{lat.toFixed(6)}°</div>
            </div>
            <div className="border border-blue-900/40 bg-[#0d1f3c]/60 px-3 py-2">
              <div className="text-[9px] font-mono text-blue-400/50 uppercase tracking-widest mb-1">Longitude</div>
              <div className="text-sm font-mono text-white">{lng.toFixed(6)}°</div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-3">
          <div className="border border-blue-900/40 bg-[#0d1f3c]/60 p-4">
            <label className="text-[9px] font-mono text-blue-400/60 uppercase tracking-widest block mb-2">
              <MapPin size={9} className="inline mr-1" />Location Name
            </label>
            <input
              className="w-full bg-transparent border-b border-blue-400/30 text-xs font-mono text-white py-1 outline-none focus:border-blue-400 transition-colors placeholder:text-blue-300/20"
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="e.g. Kariakoo Market junction"
            />
          </div>

          <div className="border border-blue-900/40 bg-[#0d1f3c]/60 p-4">
            <label className="text-[9px] font-mono text-blue-400/60 uppercase tracking-widest block mb-3">Road Type</label>
            <div className="grid grid-cols-2 gap-1.5">
              {ROAD_TYPES.map(rt => (
                <button
                  key={rt.value}
                  onClick={() => setRoadType(rt.value)}
                  className={`text-left px-3 py-2 text-[10px] font-mono transition-all ${
                    roadType === rt.value
                      ? 'bg-blue-600/20 text-blue-300 border border-blue-500/40'
                      : 'text-blue-300/40 border border-transparent hover:text-blue-200 hover:bg-blue-900/20'
                  }`}
                >
                  {rt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="border border-blue-900/40 bg-[#0d1f3c]/60 p-4 space-y-4">
            <div>
              <label className="text-[9px] font-mono text-blue-400/60 uppercase tracking-widest block mb-2">
                <Ruler size={9} className="inline mr-1" />Billboard Size
              </label>
              <select
                className="w-full bg-[#060f1e] border border-blue-900/40 text-xs font-mono text-white py-2 px-2 outline-none focus:border-blue-400 transition-colors"
                value={size}
                onChange={e => setSize(e.target.value)}
              >
                {SIZES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>

            <div>
              <label className="text-[9px] font-mono text-blue-400/60 uppercase tracking-widest block mb-2">
                <ArrowUp size={9} className="inline mr-1" />Height from ground (m)
              </label>
              <input
                type="number" min="2" max="30"
                className="w-full bg-[#060f1e] border border-blue-900/40 text-xs font-mono text-white py-2 px-2 outline-none focus:border-blue-400 transition-colors"
                value={height}
                onChange={e => setHeight(e.target.value)}
              />
            </div>

            <div>
              <label className="text-[9px] font-mono text-blue-400/60 uppercase tracking-widest block mb-2">
                <Compass size={9} className="inline mr-1" />Facing Angle
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {['perpendicular', 'angled-45', 'parallel', 'corner'].map(a => (
                  <button
                    key={a}
                    onClick={() => setAngle(a)}
                    className={`py-1.5 text-[10px] font-mono transition-all capitalize ${
                      angle === a
                        ? 'bg-blue-600/20 text-blue-300 border border-blue-500/40'
                        : 'text-blue-300/30 border border-blue-900/30 hover:text-blue-200'
                    }`}
                  >
                    {a.replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {error && (
            <div className="border border-red-500/40 bg-red-900/10 px-3 py-2 text-xs font-mono text-red-400">
              {error}
            </div>
          )}

          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="w-full py-3 bg-blue-600 text-white font-mono text-xs hover:bg-blue-500 transition-all border border-blue-400/40 flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {isAnalyzing ? (
              <><div className="w-3 h-3 border border-white/40 border-t-white rounded-full animate-spin" />ANALYZING…</>
            ) : (
              <>RUN ANALYSIS <ChevronRight size={12} /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
