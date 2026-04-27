import { signIn } from '@/auth';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}) {
  const session = await auth();
  const { callbackUrl, error } = await searchParams;

  if (session?.user) redirect(callbackUrl ?? '/dashboard');

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4">
      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-10 h-10 border-t-2 border-l-2 border-primary-soft/30" />
      <div className="absolute top-0 right-0 w-10 h-10 border-t-2 border-r-2 border-primary-soft/30" />
      <div className="absolute bottom-0 left-0 w-10 h-10 border-b-2 border-l-2 border-primary-soft/30" />
      <div className="absolute bottom-0 right-0 w-10 h-10 border-b-2 border-r-2 border-primary-soft/30" />

      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-primary rounded flex items-center justify-center">
              <span className="text-white font-bold text-lg font-mono">B</span>
            </div>
            <div className="text-left">
              <div className="text-fg font-bold text-xl font-mono tracking-widest">
                BILLBOARD<span className="text-primary-soft">IQ</span>
              </div>
              <div className="text-fg-dim text-[10px] font-mono tracking-widest">INTELLIGENCE PLATFORM</div>
            </div>
          </div>
          <div className="flex items-center gap-2 justify-center opacity-60 mb-1">
            <div className="flex-1 h-px bg-border" />
            <span className="text-[9px] font-mono text-fg-muted tracking-widest">SECURE ACCESS</span>
            <div className="flex-1 h-px bg-border" />
          </div>
        </div>

        {/* Card */}
        <div className="bg-surface/80 border border-border p-6 space-y-5">
          <div>
            <h1 className="text-sm font-mono font-bold text-fg">Sign in to your account</h1>
            <p className="text-[10px] font-mono text-fg-muted mt-1">
              Access your billboard intelligence dashboard.
            </p>
          </div>

          {error && (
            <div className="border border-red-500/40 bg-red-900/10 px-3 py-2 text-xs font-mono text-red-400">
              {error === 'OAuthSignin'   ? 'Could not sign in with Google. Try again.' :
               error === 'OAuthCallback' ? 'OAuth callback error. Check your Google credentials.' :
               'Sign-in failed. Please try again.'}
            </div>
          )}

          {/* Google sign-in */}
          <form action={async () => {
            'use server';
            await signIn('google', { redirectTo: callbackUrl ?? '/dashboard' });
          }}>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white text-gray-800 font-mono text-xs font-bold hover:bg-gray-100 transition-colors border border-gray-200"
            >
              <svg width="16" height="16" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
          </form>

          <p className="text-[9px] font-mono text-fg-dim text-center leading-relaxed">
            By signing in you agree to our terms of service.<br />
            Your data is stored securely in Neon PostgreSQL.
          </p>
        </div>

        {/* Bottom metadata */}
        <div className="flex items-center justify-center gap-3 mt-4 text-[8px] font-mono text-fg-dim">
          <span>TZ MARKET</span>
          <span>·</span>
          <span>V1.0.0</span>
          <span>·</span>
          <div className="flex items-center gap-1">
            <div className="w-1 h-1 rounded-full bg-success animate-pulse" />
            <span>ONLINE</span>
          </div>
        </div>
      </div>
    </main>
  );
}
