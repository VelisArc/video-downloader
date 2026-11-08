import { Helmet } from 'react-helmet-async';
import { Truck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { siteConfig, siteUrl } from '../lib/site';

export default function ShippingDeliveryPolicy() {
  const sections = [
    { title: 'Nature of Service', content: `${siteConfig.name} is a digital service that provides video and audio extraction. We do not ship physical products. All transactions are for digital access.` },
    { title: 'Digital Delivery', content: 'Service access is granted immediately upon successful payment. No physical items are shipped. Monthly subscriptions provide access for the duration of the billing period.' },
    { title: 'Delivery Time', content: 'Download processing typically takes 5-30 seconds depending on the source platform and file size. This is not a shipping time but the time required for our servers to extract the media stream.' },
    { title: 'File Formats', content: 'Downloads are provided in MP4 (video) or MP3/M4A (audio) formats, depending on the source and your selection. We use the highest quality stream available from the source.' },
  ];

  return (
    <div className="shell pt-10 pb-20 sm:pt-14">
      <Helmet><title>Shipping & Delivery | {siteConfig.name}</title><meta name="description" content={`${siteConfig.name} shipping and delivery policy for digital services.`} /><link rel="canonical" href={siteUrl('/shipping-delivery')} /></Helmet>

      <header className="mx-auto max-w-3xl">
        <span className="eyebrow"><Truck className="h-3.5 w-3.5" aria-hidden="true" /> Delivery</span>
        <h1 className="mt-4 text-4xl font-extrabold leading-[1.05] sm:text-5xl" style={{ color: 'var(--ink-900)' }}>Shipping &amp; Delivery Policy</h1>
        <p className="mono mt-4 text-[11px] uppercase" style={{ color: 'var(--ink-500)', letterSpacing: '0.12em' }}>Digital service delivery information.</p>
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
        <Link to="/refund-policy" className="btn-outline min-h-11 text-xs">Refund Policy</Link>
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
