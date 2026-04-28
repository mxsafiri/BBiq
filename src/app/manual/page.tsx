import Link from 'next/link';
import {
  MapPin, BarChart3, DollarSign, Zap, Eye, Users,
  ChevronRight, CheckCircle2, Globe, Navigation,
  TrendingUp, FileDown, Search, MousePointer,
} from 'lucide-react';

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 text-[9px] font-mono text-fg-muted uppercase tracking-widest">
      <span className="w-3 h-px bg-primary inline-block" />
      {children}
    </span>
  );
}

function SectionHeader({ tag, title, sub }: { tag: string; title: React.ReactNode; sub?: string }) {
  return (
    <div className="mb-8 md:mb-12">
      <Tag>{tag}</Tag>
      <h2 className="text-2xl md:text-3xl font-bold font-mono text-fg mt-2 mb-2">{title}</h2>
      {sub && <p className="text-sm font-mono text-fg-muted max-w-xl leading-relaxed">{sub}</p>}
    </div>
  );
}

function Divider() {
  return <div className="border-t border-border my-16 md:my-20" />;
}

const STEPS = [
  {
    n: '01',
    icon: Search,
    title: 'Search or Pin a Location',
    body: 'Type any address in Dar es Salaam — or simply tap the map to drop a pin exactly where your billboard will stand. The map geocodes in real time so you always know the precise coordinates.',
  },
  {
    n: '02',
    icon: Zap,
    title: 'We Fetch Live Data',
    body: 'The moment you hit RUN ANALYSIS, BillboardIQ queries Google Routes API for real-time traffic flow and Foursquare for nearby foot-traffic generators — all within seconds.',
  },
  {
    n: '03',
    icon: BarChart3,
    title: 'Get Your Score & Price',
    body: 'Our scoring engine weighs traffic volume, congestion levels, visibility angle, billboard size, and nearby activity to produce a composite score and a data-driven monthly price estimate in TZS.',
  },
  {
    n: '04',
    icon: FileDown,
    title: 'Export & Share',
    body: 'One click generates a clean PDF report with your score breakdown, audience reach figures, pricing estimates, and nearby place analysis — ready to share with clients or stakeholders.',
  },
];

const FEATURES = [
  {
    icon: MapPin,
    title: 'Precision Location Intelligence',
    body: 'Every analysis is pinned to GPS coordinates. No guessing — real latitude and longitude, real road context.',
    accent: 'primary',
  },
  {
    icon: TrendingUp,
    title: 'Live Traffic Signals',
    body: 'Google Routes API measures actual congestion right now, not historical averages. Your price reflects today\'s reality.',
    accent: 'primary',
  },
  {
    icon: Users,
    title: 'Foot Traffic Mapping',
    body: 'Foursquare\'s global places database identifies nearby activity generators — markets, transport hubs, malls — within 500m.',
    accent: 'gold',
  },
  {
    icon: Eye,
    title: 'Visibility Scoring',
    body: 'Billboard size, height, and facing angle are combined into a visibility factor that adjusts your audience exposure estimate.',
    accent: 'gold',
  },
  {
    icon: DollarSign,
    title: 'TZS Pricing Engine',
    body: 'Prices are calculated using CPM (cost per thousand impressions) benchmarked to the Tanzanian OOH market — not global averages.',
    accent: 'primary',
  },
  {
    icon: Globe,
    title: 'Portfolio Analytics',
    body: 'Track all your analysed locations in one place. Compare scores, spot your top-performing sites, and build a data-backed pitch.',
    accent: 'gold',
  },
];

const WHY_ROWS = [
  { before: 'Pricing based on gut feel and negotiation', after: 'Data-driven monthly rate with low/high range in TZS' },
  { before: 'No visibility into foot or vehicle traffic', after: 'Live Google Routes + Foursquare signals, refreshed on demand' },
  { before: 'Pitching clients with anecdotal claims', after: 'Export a professional PDF report in one click' },
  { before: 'Comparing locations by memory', after: 'Composite scores across your full portfolio' },
  { before: 'Losing deals to competitors with better data', after: 'Walk in with impression estimates and CPM rates' },
];

