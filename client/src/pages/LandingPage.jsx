/*
 * LandingPage
 * -----------
 * Design decisions:
 * - Whitespace-first: the hero holds a single focused thought; every margin/gap
 *   is deliberate so the eye follows eyebrow → headline → sub → CTA with no friction.
 * - One primary action. The green CTA ("Get started") is the only saturated element
 *   above the fold — anything else drawing attention would dilute it.
 * - Two font weights (400 + 600). Hierarchy comes from size, not from weight
 *   soup. Muted gray (#6b7280) carries secondary copy so the headline stays the loudest voice.
 * - Forest green + mint palette. No gradients, no shadows, no faux-3D. Cards on
 *   a subtly darker surface (#f9fafb) to separate them from the hero without borders.
 * - Inline SVGs only — no image requests, no broken placeholders, no layout shift.
 * - Mobile: hero stays centered, features stack, stat pills wrap. The single-column
 *   reading order is identical to the desktop visual order.
 */

import { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function LeafLogo({ className = 'h-6 w-6' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <path
        d="M20 4C14 4 8 6 5 11c-2 3.3-1.5 7.3 1 9.5C8 15 12.5 12.5 18 12c-4 1.5-7.5 4-10 8 3 1 6.5.5 9-1.5C20.5 16 22 10 20 4Z"
        fill="currentColor"
      />
    </svg>
  );
}

function Icon({ path, className = 'h-7 w-7 text-forest-600' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      {path}
    </svg>
  );
}

const ICON_GRID = (
  <>
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
  </>
);

const ICON_USERS = (
  <>
    <circle cx="9" cy="8" r="3.25" />
    <path d="M3.5 20c.5-3 2.8-4.75 5.5-4.75S14 17 14.5 20" />
    <circle cx="17" cy="9.5" r="2.5" />
    <path d="M15 20c.3-2 1.8-3.25 4-3.25s2.8 1.25 3 3.25" />
  </>
);

const ICON_PULSE = (
  <>
    <path d="M3 12h4l2.5-6 4 12 2-6H21" />
  </>
);

export default function LandingPage() {
  const navigate = useNavigate();
  const featuresRef = useRef(null);

  useEffect(() => {
    const prev = document.title;
    document.title = 'SmartSeason — Field Monitoring System';
    return () => { document.title = prev; };
  }, []);

  const scrollToFeatures = (e) => {
    e.preventDefault();
    featuresRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen scroll-smooth bg-white text-slate-900">
      {/* NAVBAR */}
      <header className="sticky top-0 z-30 bg-forest-600">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2 text-white">
            <LeafLogo className="h-6 w-6 text-forest-50" />
            <span className="text-base font-semibold tracking-tight">SmartSeason</span>
          </Link>
          <Link
            to="/login"
            className="rounded-md bg-white px-4 py-1.5 text-sm font-semibold text-forest-600 hover:bg-forest-50"
          >
            Sign in
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section className="flex min-h-[calc(100vh-56px)] items-center">
        <div className="mx-auto w-full max-w-3xl px-6 py-20 text-center">
          <span className="inline-flex items-center rounded-full bg-forest-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-forest-800">
            Field monitoring, simplified
          </span>

          <h1 className="mt-6 text-4xl font-semibold leading-tight tracking-tight text-[#1a1a1a] sm:text-5xl md:text-[48px] md:leading-[1.1]">
            Know exactly where every field stands, always
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-[17px] leading-relaxed text-[#6b7280] sm:text-[18px]">
            Track crop stages, assign field agents, and stay on top of every update — all in one place.
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-x-6 gap-y-4">
            <button
              onClick={() => navigate('/login')}
              className="rounded-lg bg-forest-600 px-8 py-3.5 text-base font-semibold text-white hover:bg-forest-800"
            >
              Get started →
            </button>
            <a
              href="#features"
              onClick={scrollToFeatures}
              className="text-sm font-semibold text-forest-600 hover:text-forest-800"
            >
              Learn more
            </a>
          </div>

          <ul className="mt-14 flex flex-wrap items-center justify-center gap-x-2 gap-y-2 text-sm text-slate-500">
            <li className="rounded-full border border-slate-200 px-3 py-1">12 crop types</li>
            <li aria-hidden="true" className="hidden sm:inline">·</li>
            <li className="rounded-full border border-slate-200 px-3 py-1">Real-time updates</li>
            <li aria-hidden="true" className="hidden sm:inline">·</li>
            <li className="rounded-full border border-slate-200 px-3 py-1">Role-based access</li>
          </ul>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" ref={featuresRef} className="bg-white py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-[#1a1a1a] sm:text-[36px]">
              Everything your team needs
            </h2>
            <p className="mt-3 text-base text-[#6b7280]">
              Purpose-built for coordinators and agents working the same season from different places.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-3">
            <div className="rounded-xl bg-[#f9fafb] p-8">
              <div className="inline-flex items-center justify-center rounded-lg bg-forest-50 p-3">
                <Icon path={ICON_GRID} />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-[#1a1a1a]">Multi-field overview</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-[#6b7280]">
                See every plot, crop, and stage at a glance. Filter by status to find what needs attention today.
              </p>
            </div>

            <div className="rounded-xl bg-[#f9fafb] p-8">
              <div className="inline-flex items-center justify-center rounded-lg bg-forest-50 p-3">
                <Icon path={ICON_USERS} />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-[#1a1a1a]">Agent assignment</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-[#6b7280]">
                Match each field to the right agent. Role-based access keeps everyone focused on their own work.
              </p>
            </div>

            <div className="rounded-xl bg-[#f9fafb] p-8">
              <div className="inline-flex items-center justify-center rounded-lg bg-forest-50 p-3">
                <Icon path={ICON_PULSE} />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-[#1a1a1a]">Live stage tracking</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-[#6b7280]">
                Planted, growing, ready, harvested — every update logs automatically into an audit-friendly trail.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="bg-forest-600">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-6 py-20 text-center md:flex-row md:justify-between md:text-left">
          <p className="text-2xl font-semibold tracking-tight text-white sm:text-[28px]">
            Ready to take control of your growing season?
          </p>
          <Link
            to="/login"
            className="rounded-lg bg-white px-6 py-3 text-base font-semibold text-forest-600 hover:bg-forest-50"
          >
            Sign in to your account →
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-200">
        <div className="mx-auto flex h-10 max-w-6xl items-center justify-between px-6 text-xs text-slate-500">
          <span>© 2026 SmartSeason</span>
          <span>Built for field coordinators</span>
        </div>
      </footer>
    </div>
  );
}
