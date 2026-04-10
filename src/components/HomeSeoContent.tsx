import { useState } from 'react';
import {
  CheckCircle2,
  ChevronDown,
  Cookie,
  Globe2,
  Lock,
  MonitorSmartphone,
  ShieldCheck,
  Sparkles,
  Video,
} from 'lucide-react';

const capabilityCards = [
  {
    title: 'Broader platform coverage',
    description:
      'SwiftDL now accepts many more yt-dlp-compatible platforms while still keeping the workflow grounded in what the source extractor can reliably expose.',
    icon: Globe2,
  },
  {
    title: 'Clean browser workflow',
    description:
      'No extensions, installers, or APKs are required. Paste the link, choose video or audio, and save the result directly from your browser.',
    icon: MonitorSmartphone,
  },
  {
    title: 'Saved cookie vault when needed',
    description:
      'If a link requires login and you are already allowed to see it, logged-in users can save cookies and let auto-match choose the best session, while premium plans unlock more saved slots.',
    icon: Cookie,
  },
  {
    title: 'Privacy-minded handling',
    description:
      'SwiftDL does not keep copies of downloaded media on the public site. Recent items are stored in your browser only for quick access.',
    icon: ShieldCheck,
  },
];

const workflowSteps = [
  {
    title: 'Copy a supported link',
    description:
      'Open a public or authorized video page on a supported platform and copy the direct share link.',
  },
  {
    title: 'Paste and choose the format',
    description:
      'Use the main downloader above, decide whether you want video or audio, and enable Cookies Mode only if the link needs account access.',
  },
  {
    title: 'Review the preview card',
    description:
      'SwiftDL fetches the title, thumbnail, uploader, and other metadata before you trigger the final save action.',
  },
  {
    title: 'Download to your device',
    description:
      'Save the file locally. If the browser previews the media instead of auto-saving, use Save video as or long-press on mobile.',
  },
];

const supportedContent = [
  {
    platform: 'Public links across major platforms',
    items: [
      'Instagram, Facebook, YouTube, TikTok, X, Reddit, Vimeo, Twitch, and many other yt-dlp-compatible URLs',
      'Video and audio extraction when the source exposes compatible streams',
      'Cleaner preview flow with title, thumbnail, uploader, and format details',
      'Graceful failure when a platform blocks or does not expose direct media',
    ],
  },
  {
    platform: 'Premium cookie workflows',
    items: [
      'Save multiple cookies per user across different accounts and platforms',
      'Auto-match tries exact domains first, then same-platform sessions, then fallbacks',
      'Delete expired cookies or clear the vault whenever you need',
      'Only works for media you are already authorized to view',
    ],
  },
];

const trustNotes = [
  {
    title: 'What SwiftDL is for',
    copy:
      'SwiftDL is designed for personal offline access, creator self-archiving, review workflows, and legitimate internal reference use.',
    icon: Sparkles,
  },
  {
    title: 'What SwiftDL is not for',
    copy:
      'It should not be used to re-upload copyrighted work, bypass permissions you do not have, or automate large-scale scraping.',
    icon: Lock,
  },
  {
    title: 'When downloads fail',
    copy:
      'The most common causes are deleted posts, temporary platform rate limits, unsupported link variants, expired cookies, or links that require fresh authentication.',
    icon: Video,
  },
];

const faqs = [
  {
    question: 'Is SwiftDL free to use?',
    answer:
      'Yes. There is a free tier for public links, and some deployments also offer optional ad-free plans with higher or unlimited limits. The exact limits come from the current deployment configuration.',
  },
  {
    question: 'Does SwiftDL support private accounts?',
    answer:
      'By default, SwiftDL is optimized for public links. For certain login-required links, premium Cookies Mode may work if you already have permission to view the content and provide a fresh cookies.txt export from your own session.',
  },
  {
    question: 'Can I save only the audio?',
    answer:
      'Yes. Switch the format toggle to audio before fetching the link. SwiftDL will request the best available audio stream exposed by the source.',
  },
  {
    question: 'Why does a direct download link stop working later?',
    answer:
      'Many platforms generate time-limited media URLs. They can expire after some time, so it is best to save the file locally rather than rely on the temporary source link.',
  },
  {
    question: 'Do I need an app on iPhone or Android?',
    answer:
      'No. SwiftDL runs in the browser and can also be installed as a lightweight web app through your browser install flow.',
  },
  {
    question: 'Where are recent downloads stored?',
    answer:
      'The Recent Downloads section is stored locally in your browser. Clearing browser storage or using private browsing can remove that history.',
  },
  {
    question: 'Will SwiftDL always return HD?',
    answer:
      'SwiftDL requests the best usable source that the platform exposes. Final quality depends on what the original platform makes available for that specific link.',
  },
  {
    question: 'What if the platform rate-limits me?',
    answer:
      'Wait a little and retry. Social platforms sometimes throttle repeated requests. In some cases a fresh authenticated session through Cookies Mode can help if you are already authorized.',
  },
  {
    question: 'Does SwiftDL keep copies of media on the server?',
    answer:
      'The public workflow is designed to fetch metadata and a downloadable media URL, not to build a permanent hosted library of user content.',
  },
  {
    question: 'Can teams use SwiftDL internally?',
    answer:
      'Yes, many teams use tools like this for internal review, archiving approved brand assets, and offline reference. They should still respect copyright and platform terms.',
  },
];

