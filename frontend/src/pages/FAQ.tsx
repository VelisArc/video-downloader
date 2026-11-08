import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { ChevronDown, Mail, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { siteConfig, siteUrl } from '../lib/site';

const faqs = [
  { q: 'What is ShareHub?', a: 'ShareHub is a browser-based video and audio downloader that works with thousands of platforms including Instagram, Facebook, TikTok, X, Vimeo, Reddit, and other compatible public sources. Paste a link, choose your format, and download.' },
  { q: 'Is ShareHub free?', a: 'Yes! ShareHub offers a free tier with a daily limit. Premium plans are available for users who need higher or unlimited limits.' },
  { q: 'How do I download a video?', a: 'Copy the URL of the video you want, paste it into the downloader on our homepage, select Video or Audio, then click Download.' },
  { q: 'What platforms does ShareHub support?', a: 'ShareHub supports Instagram, Facebook, TikTok, X/Twitter, Vimeo, Dailymotion, Twitch, SoundCloud, Reddit, and many more yt-dlp-compatible platforms.' },
  { q: 'Can I download audio only?', a: 'Yes. Toggle the selector to Audio mode before downloading. We extract the highest quality MP3 or M4A stream available.' },
  { q: 'What is the daily download limit?', a: 'Guest users get 1 download per day. Logged-in free users get 3 per day. Premium users get higher fair-use limits designed to prevent abuse.' },
  { q: 'How do I increase my daily limit?', a: 'Sign in with Google to get 3 downloads/day, or upgrade to a Monthly or Lifetime premium plan for higher fair-use limits.' },
  { q: 'Do I need to create an account?', a: 'No. You can download as a guest. Creating an account increases your daily limit and unlocks premium features.' },
  { q: 'Are downloads private?', a: 'Yes. We do not log or store your downloads. History is stored locally in your browser.' },
  { q: 'What video quality is available?', a: 'Quality depends on the source. We support up to 4K when the source provides it. The highest available resolution is used.' },
  { q: 'Can I download from Instagram?', a: 'Yes. Instagram Reels, Stories, IGTV, and post videos are supported for public content.' },
  { q: 'Can I download from Facebook?', a: 'Yes. Facebook feed videos, Watch links, and Reels are supported for public content.' },
  { q: 'Why did my download fail?', a: 'Common reasons: the video is private, the link is expired, the platform changed its API, or the content is protected by DRM.' },
  { q: 'Does ShareHub work on mobile?', a: 'Yes. ShareHub is fully responsive and works on iPhone, iPad, and Android devices through the browser.' },
  { q: 'Is there an app?', a: 'ShareHub is browser-based, but you can install it as a Progressive Web App from your browser for quick access.' },
  { q: 'How do I contact support?', a: `Email us at ${siteConfig.supportEmail}. We respond during business hours.` },
  { q: 'What payment methods are accepted?', a: 'Payments are processed through Razorpay, which supports credit/debit cards, UPI, net banking, and wallets.' },
  { q: 'Can I get a refund?', a: 'Due to the digital nature of the service, all purchases are final. See our refund policy for details.' },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null);
  const [search, setSearch] = useState('');

  const filtered = faqs.filter(f => !search || f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <Helmet><title>FAQ | {siteConfig.name}</title><meta name="description" content="Frequently asked questions about ShareHub." /><link rel="canonical" href={siteUrl('/faq')} /></Helmet>

      {/* Sub-page hero ------------------------------------------------------- */}
      <div className="section-muted border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="shell py-10 text-center sm:py-14">
          <span className="tag">FAQ</span>
          <h1 className="section-heading text-2xl sm:text-4xl">Frequently Asked Questions</h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 sm:text-base" style={{ color: 'var(--ink-600)' }}>
            Everything you need to know about ShareHub.
          </p>
        </div>
      </div>

      <div className="shell max-w-3xl py-10 sm:py-14">
        {/* Search -------------------------------------------------------------- */}
        <div className="relative mb-6">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2" style={{ color: 'var(--ink-400)' }} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search questions..."
            aria-label="Search questions"
            className="min-h-12 w-full rounded-2xl border py-3 pl-12 pr-4 text-sm outline-none transition-colors"
            style={{ borderColor: 'var(--border)', background: 'var(--surface)', color: 'var(--ink-900)', boxShadow: 'var(--shadow-xs)' }}
            onFocus={e => e.currentTarget.style.borderColor = 'var(--border-strong)'}
            onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
          />
        </div>

        {/* Accordion ----------------------------------------------------------- */}
        <div className="space-y-3">
          {filtered.map((f, i) => {
            const isOpen = open === i;
            return (
              <article
                key={f.q}
                className="card overflow-hidden rounded-2xl p-0 transition-shadow"
                style={isOpen ? { borderColor: 'var(--border-strong)', boxShadow: 'var(--shadow-md)' } : undefined}
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="flex min-h-11 w-full items-center justify-between gap-4 p-4 text-left sm:p-5"
                >
                  <span className="text-sm font-semibold leading-6 break-words sm:text-[15px]" style={{ color: 'var(--ink-900)' }}>{f.q}</span>
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors"
                    style={{ background: isOpen ? 'var(--grad-brand-soft)' : 'var(--surface-soft)', color: isOpen ? 'var(--brand-700)' : 'var(--ink-500)' }}
                  >
                    <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                  </span>
                </button>
                <div className={`grid transition-all duration-200 ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                  <div className="overflow-hidden">
                    <p className="border-t px-4 pb-5 pt-4 text-sm leading-7 break-words sm:px-5" style={{ borderColor: 'var(--border)', color: 'var(--ink-600)' }}>{f.a}</p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <p className="rounded-2xl border border-dashed py-12 text-center text-sm" style={{ borderColor: 'var(--border-med)', color: 'var(--ink-500)' }}>
            No matching questions found.
          </p>
        )}

        {/* Still need help ------------------------------------------------------- */}
        <div
          className="mt-10 rounded-3xl border p-6 text-center sm:p-8"
          style={{ background: 'var(--grad-brand-soft)', borderColor: 'var(--border)' }}
        >
          <div className="icon-tile mx-auto"><Mail className="h-5 w-5" /></div>
          <h3 className="mt-4 text-base font-bold sm:text-lg" style={{ color: 'var(--ink-900)' }}>Still need help?</h3>
          <p className="mx-auto mt-1.5 max-w-md text-sm leading-6" style={{ color: 'var(--ink-600)' }}>We are here to help.</p>
          <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
            <a href={siteConfig.supportMailto} className="btn-primary w-full sm:w-auto">Contact support</a>
            <Link to="/" className="btn-outline w-full sm:w-auto">Open downloader</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
