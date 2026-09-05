import type { Metadata } from 'next'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'Down for Maintenance — LLDCanvas',
  description: 'LLDCanvas is temporarily down for scheduled maintenance. We will be back shortly.',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-static'

export default function MaintenancePage() {
  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .a1 { animation: fadeUp 0.5s 0.05s ease both; }
        .a2 { animation: fadeUp 0.5s 0.15s ease both; }
        .a3 { animation: fadeUp 0.5s 0.25s ease both; }
        .a4 { animation: fadeUp 0.5s 0.35s ease both; }
        .a5 { animation: fadeUp 0.5s 0.45s ease both; }
        .ai { animation: fadeIn 0.8s 0.3s ease both; }
      `}</style>

      <div className="flex h-screen overflow-hidden flex-col lg:flex-row">

        {/* ════════════════════════════════════════════════════════════════
            LEFT — content panel
        ════════════════════════════════════════════════════════════════ */}
        <div className="relative flex flex-1 flex-col bg-white px-10 py-10 lg:max-w-[52%] lg:px-14 lg:py-12">

          {/* Logo + rule */}
          <div className="a1 shrink-0">
            <Image
              src="/LLDCanvas_Logo.png"
              alt="LLDCanvas"
              width={180}
              height={56}
              priority
              className="h-auto w-[140px] sm:w-[155px]"
            />
            <div className="mt-7 h-px bg-gray-100" />
          </div>

          {/* Main content — vertically centred */}
          <div className="flex flex-1 flex-col justify-center py-6">

            {/* Status badge */}
            <div className="a2 mb-6 inline-flex w-fit items-center gap-2.5 rounded-full border border-amber-100 bg-amber-50 px-3.5 py-1.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-amber-500" />
              </span>
              <span className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-amber-700">
                Scheduled maintenance
              </span>
            </div>

            {/* Headline */}
            <h1 className="a3 mb-4 text-[46px] font-bold leading-[1.07] tracking-[-0.026em] text-gray-950 sm:text-[50px] lg:text-[54px]">
              We&rsquo;re making<br />LLDCanvas better.
            </h1>

            {/* Description */}
            <p className="a4 mb-7 max-w-[400px] text-[14.5px] leading-[1.8] text-gray-500">
              Our team is rolling out performance improvements and new features.
              The site will be back online soon — we appreciate your patience.
            </p>

            {/* Divider */}
            <div className="a4 mb-7 h-px bg-gray-100" />

            {/* CTA — centred */}
            <div className="a5 flex justify-center">
              <a
                href="mailto:support.lldcanvas@gmail.com"
                className="inline-flex items-center gap-2 rounded-full bg-gray-950 px-7 py-3.5 text-[13px] font-medium text-white transition hover:bg-gray-800"
              >
                <svg viewBox="0 0 24 24" className="h-[14px] w-[14px]" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <rect x="2" y="4" width="20" height="16" rx="2"/>
                  <path d="m22 7-10 6L2 7"/>
                </svg>
                Contact Support
              </a>
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════════
            RIGHT — illustration panel
        ════════════════════════════════════════════════════════════════ */}
        <div
          className="ai relative hidden flex-1 items-center justify-center overflow-hidden lg:flex"
          style={{
            background: 'linear-gradient(145deg, #eef2ff 0%, #f5f3ff 40%, #ede9fe 100%)',
          }}
        >
          {/* Decorative grid */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage: 'radial-gradient(circle, #c7d2fe 1px, transparent 1px)',
              backgroundSize: '32px 32px',
              opacity: 0.5,
            }}
          />

          {/* Glow orbs */}
          <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-violet-300/30 blur-[80px]" />
            <div className="absolute -bottom-20 left-10 h-64 w-64 rounded-full bg-indigo-300/30 blur-[80px]" />
          </div>

          {/* SVG illustration */}
          <div className="relative z-10 w-full max-w-[440px] px-10">
            <Image
              src="/maintenance.svg"
              alt="Maintenance in progress illustration"
              width={520}
              height={402}
              priority
              className="h-auto w-full max-w-[480px]"
            />
          </div>

          {/* Floating label bottom */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white/80 px-5 py-2 shadow-sm backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-500" />
              </span>
              <span className="font-mono text-[11px] font-medium text-indigo-700">
                Engineers actively working on a fix
              </span>
            </div>
          </div>
        </div>

      </div>
    </>
  )
}
