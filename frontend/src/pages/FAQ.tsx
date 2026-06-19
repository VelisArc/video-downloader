import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { ChevronDown, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { siteConfig, siteUrl } from '../lib/site';

const faqs = [
  { q: 'What is SwiftDL?', a: 'SwiftDL is a browser-based video and audio downloader that works with thousands of platforms including YouTube, Instagram, Facebook, and TikTok. Paste a link, choose your format, and download.' },
  { q: 'Is SwiftDL free?', a: 'Yes! SwiftDL offers a free tier with a daily limit. Premium plans are available for users who need higher or unlimited limits.' },
  { q: 'How do I download a video?', a: 'Copy the URL of the video you want, paste it into the downloader on our homepage, select Video or Audio, then click Download.' },
  { q: 'What platforms does SwiftDL support?', a: 'SwiftDL supports YouTube, Instagram, Facebook, TikTok, X/Twitter, Vimeo, Dailymotion, Twitch, SoundCloud, and many more yt-dlp-compatible platforms.' },
  { q: 'Can I download audio only?', a: 'Yes. Toggle the selector to Audio mode before downloading. We extract the highest quality MP3 or M4A stream available.' },
  { q: 'What is the daily download limit?', a: 'Guest users get 1 download per day. Logged-in free users get 3 per day. Premium users get unlimited downloads.' },
  { q: 'How do I increase my daily limit?', a: 'Sign in with Google to get 3 downloads/day, or upgrade to a Monthly or Lifetime premium plan for unlimited downloads.' },
  { q: 'Do I need to create an account?', a: 'No. You can download as a guest. Creating an account increases your daily limit and unlocks premium features.' },
  { q: 'Are downloads private?', a: 'Yes. We do not log or store your downloads. History is stored locally in your browser.' },
  { q: 'What video quality is available?', a: 'Quality depends on the source. We support up to 4K when the source provides it. The highest available resolution is used.' },
  { q: 'Can I download from Instagram?', a: 'Yes. Instagram Reels, Stories, IGTV, and post videos are supported for public content.' },
  { q: 'Can I download from Facebook?', a: 'Yes. Facebook feed videos, Watch links, and Reels are supported for public content.' },
  { q: 'Why did my download fail?', a: 'Common reasons: the video is private, the link is expired, the platform changed its API, or the content is protected by DRM.' },
  { q: 'Does SwiftDL work on mobile?', a: 'Yes. SwiftDL is fully responsive and works on iPhone, iPad, and Android devices through the browser.' },
  { q: 'Is there an app?', a: 'SwiftDL is browser-based, but you can install it as a Progressive Web App from your browser for quick access.' },
  { q: 'How do I contact support?', a: `Email us at ${siteConfig.supportEmail}. We respond during business hours.` },
  { q: 'What payment methods are accepted?', a: 'Payments are processed through Razorpay, which supports credit/debit cards, UPI, net banking, and wallets.' },
  { q: 'Can I get a refund?', a: 'Due to the digital nature of the service, all purchases are final. See our refund policy for details.' },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null);
  const [search, setSearch] = useState('');

  const filtered = faqs.filter(f => !search || f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="shell" style={{ maxWidth: 800, padding: '3rem 1rem 4rem' }}>
      <Helmet><title>FAQ | {siteConfig.name}</title><meta name="description" content="Frequently asked questions about SwiftDL." /><link rel="canonical" href={siteUrl('/faq')} /></Helmet>

      <div className="text-center max-w-xl mx-auto mb-8">
        <span className="tag">FAQ</span>
        <h1 className="text-3xl font-bold mt-3" style={{ color: 'var(--ink-900)' }}>Frequently Asked Questions</h1>
        <p className="mt-2 text-sm" style={{ color: 'var(--ink-600)' }}>Everything you need to know about SwiftDL.</p>
      </div>

      <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search questions..." className="w-full rounded-lg border px-4 py-2.5 text-sm mb-6 outline-none transition-colors" style={{ borderColor: 'var(--border)', background: 'var(--surface)', color: 'var(--ink-900)' }} onFocus={e => e.target.style.borderColor = 'var(--border-strong)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />

      <div className="space-y-2">
        {filtered.map((f, i) => {
          const isOpen = open === i;
          return (
            <article key={f.q} className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <button onClick={() => setOpen(isOpen ? null : i)} className="flex w-full items-center justify-between gap-4 p-4 text-left">
                <span className="text-sm font-semibold leading-snug" style={{ color: 'var(--ink-900)' }}>{f.q}</span>
                <div className="shrink-0 rounded-md p-1" style={{ background: isOpen ? 'var(--brand-50)' : 'transparent', color: isOpen ? 'var(--brand-600)' : 'var(--ink-400)' }}>
                  <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </div>
              </button>
              <div className={`grid transition-all duration-200 ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden px-4 pb-4"><p className="text-xs leading-relaxed" style={{ color: 'var(--ink-600)' }}>{f.a}</p></div>
              </div>
            </article>
          );
        })}
      </div>

      {filtered.length === 0 && <p className="text-center text-sm py-10" style={{ color: 'var(--ink-500)' }}>No matching questions found.</p>}

      <div className="mt-10 text-center rounded-xl p-6" style={{ background: 'var(--surface-soft)', border: '1px solid var(--border)' }}>
        <Mail className="h-5 w-5 mx-auto" style={{ color: 'var(--brand-600)' }} />
        <h3 className="mt-2 text-sm font-bold" style={{ color: 'var(--ink-900)' }}>Still need help?</h3>
        <p className="text-xs mt-1" style={{ color: 'var(--ink-600)' }}>We are here to help.</p>
        <div className="mt-3 flex justify-center gap-3">
          <a href={siteConfig.supportMailto} className="btn-primary text-xs">Contact support</a>
          <Link to="/" className="btn-outline text-xs">Open downloader</Link>
        </div>
      </div>
    </div>
  );
}