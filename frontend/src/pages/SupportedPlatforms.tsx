import { Helmet } from 'react-helmet-async';
import { ArrowRight, CheckCircle2, Facebook, Globe2, Instagram, Music4, Video } from 'lucide-react';
import { Link } from 'react-router-dom';
import { siteConfig, siteUrl } from '../lib/site';

const data = [
  { title: 'Instagram', icon: Instagram, copy: 'Strong for reels, post videos, and other supported Instagram media.', points: ['Public reels and post videos', 'Many post and carousel links', 'Audio extraction when available'], to: '/how-to-download-instagram-reels', cta: 'Read Instagram guide', header: 'var(--grad-brand)' },
  { title: 'Facebook', icon: Facebook, copy: 'Strong for feed videos, Watch links, reels, and other supported Facebook URLs.', points: ['Feed videos, reels, and Watch', 'Replay after live streams', 'Audio extraction when available'], to: '/how-to-download-facebook-videos', cta: 'Read Facebook guide', header: 'var(--brand-700)' },
  { title: 'Broader coverage', icon: Globe2, copy: 'ShareHub accepts many yt-dlp-compatible public links including TikTok, X, Reddit, Vimeo, and more.', points: ['TikTok, X, Reddit, Vimeo, Dailymotion', 'Results depend on URL format', 'Unsupported URLs fail gracefully'], to: '/faq', cta: 'Compatibility notes', header: 'var(--ink-heavy)' },
];

export default function SupportedPlatforms() {
  return (
    <div>
      <Helmet><title>Supported Platforms | {siteConfig.name}</title><meta name="description" content="See the platforms ShareHub supports." /><link rel="canonical" href={siteUrl('/supported-platforms')} /></Helmet>

      {/* Sub-page hero ------------------------------------------------------- */}
      <div className="section-muted border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="shell-wide py-10 text-center sm:py-14">
          <span className="tag">Platforms</span>
          <h1 className="section-heading text-2xl sm:text-4xl">Supported today</h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 sm:text-base" style={{ color: 'var(--ink-600)' }}>
            ShareHub now handles a wider set of yt-dlp-compatible platforms while being honest that results depend on the exact URL and platform restrictions.
          </p>
        </div>
      </div>

      <div className="shell-wide py-10 sm:py-14">
        {/* Platform cards ------------------------------------------------------ */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {data.map(d => (
            <article
              key={d.title}
              className="card card-hover flex flex-col overflow-hidden rounded-3xl p-0"
            >
              <div className="relative px-5 py-6 text-white sm:px-6 sm:py-7" style={{ background: d.header }}>
                <div className="inline-flex rounded-2xl border border-white/20 bg-white/15 p-2.5">
                  <d.icon className="h-6 w-6" />
                </div>
                <h2 className="mt-4 font-display text-xl font-extrabold text-white sm:text-2xl" style={{ letterSpacing: '-0.03em' }}>{d.title}</h2>
              </div>
              <div className="flex flex-1 flex-col p-5 sm:p-6">
                <p className="text-sm leading-6 break-words" style={{ color: 'var(--ink-600)' }}>{d.copy}</p>
                <ul className="mt-4 space-y-2">
                  {d.points.map(p => (
                    <li key={p} className="flex items-start gap-2 text-sm leading-6" style={{ color: 'var(--ink-600)' }}>
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" style={{ color: 'var(--brand-500)' }} />
                      <span className="break-words">{p}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to={d.to}
                  className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold transition-colors sm:w-auto sm:justify-start"
                  style={{ borderColor: 'var(--border-med)', color: 'var(--brand-700)' }}
                >
                  {d.cta} <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>

        {/* Notes ---------------------------------------------------------------- */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 sm:gap-5">
          {[
            { icon: Video, title: 'Public media first', desc: 'Public links remain the clearest and most stable path across every supported platform.' },
            { icon: Music4, title: 'Audio when available', desc: 'Audio extraction depends on the streams the source platform exposes for that link.' },
            { icon: Globe2, title: 'Broad compatibility', desc: 'Many yt-dlp-compatible platforms work, but some URLs may fail depending on restrictions.' },
          ].map(f => (
            <article key={f.title} className="bento">
              <div className="relative z-10">
                <div className="icon-tile"><f.icon className="h-5 w-5" /></div>
                <h2 className="mt-4 text-base font-bold" style={{ color: 'var(--ink-900)' }}>{f.title}</h2>
                <p className="mt-2 text-sm leading-6 break-words" style={{ color: 'var(--ink-600)' }}>{f.desc}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
