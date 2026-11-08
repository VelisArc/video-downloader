import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { CheckCircle2, Globe, Lock, Shield } from 'lucide-react';
import { siteConfig, siteUrl } from '../lib/site';

const principles = [
  { title: 'Broader but honest scope', desc: 'We cover many platforms while being clear that not every link will work.', icon: Globe },
  { title: 'Privacy-minded handling', desc: 'Your downloads are not logged. History stays in your browser.', icon: Shield },
  { title: 'Accessible UX', desc: 'Clean, fast, and works on every device without installation.', icon: CheckCircle2 },
  { title: 'Permission-aware use', desc: 'We only process public content you already have access to.', icon: Lock },
];

export default function AboutUs() {
  return (
    <div>
      <Helmet><title>About Us | {siteConfig.name}</title><meta name="description" content={`Learn more about ${siteConfig.name}.`} /><link rel="canonical" href={siteUrl('/about-us')} /></Helmet>

      {/* Sub-page hero ------------------------------------------------------- */}
      <div className="section-muted border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="shell py-10 text-center sm:py-14">
          <span className="tag">About</span>
          <h1 className="section-heading text-2xl sm:text-4xl">About {siteConfig.name}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 sm:text-base" style={{ color: 'var(--ink-600)' }}>
            {siteConfig.name} is a browser-based video and audio downloader that works with thousands of platforms. We believe downloading public content should be simple, fast, and private.
          </p>
        </div>
      </div>

      <div className="shell max-w-4xl py-10 sm:py-14">
        {/* Principles --------------------------------------------------------- */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
          {principles.map(p => (
            <article key={p.title} className="bento card-hover">
              <div className="relative z-10">
                <div className="icon-tile"><p.icon className="h-5 w-5" /></div>
                <h2 className="mt-4 text-base font-bold" style={{ color: 'var(--ink-900)' }}>{p.title}</h2>
                <p className="mt-2 text-sm leading-6 break-words" style={{ color: 'var(--ink-600)' }}>{p.desc}</p>
              </div>
            </article>
          ))}
        </div>

        {/* Responsible use ---------------------------------------------------- */}
        <div className="card mt-6 rounded-3xl p-5 sm:p-7">
          <div className="flex items-center gap-3">
            <div className="icon-tile"><Shield className="h-5 w-5" /></div>
            <h2 className="text-base font-bold sm:text-lg" style={{ color: 'var(--ink-900)' }}>Responsible use</h2>
          </div>
          <ul className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {['Download only public content you have permission to access.', 'Respect platform terms of service.', 'Do not use for copyright infringement.', 'Content is saved locally on your device.'].map(item => (
              <li key={item} className="flex items-start gap-2.5 text-sm leading-6" style={{ color: 'var(--ink-600)' }}>
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" style={{ color: 'var(--brand-500)' }} />
                <span className="break-words">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* CTAs ---------------------------------------------------------------- */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link to="/contact-us" className="btn-primary w-full sm:w-auto">Contact us</Link>
          <Link to="/privacy-policy" className="btn-outline w-full sm:w-auto">Privacy policy</Link>
        </div>
      </div>
    </div>
  );
}
