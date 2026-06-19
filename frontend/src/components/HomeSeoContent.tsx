import { useState } from 'react';
import { AlertTriangle, CheckCircle2, ChevronDown, Globe2, MonitorSmartphone, Music4, ShieldCheck, Sparkles, Video, Zap, Smartphone, Wifi, HardDrive, RefreshCw, PlayCircle } from 'lucide-react';

const capabilities = [
  { title: 'Universal Video Downloader', desc: 'SwiftDL supports thousands of platforms. From mainstream social media giants to niche platforms, our free video downloader handles them all.', icon: Globe2 },
  { title: 'Lightning Fast Speeds', desc: 'Experience ultra-fast download speeds. Our backend infrastructure is optimized to extract and deliver media instantly without waiting.', icon: Zap },
  { title: 'High Quality 4K & HD', desc: 'Never compromise on quality. Download videos in stunning 4K, 1080p, or 720p HD resolution exactly as the creator intended.', icon: Video },
  { title: 'Crystal Clear MP3 Audio', desc: 'Need just the music? Extract high-fidelity 320kbps MP3 or M4A audio streams directly from any video link.', icon: Music4 },
  { title: 'No App Installation', desc: 'A pure browser-based experience. Forget about downloading shady APKs or heavy desktop software. It works instantly on the web.', icon: MonitorSmartphone },
  { title: 'No Watermarks', desc: 'Save content without annoying platform logos or watermarks ruining the visual experience.', icon: Sparkles },
  { title: '100% Secure & Private', desc: 'We do not log your downloads or store your media. Your privacy is our top priority.', icon: ShieldCheck },
  { title: 'Mobile & Tablet Ready', desc: 'Perfectly responsive design means you can save videos directly to your iPhone, iPad, or Android device.', icon: Smartphone },
  { title: 'Offline Viewing', desc: 'Save data by downloading videos while on Wi-Fi, then watch them anywhere without buffering.', icon: Wifi },
  { title: 'Batch Ready', desc: 'Our system processes links rapidly, making it easy to download multiple videos one after another.', icon: RefreshCw },
  { title: 'Save Directly to Storage', desc: 'Choose your destination folder and save mp4 or mp3 files directly to your device.', icon: HardDrive },
];

const steps = [
  { title: 'Find Your Video', desc: 'Open your favorite social media app or website. Find the video, reel, or song you want to save.' },
  { title: 'Copy the Share Link', desc: 'Tap the "Share" icon on the post and select "Copy Link".' },
  { title: 'Paste into SwiftDL', desc: 'Come back to our website and paste the copied URL into the search box.' },
  { title: 'Choose Format', desc: 'Decide if you want the full MP4 video or just the MP3 audio track.' },
  { title: 'Click Download', desc: 'Hit the download button. Our backend extracts the highest quality media streams.' },
  { title: 'Save to Gallery', desc: 'Click "Save File" to download it directly to your device storage.' },
];

const platforms = [
  { name: 'Social Media Giants', items: ['Instagram Reels, Stories, IGTV', 'Facebook Watch, Groups, Pages', 'X (Twitter) Videos', 'TikTok Videos', 'Snapchat Spotlight', 'Pinterest Videos', 'LinkedIn Videos'] },
  { name: 'Video Streaming', items: ['YouTube Shorts & 4K', 'Vimeo Showcases', 'Dailymotion Episodes', 'Twitch VODs & Clips', 'Rumble Videos', 'Bilibili Vlogs', 'Reddit Videos'] },
  { name: 'Audio & Music', items: ['SoundCloud Tracks', 'Mixcloud DJ Sets', 'Bandcamp Releases', 'Audiomack Songs', 'Podcast MP3 extraction'] },
  { name: 'News & Educational', items: ['TED Talks', 'BBC, CNN clips', 'Bloomberg Updates', 'Khan Academy'] },
];

