import { Helmet } from 'react-helmet-async';
import { ScrollText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { siteConfig, siteUrl } from '../lib/site';

export default function TermsOfService() {
  const sections = [
    { title: 'Service description', content: `${siteConfig.name} is a browser-based tool that extracts publicly accessible video and audio streams from supported platforms. The service relies on yt-dlp and platform APIs, which may change without notice.` },
    { title: 'Permitted use', content: 'You may use ShareHub to download content you already have legal access to view. You must comply with the terms of service of the source platform.' },
    { title: 'Prohibited use', content: 'You may not use ShareHub to bypass paywalls, DRM, or access private content. You may not use the service for copyright infringement or any illegal activity.' },
    { title: 'User responsibility', content: 'You are responsible for how you use downloaded content. Respect copyright laws and platform terms. We do not condone piracy.' },
    { title: 'Availability and limitations', content: 'The service is provided "as is" without warranties. We may change or discontinue features at any time. We do not guarantee that every link will work.' },
  ];

  return (
    <div className="shell pt-10 pb-20 sm:pt-14">
      <Helmet><title>Terms of Service | {siteConfig.name}</title><meta name="description" content={`${siteConfig.name} terms of service.`} /><link rel="canonical" href={siteUrl('/terms-of-service')} /></Helmet>

      <header className="mx-auto max-w-3xl">
        <span className="eyebrow"><ScrollText className="h-3.5 w-3.5" aria-hidden="true" /> Terms</span>
        <h1 className="mt-4 text-4xl font-extrabold leading-[1.05] sm:text-5xl" style={{ color: 'var(--ink-900)' }}>Terms of Service</h1>
        <p className="mono mt-4 text-[11px] uppercase" style={{ color: 'var(--ink-500)', letterSpacing: '0.12em' }}>By using {siteConfig.name}, you agree to these terms.</p>
      </header>

      <main
        className="mx-auto mt-8 max-w-3xl break-words rounded-2xl border p-5 sm:p-8 lg:p-10"
        style={{ borderColor: 'var(--border)', background: 'var(--surface)', boxShadow: 'var(--shadow-md)' }}
      >
        {sections.map((s, i) => (
          <section
            key={s.title}
            className={`pt-6 ${i > 0 ? 'mt-6 border-t' : ''}`}
            style={{ borderColor: 'var(--border)' }}
          >
            <div className="flex items-start gap-3">
              <span aria-hidden="true" className="mt-1.5 h-6 w-0.5 shrink-0 rounded-full" style={{ background: 'var(--grad-brand)' }} />
              <div className="min-w-0">
                <h2 className="text-base font-bold sm:text-lg" style={{ color: 'var(--ink-900)' }}>{s.title}</h2>
                <p className="mt-2 text-sm leading-7" style={{ color: 'var(--ink-600)' }}>{s.content}</p>
              </div>
            </div>
          </section>
        ))}
      </main>

      <div className="mx-auto mt-6 flex max-w-3xl flex-wrap items-center gap-3">
        <Link to="/privacy-policy" className="btn-outline min-h-11 text-xs">Privacy Policy</Link>
      </div>

      <div
        className="mx-auto mt-4 flex max-w-3xl flex-col gap-3 rounded-2xl border border-dashed p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"
        style={{ borderColor: 'var(--border-med)' }}
      >
        <p className="text-sm leading-6" style={{ color: 'var(--ink-600)' }}><span className="font-semibold" style={{ color: 'var(--ink-900)' }}>Questions?</span> Contact support and we&apos;ll help.</p>
        <Link to="/contact-us" className="btn-outline min-h-10 shrink-0 rounded-full px-4 text-xs">Contact support</Link>
      </div>
    </div>
  );
}
