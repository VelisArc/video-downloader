import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ArrowRight, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="relative flex min-h-[78vh] items-center justify-center overflow-hidden sm:min-h-[84vh]" style={{ background: 'var(--canvas)', isolation: 'isolate' }}>
      <Helmet><title>Page Not Found | ShareHub</title><meta name="robots" content="noindex, nofollow" /></Helmet>

      {/* Subtle backdrop ---------------------------------------------------- */}
      <span className="dot-grid pointer-events-none absolute inset-0" aria-hidden />
      <span
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(62% 55% at 50% 45%, transparent 0%, var(--canvas) 82%)' }}
        aria-hidden
      />
      <span
        className="aurora-orb aurora-orb--two pointer-events-none"
        style={{ opacity: 0.28 }}
        aria-hidden
      />
      <span
        className="aurora-orb aurora-orb--three pointer-events-none"
        style={{ opacity: 0.22 }}
        aria-hidden
      />

      {/* Content -------------------------------------------------------------- */}
      <div className="shell relative mx-auto max-w-xl px-4 py-16 text-center sm:px-6 sm:py-20">
        <span className="eyebrow mono">Error · Off the map</span>

        <p
          className="gradient-text select-none font-extrabold leading-[0.95]"
          style={{ fontFamily: "'Sora', 'Inter', system-ui, sans-serif", fontSize: 'clamp(6.5rem, 32vw, 11rem)', letterSpacing: '-0.05em' }}
          aria-hidden
        >
          404
        </p>

        <h1 className="mt-4 text-2xl font-extrabold sm:text-4xl" style={{ color: 'var(--ink-900)' }}>
          This page is not available
        </h1>
        <p className="mx-auto mt-3 max-w-md text-[15px] leading-7 sm:text-base" style={{ color: 'var(--ink-600)' }}>
          The page you are looking for does not exist or has been moved.
        </p>

        <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
          <Link to="/" className="btn-primary min-h-11 w-full px-6 text-sm sm:w-auto">
            <Home className="h-4 w-4" aria-hidden /> Go home
          </Link>
          <Link to="/faq" className="btn-outline min-h-11 w-full px-6 text-sm sm:w-auto">
            Visit FAQ <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </div>
    </div>
  );
}
