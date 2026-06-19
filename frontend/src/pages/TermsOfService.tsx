import { Helmet } from 'react-helmet-async';
import { AlertTriangle, CheckCircle2, Scale, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { siteConfig, siteUrl } from '../lib/site';

export default function TermsOfService() {
  return (
    <div className="section-shell max-w-5xl py-8">
      <Helmet>
        <title>Terms of Service | {siteConfig.name}</title>
        <meta
          name="description"
          content="Read the SwiftDL terms covering supported use, user responsibility, copyright, and service limitations."
        />
        <link rel="canonical" href={siteUrl('/terms-of-service')} />
      </Helmet>

      <div className="mx-auto max-w-3xl text-center">
        <div className="mx-auto inline-flex rounded-[28px] bg-[var(--surface-soft)] p-4 text-[var(--brand-600)]">
          <Scale className="h-7 w-7" />
        </div>
        <h1 className="mt-5 text-3xl font-black text-[var(--ink-900)] md:text-4xl">
          Terms of Service
        </h1>
        <p className="mt-4 text-base leading-8 text-[var(--ink-600)]">
          These terms explain what SwiftDL is for, what users are responsible
          for, and where the service boundaries are.
        </p>
      </div>

      <div className="mt-8 rounded-2xl border border-yellow-200 bg-yellow-50 p-4 text-sm leading-7 text-yellow-900">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-1 h-5 w-5 flex-none" />
          <p>
            By using SwiftDL, you agree to these terms. If you do not agree with
            them, do not use the service.
          </p>
        </div>
      </div>

      <div className="mt-8 space-y-6 text-sm text-[var(--ink-600)]">
        <section className="feature-card">
          <h2 className="text-xl font-black text-[var(--ink-900)]">
            1. Service description
          </h2>
          <p className="mt-4 leading-7">
            SwiftDL is a browser-based tool for supported media workflows across
            many yt-dlp-compatible platforms. It may include public-link
            downloads, audio extraction, account-based features, and optional
            session-based downloads through Cookies Mode.
          </p>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <article className="feature-card">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-[var(--brand-600)]" />
              <h2 className="text-xl font-black text-[var(--ink-900)]">
                Permitted use
              </h2>
            </div>
            <ul className="mt-4 list-disc pl-5 leading-7">
              <li>Downloading media you own or are clearly authorized to use</li>
              <li>Personal offline viewing and internal reference workflows</li>
              <li>Authorized session-based downloads through your own current cookies.txt export</li>
              <li>Fair-use or research scenarios where applicable law allows it</li>
            </ul>
          </article>

          <article className="feature-card">
            <div className="flex items-center gap-3">
              <XCircle className="h-5 w-5 text-[var(--brand-600)]" />
              <h2 className="text-xl font-black text-[var(--ink-900)]">
                Prohibited use
              </h2>
            </div>
            <ul className="mt-4 list-disc pl-5 leading-7">
              <li>Downloading or redistributing copyrighted content without permission</li>
              <li>Using SwiftDL to bypass access you do not already have</li>
              <li>Automated scraping, abuse, or attempts to degrade the service</li>
              <li>Illegal, deceptive, or impersonation-related use</li>
            </ul>
          </article>
        </section>

        <section className="feature-card">
          <h2 className="text-xl font-black text-[var(--ink-900)]">
            3. User responsibility
          </h2>
          <div className="mt-4 space-y-4 leading-7">
            <p>
              You are responsible for ensuring that your use of downloaded media
              complies with copyright law, platform rules, privacy rights, and
              any permission requirements tied to the original content.
            </p>
            <p>
              If you use Cookies Mode, you must only submit your own current
              session data for content you are already authorized to access.
            </p>
          </div>
        </section>

        <section className="feature-card">
          <h2 className="text-xl font-black text-[var(--ink-900)]">
            4. Availability and limitations
          </h2>
          <div className="mt-4 space-y-4 leading-7">
            <p>
              SwiftDL is provided on an as-is and as-available basis. Platform
              changes, deleted posts, rate limits, and regional restrictions can
              cause downloads to fail even when a user enters a valid-looking
              link.
            </p>
            <p>
              We may modify, pause, or discontinue features at any time,
              especially when third-party platform behavior changes.
            </p>
          </div>
        </section>

        <section className="feature-card">
          <h2 className="text-xl font-black text-[var(--ink-900)]">
            5. Copyright and notices
          </h2>
          <p className="mt-4 leading-7">
            SwiftDL respects copyright and responds to valid takedown notices.
            If you believe your rights have been violated, use the{' '}
            <Link to="/dmca" className="text-[var(--brand-700)] hover:underline">
              DMCA page
            </Link>{' '}
            or contact support.
          </p>
        </section>
      </div>
    </div>
  );
}
