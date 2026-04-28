import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'BillboardIQ — Outdoor Advertising Intelligence for Tanzania';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#0d0d0d',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          padding: '72px 80px',
          fontFamily: 'monospace',
        }}
      >
        {/* Top accent line */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 48, height: 2, background: '#00ff88' }} />
          <span style={{ color: '#00ff88', fontSize: 13, letterSpacing: 6, textTransform: 'uppercase' }}>
            Billboard Intelligence
          </span>
        </div>

        {/* Main content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ color: '#ffffff', fontSize: 72, fontWeight: 700, letterSpacing: -2, lineHeight: 1 }}>
              BILLBOARD
            </span>
            <span style={{ color: '#00ff88', fontSize: 72, fontWeight: 700, letterSpacing: -2, lineHeight: 1 }}>
              IQ
            </span>
          </div>
          <p style={{ color: '#888888', fontSize: 26, margin: 0, lineHeight: 1.4, maxWidth: 700 }}>
            Drop a pin in Dar es Salaam. Get impressions, pricing, and a full location analysis in seconds.
          </p>
        </div>

        {/* Bottom stats row */}
        <div style={{ display: 'flex', gap: 48 }}>
          {[
            { label: 'Real traffic data', value: 'Google Routes API' },
            { label: 'Nearby places', value: 'OpenStreetMap' },
            { label: 'Market', value: 'Tanzania' },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ color: '#00ff88', fontSize: 18, fontWeight: 700 }}>{value}</span>
              <span style={{ color: '#555555', fontSize: 13, letterSpacing: 2, textTransform: 'uppercase' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
