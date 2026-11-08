import { Helmet } from 'react-helmet-async';
import { Scale, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { siteConfig, siteUrl } from '../lib/site';

export default function DMCA() {
  const noticeItems = [
    'Identification of the copyrighted work claimed to have been infringed',
    'Identification of the material that is claimed to be infringing',
    'Your contact information (email, address, phone number)',
    'A statement that you have a good faith belief the use is not authorized',
    'A statement that the information in the notice is accurate, under penalty of perjury',
    'Your physical or electronic signature',
  ];

  return (
    <div className="shell pt-10 pb-20 sm:pt-14">
      <Helmet><title>DMCA | {siteConfig.name}</title><meta name="description" content={`${siteConfig.name} DMCA copyright policy.`} /><meta property="og:title" content={`DMCA - ${siteConfig.name}`} /><link rel="canonical" href={siteUrl('/dmca')} /></Helmet>

      <header className="mx-auto max-w-3xl">
        <span className="eyebrow"><Scale className="h-3.5 w-3.5" aria-hidden="true" /> DMCA</span>
        <h1 className="mt-4 text-4xl font-extrabold leading-[1.05] sm:text-5xl" style={{ color: 'var(--ink-900)' }}>DMCA / Copyright Policy</h1>
      </header>

      <main
        className="mx-auto mt-8 max-w-3xl break-words rounded-2xl border p-5 sm:p-8 lg:p-10"
        style={{ borderColor: 'var(--border)', background: 'var(--surface)', boxShadow: 'var(--shadow-md)' }}
      >
        <p className="text-sm leading-7" style={{ color: 'var(--ink-600)' }}>
          We respect intellectual property rights and comply with the Digital Millennium Copyright Act. If you believe content on our service infringes your copyright, please contact our designated agent.
        </p>

        <section className="mt-8 border-t pt-6" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-start gap-3">
            <span aria-hidden="true" className="mt-1.5 h-6 w-0.5 shrink-0 rounded-full" style={{ background: 'var(--grad-brand)' }} />
            <div className="min-w-0">
              <h2 className="text-base font-bold sm:text-lg" style={{ color: 'var(--ink-900)' }}>Reporting Infringement</h2>
              <p className="mt-2 text-sm leading-7" style={{ color: 'var(--ink-600)' }}>To file a DMCA notice, please include the following information:</p>
              <ol className="mt-4 space-y-3 text-sm leading-7" style={{ color: 'var(--ink-600)' }}>
                {noticeItems.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="mono mt-0.5 shrink-0 text-xs font-semibold" style={{ color: 'var(--brand-600)' }}>{String(i + 1).padStart(2, '0')}</span>
                    <span className="min-w-0">{item}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <section className="mt-8 border-t pt-6" style={{ borderColor: 'var(--border)' }}>
          <div
            className="rounded-2xl border p-4 sm:p-5"
            style={{ borderColor: 'color-mix(in srgb, var(--brand-500) 30%, var(--border))', background: 'var(--grad-brand-soft)' }}
          >
            <div className="flex items-center gap-3">
              <span className="icon-tile"><FileText className="h-5 w-5" aria-hidden="true" /></span>
              <h2 className="text-base font-bold sm:text-lg" style={{ color: 'var(--ink-900)' }}>Designated Copyright Agent</h2>
            </div>
            <p className="mt-3 text-sm leading-7" style={{ color: 'var(--ink-700)' }}>Email: <a href={siteConfig.supportMailto} className="font-semibold underline underline-offset-4 break-all" style={{ color: 'var(--brand-700)' }}>{siteConfig.supportEmail}</a></p>
            <p className="mt-2 text-sm leading-7" style={{ color: 'var(--ink-600)' }}>We respond to all valid DMCA notices promptly.</p>
          </div>
        </section>
      </main>

      <div className="mx-auto mt-6 flex max-w-3xl flex-wrap items-center gap-3">
        <Link to="/terms-of-service" className="btn-outline min-h-11 text-xs">Terms of Service</Link>
        <Link to="/privacy-policy" className="btn-ghost min-h-11 text-xs" style={{ color: 'var(--brand-700)' }}>Privacy Policy</Link>
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