const GUIDE_SECTIONS = [
  {
    icon: Navigation,
    title: 'Analyze Page',
    steps: [
      'Use the search bar to find any street, junction, or landmark in Tanzania.',
      'Press Enter or tap GO to fly the map to that location.',
      'Tap the map to move the pin to the exact billboard position — or drag the red marker.',
      'Select Road Type (highway gives highest traffic volume; local gives highest dwell time).',
      'Choose Billboard Size and Height — larger and higher = better visibility score.',
      'Pick Facing Angle — perpendicular to traffic is always optimal.',
      'Hit RUN ANALYSIS. Results appear in under 10 seconds.',
    ],
  },
  {
    icon: BarChart3,
    title: 'Results Page',
    steps: [
      'The grade badge (PREMIUM / HIGH / MEDIUM / LOW) is your headline metric.',
      'Score Breakdown shows four sub-scores: Traffic, Foot Activity, Visibility, Composite.',
      'Pricing Engine shows a suggested monthly rate plus a low/high confidence range.',
      'Nearby Activity lists the top foot-traffic generators within 500m and their influence weight.',
      'Peak Traffic Hours shows the 24-hour traffic pattern for your road type.',
      'Click EXPORT PDF REPORT to generate a shareable PDF — opens in a new tab and auto-prints.',
    ],
  },
  {
    icon: TrendingUp,
    title: 'Analytics & Reports',
    steps: [
      'Analytics tab aggregates all your analyses: total impressions, avg score, revenue potential.',
      'Score Tier Distribution shows how your portfolio breaks down across PREMIUM → LOW.',
      'Reports tab lists every past analysis with grade, price, and date — click any row to revisit.',
      'Live Traffic tab shows a real-time snapshot for any road type on demand.',
    ],
  },
];

