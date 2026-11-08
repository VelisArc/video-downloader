import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { CheckCircle2, Mail } from 'lucide-react';
import { siteConfig, siteUrl } from '../lib/site';

export default function ContactUs() {
  return (
    <div>
      <Helmet><title>Contact Us | {siteConfig.name}</title><meta name="description" content="Get in touch with the ShareHub team." /><link rel="canonical" href={siteUrl('/contact-us')} /></Helmet>

      {/* Sub-page hero ------------------------------------------------------- */}
      <div className="section-muted border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="shell py-10 text-center sm:py-14">
          <span className="tag">Contact</span>
          <h1 className="section-heading text-2xl sm:text-4xl">Contact Us</h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 sm:text-base" style={{ color: 'var(--ink-600)' }}>
            Have a question or need help? We are here for you.
          </p>
        </div>
      </div>

      <div className="shell max-w-3xl py-10 sm:py-14">
        {/* Email card ---------------------------------------------------------- */}
        <div className="card rounded-3xl p-6 text-center sm:p-10" style={{ boxShadow: 'var(--shadow-md)' }}>
          <div className="icon-tile mx-auto h-14 w-14 rounded-2xl">
            <Mail className="h-7 w-7" />
          </div>
          <h2 className="mt-5 text-lg font-bold sm:text-xl" style={{ color: 'var(--ink-900)' }}>Email us</h2>
          <a
            href={siteConfig.supportMailto}
            className="mt-2 inline-block max-w-full break-all text-base font-semibold hover:underline sm:text-lg"
            style={{ color: 'var(--brand-700)' }}
          >
            {siteConfig.supportEmail}
          </a>
          <p className="mt-3">
            <span className="pill">{siteConfig.supportHours}</span>
          </p>
        </div>

        {/* Helpful context ------------------------------------------------------ */}
        <div className="card mt-6 rounded-3xl p-5 sm:p-7">
          <h2 className="text-base font-bold sm:text-lg" style={{ color: 'var(--ink-900)' }}>Helpful context to include</h2>
          <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {['The platform you are trying to download from', 'The exact error message you see', 'Whether you are logged in or a guest', 'Your device type and browser'].map(item => (
              <li key={item} className="flex items-start gap-2.5 text-sm leading-6" style={{ color: 'var(--ink-600)' }}>
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" style={{ color: 'var(--brand-500)' }} />
                <span className="break-words">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* CTAs ---------------------------------------------------------------- */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link to="/faq" className="btn-outline w-full sm:w-auto">Visit FAQ</Link>
          <Link to="/dmca" className="btn-ghost w-full sm:w-auto">DMCA</Link>
        </div>
      </div>
    </div>
  );
}
