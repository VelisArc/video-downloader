import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { siteConfig, siteUrl } from '../lib/site';

export default function ContactUs() {
  return (
    <div className="shell" style={{ maxWidth: 600, padding: '3rem 1rem 4rem' }}>
      <Helmet><title>Contact Us | {siteConfig.name}</title><meta name="description" content="Get in touch with the SwiftDL team." /><link rel="canonical" href={siteUrl('/contact-us')} /></Helmet>

      <div className="text-center mb-8">
        <span className="tag">Contact</span>
        <h1 className="text-3xl font-bold mt-3" style={{ color: 'var(--ink-900)' }}>Contact Us</h1>
        <p className="mt-2 text-sm" style={{ color: 'var(--ink-600)' }}>Have a question or need help? We are here for you.</p>
      </div>

      <div className="card text-center mb-6">
        <div className="inline-flex rounded-lg p-3 mb-4" style={{ background: 'var(--brand-50)', color: 'var(--brand-600)' }}><Mail className="h-6 w-6" /></div>
        <h2 className="text-sm font-bold" style={{ color: 'var(--ink-900)' }}>Email us</h2>
        <a href={siteConfig.supportMailto} className="mt-2 inline-block text-sm font-semibold hover:underline" style={{ color: 'var(--brand-600)' }}>{siteConfig.supportEmail}</a>
        <p className="mt-1 text-xs" style={{ color: 'var(--ink-500)' }}>{siteConfig.supportHours}</p>
      </div>

      <div className="card mb-6">
        <h2 className="text-sm font-bold" style={{ color: 'var(--ink-900)' }}>Helpful context to include</h2>
        <ul className="mt-3 space-y-2 text-xs" style={{ color: 'var(--ink-600)' }}>
          {['The platform you are trying to download from', 'The exact error message you see', 'Whether you are logged in or a guest', 'Your device type and browser'].map(item => (
            <li key={item} className="flex items-start gap-2"><span className="mt-1 w-1 h-1 rounded-full shrink-0" style={{ background: 'var(--brand-500)' }} />{item}</li>
          ))}
        </ul>
      </div>

      <div className="flex gap-3">
        <Link to="/faq" className="btn-outline text-xs">Visit FAQ</Link>
        <Link to="/dmca" className="btn-ghost text-xs">DMCA</Link>
      </div>
    </div>
  );
}