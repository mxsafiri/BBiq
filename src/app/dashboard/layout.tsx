import { auth, signOut } from '@/auth';
import { redirect } from 'next/navigation';
import { SidebarNav } from '@/components/ui/sidebar-nav';
import Image from 'next/image';
import { LogOut } from 'lucide-react';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const user = session.user;

  return (
    <div className="min-h-screen bg-background">
      <SidebarNav />

      <div className="md:ml-[220px] min-h-screen pb-20 md:pb-0">
        {/* Top bar */}
        <header className="sticky top-0 z-20 h-12 border-b border-border bg-background/80 backdrop-blur-md flex items-center justify-between px-4 md:px-6">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 md:hidden">
            <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
              <span className="text-white font-bold text-[10px] font-mono">B</span>
            </div>
            <span className="text-fg font-bold text-sm font-mono tracking-widest">
              BILLBOARD<span className="text-primary-soft">IQ</span>
            </span>
          </div>

          {/* Desktop market indicator */}
          <div className="hidden md:flex items-center gap-2 text-[10px] font-mono text-fg-muted">
            <span className="text-fg-dim">◐</span>
            <span>DAR ES SALAAM MARKET</span>
            <span className="text-fg-dim">·</span>
            <span>LIVE</span>
            <div className="w-1 h-1 rounded-full bg-success animate-pulse ml-1" />
          </div>

          {/* User + sign-out */}
          <div className="flex items-center gap-2 md:gap-3">
            <div className="flex items-center gap-2">
              {user.image ? (
                <Image
                  src={user.image}
                  alt={user.name ?? 'User'}
                  width={24}
                  height={24}
                  className="rounded-full border border-border"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-surface border border-border flex items-center justify-center">
                  <span className="text-[9px] font-mono text-primary-soft">
                    {(user.name ?? user.email ?? 'U')[0].toUpperCase()}
                  </span>
                </div>
              )}
              <span className="hidden sm:block text-[10px] font-mono text-fg-muted max-w-[120px] truncate">
                {user.name ?? user.email}
              </span>
            </div>

            <form action={async () => {
              'use server';
              await signOut({ redirectTo: '/login' });
            }}>
              <button
                type="submit"
                title="Sign out"
                className="flex items-center gap-1.5 text-[9px] font-mono text-fg-dim hover:text-primary-soft transition-colors px-2 py-1 border border-transparent hover:border-border"
              >
                <LogOut size={11} />
                <span className="hidden sm:inline">SIGN OUT</span>
              </button>
            </form>
          </div>
        </header>

        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
