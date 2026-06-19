import { Helmet } from 'react-helmet-async';
import { ArrowRight, CheckCircle2, Facebook, Globe2, Instagram, Lock, Music4, Video } from 'lucide-react';
import { Link } from 'react-router-dom';
import { siteConfig, siteUrl } from '../lib/site';

const platformData = [
  {
    title: 'Instagram',
    accent: 'from-[#f05f6b] to-[#f49c4d]',
    icon: Instagram,
    copy:
      'Strong for reels, post videos, and other supported Instagram media, including some login-required links when your own cookies are available.',
    points: [
      'Public reels and post videos',
      'Many post and carousel links',
      'Audio extraction when the source exposes it',
      'Saved-cookie support for authorized sessions',
    ],
    to: '/how-to-download-instagram-reels',
    cta: 'Read the Instagram guide',
  },
  {
    title: 'Facebook',
    accent: 'from-[#2563eb] to-[#38bdf8]',
    icon: Facebook,
    copy:
      'Strong for feed videos, Watch links, reels, and other supported Facebook URLs, with premium cookie matching for restricted sessions.',
    points: [
      'Feed videos, reels, and Watch links',
      'Replay content after live streams end',
      'Audio extraction when available',
      'Premium cookie vault for authorized access',
    ],
    to: '/how-to-download-facebook-videos',
    cta: 'Read the Facebook guide',
  },
  {
    title: 'Broader extractor coverage',
    accent: 'from-[#1f2233] to-[#4b5563]',
    icon: Globe2,
    copy:
      'SwiftDL now accepts many other yt-dlp-compatible links as well, including major short-video, long-form video, and community platforms when the underlying extractor supports that URL.',
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
          content="See the major platforms and wider yt-dlp-compatible coverage SwiftDL now supports, including premium cookie matching for authorized links."
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
          restrictions, and whether the media is public or requires your own
          authorized session.
        </p>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {platformData.map(({ title, accent, icon: Icon, copy, points, to, cta }) => (
          <article
            key={title}
            className="overflow-hidden rounded-2xl border border-[var(--border-soft)] bg-white shadow-[0_18px_40px_rgba(31,34,51,0.05)]"
          >
            <div className={`bg-gradient-to-r ${accent} px-5 py-4 text-white`}>
              <div className="inline-flex rounded-[24px] bg-white/15 p-3">
                <Icon className="h-7 w-7" />
              </div>
              <h2 className="mt-3 text-2xl font-black">{title}</h2>
            </div>
            <div className="space-y-3 p-5">
              <p className="text-sm leading-7 text-[var(--ink-600)]">{copy}</p>
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
        ))}
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <article className="feature-card">
          <Video className="mb-4 h-5 w-5 text-[var(--brand-600)]" />
          <h2 className="text-xl font-black text-[var(--ink-900)]">Public media first</h2>
          <p className="mt-3 text-sm leading-7 text-[var(--ink-600)]">
            Public links remain the clearest and most stable path across every supported platform.
          </p>
        </article>
        <article className="feature-card">
          <Music4 className="mb-4 h-5 w-5 text-[var(--brand-600)]" />
          <h2 className="text-xl font-black text-[var(--ink-900)]">Audio when available</h2>
          <p className="mt-3 text-sm leading-7 text-[var(--ink-600)]">
            Audio extraction depends on the streams the source platform exposes for that specific link.
          </p>
        </article>
        <article className="feature-card">
          <Lock className="mb-4 h-5 w-5 text-[var(--brand-600)]" />
          <h2 className="text-xl font-black text-[var(--ink-900)]">Permission-aware</h2>
          <p className="mt-3 text-sm leading-7 text-[var(--ink-600)]">
            Premium cookie matching can help with authorized links, but it does not bypass permissions you do not already have.
          </p>
        </article>
      </section>
    </div>
  );
}
