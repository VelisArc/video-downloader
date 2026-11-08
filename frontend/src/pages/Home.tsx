import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Download,
  Gauge,
  Globe2,
  History,
  Layers,
  Music4,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Trash2,
  Video,
  Zap,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import HomeSeoContent from '../components/HomeSeoContent';
import DownloaderPanel from '../components/DownloaderPanel';
import ResultCard from '../components/ResultCard';
import { DownloadHistoryItem, DownloadType, STORAGE_KEYS, getOrCreateClientId, isSupportedUrl, loadDownloadHistory, normalizeUrl, sanitizeFilename, saveDownloadHistory } from '../lib/downloads';
import { siteConfig, siteUrl } from '../lib/site';
import { API_BASE } from '../lib/api';
import BrandMark from '../components/BrandMark';

const blank: DownloadHistoryItem = { id: '', thumbnail: '', title: '', downloadUrl: '', ext: 'mp4', date: '', type: 'video', platform: '' };

const platformRail = ['Instagram', 'Facebook', 'TikTok', 'X', 'Vimeo', 'SoundCloud', 'Reddit', 'Dailymotion', 'Twitch'];

const heroStats = [
  { value: '1000+', label: 'compatible sources', icon: Globe2 },
  { value: '2-in-1', label: 'video & audio', icon: Music4 },
  { value: 'PWA', label: 'install in seconds', icon: Smartphone },
];

const features = [
  {
    title: 'One workspace for every link',
    desc: 'Paste once, choose video or audio, and keep the result, history and repeat saves in the same clean surface.',
    icon: Layers,
    span: 'lg:col-span-2',
  },
  {
    title: 'Only success counts',
    desc: 'A failed link check never eats your daily quota. You spend a download only when a real stream is found.',
    icon: Gauge,
  },
  {
    title: 'Private by default',
    desc: 'Downloads and history stay in your browser. No account required to run a public link.',
    icon: ShieldCheck,
  },
  {
    title: 'History that helps',
    desc: 'Recent results are saved locally so you can grab the same file again without pasting the link twice.',
    icon: History,
    span: 'lg:col-span-2',
  },
];

const steps = [
  { title: 'Copy the link', desc: 'Grab the public share URL from the platform you are already viewing.', icon: Globe2 },
  { title: 'Pick a format', desc: 'Choose video or audio - the rest of the workflow stays the same.', icon: Music4 },
  { title: 'Save in one tap', desc: 'Download, copy or share the prepared file from a single result card.', icon: Download },
];

