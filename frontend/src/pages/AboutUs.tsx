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
    <div className="shell" style={{ maxWidth: 720, padding: '3rem 1rem 4rem' }}>
      <Helmet><title>About Us | {siteConfig.name}</title><meta name="description" content={`Learn more about ${siteConfig.name}.`} /><link rel="canonical" href={siteUrl('/about-us')} /></Helmet>

      <div className="text-center mb-8">
        <span className="tag">About</span>
        <h1 className="text-3xl font-bold mt-3" style={{ color: 'var(--ink-900)' }}>About {siteConfig.name}</h1>
        <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--ink-600)' }}>
          {siteConfig.name} is a browser-based video and audio downloader that works with thousands of platforms. We believe downloading public content should be simple, fast, and private.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 mb-8">
        {principles.map(p => (
          <article key={p.title} className="card card-hover">
            <div className="inline-flex rounded-lg p-2 mb-3" style={{ background: 'var(--brand-50)', color: 'var(--brand-600)' }}><p.icon className="h-4 w-4" /></div>
            <h2 className="text-sm font-bold" style={{ color: 'var(--ink-900)' }}>{p.title}</h2>
            <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--ink-600)' }}>{p.desc}</p>
          </article>
        ))}
      </div>

      <div className="card mb-8">
        <h2 className="text-sm font-bold" style={{ color: 'var(--ink-900)' }}>Responsible use</h2>
        <ul className="mt-3 space-y-2">
          {['Download only public content you have permission to access.', 'Respect platform terms of service.', 'Do not use for copyright infringement.', 'Content is saved locally on your device.'].map(item => (
            <li key={item} className="flex items-start gap-2 text-xs" style={{ color: 'var(--ink-600)' }}><CheckCircle2 className="h-3 w-3 mt-0.5 shrink-0" style={{ color: 'var(--brand-500)' }} />{item}</li>
          ))}
        </ul>
      </div>

      <div className="flex gap-3">
        <Link to="/contact-us" className="btn-primary text-xs">Contact us</Link>
        <Link to="/privacy-policy" className="btn-outline text-xs">Privacy policy</Link>
      </div>
    </div>
  );
}