const trust = [
  { title: 'Strictly No Logging', desc: 'We do not track which videos you download. Your session history is stored locally on your device.', icon: ShieldCheck },
  { title: 'Transparent Limitations', desc: 'We do not claim to bypass paywalls or DRM. SwiftDL relies on standard yt-dlp extraction for public content.', icon: AlertTriangle },
  { title: 'Fair Usage Quotas', desc: 'To keep the service fast for everyone, we use a transparent daily quota system.', icon: Zap },
];

const faqData = [
  { q: 'Is SwiftDL a free video downloader?', a: 'Yes! SwiftDL offers a generous free tier for downloading from hundreds of platforms. Premium tiers are available for higher daily limits.' },
  { q: 'How do I download Instagram Reels?', a: 'Open Instagram, tap Share on the Reel, copy the link. Paste into SwiftDL, select Video, and hit download.' },
  { q: 'Can I download videos without a watermark?', a: 'Yes - for many platforms, our backend extracts the raw video file directly from the CDN without watermarks.' },
  { q: 'What video quality can I download?', a: 'We support up to 4K resolution depending on the original source video.' },
  { q: 'How can I convert YouTube videos to MP3?', a: 'Paste your YouTube link and toggle from Video to Audio. Our system extracts the highest quality audio stream.' },
  { q: 'Does this work on mobile?', a: 'Absolutely. SwiftDL is fully optimized for iPhone, iPad, and Android.' },
  { q: 'Why did my download fail?', a: 'Downloads can fail if the video is private, the link is broken, or the platform changed their code. Public links work best.' },
  { q: 'Are there any ads?', a: 'Our free tier may display unobtrusive banner ads. Premium users enjoy a 100% ad-free experience.' },
];