export default function Home() {
  const { user } = useAuth();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [type, setType] = useState<DownloadType>('video');
  const [history, setHistory] = useState<DownloadHistoryItem[]>([]);
  const [data, setData] = useState<DownloadHistoryItem>(blank);

  useEffect(() => {
    getOrCreateClientId();
    setHistory(loadDownloadHistory());
  }, []);

  const add = (download: Omit<DownloadHistoryItem, 'id' | 'date'>) => {
    const item: DownloadHistoryItem = { ...download, id: Date.now().toString(), date: new Date().toLocaleDateString() };
    const next = [item, ...history].slice(0, 10);
    setHistory(next);
    saveDownloadHistory(next);
    setData(item);
  };

  const handleDownload = async () => {
    const normalizedUrl = normalizeUrl(url);
    if (!normalizedUrl) return toast.error('Paste a video link first');
    if (!isSupportedUrl(normalizedUrl)) return toast.error('Enter a valid video URL');

    setLoading(true);
    setShowResults(false);
    const toastId = toast.loading('Checking the link...');

    try {
      const token = user ? await user.getIdToken() : null;
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ url: normalizedUrl, type }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || 'The link could not be processed.');
      if (!payload.downloadUrl) throw new Error('No downloadable stream was found for this link.');

      setUrl(normalizedUrl);
      add({
        thumbnail: payload.thumbnail || '',
        title: payload.title || 'Untitled',
        downloadUrl: payload.downloadUrl,
        ext: payload.ext || (type === 'audio' ? 'mp3' : 'mp4'),
        type,
        uploader: payload.uploader,
        duration: payload.duration,
        view_count: payload.view_count,
        platform: payload.platform || '',
      });
      setShowResults(true);
      toast.success('Ready to download!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unexpected error');
    } finally {
      toast.dismiss(toastId);
      setLoading(false);
    }
  };

  const downloadAgain = (downloadUrl: string, title: string, ext: string) => {
    const anchor = document.createElement('a');
    anchor.href = downloadUrl;
    anchor.download = `${sanitizeFilename(title)}.${ext || 'mp4'}`;
    anchor.rel = 'noopener noreferrer';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    toast.success('Download started');
  };

  const fmt = (platform?: string | null) => {
    const name = (platform || '').trim();
    if (!name || name === 'generic') return 'Auto-detected';
    return name.split(/[-_.]/g).filter(Boolean).map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
  };

  return (
    <>
      <Helmet>
        <title>ShareHub | Multi-Platform Video & Audio Downloader</title>
        <meta name="description" content="Download public videos and audio from supported platforms including Instagram, Facebook, TikTok, X, Vimeo, Reddit and more. Fast browser-based downloader." />
        <link rel="canonical" href={siteUrl('/')} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={siteConfig.name} />
        <meta property="og:url" content={siteUrl('/')} />
        <meta property="og:title" content="ShareHub | Multi-Platform Video Downloader" />
        <meta property="og:description" content="Download public videos and audio from supported platforms. Fast browser workflow, no install required." />
        <meta property="og:image" content={siteUrl('/logo.png')} />
      </Helmet>

      <div className="overflow-hidden">
        {/* Hero ------------------------------------------------------------- */}
        <section className="hero-canvas">
          <span className="aurora-orb aurora-orb--one" aria-hidden />
          <span className="aurora-orb aurora-orb--two" aria-hidden />
          <span className="aurora-orb aurora-orb--three" aria-hidden />

          <div className="shell-wide relative z-10 grid grid-cols-1 gap-5 py-6 sm:gap-10 sm:py-14 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-center lg:py-20">
            <div className="min-w-0 text-white">
              <span
                className="inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.12em]"
                style={{ borderColor: 'rgba(216, 180, 254, 0.3)', background: 'rgba(139, 92, 246, 0.16)', color: '#e9d5ff' }}
              >
                <Sparkles className="h-3.5 w-3.5" />
                Browser media workspace
              </span>

              <h1 className="mt-6 max-w-2xl font-display text-[clamp(2.1rem,7vw,3.6rem)] font-extrabold leading-[1.02] text-white text-balance">
                Every public video.
                <br />
                <span className="gradient-text">One clean download.</span>
              </h1>

              <p className="mt-4 max-w-xl text-[15px] leading-6 sm:mt-6 sm:text-lg sm:leading-7" style={{ color: 'rgba(233, 226, 255, 0.78)' }}>
                Paste a supported link, choose video or audio, and save it straight to your device.
                No popups, no installs, and failed checks never burn your daily limit.
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap sm:items-center">
                <a href="#downloader" className="btn-primary min-h-12 w-full justify-center px-6 text-[15px] sm:w-auto">
                  Start downloading <ArrowRight className="h-4 w-4" />
                </a>
                <Link
                  to="/supported-platforms"
                  className="hidden min-h-12 items-center justify-center gap-2 rounded-xl border px-5 text-sm font-semibold text-white transition-colors hover:bg-white/10 sm:inline-flex"
                  style={{ borderColor: 'rgba(255,255,255,0.2)' }}
                >
                  <Globe2 className="h-4 w-4" /> See supported sites
                </Link>
              </div>

              <dl className="snap-row no-scrollbar mt-6 max-w-lg sm:mt-10 sm:grid sm:grid-cols-3 sm:gap-3">
                {heroStats.map(stat => (
                  <div key={stat.label} className="w-[148px] rounded-xl border p-2.5 sm:w-auto sm:rounded-2xl sm:p-3.5" style={{ borderColor: 'rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.05)' }}>
                    <stat.icon className="h-4 w-4" style={{ color: '#f0abfc' }} />
                    <dt className="mt-1.5 font-display text-base font-extrabold text-white sm:mt-2 sm:text-xl">{stat.value}</dt>
                    <dd className="mt-0.5 text-[9px] font-medium leading-3.5 sm:text-[11px] sm:leading-4" style={{ color: 'rgba(233, 226, 255, 0.62)' }}>{stat.label}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Downloader card ------------------------------------------- */}
            <div id="downloader" className="min-w-0 scroll-mt-24">
              <div className="glass-panel rounded-2xl p-1.5 sm:rounded-[1.75rem] sm:p-3">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2 rounded-xl border px-2.5 py-2 sm:mb-2.5 sm:gap-3 sm:rounded-2xl sm:px-3 sm:py-2.5" style={{ borderColor: 'rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.06)' }}>
                  <div className="flex items-center gap-2.5">
                    <BrandMark className="h-9 w-9" />
                    <div>
                      <p className="text-sm font-bold text-white">{siteConfig.name} Console</p>
                      <p className="text-[11px]" style={{ color: 'rgba(233, 226, 255, 0.55)' }}>Video &amp; audio extraction</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold" style={{ background: 'rgba(34, 197, 94, 0.14)', color: '#86efac' }}>
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" /> Online
                  </span>
                </div>

                <div className="hero-surface rounded-xl p-2.5 sm:rounded-2xl sm:p-4">
                  <DownloaderPanel url={url} setUrl={setUrl} downloadType={type} setDownloadType={setType} isLoading={loading} onDownload={handleDownload} />
                  {showResults && <ResultCard videoData={data} />}
                </div>

                <div className="mt-2.5 hidden gap-1.5 overflow-x-auto pb-1 sm:flex">
                  {platformRail.map(platform => (
                    <span
                      key={platform}
                      className="shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold"
                      style={{ borderColor: 'rgba(255,255,255,0.12)', color: 'rgba(233, 226, 255, 0.65)' }}
                    >
                      {platform}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Platform marquee -------------------------------------------- */}
          <div className="relative z-10 hidden border-t md:block" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
            <div className="marquee-mask overflow-hidden py-5">
              <div className="marquee items-center gap-10">
                {[...platformRail, ...platformRail].map((platform, index) => (
                  <span key={`${platform}-${index}`} className="flex shrink-0 items-center gap-2 text-sm font-semibold" style={{ color: 'rgba(233, 226, 255, 0.5)' }}>
                    <CheckCircle2 className="h-4 w-4" style={{ color: 'rgba(103, 232, 249, 0.7)' }} />
                    {platform}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Features --------------------------------------------------------- */}
        <section className="section-muted border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="shell-wide py-10 sm:py-20">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4 sm:mb-10 sm:gap-5">
              <div className="max-w-xl">
                <span className="tag"><Zap className="h-4 w-4" /> Why ShareHub</span>
                <h2 className="section-heading">Built like a tool you actually want to reuse.</h2>
              </div>
              <p className="max-w-md text-sm leading-6" style={{ color: 'var(--ink-600)' }}>
                Clean states, honest limits and a result card that tells you exactly what is ready to save.
              </p>
            </div>

            <div className="stagger grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
              {features.map(feature => (
                <article key={feature.title} className={`bento ${feature.span || ''}`}>
                  <div className="relative z-10">
                    <div className="icon-tile">
                      <feature.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <h3 className="mt-3 text-[13px] font-bold leading-snug sm:mt-5 sm:text-lg">{feature.title}</h3>
                    <p className="mt-1.5 max-w-md text-[11px] leading-4 sm:mt-2 sm:text-sm sm:leading-6" style={{ color: 'var(--ink-600)' }}>{feature.desc}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Steps ------------------------------------------------------------ */}
        <section className="shell-wide py-10 sm:py-20">
          <div className="mx-auto mb-6 max-w-2xl text-center sm:mb-10">
            <span className="eyebrow justify-center"><Clock3 className="h-3.5 w-3.5" /> 3 steps, no friction</span>
            <h2 className="section-heading">From link to file in under a minute.</h2>
          </div>

          <div className="snap-row no-scrollbar md:grid md:grid-cols-3 md:gap-4">
            {steps.map((step, index) => (
              <article key={step.title} className="card card-hover group w-[228px] md:w-auto">
                <div className="flex items-center justify-between">
                  <div className="icon-tile">
                    <step.icon className="h-5 w-5" />
                  </div>
                  <span className="font-display text-4xl font-extrabold" style={{ color: 'var(--ink-100)' }}>
                    0{index + 1}
                  </span>
                </div>
                <h3 className="mt-5 text-base font-bold">{step.title}</h3>
                <p className="mt-2 text-sm leading-6" style={{ color: 'var(--ink-600)' }}>{step.desc}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Premium teaser --------------------------------------------------- */}
        <section className="shell-wide pb-10 sm:pb-20">
          <div
            className="relative overflow-hidden rounded-[2rem] px-6 py-10 sm:px-10 sm:py-12"
            style={{ background: 'var(--grad-brand)', boxShadow: 'var(--shadow-xl)' }}
          >
            <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-white/15 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-amber-300/25 blur-3xl" />
            <div className="relative flex flex-wrap items-center justify-between gap-6">
              <div className="max-w-xl text-white">
                <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em]" style={{ borderColor: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.12)' }}>
                  <Sparkles className="h-3.5 w-3.5" /> Premium
                </span>
                <h2 className="mt-4 font-display text-2xl font-extrabold text-white sm:text-3xl">
                  More downloads, more history, zero ads.
                </h2>
                <p className="mt-3 text-sm leading-6" style={{ color: 'rgba(255,255,255,0.82)' }}>
                  Upgrade for higher daily limits and an ad-free workspace. Start free, no card needed to test a link.
                </p>
              </div>
              <Link
                to="/pricing"
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-white px-6 text-sm font-bold text-[#6d28d9] shadow-lg transition-transform hover:-translate-y-0.5 sm:w-auto"
              >
                View plans <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* History ---------------------------------------------------------- */}
        {history.length > 0 && (
          <section className="shell-wide pb-10 sm:pb-20">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="tag"><History className="h-4 w-4" /> Browser history</span>
                <h2 className="mt-3 text-2xl font-extrabold sm:text-3xl">Recent downloads</h2>
              </div>
              <button
                onClick={() => {
                  setHistory([]);
                  localStorage.removeItem(STORAGE_KEYS.downloadHistory);
                  toast.success('History cleared');
                }}
                className="btn-outline min-h-10 rounded-full px-4 text-xs"
              >
                <Trash2 className="h-4 w-4" /> Clear history
              </button>
            </div>

            <div className="grid gap-3 lg:grid-cols-2">
              {history.map(item => (
                <article key={item.id} className="table-row grid-cols-[64px_1fr_auto] items-center gap-3 sm:grid-cols-[88px_1fr_auto]">
                  {item.thumbnail ? (
                    <img src={item.thumbnail} alt="" loading="lazy" className="h-16 w-16 rounded-xl object-cover sm:h-16 sm:w-[88px]" />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-xl sm:w-[88px]" style={{ background: 'var(--grad-brand-soft)', color: 'var(--brand-600)' }}>
                      <Video className="h-6 w-6" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="flex flex-wrap gap-1.5">
                      <span className="pill">{(item.ext || 'mp4').toUpperCase()}</span>
                      {item.platform && <span className="pill">{fmt(item.platform)}</span>}
                    </div>
                    <h3 className="mt-1.5 line-clamp-2 text-[13px] font-bold leading-snug">{item.title}</h3>
                    <p className="mt-0.5 text-[11px]" style={{ color: 'var(--ink-500)' }}>Saved {item.date}</p>
                  </div>
                  <button onClick={() => downloadAgain(item.downloadUrl, item.title, item.ext)} className="flex h-11 w-11 items-center justify-center rounded-xl text-white transition-transform active:scale-95 sm:h-auto sm:w-auto sm:min-h-10 sm:px-4" style={{ background: 'var(--ink-heavy)' }} aria-label="Download again">
                    <Download className="h-4 w-4" /><span className="hidden text-xs sm:inline">Save</span>
                  </button>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>

      <HomeSeoContent />
    </>
  );
}
