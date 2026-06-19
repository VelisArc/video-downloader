import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { ChevronDown, Instagram, Link as LinkIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { siteConfig, siteUrl } from '../lib/site';

const steps = [
  'Open Instagram and find the Reel or post video you want to download.',
  'Tap the Share icon (paper airplane) below the post.',
  'Select "Copy Link" from the share menu.',
  'Come back to SwiftDL and paste the link into the input field above.',
  'Choose "Video" as your format, then click Download.',
  'Wait for processing, then save the file to your device.',
];

const features = [
  'Audio extraction when the source stream includes a compatible audio track',
  'Public links only — private or friends-only posts are not accessible',
  'Works on both mobile and desktop browsers without any app',
  'Watermark-free downloads when extracting the raw video file',
  'Carousel posts: SwiftDL handles the first video or image in the carousel',
  'Stories: may work if the link is copied while the story is still active (24 hr window)',
];

const troubleshooting = [
  'Make sure the link starts with https://www.instagram.com/reel/ or /p/',
  'If the download fails, the post may be private or the link may be expired',
  'Instagram may occasionally change their API, causing temporary issues',
  'Very old posts may not have accessible media streams anymore',
  'Rate limiting: if you download too many videos quickly, Instagram may block requests temporarily',
];

const faqs = [
  { q: 'Does it work with private Instagram accounts?', a: 'No. We can only process public posts. Private account content is not accessible through our tool.' },
  { q: 'Can I download Instagram Stories?', a: 'Stories may work if you copy the link while the story is still live (within 24 hours). However, stories are less reliable than Reels or posts.' },
  { q: 'Does it download Instagram profile pictures?', a: 'No. Profile pictures and other non-video/non-audio content are not supported.' },
  { q: 'Why does my download fail?', a: 'The post may be private, the link may be expired, or Instagram may have changed their platform structure.' },
  { q: 'Can I download audio only from Instagram?', a: 'Yes, if the source post has a compatible audio stream, you can toggle to Audio mode before downloading.' },
];

export default function HowToDownloadInstagramReels() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="shell" style={{ maxWidth: 720, padding: '2rem 1rem 3rem' }}>
      <Helmet><title>Instagram Download Guide | {siteConfig.name}</title><meta name="description" content="Learn how to download Instagram Reels and post videos." /><link rel="canonical" href={siteUrl('/how-to-download-instagram-reels')} /></Helmet>

      <div className="rounded-xl border p-6 text-center mb-8" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
        <div className="mx-auto inline-flex rounded-xl p-3 text-white mb-4" style={{ background: 'linear-gradient(135deg, #e1306c, #f77737)' }}><Instagram className="h-8 w-8" /></div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--ink-900)' }}>How to download Instagram Reels</h1>
        <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--ink-600)' }}>A simple guide for downloading public Instagram Reels and post videos.</p>
        <Link to="/" className="btn-primary inline-flex mt-4 text-xs">Open downloader</Link>
      </div>

      <div className="card mb-8">
        <h2 className="text-sm font-bold" style={{ color: 'var(--ink-900)' }}>Step-by-step workflow</h2>
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
        <h2 className="text-sm font-bold" style={{ color: 'var(--ink-900)' }}>What to expect</h2>
        <ul className="mt-3 space-y-2">
          {features.map(f => <li key={f} className="flex items-start gap-2 text-xs leading-relaxed" style={{ color: 'var(--ink-600)' }}><span className="w-1.5 h-1.5 rounded-full mt-1 shrink-0" style={{ background: 'var(--brand-500)' }} />{f}</li>)}
        </ul>
      </div>

      <div className="card mb-8">
        <h2 className="text-sm font-bold" style={{ color: 'var(--ink-900)' }}>Troubleshooting tips</h2>
        <ul className="mt-3 space-y-2">
          {troubleshooting.map(t => <li key={t} className="flex items-start gap-2 text-xs leading-relaxed" style={{ color: 'var(--ink-600)' }}><LinkIcon className="h-3 w-3 mt-0.5 shrink-0" style={{ color: 'var(--brand-500)' }} />{t}</li>)}
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