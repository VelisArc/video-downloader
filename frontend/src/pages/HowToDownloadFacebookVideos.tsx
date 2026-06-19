import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { ChevronDown, Share2, Link as LinkIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { siteConfig, siteUrl } from '../lib/site';

const steps = [
  'Open Facebook and navigate to the video, Reel, or Watch content you want to save.',
  'Click or tap the Share button (three dots or arrow icon) on the post.',
  'Select "Copy Link" from the available options.',
  'Return to SwiftDL and paste the copied URL into the input field.',
  'Select "Video" for video, or "Audio" for audio extraction.',
  'Click Download, then save the file to your device after processing.',
];

const goodLinks = [
  'https://www.facebook.com/watch/?v=1234567890',
  'https://www.facebook.com/username/videos/1234567890',
  'https://www.facebook.com/reel/1234567890',
  'https://fb.watch/xxxxxx/ (shortened Watch links)',
  'https://www.facebook.com/username/posts/1234567890',
];

const features = [
  'Desktop and mobile: works across both platforms via browser',
  'Public and some login-accessible content may work',
  'Rate limits: rapid downloading may trigger Facebook rate limiting',
  'Mobile links: format may differ from desktop links',
  'Region-locked content: some videos may not be accessible from your location',
  'Facebook changes their video structure regularly, so some links may fail temporarily',
];

const failures = [
  'The video is private or friends-only',
  'The link is broken or expired',
  'The content is a live stream (must end first)',
  'The video uses DRM protection',
  'Facebook is rate-limiting your request',
];

const faqs = [
  { q: 'Does it work with private Facebook videos?', a: 'No. We can only process publicly accessible content. Private or friends-only videos are not supported.' },
  { q: 'Can I download Facebook Live streams?', a: 'Live streams must end first. Once the stream concludes and becomes a replay video, you can try downloading it.' },
  { q: 'Does it work with Facebook Watch?', a: 'Yes. Facebook Watch links are supported when the content is publicly accessible.' },
  { q: 'Why does my download fail?', a: 'The video may be private, the link may be broken, or Facebook may have changed their video delivery system.' },
  { q: 'Can I extract audio from Facebook videos?', a: 'Yes. Toggle to Audio mode before downloading if you want the audio track only.' },
];

export default function HowToDownloadFacebookVideos() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="shell" style={{ maxWidth: 720, padding: '2rem 1rem 3rem' }}>
      <Helmet><title>Facebook Download Guide | {siteConfig.name}</title><meta name="description" content="Learn how to download Facebook videos and Reels." /><link rel="canonical" href={siteUrl('/how-to-download-facebook-videos')} /></Helmet>

      <div className="rounded-xl border p-6 text-center mb-8" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
        <div className="mx-auto inline-flex rounded-xl p-3 text-white mb-4" style={{ background: 'var(--brand-600)' }}><Share2 className="h-8 w-8" /></div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--ink-900)' }}>How to download Facebook videos</h1>
        <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--ink-600)' }}>A practical guide for public Facebook videos, Reels, and Watch content.</p>
        <Link to="/" className="btn-primary inline-flex mt-4 text-xs">Open downloader</Link>
      </div>

      <div className="card mb-8">
        <h2 className="text-sm font-bold" style={{ color: 'var(--ink-900)' }}>Basic workflow</h2>
        <ol className="mt-3 space-y-3">
          {steps.map((s, i) => (
            <li key={i} className="flex gap-3 text-xs leading-relaxed" style={{ color: 'var(--ink-600)' }}>
              <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 mt-0.5" style={{ background: 'var(--brand-600)' }}>{i + 1}</span>
              {s}
            </li>
          ))}
        </ol>
      </div>

      <div className="card mb-8">
        <h2 className="text-sm font-bold" style={{ color: 'var(--ink-900)' }}>Good link types</h2>
        <ul className="mt-3 space-y-2">
          {goodLinks.map(l => <li key={l} className="text-xs font-mono" style={{ color: 'var(--ink-600)' }}>{l}</li>)}
        </ul>
      </div>

      <div className="card mb-8">
        <h2 className="text-sm font-bold" style={{ color: 'var(--ink-900)' }}>What to expect</h2>
        <ul className="mt-3 space-y-2">
          {features.map(f => <li key={f} className="flex items-start gap-2 text-xs leading-relaxed" style={{ color: 'var(--ink-600)' }}><span className="w-1.5 h-1.5 rounded-full mt-1 shrink-0" style={{ background: 'var(--brand-500)' }} />{f}</li>)}
        </ul>
      </div>

      <div className="card mb-8">
        <h2 className="text-sm font-bold" style={{ color: 'var(--ink-900)' }}>Common failure causes</h2>
        <ul className="mt-3 space-y-2">
          {failures.map(f => <li key={f} className="flex items-start gap-2 text-xs leading-relaxed" style={{ color: 'var(--ink-600)' }}><LinkIcon className="h-3 w-3 mt-0.5 shrink-0" style={{ color: 'var(--brand-500)' }} />{f}</li>)}
        </ul>
      </div>

      <div className="space-y-2">
        <h2 className="text-sm font-bold mb-3" style={{ color: 'var(--ink-900)' }}>FAQ</h2>
        {faqs.map((f, i) => {
          const isOpen = open === i;
          return (
            <article key={f.q} className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <button onClick={() => setOpen(isOpen ? null : i)} className="flex w-full items-center justify-between gap-4 p-3 text-left">
                <span className="text-xs font-semibold" style={{ color: 'var(--ink-900)' }}>{f.q}</span>
                <ChevronDown className={`h-3.5 w-3.5 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} style={{ color: 'var(--ink-400)' }} />
              </button>
              <div className={`grid transition-all duration-200 ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden px-3 pb-3"><p className="text-xs leading-relaxed" style={{ color: 'var(--ink-600)' }}>{f.a}</p></div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}