import { useState } from 'react';
import { AlertTriangle, CheckCircle2, ChevronDown, Globe2, Music4, PlayCircle, RefreshCw, ShieldCheck, Smartphone, Sparkles, Video, Zap } from 'lucide-react';

const capabilities = [
  { title: 'Broad platform coverage', desc: 'SwiftDL accepts many yt-dlp-compatible public links across social, video, and audio sites while keeping failures clear.', icon: Globe2 },
  { title: 'Video and audio modes', desc: 'Keep the original media flow simple by choosing a video or audio output before processing.', icon: Video },
  { title: 'Mobile-ready saves', desc: 'The responsive interface keeps the same controls available on desktop, tablet, and phone.', icon: Smartphone },
  { title: 'Clear result actions', desc: 'Download, copy, or share the prepared file link from one focused result state.', icon: Sparkles },
  { title: 'Local browser history', desc: 'Recent items are stored on your device, giving you quick repeat access without account friction.', icon: RefreshCw },
  { title: 'Transparent limits', desc: 'Private, expired, restricted, or DRM-protected content can fail depending on the source platform.', icon: AlertTriangle },
];

const steps = [
  { title: 'Copy', desc: 'Use the public share link from the source platform.' },
  { title: 'Choose', desc: 'Select video or audio before the request is processed.' },
  { title: 'Save', desc: 'Use the result actions to download, copy, or share.' },
];

const platforms = [
  { name: 'Social', items: ['Instagram Reels and posts', 'Facebook Watch and reels', 'TikTok public videos', 'X public video posts'] },
  { name: 'Video', items: ['Vimeo public videos', 'Dailymotion links', 'Reddit hosted media', 'Twitch clips where available'] },
  { name: 'Audio', items: ['SoundCloud tracks', 'Podcast-compatible pages', 'Music clips where streams are exposed', 'Audio extraction from supported videos'] },
];

const trust = [
  { title: 'Public content first', desc: 'The service is designed for media you already have permission to access.', icon: ShieldCheck },
  { title: 'No local history sync', desc: 'Browser history stays in local storage on the current device.', icon: RefreshCw },
  { title: 'Source-aware failures', desc: 'Some platforms change frequently, so unsupported links fail with a clear message.', icon: Zap },
];

const faqData = [
  { q: 'Is SwiftDL free to use?', a: 'Yes. SwiftDL includes a free browser workflow. Premium plans can increase limits and remove ads when billing is configured.' },
  { q: 'Can I download Instagram Reels?', a: 'Public Instagram Reels and post videos can work when the source exposes a compatible stream.' },
  { q: 'Does SwiftDL convert video to audio?', a: 'Yes. Select Audio before processing the link to request an audio output where available.' },
  { q: 'Why did a link fail?', a: 'The video may be private, removed, expired, protected by DRM, or affected by platform changes.' },
  { q: 'Does it work on mobile?', a: 'Yes. The interface is responsive and can also be installed as a browser PWA on supported devices.' },
  { q: 'Where is history stored?', a: 'Recent download history is stored in your browser local storage on this device.' },
];

