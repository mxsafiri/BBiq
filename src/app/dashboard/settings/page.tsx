import { auth, signOut } from '@/auth';
import { redirect } from 'next/navigation';
import Image from 'next/image';
import { User, Database, MapPin, DollarSign, Activity, LogOut } from 'lucide-react';

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border/60 last:border-0 text-xs font-mono">
      <span className="text-fg-muted">{k}</span>
      <span className="text-fg">{v}</span>
    </div>
  );
}

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');
  const user = session.user;

  const cpm = process.env.CPM_RATE_TZS ?? '2500';
  const defaultCity = process.env.NEXT_PUBLIC_DEFAULT_CITY ?? 'Dar es Salaam';
  const hasGoogleMaps = !!process.env.GOOGLE_MAPS_API_KEY;
  const hasFoursquare = !!process.env.FOURSQUARE_API_KEY;

  return (
    <div className="space-y-4 md:space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-4 h-px bg-primary" />
          <span className="text-[10px] font-mono text-fg-muted uppercase tracking-widest">Account & System</span>
        </div>
        <h1 className="text-xl md:text-2xl font-bold font-mono text-fg tracking-wide">
          <span className="text-primary">SETTINGS</span>
        </h1>
      </div>

      {/* Account */}
      <section className="bg-surface/60 border border-border">
        <div className="px-4 py-3 border-b border-border flex items-center gap-2">
          <User size={12} className="text-primary" />
          <span className="text-[10px] font-mono text-fg uppercase tracking-wider">Account</span>
        </div>
        <div className="p-4 flex items-center gap-4">
          {user.image ? (
            <Image src={user.image} alt={user.name ?? 'User'} width={48} height={48} className="rounded-full border border-border" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-surface-2 border border-border flex items-center justify-center">
              <span className="text-sm font-mono text-primary">{(user.name ?? user.email ?? 'U')[0].toUpperCase()}</span>
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="text-sm font-mono text-fg truncate">{user.name ?? '—'}</div>
            <div className="text-xs font-mono text-fg-muted truncate">{user.email}</div>
          </div>
          <form action={async () => { 'use server'; await signOut({ redirectTo: '/login' }); }}>
            <button
              type="submit"
              className="flex items-center gap-1.5 text-[10px] font-mono text-fg-muted hover:text-primary transition-colors px-3 py-1.5 border border-border hover:border-primary/40"
            >
              <LogOut size={11} />
              SIGN OUT
            </button>
          </form>
        </div>
      </section>

      {/* Pricing config */}
      <section className="bg-surface/60 border border-border">
        <div className="px-4 py-3 border-b border-border flex items-center gap-2">
          <DollarSign size={12} className="text-primary" />
          <span className="text-[10px] font-mono text-fg uppercase tracking-wider">Pricing Engine</span>
        </div>
        <div className="p-4">
          <Row k="CPM rate" v={<span>TZS {Number(cpm).toLocaleString()}</span>} />
          <Row k="Currency" v="TZS (Tanzanian Shilling)" />
          <Row k="Default city" v={defaultCity} />
        </div>
      </section>

      {/* Data sources */}
      <section className="bg-surface/60 border border-border">
        <div className="px-4 py-3 border-b border-border flex items-center gap-2">
          <Database size={12} className="text-primary" />
          <span className="text-[10px] font-mono text-fg uppercase tracking-wider">Data Sources</span>
        </div>
        <div className="p-4">
          <Row k="Database" v={<span className="text-success">Neon PostgreSQL · connected</span>} />
          <Row
            k="Foursquare Places"
            v={hasFoursquare
              ? <span className="text-success">configured</span>
              : <span className="text-fg-muted">mock data</span>}
          />
          <Row
            k="Google Routes"
            v={hasGoogleMaps
              ? <span className="text-success">configured</span>
              : <span className="text-fg-muted">mock data</span>}
          />
        </div>
      </section>

      {/* System */}
      <section className="bg-surface/60 border border-border">
        <div className="px-4 py-3 border-b border-border flex items-center gap-2">
          <Activity size={12} className="text-primary" />
          <span className="text-[10px] font-mono text-fg uppercase tracking-wider">System</span>
        </div>
        <div className="p-4">
          <Row k="Version" v="v1.0.0" />
          <Row k="Market" v={<span className="flex items-center gap-1.5"><MapPin size={10} className="text-primary" /> Tanzania</span>} />
          <Row k="Status" v={<span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" /> All systems online</span>} />
        </div>
      </section>
    </div>
  );
}
