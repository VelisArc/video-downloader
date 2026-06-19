import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  AlertTriangle,
  ChevronDown,
  Download,
  Lock,
  Monitor,
  PlayCircle,
  Share2,
  Wifi,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { siteConfig, siteUrl } from '../lib/site';

const faqs = [
  {
    question: 'Do Facebook reels and Watch links work?',
    answer:
      'Many public reel and Watch-style links work well. Reliability still depends on the exact link and what Facebook is exposing at that time.',
  },
  {
    question: 'Can I use SwiftDL for private groups or friends-only posts?',
    answer:
      'Those links usually need authentication. Cookies Mode may help only when you are already authorized to view the content and provide your own current session export.',
  },
  {
    question: 'Why does Facebook sometimes return a broken or incomplete result?',
    answer:
      'The post may have changed privacy settings, the media may be region-restricted, or Facebook may be temporarily rate-limiting repeated requests.',
  },
  {
    question: 'Can I save audio only from a Facebook video?',
    answer:
      'Yes, when the source provides a suitable audio stream. Choose the audio option before you submit the link.',
  },
  {
    question: 'Why is my Facebook download only 720p?',
    answer:
      'Facebook often restricts 1080p and higher resolutions to authenticated users on their official apps. Public APIs typically only expose up to 720p SD versions of the media.',
  },
  {
    question: 'Can I download Facebook live streams?',
    answer:
      'You cannot download a live broadcast while it is happening. Wait for the broadcast to finish and become a regular post or Watch video before attempting to download it.',
  },
  {
    question: 'How do I find the direct link on mobile?',
    answer:
      'Tap the "Share" button on the post or reel, then look for a "Copy Link" option. This will copy the direct URL to your clipboard.',
  },
  {
    question: 'What if the link says it has expired?',
    answer:
      'Facebook media URLs have expiration tokens. If a download fails with an expiration error, simply refresh the page and generate a new link through our tool.',
  },
  {
    question: 'Does this work for Facebook Stories?',
    answer:
      'Public stories can sometimes be processed if you have the exact direct link. However, because stories expire in 24 hours, they are inherently more difficult to process reliably.',
  },
  {
    question: 'Will the original creator be notified?',
    answer:
      'No. Our system retrieves the media passively. The creator will not receive any notification that their video was downloaded.',
  },
  {
    question: 'Can I download videos from Messenger?',
    answer:
      'No. Links from private Messenger chats are completely walled off and cannot be accessed by our systems, even with Cookies Mode.',
  },
  {
    question: 'What do I do if I get a 403 Forbidden error?',
    answer:
      'This means Facebook blocked the request. Trying again later or using Cookies Mode with a valid session are your best options.',
  },
];

