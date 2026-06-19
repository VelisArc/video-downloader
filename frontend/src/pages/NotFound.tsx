import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Home } from 'lucide-react';
import { siteConfig, siteUrl } from '../lib/site';

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-4 py-16 text-center">
      <Helmet>
        <title>Page Not Found | {siteConfig.name}</title>
        <meta
          name="description"
          content="The page you are looking for does not exist or may have moved."
        />
        <link rel="canonical" href={siteUrl('/404')} />
      </Helmet>

      <span className="mb-5 inline-flex rounded-full border border-[var(--border-strong)] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand-700)] shadow-sm">
        404
      </span>
      <h1 className="max-w-2xl text-4xl font-black tracking-tight text-[var(--ink-900)] md:text-5xl">
        This page is not available.
      </h1>
      <p className="mt-4 max-w-xl text-base leading-7 text-[var(--ink-600)]">
        The link may be outdated, the route may have changed, or the page may
        not exist on this deployment.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-full bg-[var(--brand-600)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--brand-700)]"
        >
          <Home className="h-4 w-4" />
          Go Home
        </Link>
        <button
          type="button"
          onClick={() => window.history.back()}
          className="inline-flex items-center gap-2 rounded-full border border-[var(--border-strong)] bg-white px-5 py-3 text-sm font-semibold text-[var(--ink-700)] transition hover:border-[var(--brand-300)] hover:text-[var(--brand-700)]"
        >
          <ArrowLeft className="h-4 w-4" />
          Go Back
        </button>
      </div>
    </main>
  );
}
