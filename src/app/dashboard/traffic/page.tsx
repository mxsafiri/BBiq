import { Activity, MapPin, Gauge } from 'lucide-react';
import { getLiveTraffic } from '@/db/queries';

function congestionLabel(level: number) {
  if (level >= 0.7) return { label: 'HEAVY',     cls: 'text-primary border-primary/40 bg-primary/10' };
  if (level >= 0.5) return { label: 'MODERATE',  cls: 'text-gold border-gold/40 bg-gold/10' };
  if (level >= 0.3) return { label: 'LIGHT',     cls: 'text-success border-success/40 bg-success/10' };
  return                 { label: 'FREE-FLOW', cls: 'text-fg-muted border-border' };
}

function fmtRecorded(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString('en-TZ', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export default async function TrafficPage() {
  const rows = await getLiveTraffic();

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-4 h-px bg-primary" />
            <span className="text-[10px] font-mono text-fg-muted uppercase tracking-widest">Real-time Signals</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold font-mono text-fg tracking-wide">
            LIVE <span className="text-primary">TRAFFIC</span>
          </h1>
          <p className="text-xs font-mono text-fg-muted mt-1">
            Latest congestion + speed snapshot per analyzed location
          </p>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono text-fg-muted">
          <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
          {rows.length} location{rows.length === 1 ? '' : 's'} tracked
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="bg-surface/60 border border-border px-5 py-16 text-center">
          <Activity size={28} className="mx-auto text-fg-dim mb-3" />
          <div className="text-xs font-mono text-fg-muted">No traffic snapshots yet.</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          {rows.map(r => {
            const c = congestionLabel(r.congestionLevel);
            return (
              <div key={r.locationId} className="bg-surface/60 border border-border p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2 min-w-0">
                    <MapPin size={12} className="text-primary shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <div className="text-xs font-mono text-fg truncate">{r.locationName}</div>
                      <div className="text-[10px] font-mono text-fg-dim truncate mt-0.5">{r.address}</div>
                    </div>
                  </div>
                  <span className={`shrink-0 text-[9px] font-mono font-bold px-2 py-1 border ${c.cls}`}>{c.label}</span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <div className="text-[9px] font-mono text-fg-muted uppercase tracking-widest mb-1">Congestion</div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-surface-2 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${r.congestionLevel * 100}%` }} />
                      </div>
                      <span className="text-xs font-mono text-fg w-9 text-right">{Math.round(r.congestionLevel * 100)}%</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-[9px] font-mono text-fg-muted uppercase tracking-widest mb-1 flex items-center gap-1">
                      <Gauge size={10} /> Avg Speed
                    </div>
                    <div className="text-xs font-mono text-fg">{r.avgSpeedKph.toFixed(0)} <span className="text-fg-dim text-[10px]">km/h</span></div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[9px] font-mono text-fg-dim pt-2 border-t border-border/60">
                  <span>SOURCE: {r.source.toUpperCase()}</span>
                  <span>{fmtRecorded(r.recordedAt)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