export default function ManualPage() {
  return (
    <div className="min-h-screen bg-background text-fg font-mono">

      {/* ── Nav ── */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 md:px-8 h-12 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-[10px]">B</span>
            </div>
            <span className="text-fg font-bold text-sm tracking-widest">
              BILLBOARD<span className="text-primary">IQ</span>
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-[9px] text-fg-dim uppercase tracking-widest hidden sm:block">Product Guide</span>
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 text-[10px] font-mono text-white bg-primary px-4 py-2 hover:bg-primary/90 transition-colors"
            >
              ENTER DASHBOARD <ChevronRight size={10} />
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 md:px-8">

        {/* ── Hero ── */}
        <section className="py-20 md:py-28">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-6 h-px bg-primary" />
            <span className="text-[9px] text-fg-muted uppercase tracking-widest">Billboard Intelligence Platform · Tanzania</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-fg leading-tight tracking-tight mb-6">
            STOP GUESSING.<br />
            <span className="text-primary">START PRICING</span><br />
            WITH DATA.
          </h1>
          <p className="text-sm md:text-base text-fg-muted max-w-2xl leading-loose mb-10">
            BillboardIQ is the first out-of-home intelligence platform built for the Tanzanian market.
            In under 10 seconds, it turns a map pin into a traffic score, audience estimate,
            and a data-backed monthly price — in TZS.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/dashboard/analyze"
              className="flex items-center gap-2 bg-primary text-white text-xs px-6 py-3 hover:bg-primary/90 transition-colors tracking-widest"
            >
              ANALYZE A LOCATION <ChevronRight size={12} />
            </Link>
            <a
              href="#how-it-works"
              className="flex items-center gap-2 border border-border text-fg-muted text-xs px-6 py-3 hover:border-primary/50 hover:text-fg transition-colors tracking-widest"
            >
              SEE HOW IT WORKS
            </a>
          </div>

          {/* Live status pill */}
          <div className="mt-10 inline-flex items-center gap-2 border border-success/30 bg-success/5 px-4 py-2">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            <span className="text-[10px] text-success tracking-widest">LIVE · Google Routes API + Foursquare · Tanzania Market</span>
          </div>
        </section>

        <Divider />

        {/* ── The Problem ── */}
        <section className="py-4">
          <SectionHeader
            tag="The Problem"
            title={<>Billboard pricing in Tanzania<br /><span className="text-primary">is broken.</span></>}
            sub="Most operators set rates based on gut feel, past deals, or what the client is willing to pay. There is no standard. That means you leave money on the table — or lose deals to competitors who sound more credible."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border border-border">
            <div className="p-4 border-b border-border md:border-b-0 md:border-r">
              <div className="text-[9px] text-fg-dim uppercase tracking-widest mb-4">Before BillboardIQ</div>
              <div className="space-y-3">
                {WHY_ROWS.map(r => (
                  <div key={r.before} className="flex items-start gap-2 text-[11px] text-fg-muted">
                    <span className="text-primary mt-0.5 shrink-0">✕</span>
                    {r.before}
                  </div>
                ))}
              </div>
            </div>
            <div className="p-4 bg-surface/40">
              <div className="text-[9px] text-success uppercase tracking-widest mb-4">After BillboardIQ</div>
              <div className="space-y-3">
                {WHY_ROWS.map(r => (
                  <div key={r.after} className="flex items-start gap-2 text-[11px] text-fg">
                    <CheckCircle2 size={12} className="text-success mt-0.5 shrink-0" />
                    {r.after}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <Divider />

        {/* ── How it works ── */}
        <section id="how-it-works" className="py-4">
          <SectionHeader
            tag="How It Works"
            title={<>Four steps from pin<br />to <span className="text-primary">priced report.</span></>}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {STEPS.map(({ n, icon: Icon, title, body }) => (
              <div key={n} className="border border-border bg-surface/40 p-6 flex gap-5">
                <div className="shrink-0">
                  <div className="text-[9px] text-fg-dim font-mono mb-2">{n}</div>
                  <div className="w-10 h-10 border border-primary/40 bg-primary/10 flex items-center justify-center">
                    <Icon size={18} className="text-primary" />
                  </div>
                </div>
                <div>
                  <div className="text-sm font-bold text-fg mb-2 tracking-wide">{title}</div>
                  <p className="text-[11px] text-fg-muted leading-relaxed">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <Divider />

        {/* ── Features ── */}
        <section className="py-4">
          <SectionHeader
            tag="Platform Features"
            title={<>Everything you need to<br /><span className="text-primary">price with confidence.</span></>}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map(({ icon: Icon, title, body, accent }) => (
              <div key={title} className="border border-border bg-surface/30 p-5 group hover:border-primary/40 transition-colors">
                <div className={`w-9 h-9 flex items-center justify-center mb-4 border ${
                  accent === 'gold'
                    ? 'border-gold/40 bg-gold/10'
                    : 'border-primary/40 bg-primary/10'
                }`}>
                  <Icon size={16} className={accent === 'gold' ? 'text-gold' : 'text-primary'} />
                </div>
                <div className="text-xs font-bold text-fg mb-2 tracking-wide">{title}</div>
                <p className="text-[10px] text-fg-muted leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </section>

        <Divider />

        {/* ── Data sources ── */}
        <section className="py-4">
          <SectionHeader
            tag="Data Sources"
            title={<>Powered by the world's<br /><span className="text-primary">best location APIs.</span></>}
            sub="We don't estimate traffic from census data or guesswork. We query live infrastructure APIs every time you run an analysis."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-border bg-surface/40 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 border border-primary/40 bg-primary/10 flex items-center justify-center shrink-0">
                  <Navigation size={18} className="text-primary" />
                </div>
                <div>
                  <div className="text-xs font-bold text-fg">Google Routes API</div>
                  <div className="text-[9px] text-fg-dim uppercase tracking-widest">Real-time Traffic</div>
                </div>
                <span className="ml-auto text-[9px] text-success border border-success/30 px-2 py-1">LIVE</span>
              </div>
              <p className="text-[11px] text-fg-muted leading-relaxed mb-4">
                We send a 500m probe route centred on your pin. Google returns the traffic-aware travel time vs. free-flow time. The difference gives us a congestion level (0–100%) and an average speed estimate — updated in real time.
              </p>
              <div className="space-y-1.5 text-[10px]">
                {['Congestion level (0–100%)', 'Average speed (km/h)', 'Traffic-aware vs free-flow duration', 'Updated on every analysis run'].map(f => (
                  <div key={f} className="flex items-center gap-2 text-fg-muted">
                    <span className="w-1 h-1 rounded-full bg-primary shrink-0" />{f}
                  </div>
                ))}
              </div>
            </div>

            <div className="border border-border bg-surface/40 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 border border-gold/40 bg-gold/10 flex items-center justify-center shrink-0">
                  <MapPin size={18} className="text-gold" />
                </div>
                <div>
                  <div className="text-xs font-bold text-fg">Foursquare Places API</div>
                  <div className="text-[9px] text-fg-dim uppercase tracking-widest">Foot Traffic Intelligence</div>
                </div>
                <span className="ml-auto text-[9px] text-success border border-success/30 px-2 py-1">LIVE</span>
              </div>
              <p className="text-[11px] text-fg-muted leading-relaxed mb-4">
                Foursquare's global places database identifies nearby venues within 500m of your pin — markets, transport hubs, schools, hospitals, malls — and assigns an influence weight based on category and distance.
              </p>
              <div className="space-y-1.5 text-[10px]">
                {['Nearby places within 500m radius', 'Category classification (10+ types)', 'Distance-weighted influence score', 'Drives foot traffic component of scoring'].map(f => (
                  <div key={f} className="flex items-center gap-2 text-fg-muted">
                    <span className="w-1 h-1 rounded-full bg-gold shrink-0" />{f}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <Divider />

        {/* ── Step by step guide ── */}
        <section className="py-4">
          <SectionHeader
            tag="User Guide"
            title={<>Step-by-step:<br /><span className="text-primary">every screen explained.</span></>}
          />
          <div className="space-y-4">
            {GUIDE_SECTIONS.map(({ icon: Icon, title, steps }, si) => (
              <div key={title} className="border border-border bg-surface/30">
                <div className="flex items-center gap-3 px-5 py-3 border-b border-border bg-surface/60">
                  <div className="w-7 h-7 border border-primary/40 bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon size={13} className="text-primary" />
                  </div>
                  <span className="text-xs font-bold text-fg tracking-wide">{title}</span>
                  <span className="ml-auto text-[9px] text-fg-dim">0{si + 1}</span>
                </div>
                <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-2">
                  {steps.map((step, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="text-[9px] font-mono text-primary shrink-0 mt-0.5 w-4">{String(i + 1).padStart(2, '0')}</span>
                      <p className="text-[11px] text-fg-muted leading-relaxed">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <Divider />

        {/* ── Scoring explained ── */}
        <section className="py-4">
          <SectionHeader
            tag="Scoring Model"
            title={<>How your score<br /><span className="text-primary">is calculated.</span></>}
          />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-8">
            {[
              { label: 'Traffic Score', weight: '40%', desc: 'Vehicle volume, congestion, average speed on the road', color: 'primary' },
              { label: 'Foot Activity', weight: '30%', desc: 'Number and type of nearby places within 500m radius', color: 'primary' },
              { label: 'Visibility Factor', weight: '20%', desc: 'Billboard size, height from ground, and facing angle', color: 'gold' },
              { label: 'Composite Score', weight: '100%', desc: 'Weighted average of all three — your headline grade', color: 'gold' },
            ].map(({ label, weight, desc, color }) => (
              <div key={label} className="border border-border bg-surface/30 p-4">
                <div className={`text-2xl font-bold mb-1 ${color === 'gold' ? 'text-gold' : 'text-primary'}`}>{weight}</div>
                <div className="text-[10px] font-bold text-fg mb-2">{label}</div>
                <p className="text-[10px] text-fg-muted leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          <div className="border border-border bg-surface/30 p-5">
            <div className="text-[9px] text-fg-dim uppercase tracking-widest mb-3">Grade thresholds</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { grade: 'PREMIUM', range: '80 – 100', color: 'text-primary border-primary/40 bg-primary/10' },
                { grade: 'HIGH',    range: '65 – 79',  color: 'text-primary-glow border-primary-glow/30 bg-primary-glow/5' },
                { grade: 'MEDIUM',  range: '45 – 64',  color: 'text-gold border-gold/40 bg-gold/5' },
                { grade: 'LOW',     range: '0 – 44',   color: 'text-fg-muted border-border bg-surface/40' },
              ].map(({ grade, range, color }) => (
                <div key={grade} className={`border px-4 py-3 text-center ${color}`}>
                  <div className="text-xs font-bold tracking-widest">{grade}</div>
                  <div className="text-[10px] mt-1 opacity-70">{range} / 100</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <Divider />

        {/* ── CTA ── */}
        <section className="py-16 text-center">
          <Tag>Get Started</Tag>
          <h2 className="text-3xl md:text-4xl font-bold text-fg mt-3 mb-4">
            Ready to price smarter?
          </h2>
          <p className="text-sm text-fg-muted mb-10 max-w-lg mx-auto leading-relaxed">
            Your first analysis takes under a minute. No setup. No spreadsheet.
            Just a map pin and real data.
          </p>
          <Link
            href="/dashboard/analyze"
            className="inline-flex items-center gap-2 bg-primary text-white text-xs px-8 py-4 hover:bg-primary/90 transition-colors tracking-widest"
          >
            RUN YOUR FIRST ANALYSIS <ChevronRight size={12} />
          </Link>
          <div className="mt-16 flex items-center justify-center gap-6 text-[9px] text-fg-dim uppercase tracking-widest flex-wrap">
            <span>Tanzania Market</span>
            <span className="w-px h-3 bg-border" />
            <span>Google Routes · Live</span>
            <span className="w-px h-3 bg-border" />
            <span>Foursquare · Live</span>
            <span className="w-px h-3 bg-border" />
            <span>Neon PostgreSQL</span>
            <span className="w-px h-3 bg-border" />
            <span>v1.0.0</span>
          </div>
        </section>

      </div>

      {/* ── Footer ── */}
      <footer className="border-t border-border">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-[8px]">B</span>
            </div>
            <span className="text-[10px] font-mono text-fg-muted tracking-widest">
              BILLBOARDIQ · INTELLIGENCE PLATFORM
            </span>
          </div>
          <div className="text-[9px] font-mono text-fg-dim">
            © {new Date().getFullYear()} BillboardIQ · Tanzania
          </div>
        </div>
      </footer>

    </div>
  );
}
