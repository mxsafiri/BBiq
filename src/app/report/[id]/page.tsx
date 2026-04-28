'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import type { AnalysisDetail } from '@/db/queries';

function fmt(n: number) {
  if (n >= 1_000_000) return `TZS ${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000)     return `TZS ${(n / 1_000).toFixed(0)}K`;
  return `TZS ${n}`;
}

function pct(v: number) { return Math.round(v * 100); }

export default function ReportPage() {
  const { id } = useParams<{ id: string }>();
  const [a, setA] = useState<AnalysisDetail | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/analyses/${id}`)
      .then(r => { if (!r.ok) throw new Error('Not found'); return r.json(); })
      .then(data => { setA(data); })
      .catch(e => setError(e.message));
  }, [id]);

  // Auto-print once data is loaded
  useEffect(() => {
    if (a) {
      const t = setTimeout(() => window.print(), 800);
      return () => clearTimeout(t);
    }
  }, [a]);

  if (error) {
    return (
      <div style={{ fontFamily: 'monospace', padding: 40, color: '#e31837' }}>
        Error: {error}
      </div>
    );
  }

  if (!a) {
    return (
      <div style={{ fontFamily: 'monospace', padding: 40, color: '#666', textAlign: 'center' }}>
        Loading report…
      </div>
    );
  }

  const date = new Date(a.createdAt).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  const scores = [
    { label: 'Traffic Score',     value: pct(a.trafficScore) },
    { label: 'Foot Activity',     value: pct(a.footScore) },
    { label: 'Visibility Factor', value: pct(a.visibilityFactor) },
    { label: 'Composite Score',   value: pct(a.compositeScore) },
  ];

  return (
    <>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body { background: #fff !important; color: #111; min-height: auto !important; flex-direction: unset !important; }
        body { font-family: 'Courier New', monospace; background: #fff !important; color: #111; }

        .page { max-width: 800px; margin: 0 auto; padding: 48px 40px; }

        /* ── Print overrides ── */
        @media print {
          .no-print { display: none !important; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .page { padding: 20px; }
          .score-bar-fill { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }

        .header { display: flex; justify-content: space-between; align-items: flex-start;
                  border-bottom: 2px solid #e31837; padding-bottom: 16px; margin-bottom: 24px; }
        .logo { font-size: 22px; font-weight: 700; letter-spacing: 2px; color: #111; }
        .logo span { color: #e31837; }
        .meta { text-align: right; font-size: 10px; color: #666; line-height: 1.6; }

        h2 { font-size: 11px; letter-spacing: 3px; color: #e31837; text-transform: uppercase;
             margin-bottom: 10px; padding-bottom: 4px; border-bottom: 1px solid #eee; }

        .location-block { margin-bottom: 24px; }
        .location-name { font-size: 20px; font-weight: 700; letter-spacing: 1px; margin-bottom: 4px; }
        .location-meta { font-size: 10px; color: #666; letter-spacing: 1px; }

        .grade-badge { display: inline-block; padding: 4px 14px; font-size: 11px;
                       font-weight: 700; letter-spacing: 3px; border: 1.5px solid #e31837;
                       color: #e31837; margin-top: 8px; }

        .scores-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px; }
        .score-card { border: 1px solid #ddd; padding: 12px 10px; }
        .score-label { font-size: 8px; color: #888; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 4px; }
        .score-value { font-size: 26px; font-weight: 700; color: #111; line-height: 1; }
        .score-sub { font-size: 10px; color: #aaa; }
        .score-bar { height: 3px; background: #eee; margin-top: 6px; border-radius: 2px; overflow: hidden; }
        .score-bar-fill { height: 100%; background: #e31837; border-radius: 2px; }
        .score-card:last-child .score-value { color: #e31837; }
        .score-card:last-child .score-bar-fill { background: #f99c00; }

        .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; }

        .pricing-block { border: 1.5px solid #e31837; padding: 16px; background: #fff9f9; }
        .price-main { font-size: 28px; font-weight: 700; color: #e31837; margin: 8px 0 4px; }
        .price-sub { font-size: 9px; color: #888; letter-spacing: 2px; text-transform: uppercase; }
        .price-row { display: flex; justify-content: space-between; font-size: 10px;
                     padding: 5px 0; border-bottom: 1px solid #f0e0e0; color: #555; }
        .price-row:last-child { border-bottom: none; }
        .price-row span:last-child { color: #111; font-weight: 600; }

        .specs-block { border: 1px solid #ddd; padding: 16px; }
        .spec-row { display: flex; justify-content: space-between; font-size: 10px;
                    padding: 5px 0; border-bottom: 1px solid #f5f5f5; color: #666; }
        .spec-row:last-child { border-bottom: none; }
        .spec-row span:last-child { color: #111; font-weight: 600; }

        .impressions-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 24px; }
        .imp-card { border: 1px solid #ddd; padding: 12px; text-align: center; }
        .imp-label { font-size: 8px; color: #999; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 4px; }
        .imp-value { font-size: 18px; font-weight: 700; color: #111; }
        .imp-unit { font-size: 9px; color: #aaa; margin-top: 2px; }

        .places-table { width: 100%; border-collapse: collapse; font-size: 10px; margin-bottom: 24px; }
        .places-table th { text-align: left; padding: 6px 8px; background: #f5f5f5;
                           font-size: 8px; letter-spacing: 2px; color: #888; border-bottom: 2px solid #ddd; }
        .places-table td { padding: 6px 8px; border-bottom: 1px solid #f0f0f0; color: #333; }
        .places-table tr:last-child td { border-bottom: none; }

        .footer { border-top: 1px solid #ddd; padding-top: 12px; display: flex;
                  justify-content: space-between; font-size: 9px; color: #aaa; letter-spacing: 1px; }

        .print-btn { display: block; margin: 0 auto 32px; padding: 10px 28px;
                     background: #e31837; color: #fff; font-family: monospace;
                     font-size: 12px; font-weight: 700; letter-spacing: 2px;
                     border: none; cursor: pointer; text-transform: uppercase; }
        .print-btn:hover { background: #c0122c; }
      `}</style>

      <div className="page">
        {/* Print button — hidden in print */}
        <div className="no-print" style={{ textAlign: 'center', marginBottom: 24 }}>
          <button className="print-btn" onClick={() => window.print()}>
            ⬇ Save / Print PDF
          </button>
        </div>

        {/* Header */}
        <div className="header">
          <div>
            <div className="logo">BILLBOARD<span>IQ</span></div>
            <div style={{ fontSize: 9, color: '#888', letterSpacing: 2, marginTop: 2 }}>
              INTELLIGENCE PLATFORM · TANZANIA
            </div>
          </div>
          <div className="meta">
            <div style={{ fontWeight: 700, fontSize: 11, marginBottom: 2 }}>LOCATION ANALYSIS REPORT</div>
            <div>Generated: {date}</div>
            <div>Ref: {a.id.substring(0, 8).toUpperCase()}</div>
            <div>Market: Dar es Salaam, TZ</div>
          </div>
        </div>

        {/* Location */}
        <div className="location-block">
          <div style={{ fontSize: 9, color: '#e31837', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 6 }}>
            — Location
          </div>
          <div className="location-name">{a.locationName}</div>
          <div className="location-meta">
            LAT {a.lat.toFixed(5)}° · LNG {a.lng.toFixed(5)}° · {a.roadType.toUpperCase()} ROAD ·
            SIZE {a.size}m · HEIGHT {a.heightM}m · {a.angle.replace('-', ' ').toUpperCase()}
          </div>
          <div className="grade-badge">{a.scoreGrade} GRADE</div>
        </div>

        {/* Score cards */}
        <h2>Score Breakdown</h2>
        <div className="scores-grid">
          {scores.map(({ label, value }) => (
            <div key={label} className="score-card">
              <div className="score-label">{label}</div>
              <div className="score-value">{value}<span className="score-sub">/100</span></div>
              <div className="score-bar">
                <div className="score-bar-fill" style={{ width: `${value}%` }} />
              </div>
            </div>
          ))}
        </div>

        {/* Impressions */}
        <h2>Audience Reach</h2>
        <div className="impressions-row">
          <div className="imp-card">
            <div className="imp-label">Daily Impressions</div>
            <div className="imp-value">{a.dailyImpressions.toLocaleString()}</div>
            <div className="imp-unit">est. per day</div>
          </div>
          <div className="imp-card">
            <div className="imp-label">Weekly Impressions</div>
            <div className="imp-value">{a.weeklyImpressions.toLocaleString()}</div>
            <div className="imp-unit">est. per week</div>
          </div>
          <div className="imp-card">
            <div className="imp-label">Monthly Impressions</div>
            <div className="imp-value">{a.monthlyImpressions.toLocaleString()}</div>
            <div className="imp-unit">est. per month</div>
          </div>
        </div>

        {/* Pricing + Specs */}
        <h2>Pricing & Specifications</h2>
        <div className="two-col">
          <div className="pricing-block">
            <div className="price-sub">Suggested Monthly Rate</div>
            <div className="price-main">{fmt(a.suggestedPriceTzs)}</div>
            <div className="price-row"><span>Low estimate</span><span>{fmt(a.priceLowTzs)}</span></div>
            <div className="price-row"><span>High estimate</span><span>{fmt(a.priceHighTzs)}</span></div>
            <div className="price-row"><span>CPM rate</span><span>TZS {a.cpmRateTzs.toLocaleString()}</span></div>
            <div className="price-row"><span>Market tier</span><span>{a.scoreGrade}</span></div>
          </div>
          <div className="specs-block">
            <div className="spec-row"><span>Road type</span><span>{a.roadType}</span></div>
            <div className="spec-row"><span>Billboard size</span><span>{a.size}m</span></div>
            <div className="spec-row"><span>Height from ground</span><span>{a.heightM}m</span></div>
            <div className="spec-row"><span>Facing angle</span><span>{a.angle.replace('-', ' ')}</span></div>
            <div className="spec-row"><span>Exposure time</span><span>{a.exposureTimeSeconds}s avg</span></div>
            <div className="spec-row"><span>Peak day</span><span>Saturday</span></div>
            <div className="spec-row"><span>Best time</span><span>5PM – 7PM</span></div>
          </div>
        </div>

        {/* Nearby places */}
        {a.nearbyPlaces.length > 0 && (
          <>
            <h2>Nearby Activity ({a.nearbyPlaces.length} sites)</h2>
            <table className="places-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Distance</th>
                  <th>Influence</th>
                </tr>
              </thead>
              <tbody>
                {a.nearbyPlaces.slice(0, 10).map(p => (
                  <tr key={p.name}>
                    <td>{p.name}</td>
                    <td>{p.category}</td>
                    <td>{p.distance}</td>
                    <td>{Math.round(p.weight * 100)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {/* Footer */}
        <div className="footer">
          <div>BILLBOARDIQ · INTELLIGENCE PLATFORM · TANZANIA</div>
          <div>Generated {date} · Ref {a.id.substring(0, 8).toUpperCase()}</div>
          <div>Data: Google Routes + Foursquare</div>
        </div>
      </div>
    </>
  );
}
