import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { siteConfig, siteUrl } from '../lib/site';

export default function RefundPolicy() {
  return (
    <div className="shell" style={{ maxWidth: 720, padding: '3rem 1rem 4rem' }}>
      <Helmet><title>Refund Policy | {siteConfig.name}</title><meta name="description" content={`${siteConfig.name} refund and cancellation policy.`} /><link rel="canonical" href={siteUrl('/refund-policy')} /></Helmet>

      <div className="text-center mb-8">
        <span className="tag">Refund</span>
        <h1 className="text-3xl font-bold mt-3" style={{ color: 'var(--ink-900)' }}>Refund & Cancellation Policy</h1>
      </div>

      {[
        { title: 'Service overview', content: `${siteConfig.name} provides digital services including video and audio extraction. Due to the instant, digital nature of our service, all purchases are considered final upon completion.` },
        { title: 'No refund applicable', content: 'We do not offer refunds for digital subscription purchases. Once a payment is processed and access is granted, the transaction is complete. This policy exists because there is no way to "return" a digital service after it has been delivered.' },
        { title: 'Service availability', content: 'If our service experiences extended downtime (more than 48 consecutive hours) due to a server-side issue, we may offer a service extension at our discretion. Contact support with details of the issue.' },
        { title: 'Cancellation', content: 'Monthly subscriptions can be cancelled at any time. Cancellation takes effect at the end of the current billing period. You will retain access until the period ends. Lifetime plans are one-time payments and cannot be cancelled.' },
      ].map(s => (
        <div key={s.title} className="mb-6">
          <h2 className="text-sm font-bold mb-2" style={{ color: 'var(--ink-900)' }}>{s.title}</h2>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--ink-600)' }}>{s.content}</p>
        </div>
      ))}

      <div className="mt-6 flex gap-3">
        <a href={siteConfig.supportMailto} className="btn-primary text-xs">Contact support</a>
        <Link to="/pricing" className="btn-outline text-xs">View pricing</Link>
      </div>
    </div>
  );
}