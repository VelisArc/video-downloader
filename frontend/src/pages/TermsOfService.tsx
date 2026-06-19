import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { siteConfig, siteUrl } from '../lib/site';

export default function TermsOfService() {
  return (
    <div className="shell" style={{ maxWidth: 720, padding: '3rem 1rem 4rem' }}>
      <Helmet><title>Terms of Service | {siteConfig.name}</title><meta name="description" content={`${siteConfig.name} terms of service.`} /><link rel="canonical" href={siteUrl('/terms-of-service')} /></Helmet>

      <div className="text-center mb-8">
        <span className="tag">Terms</span>
        <h1 className="text-3xl font-bold mt-3" style={{ color: 'var(--ink-900)' }}>Terms of Service</h1>
        <p className="text-xs mt-2" style={{ color: 'var(--ink-500)' }}>By using {siteConfig.name}, you agree to these terms.</p>
      </div>

      {[
        { title: 'Service description', content: `${siteConfig.name} is a browser-based tool that extracts publicly accessible video and audio streams from supported platforms. The service relies on yt-dlp and platform APIs, which may change without notice.` },
        { title: 'Permitted use', content: 'You may use SwiftDL to download content you already have legal access to view. You must comply with the terms of service of the source platform.' },
        { title: 'Prohibited use', content: 'You may not use SwiftDL to bypass paywalls, DRM, or access private content. You may not use the service for copyright infringement or any illegal activity.' },
        { title: 'User responsibility', content: 'You are responsible for how you use downloaded content. Respect copyright laws and platform terms. We do not condone piracy.' },
        { title: 'Availability and limitations', content: 'The service is provided "as is" without warranties. We may change or discontinue features at any time. We do not guarantee that every link will work.' },
      ].map(s => (
        <div key={s.title} className="mb-6">
          <h2 className="text-sm font-bold mb-2" style={{ color: 'var(--ink-900)' }}>{s.title}</h2>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--ink-600)' }}>{s.content}</p>
        </div>
      ))}

      <div className="mt-6 flex gap-3">
        <Link to="/privacy-policy" className="btn-outline text-xs">Privacy Policy</Link>
        <Link to="/contact-us" className="btn-ghost text-xs">Contact</Link>
      </div>
    </div>
  );
}