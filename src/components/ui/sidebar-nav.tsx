'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  MapPin,
  BarChart3,
  Settings,
  FileText,
  Activity,
} from 'lucide-react';

const NAV = [
  { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Analyze', href: '/dashboard/analyze', icon: MapPin },
  { label: 'Reports', href: '/dashboard/reports', icon: FileText },
  { label: 'Live Traffic', href: '/dashboard/traffic', icon: Activity },
  { label: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings },
];

const MOBILE_NAV = NAV.slice(0, 5);

export function SidebarNav() {
  const path = usePathname();

  const isActive = (href: string) =>
    path === href || (href !== '/dashboard' && path.startsWith(href));

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <aside className="hidden md:flex fixed left-0 top-0 h-screen w-[220px] bg-background border-r border-border flex-col z-30">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-border">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-primary rounded flex items-center justify-center">
              <span className="text-white font-bold text-xs font-mono">B</span>
            </div>
            <div>
              <div className="text-fg font-bold text-sm font-mono tracking-widest">
                BILLBOARD<span className="text-primary-soft">IQ</span>
              </div>
              <div className="text-fg-dim text-[9px] font-mono tracking-wider">INTELLIGENCE</div>
            </div>
          </Link>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV.map(({ label, href, icon: Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded text-xs font-mono transition-all duration-150 group ${
                  active
                    ? 'bg-surface text-primary-glow border border-border'
                    : 'text-fg-muted hover:text-fg hover:bg-surface/50 border border-transparent'
                }`}
              >
                <Icon
                  size={14}
                  className={active ? 'text-primary-soft' : 'text-fg-dim group-hover:text-primary-soft'}
                />
                {label}
                {active && <div className="ml-auto w-1 h-1 rounded-full bg-success animate-pulse" />}
              </Link>
            );
          })}
        </nav>

        {/* Status */}
        <div className="px-5 py-4 border-t border-border">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            <span className="text-[9px] font-mono text-fg-muted uppercase tracking-widest">System Online</span>
          </div>
          <div className="mt-1 text-[9px] font-mono text-fg-dim">v1.0.0 · TZ Market</div>
        </div>
      </aside>

      {/* ── Mobile bottom nav ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-t border-border flex items-center justify-around px-2 py-2 safe-area-pb">
        {MOBILE_NAV.map(({ label, href, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded transition-all ${
                active ? 'text-primary-soft' : 'text-fg-dim'
              }`}
            >
              <Icon size={18} />
              <span className="text-[9px] font-mono">{label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