export default function HomeSeoContent() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="border-t" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
      <section className="shell-wide grid gap-10 py-14 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
        <div>
          <span className="tag"><Sparkles className="h-4 w-4" /> Download workflow</span>
          <h2 className="mt-4 text-3xl font-extrabold sm:text-4xl">A focused interface for public media links.</h2>
          <p className="mt-4 max-w-xl text-base leading-7" style={{ color: 'var(--ink-600)' }}>
            SwiftDL brings link input, format choice, extraction status, result actions, and recent downloads into one consistent browser experience.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {steps.map((step, index) => (
              <div key={step.title} className="flex gap-3 rounded-lg border p-4" style={{ borderColor: 'var(--border)', background: 'var(--surface-soft)' }}>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-sm font-extrabold text-white" style={{ background: 'var(--brand-600)' }}>{index + 1}</span>
                <div>
                  <h3 className="text-sm font-bold">{step.title}</h3>
                  <p className="mt-1 text-sm leading-6" style={{ color: 'var(--ink-600)' }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {capabilities.map(capability => (
            <article key={capability.title} className="card card-hover">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md" style={{ background: 'var(--brand-50)', color: 'var(--brand-700)' }}>
                <capability.icon className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold">{capability.title}</h3>
              <p className="mt-2 text-sm leading-6" style={{ color: 'var(--ink-600)' }}>{capability.desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y" style={{ borderColor: 'var(--border)', background: 'var(--canvas)' }}>
        <div className="shell-wide py-14">
          <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="tag"><PlayCircle className="h-4 w-4" /> Compatibility</span>
              <h2 className="mt-3 text-2xl font-extrabold sm:text-3xl">Common source categories</h2>
            </div>
            <p className="max-w-xl text-sm leading-6" style={{ color: 'var(--ink-600)' }}>
              Results depend on the exact URL, platform restrictions, and whether the media stream is publicly available.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {platforms.map(group => (
              <article key={group.name} className="card">
                <div className="mb-4 flex items-center gap-3 border-b pb-4" style={{ borderColor: 'var(--border)' }}>
                  <div className="flex h-10 w-10 items-center justify-center rounded-md" style={{ background: 'var(--brand-50)', color: 'var(--brand-700)' }}>
                    {group.name === 'Audio' ? <Music4 className="h-5 w-5" /> : <Globe2 className="h-5 w-5" />}
                  </div>
                  <h3 className="text-lg font-bold">{group.name}</h3>
                </div>
                <ul className="space-y-2">
                  {group.items.map(item => (
                    <li key={item} className="flex items-start gap-2 text-sm leading-6" style={{ color: 'var(--ink-600)' }}>
                      <CheckCircle2 className="mt-1 h-4 w-4 shrink-0" style={{ color: 'var(--brand-600)' }} />
                      {item}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="shell-wide py-14">
        <div className="rounded-lg p-6 sm:p-8" style={{ background: 'var(--ink-heavy)' }}>
          <div className="mb-8 max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-md border px-2.5 py-1 text-xs font-semibold" style={{ borderColor: 'rgba(255,255,255,0.18)', color: '#a7fff3' }}>
              <ShieldCheck className="h-4 w-4" /> Trust model
            </span>
            <h2 className="mt-4 text-2xl font-extrabold text-white sm:text-3xl">Responsible downloading, clear boundaries.</h2>
            <p className="mt-3 text-sm leading-6" style={{ color: 'rgba(255,255,255,0.68)' }}>
              SwiftDL is built around honest outcomes: public links work best, protected content is not bypassed, and the UI keeps failures understandable.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {trust.map(item => (
              <article key={item.title} className="rounded-lg border p-5" style={{ borderColor: 'rgba(255,255,255,0.14)', background: 'rgba(255,255,255,0.07)' }}>
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md" style={{ background: 'rgba(94,234,212,0.14)', color: '#a7fff3' }}>
                  <item.icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-white">{item.title}</h3>
                <p className="mt-2 text-sm leading-6" style={{ color: 'rgba(255,255,255,0.66)' }}>{item.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="shell py-14">
        <div className="mx-auto mb-7 max-w-2xl text-center">
          <span className="tag">FAQ</span>
          <h2 className="mt-3 text-2xl font-extrabold sm:text-3xl">Frequently asked questions</h2>
        </div>
        <div className="mx-auto max-w-3xl space-y-2">
          {faqData.map((faq, index) => {
            const isOpen = open === index;
            return (
              <article key={faq.q} className="rounded-lg border" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
                <button onClick={() => setOpen(isOpen ? null : index)} className="flex w-full items-center justify-between gap-4 p-4 text-left">
                  <span className="text-sm font-bold" style={{ color: 'var(--ink-900)' }}>{faq.q}</span>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md" style={{ background: isOpen ? 'var(--brand-50)' : 'var(--surface-soft)', color: isOpen ? 'var(--brand-700)' : 'var(--ink-500)' }}>
                    <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </span>
                </button>
                <div className={`grid transition-all duration-200 ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                  <div className="overflow-hidden px-4 pb-4">
                    <p className="text-sm leading-6" style={{ color: 'var(--ink-600)' }}>{faq.a}</p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
