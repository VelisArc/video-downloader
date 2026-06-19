import { Helmet } from 'react-helmet-async';
import { ArrowRight, CheckCircle2, Facebook, Globe2, Instagram, Music4, Video } from 'lucide-react';
import { Link } from 'react-router-dom';
import { siteConfig, siteUrl } from '../lib/site';

const data = [
  { title: 'Instagram', icon: Instagram, copy: 'Strong for reels, post videos, and other supported Instagram media.', points: ['Public reels and post videos', 'Many post and carousel links', 'Audio extraction when available'], to: '/how-to-download-instagram-reels', cta: 'Read Instagram guide', color: 'linear-gradient(135deg, #e1306c, #f77737)' },
  { title: 'Facebook', icon: Facebook, copy: 'Strong for feed videos, Watch links, reels, and other supported Facebook URLs.', points: ['Feed videos, reels, and Watch', 'Replay after live streams', 'Audio extraction when available'], to: '/how-to-download-facebook-videos', cta: 'Read Facebook guide', color: 'var(--brand-600)' },
  { title: 'Broader coverage', icon: Globe2, copy: 'SwiftDL now accepts many other yt-dlp-compatible links including YouTube, TikTok, X, and more.', points: ['YouTube, TikTok, X, Reddit, Vimeo', 'Results depend on URL format', 'Unsupported URLs fail gracefully'], to: '/faq', cta: 'Compatibility notes', color: 'var(--ink-heavy)' },
];

export default function SupportedPlatforms() {
  return (
    <div className="shell-wide py-8">
      <Helmet><title>Supported Platforms | {siteConfig.name}</title><meta name="description" content="See the platforms SwiftDL supports." /><link rel="canonical" href={siteUrl('/supported-platforms')} /></Helmet>

      <div className="text-center max-w-2xl mx-auto mb-8">
        <span className="tag">Platforms</span>
        <h1 className="text-3xl font-bold mt-3" style={{ color: 'var(--ink-900)' }}>Supported today</h1>
        <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--ink-600)' }}>SwiftDL now handles a wider set of yt-dlp-compatible platforms while being honest that results depend on the exact URL and platform restrictions.</p>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {data.map(d => (
          <article key={d.title} className="overflow-hidden rounded-xl border" style={{ borderColor: 'var(--border)' }}>
            <div className="px-5 py-4 text-white" style={{ background: d.color }}>
              <div className="inline-flex rounded-full bg-white/15 p-2.5"><d.icon className="h-6 w-6" /></div>
              <h2 className="mt-3 text-xl font-bold">{d.title}</h2>
            </div>
            <div className="p-5">
              <p className="text-xs leading-relaxed" style={{ color: 'var(--ink-600)' }}>{d.copy}</p>
              <ul className="mt-3 space-y-1.5">
                {d.points.map(p => <li key={p} className="flex gap-2 text-xs" style={{ color: 'var(--ink-600)' }}><CheckCircle2 className="h-3.5 w-3.5 mt-0.5 shrink-0" style={{ color: 'var(--brand-500)' }} />{p}</li>)}
              </ul>
              <Link to={d.to} className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold hover:underline" style={{ color: 'var(--brand-600)' }}>{d.cta} <ArrowRight className="h-3 w-3" /></Link>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {[
          { icon: Video, title: 'Public media first', desc: 'Public links remain the clearest and most stable path across every supported platform.' },
          { icon: Music4, title: 'Audio when available', desc: 'Audio extraction depends on the streams the source platform exposes for that link.' },
          { icon: Globe2, title: 'Broad compatibility', desc: 'Many yt-dlp-compatible platforms work, but some URLs may fail depending on restrictions.' },
        ].map(f => <article key={f.title} className="card card-hover"><div className="inline-flex rounded-lg p-2 mb-3" style={{ background: 'var(--brand-50)', color: 'var(--brand-600)' }}><f.icon className="h-4 w-4" /></div><h2 className="text-sm font-bold" style={{ color: 'var(--ink-900)' }}>{f.title}</h2><p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--ink-600)' }}>{f.desc}</p></article>)}
      </div>
    </div>
  );
}