export default function HomeSeoContent() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="section-shell py-16 md:py-20">
      <section className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div className="space-y-6">
          <span className="section-eyebrow">Built for dependable saves</span>
          <h2 className="max-w-3xl text-balance text-4xl font-black text-[var(--ink-900)] md:text-5xl">
            A stronger download workflow for people who care about clarity,
            control, and clean output.
          </h2>
          <div className="max-w-3xl space-y-4 text-base leading-8 text-[var(--ink-600)]">
            <p>
              SwiftDL is not trying to make impossible promises, but it is no
              longer limited to only Instagram and Facebook either. It now
              supports a wider set of yt-dlp-compatible links that people
              genuinely need to save for offline viewing, creator review,
              internal reference, or approved archival use.
            </p>
            <p>
              That broader scope still leaves room for quality control. The app
              can explain what is supported, surface metadata before you click,
              offer an audio workflow when a source allows it, and give premium
              users a safer multi-cookie path for links they are already
              authorized to view.
            </p>
          </div>
        </div>

        <div className="rounded-[32px] border border-[var(--border-soft)] bg-[linear-gradient(160deg,_rgba(255,255,255,0.92),_rgba(255,244,236,0.98))] p-7 shadow-[var(--shadow-soft)]">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--brand-700)]">
            Capability snapshot
          </p>
          <div className="mt-5 space-y-4">
            {capabilityCards.map(({ title, description, icon: Icon }) => (
              <article
                key={title}
                className="rounded-3xl border border-[var(--border-soft)] bg-white p-5"
              >
                <div className="flex items-start gap-4">
                  <div className="rounded-2xl bg-[var(--surface-soft)] p-3 text-[var(--brand-600)]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[var(--ink-900)]">
                      {title}
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-[var(--ink-600)]">
                      {description}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-16 rounded-[36px] border border-[var(--border-soft)] bg-white px-6 py-8 shadow-[0_18px_44px_rgba(31,34,51,0.06)] md:px-8 md:py-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="section-eyebrow">How it works</span>
            <h2 className="mt-4 text-3xl font-black text-[var(--ink-900)] md:text-4xl">
              A cleaner four-step process
            </h2>
          </div>
          <p className="max-w-2xl text-sm leading-7 text-[var(--ink-600)]">
            This flow is intentionally simple so the same path works on desktop,
            Android, iPhone, and tablet browsers.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {workflowSteps.map((step, index) => (
            <article
              key={step.title}
              className="rounded-3xl bg-[var(--surface-elevated)] p-5"
            >
              <div className="mb-5 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-sm font-bold text-[var(--brand-700)] shadow-sm">
                {index + 1}
              </div>
              <h3 className="text-lg font-bold text-[var(--ink-900)]">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-[var(--ink-600)]">
                {step.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-16 grid gap-6 lg:grid-cols-2">
        {supportedContent.map((section) => (
          <article
            key={section.platform}
            className="feature-card rounded-[32px] p-7"
          >
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-[var(--surface-soft)] p-3 text-[var(--brand-600)]">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <h2 className="text-2xl font-black text-[var(--ink-900)]">
                {section.platform}
              </h2>
            </div>
            <ul className="mt-6 space-y-3">
              {section.items.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-sm leading-6 text-[var(--ink-600)]"
                >
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none text-[var(--brand-600)]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      <section className="mt-16 rounded-[36px] bg-[linear-gradient(135deg,_#1f2233,_#2f344d)] px-6 py-8 text-white shadow-[0_24px_60px_rgba(31,34,51,0.24)] md:px-8 md:py-10">
        <div className="max-w-3xl">
          <span className="rounded-full border border-white/20 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/80">
            Responsible use
          </span>
          <h2 className="mt-4 text-3xl font-black md:text-4xl">
            Stronger tools only work when the rules are clear.
          </h2>
          <p className="mt-4 text-sm leading-7 text-white/75 md:text-base">
            SwiftDL is meant to help people save media they are allowed to
            access. That includes your own uploads, approved internal reference
            files, public links for offline viewing, and restricted links where
            you already have permission and explicitly provide your own session
            cookies.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {trustNotes.map(({ title, copy, icon: Icon }) => (
            <article
              key={title}
              className="rounded-3xl border border-white/10 bg-white/5 p-5"
            >
              <div className="mb-4 inline-flex rounded-2xl bg-white/10 p-3 text-[var(--accent-200)]">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-white/72">{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-16">
        <div className="mx-auto max-w-3xl text-center">
          <span className="section-eyebrow">Deep FAQ</span>
          <h2 className="mt-4 text-3xl font-black text-[var(--ink-900)] md:text-4xl">
            Questions people usually ask before they trust a downloader
          </h2>
          <p className="mt-4 text-sm leading-7 text-[var(--ink-600)] md:text-base">
            These answers keep the product grounded in what it actually does
            well, instead of making promises the platform may not support.
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-4xl space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;

            return (
              <article
                key={faq.question}
                className={`overflow-hidden rounded-[28px] border bg-white transition-all ${
                  isOpen
                    ? 'border-[var(--border-strong)] shadow-[0_18px_36px_rgba(31,34,51,0.08)]'
                    : 'border-[var(--border-soft)]'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="flex w-full items-start justify-between gap-4 px-6 py-5 text-left"
                >
                  <span className="text-sm font-semibold leading-6 text-[var(--ink-900)] md:text-base">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`mt-1 h-5 w-5 flex-none text-[var(--brand-600)] transition-transform ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <div
                  className={`overflow-hidden px-6 transition-all duration-300 ${
                    isOpen ? 'max-h-80 pb-5 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <p className="border-t border-[var(--border-soft)] pt-4 text-sm leading-7 text-[var(--ink-600)]">
                    {faq.answer}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
