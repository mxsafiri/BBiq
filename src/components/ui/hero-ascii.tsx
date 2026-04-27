'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function HeroAscii() {
  useEffect(() => {
    const embedScript = document.createElement('script');
    embedScript.type = 'text/javascript';
    embedScript.textContent = `
      !function(){
        if(!window.UnicornStudio){
          window.UnicornStudio={isInitialized:!1};
          var i=document.createElement("script");
          i.src="https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v1.4.33/dist/unicornStudio.umd.js";
          i.onload=function(){
            window.UnicornStudio.isInitialized||(UnicornStudio.init(),window.UnicornStudio.isInitialized=!0)
          };
          (document.head || document.body).appendChild(i)
        }
      }();
    `;
    document.head.appendChild(embedScript);

    const style = document.createElement('style');
    style.textContent = `
      [data-us-project] {
        position: relative !important;
        overflow: hidden !important;
      }
      [data-us-project] canvas {
        clip-path: inset(0 0 10% 0) !important;
      }
      [data-us-project] * {
        pointer-events: none !important;
      }
      [data-us-project] a[href*="unicorn"],
      [data-us-project] button[title*="unicorn"],
      [data-us-project] div[title*="Made with"],
      [data-us-project] .unicorn-brand,
      [data-us-project] [class*="brand"],
      [data-us-project] [class*="credit"],
      [data-us-project] [class*="watermark"] {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        position: absolute !important;
        left: -9999px !important;
        top: -9999px !important;
      }
    `;
    document.head.appendChild(style);

    const hideBranding = () => {
      const projectDiv = document.querySelector('[data-us-project]');
      if (projectDiv) {
        projectDiv.querySelectorAll('*').forEach(el => {
          const text = (el.textContent || '').toLowerCase();
          if (text.includes('made with') || text.includes('unicorn')) {
            el.remove();
          }
        });
      }
    };

    hideBranding();
    const interval = setInterval(hideBranding, 100);
    setTimeout(hideBranding, 1000);
    setTimeout(hideBranding, 3000);
    setTimeout(hideBranding, 5000);

    return () => {
      clearInterval(interval);
      document.head.removeChild(embedScript);
      document.head.removeChild(style);
    };
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0a1628]">
      {/* Animated background — hidden on mobile */}
      <div className="absolute inset-0 w-full h-full hidden lg:block">
        <div
          data-us-project="whwOGlfJ5Rz2rHaEUgHl"
          style={{ width: '100%', height: '100%', minHeight: '100vh' }}
        />
      </div>

      {/* Blue-tinted overlay to shift animation towards brand palette */}
      <div className="absolute inset-0 hidden lg:block bg-blue-900/30 mix-blend-multiply pointer-events-none z-[1]" />

      {/* Mobile stars background */}
      <div className="absolute inset-0 w-full h-full lg:hidden stars-bg" />

      {/* Top header */}
      <div className="absolute top-0 left-0 right-0 z-20 border-b border-blue-400/30">
        <div className="container mx-auto px-4 lg:px-8 py-3 lg:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 lg:gap-4">
            <div className="font-mono text-white text-xl lg:text-2xl font-bold tracking-widest italic transform -skew-x-12">
              BILLBOARD<span className="text-blue-400">IQ</span>
            </div>
            <div className="h-3 lg:h-4 w-px bg-blue-400/40" />
            <span className="text-blue-300/60 text-[8px] lg:text-[10px] font-mono">EST. 2025</span>
          </div>

          <div className="hidden lg:flex items-center gap-3 text-[10px] font-mono text-blue-300/60">
            <span>LAT: 6.7924°</span>
            <div className="w-1 h-1 bg-blue-400/40 rounded-full" />
            <span>LONG: 39.2083°</span>
          </div>
        </div>
      </div>

      {/* Corner frame accents */}
      <div className="absolute top-0 left-0 w-8 h-8 lg:w-12 lg:h-12 border-t-2 border-l-2 border-blue-400/40 z-20" />
      <div className="absolute top-0 right-0 w-8 h-8 lg:w-12 lg:h-12 border-t-2 border-r-2 border-blue-400/40 z-20" />
      <div className="absolute left-0 w-8 h-8 lg:w-12 lg:h-12 border-b-2 border-l-2 border-blue-400/40 z-20" style={{ bottom: '5vh' }} />
      <div className="absolute right-0 w-8 h-8 lg:w-12 lg:h-12 border-b-2 border-r-2 border-blue-400/40 z-20" style={{ bottom: '5vh' }} />

      {/* Hero content */}
      <div className="relative z-10 flex min-h-screen items-center pt-16 lg:pt-0" style={{ marginTop: '5vh' }}>
        <div className="container mx-auto px-6 lg:px-16 lg:ml-[10%]">
          <div className="max-w-lg relative">
            {/* Top decorative line */}
            <div className="flex items-center gap-2 mb-3 opacity-60">
              <div className="w-8 h-px bg-blue-400" />
              <span className="text-blue-300 text-[10px] font-mono tracking-wider">001</span>
              <div className="flex-1 h-px bg-blue-400/50" />
            </div>

            {/* Title */}
            <div className="relative">
              <div className="hidden lg:block absolute -left-3 top-0 bottom-0 w-1 dither-pattern opacity-40" />
              <h1 className="text-2xl lg:text-5xl font-bold text-white mb-3 lg:mb-4 leading-tight font-mono tracking-wider" style={{ letterSpacing: '0.1em' }}>
                BILLBOARD
                <span className="block text-blue-400 mt-1 lg:mt-2">
                  INTELLIGENCE
                </span>
              </h1>
            </div>

            {/* Dot row — desktop only */}
            <div className="hidden lg:flex gap-1 mb-3 opacity-40">
              {Array.from({ length: 40 }).map((_, i) => (
                <div key={i} className="w-0.5 h-0.5 bg-blue-300 rounded-full" />
              ))}
            </div>

            {/* Description */}
            <div className="relative">
              <p className="text-xs lg:text-base text-blue-100/70 mb-5 lg:mb-6 leading-relaxed font-mono">
                Real-time traffic signals converted to audience impressions — precise OOH pricing for every location.
              </p>
              <div className="hidden lg:block absolute -right-4 top-1/2 w-3 h-3 border border-blue-400 opacity-30" style={{ transform: 'translateY(-50%)' }}>
                <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-blue-400" style={{ transform: 'translate(-50%, -50%)' }} />
              </div>
            </div>

            {/* CTA buttons */}
            <div className="flex flex-col lg:flex-row gap-3 lg:gap-4">
              <Link
                href="/dashboard"
                className="relative px-5 lg:px-6 py-2 lg:py-2.5 bg-blue-600 text-white font-mono text-xs lg:text-sm border border-blue-400 hover:bg-blue-500 transition-all duration-200 group text-center"
              >
                <span className="hidden lg:block absolute -top-1 -left-1 w-2 h-2 border-t border-l border-blue-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="hidden lg:block absolute -bottom-1 -right-1 w-2 h-2 border-b border-r border-blue-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                ENTER DASHBOARD
              </Link>

              <Link
                href="/dashboard/analyze"
                className="relative px-5 lg:px-6 py-2 lg:py-2.5 bg-transparent border border-blue-400/60 text-blue-300 font-mono text-xs lg:text-sm hover:bg-blue-900/40 hover:border-blue-300 transition-all duration-200 text-center"
              >
                ANALYZE LOCATION
              </Link>
            </div>

            {/* Bottom notation — desktop only */}
            <div className="hidden lg:flex items-center gap-2 mt-6 opacity-40">
              <span className="text-blue-400 text-[9px] font-mono">∞</span>
              <div className="flex-1 h-px bg-blue-400" />
              <span className="text-blue-300 text-[9px] font-mono">DAR ES SALAAM</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom footer */}
      <div className="absolute left-0 right-0 z-20 border-t border-blue-400/20 bg-[#0a1628]/70 backdrop-blur-sm" style={{ bottom: '5vh' }}>
        <div className="container mx-auto px-4 lg:px-8 py-2 lg:py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 lg:gap-6 text-[8px] lg:text-[9px] font-mono text-blue-300/50">
            <span className="hidden lg:inline">SYSTEM.ACTIVE</span>
            <span className="lg:hidden">SYS.ACT</span>
            <div className="hidden lg:flex gap-1 items-end">
              {[12, 6, 14, 8, 16, 4, 10, 7].map((h, i) => (
                <div key={i} className="w-1 bg-blue-400/40" style={{ height: `${h}px` }} />
              ))}
            </div>
            <span>V1.0.0</span>
          </div>

          <div className="flex items-center gap-2 lg:gap-4 text-[8px] lg:text-[9px] font-mono text-blue-300/50">
            <span className="hidden lg:inline">◐ RENDERING</span>
            <div className="flex gap-1">
              <div className="w-1 h-1 bg-blue-400/80 rounded-full animate-pulse" />
              <div className="w-1 h-1 bg-blue-400/50 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
              <div className="w-1 h-1 bg-blue-400/20 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
            </div>
            <span className="hidden lg:inline">FRAME: ∞</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .dither-pattern {
          background-image:
            repeating-linear-gradient(0deg, transparent 0px, transparent 1px, #93c5fd 1px, #93c5fd 2px),
            repeating-linear-gradient(90deg, transparent 0px, transparent 1px, #93c5fd 1px, #93c5fd 2px);
          background-size: 3px 3px;
        }

        .stars-bg {
          background-image:
            radial-gradient(1px 1px at 20% 30%, #bfdbfe, transparent),
            radial-gradient(1px 1px at 60% 70%, #93c5fd, transparent),
            radial-gradient(1px 1px at 50% 50%, #bfdbfe, transparent),
            radial-gradient(1px 1px at 80% 10%, #60a5fa, transparent),
            radial-gradient(1px 1px at 90% 60%, #93c5fd, transparent),
            radial-gradient(1px 1px at 33% 80%, #bfdbfe, transparent),
            radial-gradient(1px 1px at 15% 60%, #60a5fa, transparent),
            radial-gradient(1px 1px at 70% 40%, #93c5fd, transparent);
          background-size: 200% 200%, 180% 180%, 250% 250%, 220% 220%, 190% 190%, 240% 240%, 210% 210%, 230% 230%;
          background-position: 0% 0%, 40% 40%, 60% 60%, 20% 20%, 80% 80%, 30% 30%, 70% 70%, 50% 50%;
          opacity: 0.35;
        }
      `}</style>
    </main>
  );
}
