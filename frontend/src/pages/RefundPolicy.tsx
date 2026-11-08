import { Helmet } from 'react-helmet-async';
import { Receipt } from 'lucide-react';
import { Link } from 'react-router-dom';
import { siteConfig, siteUrl } from '../lib/site';

export default function RefundPolicy() {
  const sections = [
    { title: 'Service overview', content: `${siteConfig.name} provides digital services including video and audio extraction. Due to the instant, digital nature of our service, all purchases are considered final upon completion.` },
    { title: 'No refund applicable', content: 'We do not offer refunds for digital subscription purchases. Once a payment is processed and access is granted, the transaction is complete. This policy exists because there is no way to "return" a digital service after it has been delivered.' },
    { title: 'Service availability', content: 'If our service experiences extended downtime (more than 48 consecutive hours) due to a server-side issue, we may offer a service extension at our discretion. Contact support with details of the issue.' },
    { title: 'Cancellation', content: 'Monthly subscriptions can be cancelled at any time. Cancellation takes effect at the end of the current billing period. You will retain access until the period ends. Lifetime plans are one-time payments and cannot be cancelled.' },
  ];

  return (
    <div className="shell pt-10 pb-20 sm:pt-14">
      <Helmet><title>Refund Policy | {siteConfig.name}</title><meta name="description" content={`${siteConfig.name} refund and cancellation policy.`} /><link rel="canonical" href={siteUrl('/refund-policy')} /></Helmet>

      <header className="mx-auto max-w-3xl">
        <span className="eyebrow"><Receipt className="h-3.5 w-3.5" aria-hidden="true" /> Refund</span>
        <h1 className="mt-4 text-4xl font-extrabold leading-[1.05] sm:text-5xl" style={{ color: 'var(--ink-900)' }}>Refund &amp; Cancellation Policy</h1>
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
        <a href={siteConfig.supportMailto} className="btn-primary min-h-11 text-xs">Contact support</a>
        <Link to="/pricing" className="btn-outline min-h-11 text-xs">View pricing</Link>
      </div>
    </div>
  );
}
