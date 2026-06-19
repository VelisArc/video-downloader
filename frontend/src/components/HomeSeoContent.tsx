import { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  Globe2,
  MonitorSmartphone,
  Music4,
  ShieldCheck,
  Sparkles,
  Video,
  Zap,
  Smartphone,
  Wifi,
  HardDrive,
  RefreshCw,
  PlayCircle,
} from 'lucide-react';

const capabilityCards = [
  {
    title: 'Universal Video Downloader',
    description: 'SwiftDL supports thousands of platforms. From mainstream social media giants to niche platforms, our free video downloader handles them all.',
    icon: Globe2,
    imageUrl: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=500&q=80',
  },
  {
    title: 'Lightning Fast Speeds',
    description: 'Experience ultra-fast download speeds. Our backend infrastructure is optimized to extract and deliver media instantly without waiting.',
    icon: Zap,
    imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500&q=80',
  },
  {
    title: 'High Quality 4K & HD',
    description: 'Never compromise on quality. Download videos in stunning 4K, 1080p, or 720p HD resolution exactly as the creator intended.',
    icon: Video,
    imageUrl: 'https://images.unsplash.com/photo-1585241936939-f4ba8b31522d?w=500&q=80',
  },
  {
    title: 'Crystal Clear MP3 Audio',
    description: 'Need just the music? Extract high-fidelity 320kbps MP3 or M4A audio streams directly from any video link.',
    icon: Music4,
    imageUrl: 'https://images.unsplash.com/photo-1614149162883-504ce4d13909?w=500&q=80',
  },
  {
    title: 'No App Installation',
    description: 'A pure browser-based experience. Forget about downloading shady APKs or heavy desktop software. It works instantly on the web.',
    icon: MonitorSmartphone,
    imageUrl: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=500&q=80',
  },
  {
    title: 'No Watermarks',
    description: 'Save content without annoying platform logos or watermarks ruining the visual experience. Clean, pristine downloads every time.',
    icon: Sparkles,
    imageUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=500&q=80',
  },
  {
    title: '100% Secure & Private',
    description: 'We do not log your downloads or store your media. Your privacy is our top priority, backed by industry-standard HTTPS encryption.',
    icon: ShieldCheck,
    imageUrl: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=500&q=80',
  },
  {
    title: 'Mobile & Tablet Ready',
    description: 'Perfectly responsive design means you can save videos directly to your iPhone, iPad, or Android camera roll with zero friction.',
    icon: Smartphone,
    imageUrl: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=500&q=80',
  },
  {
    title: 'Offline Viewing',
    description: 'Save data by downloading videos while on Wi-Fi, then watch them anywhere without buffering or eating up your mobile data plan.',
    icon: Wifi,
    imageUrl: 'https://images.unsplash.com/photo-1528297506728-9533d2ac3fa4?w=500&q=80',
  },
  {
    title: 'Batch Ready',
    description: 'Our system processes links rapidly, making it easy to download multiple videos one after another without breaking a sweat.',
    icon: RefreshCw,
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&q=80',
  },
  {
    title: 'Save Directly to Storage',
    description: 'Choose your destination folder and save mp4 or mp3 files directly to your internal storage, SD card, or external hard drive.',
    icon: HardDrive,
    imageUrl: 'https://images.unsplash.com/photo-1597839219216-a78fddc8e411?w=500&q=80',
  },
];

const workflowSteps = [
  {
    title: '1. Find Your Video',
    description: 'Open your favorite social media app or website. Find the video, reel, short, or song you want to save offline.',
    imageUrl: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=400&q=80',
  },
  {
    title: '2. Copy the Share Link',
    description: 'Tap the "Share" icon on the post and select "Copy Link". Make sure you have the direct URL to the specific post.',
    imageUrl: 'https://images.unsplash.com/photo-1555421689-d68471e189f2?w=400&q=80',
  },
  {
    title: '3. Paste into SwiftDL',
    description: 'Come back to our website and paste the copied URL into the central search box. Our system instantly recognizes the link.',
    imageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&q=80',
  },
  {
    title: '4. Choose Format',
    description: 'Decide if you want the full MP4 video or just the MP3 audio track. We provide options based on what the source supports.',
    imageUrl: 'https://images.unsplash.com/photo-1614149162883-504ce4d13909?w=400&q=80',
  },
  {
    title: '5. Click Download',
    description: 'Hit the big download button. Our backend engines will begin extracting the highest quality media streams available.',
    imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&q=80',
  },
  {
    title: '6. Save to Gallery',
    description: 'Once processed, click "Save File" to download it directly to your device storage, camera roll, or downloads folder.',
    imageUrl: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&q=80',
  },
];

