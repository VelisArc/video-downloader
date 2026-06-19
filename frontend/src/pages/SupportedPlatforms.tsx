import { Helmet } from 'react-helmet-async';
import {
  ArrowRight,
  CheckCircle2,
  Facebook,
  Globe2,
  Instagram,
  Music4,
  Video,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { siteConfig, siteUrl } from '../lib/site';

const platformData = [
  {
    title: 'Instagram',
    icon: Instagram,
    copy:
      'Strong for reels, post videos, and other supported Instagram media.',
    points: [
      'Public reels and post videos',
      'Many post and carousel links',
      'Audio extraction when the source exposes it',
    ],
    to: '/how-to-download-instagram-reels',
    cta: 'Read the Instagram guide',
  },
  {
    title: 'Facebook',
    icon: Facebook,
    copy:
      'Strong for feed videos, Watch links, reels, and other supported Facebook URLs.',
    points: [
      'Feed videos, reels, and Watch links',
      'Replay content after live streams end',
      'Audio extraction when available',
    ],
    to: '/how-to-download-facebook-videos',
    cta: 'Read the Facebook guide',
  },
  {
    title: 'Broader extractor coverage',
    icon: Globe2,
    copy:
      'SwiftDL now accepts many other yt-dlp-compatible links as well, including major short-video, long-form video, and community platforms.',
    points: [
      'Common support across YouTube, TikTok, X, Reddit, Vimeo, Twitch, and more',
      'Exact results depend on the URL format and current platform rules',
      'Some sites may expose video only, while others also expose audio',
      'Unsupported or heavily protected URLs can still fail gracefully',
    ],
    to: '/faq',
    cta: 'See compatibility notes',
  },
];

export default function SupportedPlatforms() {
  return (
    <div className="section-shell max-w-6xl py-8">
      <Helmet>
        <title>Supported Platforms | {siteConfig.name}</title>
        <meta
          name="description"
          content="See the major platforms and wider yt-dlp-compatible coverage SwiftDL now supports."
        />
        <link rel="canonical" href={siteUrl('/supported-platforms')} />
      </Helmet>

      <div className="mx-auto max-w-3xl text-center">
        <span className="section-eyebrow">Platform coverage</span>
        <h1 className="mt-4 text-3xl font-black text-[var(--ink-900)] md:text-4xl">
          Supported today
        </h1>
        <p className="mt-3 text-base leading-8 text-[var(--ink-600)]">
          SwiftDL is no longer locked to only Instagram and Facebook. It now
          handles a wider set of yt-dlp-compatible platforms while still being
          honest that final compatibility depends on the exact URL, platform
          restrictions, and whether the media is public.
        </p>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {platformData.map(
          ({ title, icon: Icon, copy, points, to, cta }) => (
            <article
              key={title}
              className="card overflow-hidden"
            >
              <div
                className="px-5 py-4 text-white"
                style={{ background: title === 'Instagram' ? 'linear-gradient(135deg, #f05f6b, #f49c4d)' : title === 'Facebook' ? 'var(--brand-600)' : 'var(--ink-900)' }}
              >
                <div className="inline-flex rounded-[24px] bg-white/15 p-3">
                  <Icon className="h-7 w-7" />
                </div>
                <h2 className="mt-3 text-2xl font-black">{title}</h2>
              </div>
              <div className="card-inner space-y-3 p-5">
                <p className="text-sm leading-7 text-[var(--ink-600)]">
                  {copy}
                </p>
                <ul className="space-y-3 text-sm leading-7 text-[var(--ink-600)]">
                  {points.map((point) => (
                    <li key={point} className="flex gap-3">
                      <CheckCircle2 className="mt-1 h-4 w-4 flex-none text-[var(--brand-600)]" />
                      {point}
                    </li>
                  ))}
                </ul>
                <Link
                  to={to}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--brand-700)] transition hover:text-[var(--brand-600)]"
                >
                  {cta}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </article>
          )
        )}
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <article className="feature-card">
          <Video className="mb-4 h-5 w-5 text-[var(--brand-600)]" />
          <h2 className="text-xl font-black text-[var(--ink-900)]">
            Public media first
          </h2>
          <p className="mt-3 text-sm leading-7 text-[var(--ink-600)]">
            Public links remain the clearest and most stable path across every
            supported platform.
          </p>
        </article>
        <article className="feature-card">
          <Music4 className="mb-4 h-5 w-5 text-[var(--brand-600)]" />
          <h2 className="text-xl font-black text-[var(--ink-900)]">
            Audio when available
          </h2>
          <p className="mt-3 text-sm leading-7 text-[var(--ink-600)]">
            Audio extraction depends on the streams the source platform exposes
            for that specific link.
          </p>
        </article>
        <article className="feature-card">
          <Globe2 className="mb-4 h-5 w-5 text-[var(--brand-600)]" />
          <h2 className="text-xl font-black text-[var(--ink-900)]">
            Broad compatibility
          </h2>
          <p className="mt-3 text-sm leading-7 text-[var(--ink-600)]">
            Many yt-dlp-compatible platforms work, but some URLs may still fail
            depending on platform restrictions.
          </p>
        </article>
      </section>
    </div>
  );
}
