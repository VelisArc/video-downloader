import { Helmet } from 'react-helmet-async';
import { Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { siteConfig, siteUrl } from '../lib/site';

export default function PrivacyPolicy() {
  return (
    <div className="shell" style={{ maxWidth: 720, padding: '3rem 1rem 4rem' }}>
      <Helmet><title>Privacy Policy | {siteConfig.name}</title><meta name="description" content={`${siteConfig.name} privacy policy.`} /><link rel="canonical" href={siteUrl('/privacy-policy')} /></Helmet>

      <div className="text-center mb-8">
        <span className="tag">Privacy</span>
        <h1 className="text-3xl font-bold mt-3" style={{ color: 'var(--ink-900)' }}>Privacy Policy</h1>
        <p className="text-xs mt-2" style={{ color: 'var(--ink-500)' }}>Last updated: January 2024</p>
      </div>

      <div className="card mb-6">
        <div className="flex items-center gap-3 mb-2"><div className="rounded-lg p-2" style={{ background: 'var(--success-100)', color: 'var(--success-600)' }}><Shield className="h-4 w-4" /></div><span className="text-sm font-bold" style={{ color: 'var(--ink-900)' }}>Quick summary</span></div>
        <p className="text-xs leading-relaxed" style={{ color: 'var(--ink-600)' }}>We collect minimal data to operate the service. Your downloads are not logged or stored on our servers. Session history stays in your browser.</p>
      </div>

      {[
        { title: 'Information we collect', content: 'We collect your email address and display name if you sign in with Google. We use Firebase Authentication and Firestore for this. We do not collect your downloaded content, IP addresses are logged temporarily for rate limiting and server operations.' },
        { title: 'How we use information', content: 'Your email is used to identify your account and manage your subscription plan. We do not share your data with third parties except Firebase (Google) for authentication and Razorpay for payment processing.' },
        { title: 'Cookies and local storage', content: 'We use localStorage to save your theme preference and download history (stored only on your device). We use Firebase auth tokens for session management. We do not use tracking cookies.' },
        { title: 'Retention and security', content: 'Account data is retained until you delete your account. Download history is stored locally in your browser and never sent to our servers. We use HTTPS encryption for all data transmission.' },
        { title: 'Contact', content: `For privacy questions, email ${siteConfig.supportEmail}. We respond during business hours.` },
      ].map(s => (
        <div key={s.title} className="mb-4">
          <h2 className="text-sm font-bold mb-2" style={{ color: 'var(--ink-900)' }}>{s.title}</h2>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--ink-600)' }}>{s.content}</p>
        </div>
      ))}

      <div className="mt-6 flex gap-3">
        <Link to="/terms-of-service" className="btn-outline text-xs">Terms of Service</Link>
        <Link to="/dmca" className="btn-ghost text-xs">DMCA</Link>
      </div>
    </div>
  );
}