const supportedContent = [
  {
    platform: 'Social Media Giants',
    items: [
      'Instagram Reels, Stories, IGTV, and Posts',
      'Facebook Watch, Groups, Pages, and Live Streams',
      'X (Twitter) Videos and Voice Tweets',
      'TikTok Videos (No Watermark extraction when possible)',
      'Snapchat Spotlight and Stories',
      'Pinterest Videos and Idea Pins',
      'LinkedIn Professional Videos',
    ],
  },
  {
    platform: 'Video Streaming & Entertainment',
    items: [
      'YouTube Shorts, Vlogs, and 4K Videos',
      'Vimeo High-Quality Showcases',
      'Dailymotion Clips and Episodes',
      'Twitch VODs and Clips',
      'Rumble Independent Videos',
      'Bilibili Animations and Vlogs',
      'Reddit Hosted Videos with Audio',
    ],
  },
  {
    platform: 'Audio & Music Platforms',
    items: [
      'SoundCloud Tracks and Playlists',
      'Mixcloud DJ Sets',
      'Bandcamp Indie Releases',
      'Audiomack Trending Songs',
      'Podcast direct MP3 extraction',
    ],
  },
  {
    platform: 'News & Educational',
    items: [
      'TED Talks and Presentations',
      'Coursera & Udemy (Public previews)',
      'BBC News, CNN, and Reuters video clips',
      'Bloomberg Market Updates',
      'Khan Academy Educational Clips',
    ],
  },
];

const trustNotes = [
  {
    title: 'Strictly No Logging',
    copy: 'We do not track which videos you download. Your session history is stored locally on your device, ensuring maximum privacy.',
    icon: ShieldCheck,
  },
  {
    title: 'Transparent Limitations',
    copy: 'We do not claim to bypass paywalls or DRM. SwiftDL relies on standard yt-dlp extraction for publicly accessible content.',
    icon: AlertTriangle,
  },
  {
    title: 'Fair Usage Quotas',
    copy: 'To keep the service fast for everyone, we use a transparent daily quota system. Heavy users can upgrade for unlimited capacity.',
    icon: Zap,
  },
];

const faqs = [
  {
    question: 'Is SwiftDL a free video downloader?',
    answer: 'Yes! SwiftDL offers a generous free tier that allows anyone to download videos and audio from hundreds of supported platforms without paying. Premium tiers are available for heavy users who need higher daily limits.',
  },
  {
    question: 'How do I download Instagram Reels?',
    answer: 'Open Instagram, tap the "Share" icon on the Reel, and copy the link. Paste it into SwiftDL, select "Video", and hit download. It will save directly to your device.',
  },
  {
    question: 'Can I download videos without a watermark?',
    answer: 'Yes, for many platforms like TikTok and Instagram, our backend extracts the raw video file directly from the content delivery network, meaning you get a clean, watermark-free video.',
  },
  {
    question: 'What video quality can I download?',
    answer: 'We support up to 4K resolution! The available quality depends on the original source video. If a video was uploaded in 1080p, we provide the 1080p MP4 file.',
  },
  {
    question: 'How can I convert YouTube videos to MP3?',
    answer: 'Paste your YouTube link and toggle the format switch from "Video" to "Audio". Our system will extract the highest quality audio stream for you to download.',
  },
  {
    question: 'Where do the downloaded videos go on my iPhone?',
    answer: 'On iOS, downloaded files go to the "Files" app inside the "Downloads" folder. Open Files, tap the video, click share, and select "Save Video" to move it to your Camera Roll.',
  },
  {
    question: 'Does this work on Android devices?',
    answer: 'Absolutely. SwiftDL is fully optimized for Android. Videos typically save directly to your "Downloads" folder, accessible via your Gallery or any File Manager.',
  },
  {
    question: 'Why did my download fail?',
    answer: 'Downloads can fail if the video is private, the link is broken, or the platform changed their code. SwiftDL works best with public, unrestricted links.',
  },
  {
    question: 'Are there any ads or popups?',
    answer: 'Our free tier may display unobtrusive banner ads to cover server costs. We prohibit malicious popups or redirects. Premium users enjoy a 100% ad-free experience.',
  },
  {
    question: 'How fast are the downloads?',
    answer: 'Incredibly fast. We rely on top-tier server infrastructure. The time depends on your internet connection and the file size.',
  },
];