export default function HomeSeoContent() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="shell py-10 md:py-14">
      {/* SEO Intro */}
      <section className="grid gap-8 lg:grid-cols-2 lg:items-center mb-14">
        <div>
          <span className="tag"><Sparkles className="h-3 w-3" /> The Ultimate Downloader</span>
          <h2 className="text-3xl md:text-4xl font-bold mt-4 leading-tight" style={{ color: 'var(--ink-900)' }}>
            Download Any Video.{' '}<span style={{ color: 'var(--brand-600)' }}>Anywhere, Anytime.</span>
          </h2>
          <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--ink-600)' }}>
            The internet's most powerful, free video downloader. Supports <strong>thousands of websites</strong> - from YouTube and Instagram to niche platforms. 100% cloud-based, no malware, no hidden fees.
          </p>
        </div>
        <div className="card" style={{ padding: 0 }}>
          <div className="p-5">
            <div className="flex items-center gap-3 border-b pb-3 mb-3" style={{ borderColor: 'var(--border)' }}>
              <div className="rounded-lg p-2" style={{ background: 'var(--brand-50)', color: 'var(--brand-600)' }}><CheckCircle2 className="h-5 w-5" /></div>
              <div><h3 className="font-bold text-sm" style={{ color: 'var(--ink-900)' }}>Universal Compatibility</h3><p className="text-[11px]" style={{ color: 'var(--ink-600)' }}>Powered by advanced yt-dlp engines</p></div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {[1, 2, 3].map(i => <div key={i} className="w-7 h-7 rounded-full flex items-center justify-center border-2" style={{ background: 'var(--brand-100)', borderColor: 'var(--surface)', color: 'var(--brand-600)' }}><Sparkles className="h-3 w-3" /></div>)}
              </div>
              <p className="text-[11px] font-medium" style={{ color: 'var(--ink-600)' }}>Trusted by 100k+ users daily.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section className="mb-14">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <span className="tag">Features</span>
          <h2 className="text-2xl md:text-3xl font-bold mt-3" style={{ color: 'var(--ink-900)' }}>Why Choose SwiftDL?</h2>
          <p className="mt-2 text-sm" style={{ color: 'var(--ink-600)' }}>Enterprise-grade extraction tools in a clean, simple interface.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {capabilities.map(c => (
            <article key={c.title} className="card card-hover">
              <div className="flex items-center gap-2 mb-2">
                <div className="rounded-md p-1.5" style={{ background: 'var(--brand-50)', color: 'var(--brand-600)' }}><c.icon className="h-4 w-4" /></div>
                <h3 className="text-sm font-bold" style={{ color: 'var(--ink-900)' }}>{c.title}</h3>
              </div>
              <p className="text-[11px] leading-relaxed" style={{ color: 'var(--ink-600)' }}>{c.desc}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Workflow */}
      <section className="mb-14 rounded-xl border p-6 md:p-8" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
        <div className="max-w-2xl mb-6">
          <span className="tag">Simple Workflow</span>
          <h2 className="text-2xl font-bold mt-3" style={{ color: 'var(--ink-900)' }}>How to Download Any Video</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {steps.map((s, i) => (
            <article key={s.title} className="card-hover" style={{ padding: '1rem', borderRadius: '0.75rem', border: '1px solid var(--border)' }}>
              <div className="flex items-center gap-2.5 mb-1.5">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: 'var(--brand-600)' }}>{i + 1}</div>
                <h3 className="text-sm font-bold" style={{ color: 'var(--ink-900)' }}>{s.title}</h3>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--ink-600)' }}>{s.desc}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Platforms */}
      <section className="mb-14">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <span className="tag">Compatibility</span>
          <h2 className="text-2xl font-bold mt-3" style={{ color: 'var(--ink-900)' }}>Download from Thousands of Platforms</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {platforms.map(g => (
            <article key={g.name} className="card card-hover">
              <div className="flex items-center gap-2.5 border-b pb-3 mb-3" style={{ borderColor: 'var(--border)' }}>
                <div className="rounded-md p-1.5" style={{ background: 'var(--brand-50)', color: 'var(--brand-600)' }}><PlayCircle className="h-4 w-4" /></div>
                <h3 className="font-bold" style={{ color: 'var(--ink-900)' }}>{g.name}</h3>
              </div>
              <ul className="space-y-1.5">
                {g.items.map(item => <li key={item} className="flex items-start gap-2 text-xs" style={{ color: 'var(--ink-600)' }}><CheckCircle2 className="h-3 w-3 mt-0.5 shrink-0" style={{ color: 'var(--brand-500)' }} />{item}</li>)}
              </ul>
            </article>
          ))}
        </div>
      </section>

      {/* Trust */}
      <section className="mb-14 rounded-xl p-8" style={{ background: 'var(--ink-heavy)' }}>
        <div className="text-center max-w-2xl mx-auto mb-8">
          <span className="inline-block rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-wider" style={{ borderColor: 'rgba(255,255,255,0.12)', color: 'var(--brand-400)' }}>Safe & Secure</span>
          <h2 className="text-2xl font-bold mt-4 text-white">Enterprise-Grade Security for Everyone.</h2>
          <p className="mt-2 text-sm" style={{ color: 'var(--ink-500)' }}>SwiftDL processes millions of requests without compromising user privacy.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3 max-w-4xl mx-auto">
          {trust.map(t => (
            <article key={t.title} className="rounded-xl p-5" style={{ border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)' }}>
              <div className="inline-flex rounded-lg p-2 mb-3" style={{ background: 'var(--brand-600)', color: 'white' }}><t.icon className="h-4 w-4" /></div>
              <h3 className="text-sm font-bold text-white mb-1">{t.title}</h3>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--ink-500)' }}>{t.desc}</p>
            </article>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section>
        <div className="text-center max-w-3xl mx-auto mb-8">
          <span className="tag">FAQ</span>
          <h2 className="text-2xl font-bold mt-3" style={{ color: 'var(--ink-900)' }}>Frequently Asked Questions</h2>
        </div>
        <div className="max-w-3xl mx-auto space-y-2">
          {faqData.map((f, i) => {
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
      </section>
    </div>
  );
}