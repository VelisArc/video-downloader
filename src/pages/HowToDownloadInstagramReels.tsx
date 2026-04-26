import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  Download,
  Instagram,
  Lock,
  Music4,
  Smartphone,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { siteConfig, siteUrl } from '../lib/site';

const steps = [
  'Locate the reel, post, or IGTV video on Instagram.',
  'Tap the Share icon (paper airplane) and select "Copy Link".',
  'Open SwiftDL in your web browser.',
  'Paste the copied link into the main input field.',
  'Select "Video" or "Audio" depending on what you want to extract.',
  'If the content is age-restricted or private (and you follow the account), enable Cookies Mode.',
  'Upload your fresh cookies.txt file if using Cookies Mode.',
  'Click the primary download button to start extraction.',
  'Wait a few seconds for our servers to process the Instagram URL.',
  'Check the preview card to ensure the title and thumbnail match what you expect.',
  'Click the final save button presented in the result card.',
  'If the browser opens the video instead of saving it, use the browser\'s "Save Page As" or long-press context menu.',
];

const faqs = [
  {
    question: 'Can I use this for private accounts?',
    answer:
      'Public links are the main path. For some login-required links, Cookies Mode can help only if you already have permission to view the media and provide your own current cookies.txt export.',
  },
  {
    question: 'Can I download audio only?',
    answer:
      'Yes. Switch to the audio option before submitting the link and SwiftDL will request the best available audio stream.',
  },
  {
    question: 'Does Instagram know that I downloaded the reel?',
    answer:
      'The downloader workflow does not notify the creator by itself, but you should still respect creator rights and platform rules.',
  },
  {
    question: 'Why did the link stop working later?',
    answer:
      'Instagram media URLs are often temporary. Save the file locally instead of relying on the temporary direct media URL.',
  },
  {
    question: 'Can I download Instagram Stories?',
    answer:
      'Downloading stories is highly unreliable because they expire quickly and often require authentication. If you try, you must use the exact story URL and Cookies Mode.',
  },
  {
    question: 'Are there limits on how many reels I can download?',
    answer:
      'Yes, we enforce daily quotas to prevent abuse. If you are a free user, you can upgrade to a premium plan for higher limits.',
  },
  {
    question: 'Why is the video quality lower than on the app?',
    answer:
      'Instagram heavily compresses videos. We extract the highest quality stream the platform exposes to external applications, which may sometimes differ from the app playback.',
  },
  {
    question: 'Can I download carousel posts?',
    answer:
      'If a carousel post contains multiple videos, our current system usually extracts the first video in the gallery.',
  },
  {
    question: 'Why do I get a "Video not found" error?',
    answer:
      'This happens if the video was deleted, if the account went private, or if the URL was copied incorrectly.',
  },
  {
    question: 'Can I download IGTV videos?',
    answer:
      'Yes, IGTV links are supported using the exact same workflow as standard reels and posts.',
  },
  {
    question: 'Do I need to install a mobile app?',
    answer:
      'No. SwiftDL works entirely within your browser (Chrome, Safari, Firefox, etc.) without needing a dedicated mobile app.',
  },
  {
    question: 'Is it safe to use my Instagram cookies?',
    answer:
      'Cookies Mode is secure, but you should treat your cookies like a password. We encrypt them and only use them to access the media you request.',
  },
];