export default function HowToDownloadFacebookVideos() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="section-shell max-w-5xl py-8">
      <Helmet>
        <title>Facebook Download Guide | {siteConfig.name}</title>
        <meta
          name="description"
          content="Learn how to save supported Facebook videos, reels, Watch links, and session-based media with a cleaner workflow."
        />
        <link rel="canonical" href={siteUrl('/how-to-download-facebook-videos')} />
      </Helmet>

      <section className="rounded-2xl border border-[var(--border-soft)] bg-[linear-gradient(135deg,_#eef5ff,_#ffffff)] p-5 shadow-[0_20px_48px_rgba(31,34,51,0.06)] md:p-6">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto inline-flex rounded-2xl bg-[linear-gradient(135deg,_#2563eb,_#38bdf8)] p-3 text-white shadow-lg">
            <Share2 className="h-8 w-8" />
          </div>
          <h1 className="mt-5 text-3xl font-black text-[var(--ink-900)] md:text-4xl">
            How to download Facebook videos and reels
          </h1>
          <p className="mt-4 text-base leading-8 text-[var(--ink-600)]">
            A practical guide for public Facebook links, replay content, and
            login-protected links that already belong to your own session.
          </p>
          <Link
            to="/"
            className="mt-4 inline-flex rounded-full bg-[#2563eb] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1d4ed8]"
          >
            Open downloader
          </Link>
        </div>
      </section>

      <section className="mt-8 grid gap-5 lg:grid-cols-2">
        <article className="feature-card">
          <div className="mb-4 inline-flex rounded-2xl bg-[var(--surface-soft)] p-3 text-[#2563eb]">
            <Download className="h-5 w-5" />
          </div>
          <h2 className="text-xl font-black text-[var(--ink-900)]">
            Basic workflow
          </h2>
          <ol className="mt-4 space-y-3 text-sm leading-7 text-[var(--ink-600)]">
            <li>1. Copy the direct Facebook or fb.watch link.</li>
            <li>2. Open SwiftDL in your browser.</li>
            <li>3. Paste it into the main input field.</li>
            <li>4. Choose whether you want the full video or just the audio track.</li>
            <li>5. If the link is session-protected and you already have access, use Cookies Mode with your own cookies.txt export.</li>
            <li>6. Click the Download button to begin metadata extraction.</li>
            <li>7. Wait for the server to process the URL and locate the best streams.</li>
            <li>8. Review the preview card (checking title and duration) and save the media locally.</li>
          </ol>
        </article>

        <article className="feature-card">
          <div className="mb-4 inline-flex rounded-2xl bg-[var(--surface-soft)] p-3 text-[#2563eb]">
            <PlayCircle className="h-5 w-5" />
          </div>
          <h2 className="text-xl font-black text-[var(--ink-900)]">
            Good link types
          </h2>
          <ul className="mt-4 space-y-3 text-sm leading-7 text-[var(--ink-600)]">
            <li>Public feed videos and reels</li>
            <li>Many Facebook Watch links</li>
            <li>Some replay content after live streams end</li>
            <li>Public group videos (if not region locked)</li>
            <li>Embedded Facebook video links from external articles</li>
            <li>fb.gg gaming clips and highlights</li>
            <li>Mobile (m.facebook.com) formatted links</li>
            <li>Some session-based links through Cookies Mode when already authorized</li>
          </ul>
        </article>
      </section>

      <section className="mt-8 grid gap-5 md:grid-cols-3">
        <article className="feature-card">
          <Monitor className="mb-4 h-5 w-5 text-[#2563eb]" />
          <h2 className="text-xl font-black text-[var(--ink-900)]">Desktop tips</h2>
          <p className="mt-3 text-sm leading-7 text-[var(--ink-600)]">
            Open the video in its own page before copying the address bar URL. That usually produces the cleanest link.
          </p>
        </article>
        <article className="feature-card">
          <Lock className="mb-4 h-5 w-5 text-[#2563eb]" />
          <h2 className="text-xl font-black text-[var(--ink-900)]">Private content</h2>
          <p className="mt-3 text-sm leading-7 text-[var(--ink-600)]">
            Cookies Mode is meant for content you can already view. It is not a shortcut around permissions you do not have.
          </p>
        </article>
        <article className="feature-card">
          <Wifi className="mb-4 h-5 w-5 text-[#2563eb]" />
          <h2 className="text-xl font-black text-[var(--ink-900)]">Rate limits</h2>
          <p className="mt-3 text-sm leading-7 text-[var(--ink-600)]">
            If repeated attempts fail, pause for a while and retry later. Facebook sometimes throttles repeated media lookups.
          </p>
        </article>
        <article className="feature-card">
          <Share2 className="mb-4 h-5 w-5 text-[#2563eb]" />
          <h2 className="text-xl font-black text-[var(--ink-900)]">Mobile links</h2>
          <p className="mt-3 text-sm leading-7 text-[var(--ink-600)]">
            If a link starts with "m.facebook", you can paste it directly. Our backend automatically normalizes mobile URLs for extraction.
          </p>
        </article>
        <article className="feature-card">
          <AlertTriangle className="mb-4 h-5 w-5 text-[#2563eb]" />
          <h2 className="text-xl font-black text-[var(--ink-900)]">Region locks</h2>
          <p className="mt-3 text-sm leading-7 text-[var(--ink-600)]">
            Videos locked to specific countries might fail unless your cookie export matches an account with access to that region.
          </p>
        </article>
        <article className="feature-card">
          <PlayCircle className="mb-4 h-5 w-5 text-[#2563eb]" />
          <h2 className="text-xl font-black text-[var(--ink-900)]">Browser previews</h2>
          <p className="mt-3 text-sm leading-7 text-[var(--ink-600)]">
            If clicking the final button plays the video instead of downloading, right-click (or long-press) and select "Save video as".
          </p>
        </article>
      </section>

      <section className="mt-8 rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-soft)] p-5">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-1 h-6 w-6 flex-none text-[#2563eb]" />
          <div>
        <h2 className="text-2xl font-black text-[var(--ink-900)]">
              Common failure causes
            </h2>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-[var(--ink-600)]">
              <li>The post was deleted or is no longer public.</li>
              <li>The copied URL was incomplete or missing characters.</li>
              <li>The content needs an authenticated session.</li>
              <li>The platform temporarily rate-limited the request.</li>
              <li>The video is from a closed Facebook group.</li>
              <li>The URL points to a live stream that is currently broadcasting.</li>
              <li>Your uploaded cookies have expired and need to be refreshed.</li>
              <li>Facebook changed their internal routing, requiring a backend update.</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-2xl font-black text-[var(--ink-900)]">
          Common questions
        </h2>
        <div className="mt-4 space-y-3">
          {faqs.map((faq, index) => (
            <article
              key={faq.question}
              className="overflow-hidden rounded-2xl border border-[var(--border-soft)] bg-white"
            >
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                className="flex w-full items-start justify-between gap-3 px-5 py-4 text-left"
              >
                <span className="text-sm font-semibold leading-6 text-[var(--ink-900)]">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`mt-1 h-5 w-5 flex-none text-[#2563eb] transition ${
                    openFaq === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <div
                className={`overflow-hidden px-6 transition-all ${
                  openFaq === index ? 'max-h-40 pb-5 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <p className="border-t border-[var(--border-soft)] pt-4 text-sm leading-7 text-[var(--ink-600)]">
                  {faq.answer}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
