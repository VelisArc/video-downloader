import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { AlertTriangle, ArrowRight, CheckCircle2, ChevronDown, Link2, Share2, Link as LinkIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { siteConfig, siteUrl } from '../lib/site';

const steps = [
  'Open Facebook and navigate to the video, Reel, or Watch content you want to save.',
  'Click or tap the Share button (three dots or arrow icon) on the post.',
  'Select "Copy Link" from the available options.',
  'Return to ShareHub and paste the copied URL into the input field.',
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
    <div style={{ background: 'var(--canvas)' }}>
      <Helmet><title>Facebook Download Guide | {siteConfig.name}</title><meta name="description" content="Learn how to download Facebook videos and Reels." /><link rel="canonical" href={siteUrl('/how-to-download-facebook-videos')} /></Helmet>

      {/* Hero --------------------------------------------------------------- */}
      <header className="hero-canvas">
        <span className="aurora-orb aurora-orb--one" aria-hidden />
        <span className="aurora-orb aurora-orb--two" aria-hidden />
        <span className="aurora-orb aurora-orb--three" aria-hidden />
        <div className="shell relative">
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-5 px-1 py-14 text-center sm:py-20">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-2xl text-white sm:h-[4.5rem] sm:w-[4.5rem]"
              style={{ background: 'var(--grad-brand)', boxShadow: 'var(--glow-brand)' }}
            >
              <Share2 className="h-8 w-8 sm:h-9 sm:w-9" aria-hidden />
            </div>
            <span className="eyebrow mono" style={{ color: 'var(--brand-300)' }}>Facebook · Guide</span>
            <h1 className="text-balance text-3xl font-extrabold leading-[1.08] text-white sm:text-5xl">
              How to download <span className="gradient-text">Facebook videos</span>
            </h1>
            <p className="max-w-xl text-[15px] leading-7 sm:text-base" style={{ color: 'var(--brand-200)' }}>
              A practical guide for public Facebook videos, Reels, and Watch content.
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
        <h2 className="section-heading">Basic workflow</h2>

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

      {/* Good link types ------------------------------------------------------- */}
      <section className="shell mx-auto max-w-3xl px-4 pt-8 sm:px-6 sm:pt-10">
        <div className="card sm:p-6">
          <div className="flex items-center gap-3">
            <span className="icon-tile">
              <Link2 className="h-5 w-5" aria-hidden />
            </span>
            <h2 className="text-lg font-bold sm:text-xl" style={{ color: 'var(--ink-900)' }}>Good link types</h2>
          </div>
          <ul className="mt-4 space-y-2">
            {goodLinks.map(l => (
              <li
                key={l}
                className="mono break-all rounded-xl border px-3.5 py-2.5 text-[13px] leading-6 sm:text-sm"
                style={{ borderColor: 'var(--border)', background: 'var(--surface-soft)', color: 'var(--ink-700)' }}
              >
                {l}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* What to expect — success callout ------------------------------------- */}
      <section className="shell mx-auto max-w-3xl px-4 pt-6 sm:px-6 sm:pt-8">
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

      {/* Common failure causes — warning callout -------------------------------- */}
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
            <h2 className="text-lg font-bold sm:text-xl" style={{ color: 'var(--ink-900)' }}>Common failure causes</h2>
          </div>
          <ul className="mt-4 space-y-2.5">
            {failures.map(f => (
              <li key={f} className="flex items-start gap-2.5 text-[15px] leading-7 sm:text-base" style={{ color: 'var(--ink-800)' }}>
                <LinkIcon className="mt-1 h-4 w-4 shrink-0" style={{ color: 'var(--warning-600)' }} aria-hidden />
                <span className="break-words">{f}</span>
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
