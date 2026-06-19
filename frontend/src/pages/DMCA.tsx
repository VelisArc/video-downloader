import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { siteConfig, siteUrl } from '../lib/site';

export default function DMCA() {
  return (
    <div className="shell" style={{ maxWidth: 720, padding: '3rem 1rem 4rem' }}>
      <Helmet><title>DMCA | {siteConfig.name}</title><meta name="description" content={`${siteConfig.name} DMCA copyright policy.`} /><meta property="og:title" content={`DMCA - ${siteConfig.name}`} /><link rel="canonical" href={siteUrl('/dmca')} /></Helmet>

      <div className="text-center mb-8">
        <span className="tag">DMCA</span>
        <h1 className="text-3xl font-bold mt-3" style={{ color: 'var(--ink-900)' }}>DMCA / Copyright Policy</h1>
      </div>

      <p className="text-xs leading-relaxed mb-6" style={{ color: 'var(--ink-600)' }}>
        We respect intellectual property rights and comply with the Digital Millennium Copyright Act. If you believe content on our service infringes your copyright, please contact our designated agent.
      </p>

      <div className="mb-6">
        <h2 className="text-sm font-bold mb-3" style={{ color: 'var(--ink-900)' }}>Reporting Infringement</h2>
        <p className="text-xs leading-relaxed mb-3" style={{ color: 'var(--ink-600)' }}>To file a DMCA notice, please include the following information:</p>
        <ol className="space-y-2 text-xs leading-relaxed" style={{ color: 'var(--ink-600)' }}>
          {[
            'Identification of the copyrighted work claimed to have been infringed',
            'Identification of the material that is claimed to be infringing',
            'Your contact information (email, address, phone number)',
            'A statement that you have a good faith belief the use is not authorized',
            'A statement that the information in the notice is accurate, under penalty of perjury',
            'Your physical or electronic signature',
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-2"><span className="font-bold shrink-0">{i + 1}.</span>{item}</li>
          ))}
        </ol>
      </div>

      <div className="card mb-6">
        <h2 className="text-sm font-bold mb-2" style={{ color: 'var(--ink-900)' }}>Designated Copyright Agent</h2>
        <p className="text-xs" style={{ color: 'var(--ink-600)' }}>Email: <a href={siteConfig.supportMailto} className="font-semibold hover:underline" style={{ color: 'var(--brand-600)' }}>{siteConfig.supportEmail}</a></p>
        <p className="text-xs mt-2" style={{ color: 'var(--ink-600)' }}>We respond to all valid DMCA notices promptly.</p>
      </div>

      <div className="flex gap-3">
        <Link to="/terms-of-service" className="btn-outline text-xs">Terms of Service</Link>
        <Link to="/privacy-policy" className="btn-ghost text-xs">Privacy Policy</Link>
      </div>
    </div>
  );
}