export default function HowToDownloadInstagramReels() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="section-shell max-w-5xl py-10">
      <Helmet>
        <title>Instagram Download Guide | {siteConfig.name}</title>
        <meta
          name="description"
          content="Learn the safest workflow for supported Instagram reels, post videos, audio extraction, and session-based links."
        />
        <link rel="canonical" href={siteUrl('/how-to-download-instagram-reels')} />
      </Helmet>

      <section className="rounded-[36px] border border-[var(--border-soft)] bg-[linear-gradient(135deg,_#fff5f1,_#ffffff)] p-6 shadow-[0_20px_48px_rgba(31,34,51,0.06)] md:p-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto inline-flex rounded-[28px] bg-[linear-gradient(135deg,_#f05f6b,_#f49c4d)] p-4 text-white shadow-lg">
            <Instagram className="h-8 w-8" />
          </div>
          <h1 className="mt-5 text-4xl font-black text-[var(--ink-900)] md:text-5xl">
            How to download Instagram reels and post media
          </h1>
          <p className="mt-4 text-base leading-8 text-[var(--ink-600)]">
            A clearer workflow for public Instagram links, creator archives, and
            session-based links you are already allowed to view.
          </p>
          <Link
            to="/"
            className="mt-6 inline-flex rounded-full bg-[var(--brand-600)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--brand-700)]"
          >
            Open downloader
          </Link>
        </div>
      </section>

      <section className="mt-10 grid gap-6 lg:grid-cols-[1fr_0.92fr]">
        <article className="rounded-[32px] border border-[var(--border-soft)] bg-white p-6 shadow-[0_16px_40px_rgba(31,34,51,0.05)]">
          <span className="section-eyebrow">Step by step</span>
          <h2 className="mt-4 text-3xl font-black text-[var(--ink-900)]">
            The simple workflow
          </h2>
          <div className="mt-6 space-y-4">
            {steps.map((step, index) => (
              <div key={step} className="flex gap-4 rounded-[24px] bg-[var(--surface-soft)] p-4">
                <div className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-white text-sm font-bold text-[var(--brand-700)] shadow-sm">
                  {index + 1}
                </div>
                <p className="text-sm leading-7 text-[var(--ink-600)]">{step}</p>
              </div>
            ))}
          </div>
        </article>

        <div className="space-y-6">
          <article className="feature-card">
            <div className="mb-4 inline-flex rounded-2xl bg-[var(--surface-soft)] p-3 text-[var(--brand-600)]">
              <Music4 className="h-5 w-5" />
            </div>
            <h2 className="text-2xl font-black text-[var(--ink-900)]">
              Audio extraction
            </h2>
            <p className="mt-3 text-sm leading-7 text-[var(--ink-600)]">
              If the source exposes an audio stream, SwiftDL can request it
              directly. This is useful for reference tracks, edits, or offline
              listening.
            </p>
          </article>

          <article className="feature-card">
            <div className="mb-4 inline-flex rounded-2xl bg-[var(--surface-soft)] p-3 text-[var(--brand-600)]">
              <Lock className="h-5 w-5" />
            </div>
            <h2 className="text-2xl font-black text-[var(--ink-900)]">
              Session-protected links
            </h2>
            <p className="mt-3 text-sm leading-7 text-[var(--ink-600)]">
              Cookies Mode is not a bypass for content you cannot access. It is
              only for links that already belong to your own authorized browser
              session.
            </p>
          </article>

          <article className="feature-card">
            <div className="mb-4 inline-flex rounded-2xl bg-[var(--surface-soft)] p-3 text-[var(--brand-600)]">
              <Smartphone className="h-5 w-5" />
            </div>
            <h2 className="text-2xl font-black text-[var(--ink-900)]">
              Mobile behavior
            </h2>
            <p className="mt-3 text-sm leading-7 text-[var(--ink-600)]">
              On iPhone or Android, the browser may preview the media first. Use
              the platform save action or long-press menu to store the file on
              your device.
            </p>
          </article>

          <article className="feature-card">
            <div className="mb-4 inline-flex rounded-2xl bg-[var(--surface-soft)] p-3 text-[var(--brand-600)]">
              <Lock className="h-5 w-5" />
            </div>
            <h2 className="text-2xl font-black text-[var(--ink-900)]">
              Watermark free
            </h2>
            <p className="mt-3 text-sm leading-7 text-[var(--ink-600)]">
              Unlike the in-app download feature, extracting reels via the direct link usually provides the original video without an added Instagram watermark.
            </p>
          </article>

          <article className="feature-card">
            <div className="mb-4 inline-flex rounded-2xl bg-[var(--surface-soft)] p-3 text-[var(--brand-600)]">
              <Music4 className="h-5 w-5" />
            </div>
            <h2 className="text-2xl font-black text-[var(--ink-900)]">
              Carousel Posts
            </h2>
            <p className="mt-3 text-sm leading-7 text-[var(--ink-600)]">
              For posts containing multiple images or videos, only the first valid media element in the gallery is typically extracted.
            </p>
          </article>

          <article className="feature-card">
            <div className="mb-4 inline-flex rounded-2xl bg-[var(--surface-soft)] p-3 text-[var(--brand-600)]">
              <Smartphone className="h-5 w-5" />
            </div>
            <h2 className="text-2xl font-black text-[var(--ink-900)]">
              Story Expiration
            </h2>
            <p className="mt-3 text-sm leading-7 text-[var(--ink-600)]">
              Stories disappear after 24 hours. Attempting to download a story link after it has expired will always result in an error.
            </p>
          </article>
        </div>
      </section>

      <section className="mt-10 rounded-[32px] border border-[var(--border-soft)] bg-[var(--surface-soft)] p-6">
        <div className="flex items-start gap-4">
          <AlertCircle className="mt-1 h-6 w-6 flex-none text-[var(--brand-700)]" />
          <div>
            <h2 className="text-2xl font-black text-[var(--ink-900)]">
              Troubleshooting tips
            </h2>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-[var(--ink-600)]">
              <li className="flex gap-3">
                <CheckCircle2 className="mt-1 h-4 w-4 flex-none text-[var(--brand-600)]" />
                Make sure you copied the direct reel or post link, not a partial share string.
              </li>
              <li className="flex gap-3">
                <CheckCircle2 className="mt-1 h-4 w-4 flex-none text-[var(--brand-600)]" />
                If the post is login-required, refresh your authenticated session and export fresh cookies.
              </li>
              <li className="flex gap-3">
                <CheckCircle2 className="mt-1 h-4 w-4 flex-none text-[var(--brand-600)]" />
                If the platform rate-limits requests, wait a little and retry with fewer repeated submissions.
              </li>
              <li className="flex gap-3">
                <CheckCircle2 className="mt-1 h-4 w-4 flex-none text-[var(--brand-600)]" />
                Verify the video has not been deleted or taken down for copyright reasons.
              </li>
              <li className="flex gap-3">
                <CheckCircle2 className="mt-1 h-4 w-4 flex-none text-[var(--brand-600)]" />
                Ensure you are not copying a profile link instead of a specific video link.
              </li>
              <li className="flex gap-3">
                <CheckCircle2 className="mt-1 h-4 w-4 flex-none text-[var(--brand-600)]" />
                Check if your premium plan daily limit has been reached in the Dashboard.
              </li>
              <li className="flex gap-3">
                <CheckCircle2 className="mt-1 h-4 w-4 flex-none text-[var(--brand-600)]" />
                Try opening the link in a private/incognito window to verify it is actually public.
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-3xl font-black text-[var(--ink-900)]">
          Common questions
        </h2>
        <div className="mt-6 space-y-4">
          {faqs.map((faq, index) => (
            <article
              key={faq.question}
              className="overflow-hidden rounded-[28px] border border-[var(--border-soft)] bg-white"
            >
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                className="flex w-full items-start justify-between gap-4 px-6 py-5 text-left"
              >
                <span className="text-sm font-semibold leading-6 text-[var(--ink-900)]">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`mt-1 h-5 w-5 flex-none text-[var(--brand-600)] transition ${
                    openFaq === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <div
                className={`overflow-hidden px-6 transition-all ${
                  openFaq === index ? 'max-h-60 pb-5 opacity-100' : 'max-h-0 opacity-0'
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
