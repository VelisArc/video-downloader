import { useState } from 'react';
import { AlertTriangle, ArrowRight, CheckCircle2, ChevronDown, Globe2, Music4, PlayCircle, RefreshCw, ShieldCheck, Smartphone, Sparkles, Video, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const capabilities = [
  { title: 'Broad platform coverage', desc: 'ShareHub accepts many yt-dlp-compatible public links across social, video, and audio sites while keeping failures clear.', icon: Globe2 },
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
  { q: 'Is ShareHub free to use?', a: 'Yes. ShareHub includes a free browser workflow. Premium plans can increase limits and remove ads when billing is configured.' },
  { q: 'Can I download Instagram Reels?', a: 'Public Instagram Reels and post videos can work when the source exposes a compatible stream.' },
  { q: 'Does ShareHub convert video to audio?', a: 'Yes. Select Audio before processing the link to request an audio output where available.' },
  { q: 'Why did a link fail?', a: 'The video may be private, removed, expired, protected by DRM, or affected by platform changes.' },
  { q: 'Does it work on mobile?', a: 'Yes. The interface is responsive and can also be installed as a browser PWA on supported devices.' },
  { q: 'Where is history stored?', a: 'Recent download history is stored in your browser local storage on this device.' },
];

export default function HomeSeoContent() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div>
      {/* Workflow + capabilities -------------------------------------------- */}
      <section className="border-t" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
        <div className="shell-wide grid gap-10 py-10 sm:gap-12 sm:py-20 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div>
            <span className="tag"><PlayCircle className="h-4 w-4" /> Download workflow</span>
            <h2 className="section-heading">A focused interface for public media links.</h2>
            <p className="mt-4 max-w-xl text-base leading-7" style={{ color: 'var(--ink-600)' }}>
              ShareHub brings link input, format choice, extraction status, result actions, and recent downloads into one consistent browser experience.
            </p>

            <div className="relative mt-8 space-y-3">
              <span className="absolute left-5 top-6 bottom-6 w-px" style={{ background: 'var(--grad-brand)' }} aria-hidden />
              {steps.map((step, index) => (
                <div key={step.title} className="relative flex gap-4 rounded-2xl border p-4" style={{ borderColor: 'var(--border)', background: 'var(--surface-soft)' }}>
                  <span className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-display text-sm font-extrabold text-white" style={{ background: 'var(--grad-brand)', boxShadow: 'var(--glow-brand)' }}>
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="text-sm font-bold">{step.title}</h3>
                    <p className="mt-1 text-sm leading-6" style={{ color: 'var(--ink-600)' }}>{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4">
            {capabilities.map(capability => (
              <article key={capability.title} className="card card-hover p-4 sm:p-6">
                <div className="icon-tile h-10 w-10 rounded-xl sm:h-12 sm:w-12">
                  <capability.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <h3 className="mt-3 text-xs font-bold leading-snug sm:mt-4 sm:text-base">{capability.title}</h3>
                <p className="mt-1 text-[11px] leading-4 sm:mt-2 sm:text-sm sm:leading-6" style={{ color: 'var(--ink-600)' }}>{capability.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Compatibility ------------------------------------------------------ */}
      <section className="section-muted border-y" style={{ borderColor: 'var(--border)' }}>
        <div className="shell-wide py-10 sm:py-20">
          <div className="mb-9 flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-xl">
              <span className="tag"><Globe2 className="h-4 w-4" /> Compatibility</span>
              <h2 className="section-heading">Common source categories</h2>
            </div>
            <p className="max-w-lg text-sm leading-6" style={{ color: 'var(--ink-600)' }}>
              Results depend on the exact URL, platform restrictions, and whether the media stream is publicly available.
            </p>
          </div>

          <div className="snap-row no-scrollbar lg:grid lg:grid-cols-3 lg:gap-4">
            {platforms.map(group => (
              <article key={group.name} className="card w-[272px] p-5 lg:w-auto">
                <div className="mb-5 flex items-center gap-3 border-b pb-4" style={{ borderColor: 'var(--border)' }}>
                  <div className="icon-tile h-11 w-11 rounded-2xl">
                    {group.name === 'Audio' ? <Music4 className="h-5 w-5" /> : <Globe2 className="h-5 w-5" />}
                  </div>
                  <h3 className="text-lg font-bold">{group.name}</h3>
                </div>
                <ul className="space-y-2.5">
                  {group.items.map(item => (
                    <li key={item} className="flex items-start gap-2.5 text-sm leading-6" style={{ color: 'var(--ink-600)' }}>
                      <CheckCircle2 className="mt-1 h-4 w-4 shrink-0" style={{ color: 'var(--brand-600)' }} />
                      {item}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link to="/supported-platforms" className="btn-outline rounded-full px-5 text-sm">
              Browse supported platforms <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Trust -------------------------------------------------------------- */}
      <section className="shell-wide py-10 sm:py-20">
        <div
          className="relative overflow-hidden rounded-[2rem] px-6 py-10 sm:px-10 sm:py-12"
          style={{ background: 'linear-gradient(160deg, #0d081f 0%, #181030 55%, #100a24 100%)', boxShadow: 'var(--shadow-xl)' }}
        >
          <span className="aurora-orb aurora-orb--one" aria-hidden />
          <div className="relative z-10">
            <div className="mb-9 max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em]" style={{ borderColor: 'rgba(216,180,254,0.32)', color: '#e9d5ff' }}>
                <ShieldCheck className="h-3.5 w-3.5" /> Trust model
              </span>
              <h2 className="mt-4 font-display text-2xl font-extrabold text-white sm:text-3xl">Responsible downloading, clear boundaries.</h2>
              <p className="mt-3 text-sm leading-6" style={{ color: 'rgba(233,226,255,0.68)' }}>
                ShareHub is built around honest outcomes: public links work best, protected content is not bypassed, and the UI keeps failures understandable.
              </p>
            </div>
            <div className="snap-row no-scrollbar md:grid md:grid-cols-3 md:gap-4">
              {trust.map(item => (
                <article key={item.title} className="w-[270px] rounded-2xl border p-5 md:w-auto" style={{ borderColor: 'rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.05)' }}>
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl" style={{ background: 'rgba(139,92,246,0.18)', color: '#c4b5fd' }}>
                    <item.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-bold text-white">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6" style={{ color: 'rgba(233,226,255,0.64)' }}>{item.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ ---------------------------------------------------------------- */}
      <section className="shell border-t pb-14 pt-10 sm:pb-20 sm:pt-16" style={{ borderColor: 'var(--border)' }}>
        <div className="mx-auto mb-8 max-w-2xl text-center">
          <span className="tag"><Sparkles className="h-4 w-4" /> FAQ</span>
          <h2 className="section-heading">Frequently asked questions</h2>
          <p className="mt-3 text-sm" style={{ color: 'var(--ink-600)' }}>Quick answers before you paste your first link.</p>
        </div>
        <div className="mx-auto max-w-3xl space-y-2.5">
          {faqData.map((faq, index) => {
            const isOpen = open === index;
            return (
              <article
                key={faq.q}
                className="overflow-hidden rounded-2xl border transition-colors"
                style={{
                  borderColor: isOpen ? 'color-mix(in srgb, var(--brand-600) 35%, var(--border))' : 'var(--border)',
                  background: 'var(--surface)',
                  boxShadow: isOpen ? 'var(--shadow-sm)' : 'none',
                }}
              >
                <button onClick={() => setOpen(isOpen ? null : index)} className="flex w-full items-center justify-between gap-4 p-4 text-left" aria-expanded={isOpen}>
                  <span className="text-sm font-bold" style={{ color: 'var(--ink-900)' }}>{faq.q}</span>
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors"
                    style={{ background: isOpen ? 'var(--grad-brand)' : 'var(--surface-soft)', color: isOpen ? '#ffffff' : 'var(--ink-500)' }}
                  >
                    <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
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

        <div className="mx-auto mt-10 max-w-3xl rounded-2xl border p-5 text-center" style={{ borderColor: 'var(--border)', background: 'var(--surface-soft)' }}>
          <p className="text-sm font-semibold" style={{ color: 'var(--ink-700)' }}>Still need help?</p>
          <p className="mt-1 text-sm" style={{ color: 'var(--ink-500)' }}>
            Read the FAQ page or contact support and we will point you in the right direction.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <Link to="/faq" className="btn-outline min-h-10 rounded-full px-4 text-xs">Full FAQ</Link>
            <Link to="/contact-us" className="btn-primary min-h-10 rounded-full px-4 text-xs">Contact support</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
