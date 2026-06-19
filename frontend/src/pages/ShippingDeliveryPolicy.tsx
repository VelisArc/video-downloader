import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { siteConfig, siteUrl } from '../lib/site';

export default function ShippingDeliveryPolicy() {
  return (
    <div className="shell" style={{ maxWidth: 720, padding: '3rem 1rem 4rem' }}>
      <Helmet><title>Shipping & Delivery | {siteConfig.name}</title><meta name="description" content={`${siteConfig.name} shipping and delivery policy for digital services.`} /><link rel="canonical" href={siteUrl('/shipping-delivery')} /></Helmet>

      <div className="text-center mb-8">
        <span className="tag">Delivery</span>
        <h1 className="text-3xl font-bold mt-3" style={{ color: 'var(--ink-900)' }}>Shipping & Delivery Policy</h1>
        <p className="text-xs mt-2" style={{ color: 'var(--ink-500)' }}>Digital service delivery information.</p>
      </div>

      {[
        { title: 'Nature of Service', content: `${siteConfig.name} is a digital service that provides video and audio extraction. We do not ship physical products. All transactions are for digital access.` },
        { title: 'Digital Delivery', content: 'Service access is granted immediately upon successful payment. No physical items are shipped. Monthly subscriptions provide access for the duration of the billing period.' },
        { title: 'Delivery Time', content: 'Download processing typically takes 5-30 seconds depending on the source platform and file size. This is not a shipping time but the time required for our servers to extract the media stream.' },
        { title: 'File Formats', content: 'Downloads are provided in MP4 (video) or MP3/M4A (audio) formats, depending on the source and your selection. We use the highest quality stream available from the source.' },
      ].map(s => (
        <div key={s.title} className="mb-6">
          <h2 className="text-sm font-bold mb-2" style={{ color: 'var(--ink-900)' }}>{s.title}</h2>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--ink-600)' }}>{s.content}</p>
        </div>
      ))}

      <div className="mt-6 flex gap-3">
        <Link to="/refund-policy" className="btn-outline text-xs">Refund Policy</Link>
        <Link to="/contact-us" className="btn-ghost text-xs">Contact</Link>
      </div>
    </div>
  );
}