export default function HomeSeoContent() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="section-shell py-12 md:py-16">
      {/* Hero SEO Intro */}
      <section className="grid gap-8 lg:grid-cols-2 lg:items-center">
        <div className="space-y-5">
          <span className="section-eyebrow">
            <Sparkles className="h-3 w-3" />
            The Ultimate Downloader Toolkit
          </span>
          <h2 className="text-balance text-3xl font-black tracking-tight text-[var(--ink-900)] md:text-5xl leading-[1.1]">
            Download Any Video.{' '}
            <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--brand-600)] to-[var(--brand-400)]">
              Anywhere, Anytime.
            </span>
          </h2>
          <div className="space-y-4 text-sm leading-relaxed text-[var(--ink-600)]">
            <p>
              Welcome to the internet's most powerful, free video downloader.
              SwiftDL supports <strong>thousands of websites</strong>, from
              mainstream platforms like YouTube, Instagram, and TikTok, to niche
              video and audio platforms.
            </p>
            <p>
              Forget about sketchy apps, hidden fees, or malware. Our 100%
              cloud-based infrastructure ensures you get maximum quality—whether
              you need a 4K MP4 or a crystal-clear 320kbps MP3.
            </p>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-1 rounded-[32px] bg-gradient-to-tr from-[var(--brand-200)] to-[var(--brand-400)] opacity-20 blur-2xl" />
          <div className="card-inner relative rounded-[28px] p-5 shadow-2xl">
            <img
              src="https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80"
              alt="Social Media Apps on Smartphone"
              className="rounded-xl shadow-lg object-cover h-44 w-full mb-4"
            />
            <div className="flex items-center justify-between border-b border-[var(--border-soft)] pb-3 mb-3">
              <div>
                <h3 className="font-bold text-sm text-[var(--ink-900)]">
                  Universal Compatibility
                </h3>
                <p className="text-[11px] text-[var(--ink-600)]">
                  Powered by advanced yt-dlp engines
                </p>
              </div>
              <div className="bg-[var(--brand-100)] p-2 rounded-full text-[var(--brand-600)]">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            </div>
            <div className="flex gap-3 items-center">
              <div className="flex -space-x-3">
                <img
                  className="w-8 h-8 border-2 border-white rounded-full"
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80"
                  alt=""
                />
                <img
                  className="w-8 h-8 border-2 border-white rounded-full"
                  src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&q=80"
                  alt=""
                />
                <img
                  className="w-8 h-8 border-2 border-white rounded-full"
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80"
                  alt=""
                />
              </div>
              <p className="text-[11px] font-medium text-[var(--ink-600)]">
                Trusted by 100k+ users daily.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Capabilities Grid */}
      <section className="mt-16">
        <div className="text-center max-w-3xl mx-auto mb-8">
          <span className="section-eyebrow">Industry Standard Features</span>
          <h2 className="mt-3 text-2xl font-black text-[var(--ink-900)] md:text-4xl">
            Why Choose SwiftDL?
          </h2>
          <p className="mt-3 text-sm text-[var(--ink-600)]">
            Enterprise-grade extraction tools in a simple, beautiful interface.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {capabilityCards.map(({ title, description, icon: Icon, imageUrl }) => (
            <article
              key={title}
              className="feature-card group flex flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] hover:border-[var(--brand-300)]"
            >
              <div className="h-32 overflow-hidden relative">
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-10" />
                <img
                  src={imageUrl}
                  alt={title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute bottom-3 right-3 z-20 bg-white/90 backdrop-blur rounded-lg p-2 text-[var(--brand-600)] shadow-lg transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <div className="rounded-lg bg-[var(--surface-soft)] p-1.5 text-[var(--brand-600)] group-hover:bg-[var(--brand-100)] transition-colors">
                    <Icon className="h-4 w-4" />
                  </div>
                  <h3 className="text-sm font-bold text-[var(--ink-900)]">
                    {title}
                  </h3>
                </div>
                <p className="text-[11px] leading-relaxed text-[var(--ink-600)] flex-1">
                  {description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Workflow Steps */}
      <section className="mt-16 rounded-[32px] border border-[var(--border-soft)] bg-gradient-to-b from-white to-[var(--surface-soft)] px-5 py-10 shadow-sm md:px-10 md:py-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div className="max-w-2xl">
            <span className="section-eyebrow">Simple Workflow</span>
            <h2 className="mt-3 text-2xl font-black text-[var(--ink-900)] md:text-4xl">
              How to Download Any Video in Seconds
            </h2>
          </div>
          <p className="max-w-md text-xs leading-relaxed text-[var(--ink-600)]">
            Our clean, 6-step process is engineered for speed. Whether you are
            on iPhone, Android, Mac, or PC, the steps remain identically simple.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {workflowSteps.map((step, index) => (
            <article
              key={step.title}
              className="card relative p-5 shadow-md transition-transform hover:-translate-y-0.5"
            >
              <div className="absolute -top-4 -right-4 flex h-10 w-10 items-center justify-center rounded-full bg-[var(--brand-600)] text-sm font-black text-white shadow-xl shadow-[var(--brand-500)]/30 border-3 border-white">
                {index + 1}
              </div>
              <div className="h-28 rounded-xl overflow-hidden mb-4">
                <img
                  src={step.imageUrl}
                  alt={step.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-sm font-bold text-[var(--ink-900)] mb-2">
                {step.title}
              </h3>
              <p className="text-xs leading-relaxed text-[var(--ink-600)]">
                {step.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* Supported Platforms */}
      <section className="mt-16">
        <div className="text-center max-w-3xl mx-auto mb-8">
          <span className="section-eyebrow">Unmatched Compatibility</span>
          <h2 className="mt-3 text-2xl font-black text-[var(--ink-900)] md:text-3xl">
            Download from Thousands of Platforms
          </h2>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          {supportedContent.map((section) => (
            <article
              key={section.platform}
              className="feature-card group transition-shadow hover:shadow-xl hover:shadow-[var(--brand-500)]/5"
            >
              <div className="flex items-center gap-3 border-b border-[var(--border-soft)] pb-4 mb-4">
                <div className="rounded-xl bg-[var(--brand-100)] p-2.5 text-[var(--brand-600)]">
                  <PlayCircle className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-black text-[var(--ink-900)]">
                  {section.platform}
                </h3>
              </div>
              <ul className="space-y-2.5">
                {section.items.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 text-xs leading-relaxed text-[var(--ink-600)]"
                  >
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 flex-none text-[var(--brand-500)]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      {/* Trust & Safety */}
      <section className="mt-16 rounded-[32px] bg-gradient-to-br from-[var(--ink-950)] via-[var(--ink-900)] to-[var(--ink-950)] px-6 py-12 text-white shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-[var(--brand-600)] rounded-full blur-[80px] opacity-20" />
        <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-64 h-64 bg-blue-600 rounded-full blur-[80px] opacity-20" />

        <div className="relative z-10 max-w-4xl mx-auto text-center mb-8">
          <span className="inline-block rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur-md">
            Safe & Secure
          </span>
          <h2 className="mt-4 text-3xl font-black md:text-4xl leading-tight">
            Enterprise-Grade Security for Everyone.
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">
            We believe powerful tools should be inherently safe. SwiftDL
            processes millions of requests without compromising user privacy.
          </p>
        </div>

        <div className="relative z-10 grid gap-4 md:grid-cols-3 max-w-5xl mx-auto">
          {trustNotes.map(({ title, copy, icon: Icon }) => (
            <article
              key={title}
              className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-lg p-5 transition-transform hover:-translate-y-1 hover:bg-white/10"
            >
              <div className="mb-4 inline-flex rounded-xl bg-gradient-to-br from-[var(--brand-400)] to-[var(--brand-600)] p-2.5 text-white shadow-lg shadow-[var(--brand-500)]/30">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold mb-2">{title}</h3>
              <p className="text-xs leading-relaxed text-slate-300">{copy}</p>
            </article>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mt-16">
        <div className="mx-auto max-w-3xl text-center mb-8">
          <span className="section-eyebrow">Knowledge Base</span>
          <h2 className="mt-3 text-3xl font-black text-[var(--ink-900)]">
            Frequently Asked Questions
          </h2>
          <p className="mt-2 text-sm text-[var(--ink-600)]">
            Everything you need to know about the internet's best free video
            downloader.
          </p>
        </div>

        <div className="mx-auto max-w-3xl space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <article
                key={faq.question}
                className={`feature-card overflow-hidden transition-all duration-300 ${
                  isOpen
                    ? 'border-[var(--brand-300)] shadow-xl shadow-[var(--brand-500)]/5 scale-[1.01]'
                    : ''
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="flex w-full items-center justify-between gap-4 p-4 text-left"
                >
                  <span className="text-sm font-bold leading-tight text-[var(--ink-900)]">
                    {faq.question}
                  </span>
                  <div
                    className={`flex-none rounded-full p-1.5 transition-colors ${
                      isOpen
                        ? 'bg-[var(--brand-100)] text-[var(--brand-600)]'
                        : 'bg-transparent text-[var(--ink-400)] group-hover:bg-[var(--surface-soft)] group-hover:text-[var(--ink-900)]'
                    }`}
                  >
                    <ChevronDown
                      className={`h-4 w-4 transition-transform duration-300 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </button>
                <div
                  className={`grid transition-all duration-300 ease-in-out ${
                    isOpen
                      ? 'grid-rows-[1fr] opacity-100'
                      : 'grid-rows-[0fr] opacity-0'
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="px-4 pb-4 pt-1">
                      <p className="text-xs leading-relaxed text-[var(--ink-600)]">
                        {faq.answer}
                      </p>
                    </div>
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
