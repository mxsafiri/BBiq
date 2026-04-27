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
    <div className="min-h-screen bg-[#0a1628]">
      <SidebarNav />

      <div className="md:ml-[220px] min-h-screen pb-20 md:pb-0">
        {/* Top bar */}
        <header className="sticky top-0 z-20 h-12 border-b border-blue-900/40 bg-[#0a1628]/90 backdrop-blur-sm flex items-center justify-between px-4 md:px-6">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 md:hidden">
            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
              <span className="text-white font-bold text-[10px] font-mono">B</span>
            </div>
            <span className="text-white font-bold text-sm font-mono tracking-widest">
              BILLBOARD<span className="text-blue-400">IQ</span>
            </span>
          </div>

          {/* Desktop market indicator */}
          <div className="hidden md:flex items-center gap-2 text-[10px] font-mono text-blue-300/50">
            <span className="text-blue-400/40">◐</span>
            <span>DAR ES SALAAM MARKET</span>
            <span className="text-blue-400/30">·</span>
            <span>LIVE</span>
            <div className="w-1 h-1 rounded-full bg-green-400 animate-pulse ml-1" />
          </div>

          {/* User + sign-out */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* User info */}
            <div className="flex items-center gap-2">
              {user.image ? (
                <Image
                  src={user.image}
                  alt={user.name ?? 'User'}
                  width={24}
                  height={24}
                  className="rounded-full border border-blue-400/30"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-blue-600/40 border border-blue-400/30 flex items-center justify-center">
                  <span className="text-[9px] font-mono text-blue-300">
                    {(user.name ?? user.email ?? 'U')[0].toUpperCase()}
                  </span>
                </div>
              )}
              <span className="hidden sm:block text-[10px] font-mono text-blue-300/60 max-w-[120px] truncate">
                {user.name ?? user.email}
              </span>
            </div>

            {/* Sign-out */}
            <form action={async () => {
              'use server';
              await signOut({ redirectTo: '/login' });
            }}>
              <button
                type="submit"
                title="Sign out"
                className="flex items-center gap-1.5 text-[9px] font-mono text-blue-400/40 hover:text-blue-300 transition-colors px-2 py-1 border border-transparent hover:border-blue-900/60"
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
