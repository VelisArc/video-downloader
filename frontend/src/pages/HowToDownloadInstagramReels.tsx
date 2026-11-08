import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { AlertTriangle, ArrowRight, CheckCircle2, ChevronDown, Instagram, Link as LinkIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { siteConfig, siteUrl } from '../lib/site';

const steps = [
  'Open Instagram and find the Reel or post video you want to download.',
  'Tap the Share icon (paper airplane) below the post.',
  'Select "Copy Link" from the share menu.',
  'Come back to ShareHub and paste the link into the input field above.',
  'Choose "Video" as your format, then click Download.',
  'Wait for processing, then save the file to your device.',
];

const features = [
  'Audio extraction when the source stream includes a compatible audio track',
  'Public links only — private or friends-only posts are not accessible',
  'Works on both mobile and desktop browsers without any app',
  'Watermark-free downloads when extracting the raw video file',
  'Carousel posts: ShareHub handles the first video or image in the carousel',
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
    <div style={{ background: 'var(--canvas)' }}>
      <Helmet><title>Instagram Download Guide | {siteConfig.name}</title><meta name="description" content="Learn how to download Instagram Reels and post videos." /><link rel="canonical" href={siteUrl('/how-to-download-instagram-reels')} /></Helmet>

      {/* Hero --------------------------------------------------------------- */}
      <header className="hero-canvas">
        <span className="aurora-orb aurora-orb--one" aria-hidden />
        <span className="aurora-orb aurora-orb--two" aria-hidden />
        <div className="shell relative">
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-5 px-1 py-14 text-center sm:py-20">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-2xl text-white sm:h-[4.5rem] sm:w-[4.5rem]"
              style={{ background: 'var(--grad-brand)', boxShadow: 'var(--glow-brand)' }}
            >
              <Instagram className="h-8 w-8 sm:h-9 sm:w-9" aria-hidden />
            </div>
            <span className="eyebrow mono" style={{ color: 'var(--brand-300)' }}>Instagram · Guide</span>
            <h1 className="text-balance text-3xl font-extrabold leading-[1.08] text-white sm:text-5xl">
              How to download <span className="gradient-text">Instagram Reels</span>
            </h1>
            <p className="max-w-xl text-[15px] leading-7 sm:text-base" style={{ color: 'var(--brand-200)' }}>
              A simple guide for downloading public Instagram Reels and post videos.
            </p>
            <Link to="/" className="btn-primary min-h-11 px-6 text-sm">
              Open downloader <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>
      </header>

      {/* Steps timeline ------------------------------------------------------- */}
      <section className="shell mx-auto max-w-3xl px-4 pt-12 sm:px-6 sm:pt-16">
        <span className="eyebrow mono">Workflow</span>
        <h2 className="section-heading">Step-by-step workflow</h2>

        <div className="relative mt-8 space-y-3 sm:space-y-4">
          <span className="absolute bottom-7 left-5 top-7 w-px sm:left-6" style={{ background: 'var(--grad-brand)' }} aria-hidden />
          {steps.map((s, i) => (
            <div
              key={i}
              className="relative flex items-start gap-4 rounded-2xl border p-4 transition-all duration-200 hover:shadow-sm sm:gap-5 sm:p-5"
              style={{ borderColor: 'var(--border)', background: 'var(--surface)', boxShadow: 'var(--shadow-xs)' }}
            >
              <span
                className="mono relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white sm:h-12 sm:w-12 sm:text-base"
                style={{ background: 'var(--grad-brand)', boxShadow: 'var(--glow-violet)' }}
                aria-hidden
              >
                {i + 1}
              </span>
              <p className="break-words pt-1.5 text-[15px] leading-7 sm:pt-2.5 sm:text-base" style={{ color: 'var(--ink-700)' }}>
                {s}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* What to expect — success callout ------------------------------------- */}
      <section className="shell mx-auto max-w-3xl px-4 pt-8 sm:px-6 sm:pt-10">
        <div
          className="rounded-2xl border p-5 sm:p-6"
          style={{ background: 'var(--success-100)', borderColor: 'color-mix(in srgb, var(--success-500) 38%, var(--border))' }}
        >
          <div className="flex items-center gap-3">
            <span
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
              style={{ background: 'color-mix(in srgb, var(--success-500) 18%, transparent)', color: 'var(--success-600)' }}
            >
              <CheckCircle2 className="h-5 w-5" aria-hidden />
            </span>
            <h2 className="text-lg font-bold sm:text-xl" style={{ color: 'var(--ink-900)' }}>What to expect</h2>
          </div>
          <ul className="mt-4 space-y-2.5">
            {features.map(f => (
              <li key={f} className="flex items-start gap-2.5 text-[15px] leading-7 sm:text-base" style={{ color: 'var(--ink-800)' }}>
                <CheckCircle2 className="mt-1 h-4 w-4 shrink-0" style={{ color: 'var(--success-600)' }} aria-hidden />
                <span className="break-words">{f}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Troubleshooting — warning callout ------------------------------------ */}
      <section className="shell mx-auto max-w-3xl px-4 pt-6 sm:px-6 sm:pt-8">
        <div
          className="rounded-2xl border p-5 sm:p-6"
          style={{ background: 'var(--warning-100)', borderColor: 'color-mix(in srgb, var(--warning-500) 42%, var(--border))' }}
        >
          <div className="flex items-center gap-3">
            <span
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
              style={{ background: 'color-mix(in srgb, var(--warning-500) 20%, transparent)', color: 'var(--warning-600)' }}
            >
              <AlertTriangle className="h-5 w-5" aria-hidden />
            </span>
            <h2 className="text-lg font-bold sm:text-xl" style={{ color: 'var(--ink-900)' }}>Troubleshooting tips</h2>
          </div>
          <ul className="mt-4 space-y-2.5">
            {troubleshooting.map(t => (
              <li key={t} className="flex items-start gap-2.5 text-[15px] leading-7 sm:text-base" style={{ color: 'var(--ink-800)' }}>
                <LinkIcon className="mt-1 h-4 w-4 shrink-0" style={{ color: 'var(--warning-600)' }} aria-hidden />
                <span className="break-words">{t}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* FAQ ------------------------------------------------------------------ */}
      <section className="shell mx-auto max-w-3xl px-4 pt-12 sm:px-6 sm:pt-16">
        <span className="eyebrow mono">Questions</span>
        <h2 className="section-heading">FAQ</h2>

        <div className="mt-6 space-y-2.5 sm:space-y-3">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <article
                key={f.q}
                className="overflow-hidden rounded-2xl border transition-all duration-200"
                style={{
                  borderColor: isOpen ? 'color-mix(in srgb, var(--brand-600) 35%, var(--border))' : 'var(--border)',
                  background: 'var(--surface)',
                  boxShadow: isOpen ? 'var(--shadow-sm)' : 'var(--shadow-xs)',
                }}
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex min-h-11 w-full items-center justify-between gap-4 p-4 text-left sm:p-5"
                  aria-expanded={isOpen}
                >
                  <span className="break-words text-[15px] font-bold leading-snug sm:text-base" style={{ color: 'var(--ink-900)' }}>{f.q}</span>
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all duration-200"
                    style={{ background: isOpen ? 'var(--grad-brand)' : 'var(--surface-soft)', color: isOpen ? 'white' : 'var(--ink-500)' }}
                  >
                    <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} aria-hidden />
                  </span>
                </button>
                <div className={`grid transition-all duration-200 ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                  <div className="overflow-hidden">
                    <p className="break-words border-t px-4 pb-4 pt-4 text-[15px] leading-7 sm:px-5 sm:pb-5 sm:text-base" style={{ borderColor: 'var(--border)', color: 'var(--ink-600)' }}>{f.a}</p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Feathered CTA --------------------------------------------------------- */}
      <section className="shell mx-auto max-w-3xl px-4 pb-16 pt-12 sm:px-6 sm:pb-20 sm:pt-16">
        <div
          className="relative overflow-hidden rounded-3xl border px-6 py-10 text-center sm:px-10 sm:py-12"
          style={{ borderColor: 'color-mix(in srgb, var(--brand-500) 32%, var(--border))', background: 'var(--grad-brand-soft)', boxShadow: 'var(--shadow-sm)' }}
        >
          <span className="dot-grid pointer-events-none absolute inset-0" aria-hidden />
          <div className="relative">
            <span className="eyebrow mono">ShareHub</span>
            <h2 className="mt-3 text-2xl font-extrabold sm:text-3xl" style={{ color: 'var(--ink-900)' }}>Ready to download?</h2>
            <div className="mt-6 flex justify-center">
              <Link to="/" className="btn-primary min-h-11 px-7 text-sm">
                Open downloader <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
