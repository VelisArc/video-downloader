import { Helmet } from 'react-helmet-async';
import { Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { siteConfig, siteUrl } from '../lib/site';

export default function PrivacyPolicy() {
  const sections = [
    { title: 'Information we collect', content: 'We collect your email address and display name if you sign in with Google. We use Firebase Authentication and Firestore for this. We do not collect your downloaded content, IP addresses are logged temporarily for rate limiting and server operations.' },
    { title: 'How we use information', content: 'Your email is used to identify your account and manage your subscription plan. We do not share your data with third parties except Firebase (Google) for authentication and Razorpay for payment processing.' },
    { title: 'Cookies and local storage', content: 'We use localStorage to save your theme preference and download history (stored only on your device). We use Firebase auth tokens for session management. We do not use tracking cookies.' },
    { title: 'Retention and security', content: 'Account data is retained until you delete your account. Download history is stored locally in your browser and never sent to our servers. We use HTTPS encryption for all data transmission.' },
    { title: 'Contact', content: `For privacy questions, email ${siteConfig.supportEmail}. We respond during business hours.` },
  ];

  return (
    <div className="shell pt-10 pb-20 sm:pt-14">
      <Helmet><title>Privacy Policy | {siteConfig.name}</title><meta name="description" content={`${siteConfig.name} privacy policy.`} /><link rel="canonical" href={siteUrl('/privacy-policy')} /></Helmet>

      <header className="mx-auto max-w-3xl">
        <span className="eyebrow"><Shield className="h-3.5 w-3.5" aria-hidden="true" /> Privacy</span>
        <h1 className="mt-4 text-4xl font-extrabold leading-[1.05] sm:text-5xl" style={{ color: 'var(--ink-900)' }}>Privacy Policy</h1>
        <p className="mono mt-4 text-[11px] uppercase" style={{ color: 'var(--ink-500)', letterSpacing: '0.12em' }}>Last updated: January 2024</p>
      </header>

      <main
        className="mx-auto mt-8 max-w-3xl break-words rounded-2xl border p-5 sm:p-8 lg:p-10"
        style={{ borderColor: 'var(--border)', background: 'var(--surface)', boxShadow: 'var(--shadow-md)' }}
      >
        <div
          className="rounded-2xl border p-4 sm:p-5"
          style={{ borderColor: 'color-mix(in srgb, var(--brand-500) 30%, var(--border))', background: 'var(--grad-brand-soft)' }}
        >
          <div className="flex items-center gap-3">
            <span className="icon-tile"><Shield className="h-5 w-5" aria-hidden="true" /></span>
            <span className="text-sm font-bold" style={{ color: 'var(--ink-900)' }}>Quick summary</span>
          </div>
          <p className="mt-3 text-sm leading-7" style={{ color: 'var(--ink-700)' }}>We collect minimal data to operate the service. Your downloads are not logged or stored on our servers. Session history stays in your browser.</p>
        </div>

        <div className="mt-8">
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
        </div>
      </main>

      <div className="mx-auto mt-6 flex max-w-3xl flex-wrap items-center gap-3">
        <Link to="/terms-of-service" className="btn-outline min-h-11 text-xs">Terms of Service</Link>
        <Link to="/dmca" className="btn-ghost min-h-11 text-xs" style={{ color: 'var(--brand-700)' }}>DMCA</Link>
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
