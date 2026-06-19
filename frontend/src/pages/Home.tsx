import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { CheckCircle2, Clock3, Download, Gauge, Globe2, History, Music4, ShieldCheck, Sparkles, Trash2, Video, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import HomeSeoContent from '../components/HomeSeoContent';
import DownloaderPanel from '../components/DownloaderPanel';
import ResultCard from '../components/ResultCard';
import { DownloadHistoryItem, DownloadType, STORAGE_KEYS, getOrCreateClientId, isSupportedUrl, loadDownloadHistory, normalizeUrl, sanitizeFilename, saveDownloadHistory } from '../lib/downloads';
import { siteConfig, siteUrl } from '../lib/site';
import { API_BASE } from '../lib/api';

const blank: DownloadHistoryItem = { id: '', thumbnail: '', title: '', downloadUrl: '', ext: 'mp4', date: '', type: 'video', platform: '' };

const platformRail = ['Instagram', 'Facebook', 'TikTok', 'X', 'Vimeo', 'SoundCloud', 'Reddit', 'Dailymotion'];

const capabilityCards = [
  { title: 'Format control', desc: 'Switch between video and audio before processing the link.', icon: Music4 },
  { title: 'Fast checks', desc: 'The API validates public links first, and failed checks do not consume your daily limit.', icon: Gauge },
  { title: 'Local history', desc: 'Recent downloads stay on this browser for quick repeat saves.', icon: History },
  { title: 'Responsible access', desc: 'Built around public content and transparent platform limits.', icon: ShieldCheck },
];

const proofPoints = [
  { value: '1000+', label: 'yt-dlp compatible sources', icon: Globe2 },
  { value: 'MP4/MP3', label: 'common output flows', icon: Download },
  { value: 'PWA', label: 'installable browser app', icon: Zap },
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
    anchor.click();
    anchor.remove();
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
        <title>SwiftDL | Multi-Platform Video & Audio Downloader</title>
        <meta name="description" content="Download public videos and audio from supported platforms including Instagram, Facebook, TikTok, X, Vimeo, Reddit and more. Fast browser-based downloader." />
        <link rel="canonical" href={siteUrl('/')} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={siteConfig.name} />
        <meta property="og:url" content={siteUrl('/')} />
        <meta property="og:title" content="SwiftDL | Multi-Platform Video Downloader" />
        <meta property="og:description" content="Download public videos and audio from supported platforms. Fast browser workflow, no install required." />
        <meta property="og:image" content={siteUrl('/logo.png')} />
      </Helmet>

      <div className="pb-14">
        <section className="hero-grid">
          <div className="shell-wide relative z-10 grid grid-cols-[minmax(0,1fr)] gap-8 py-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center lg:py-14">
            <div className="min-w-0 text-white">
              <span className="inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-semibold" style={{ borderColor: 'rgba(255,255,255,0.18)', background: 'rgba(255,255,255,0.08)', color: '#c7fff4' }}>
                <Sparkles className="h-4 w-4" /> Browser media workspace
              </span>
              <h1 className="mt-5 max-w-xl text-3xl font-extrabold leading-tight text-white sm:text-5xl">
                Download public media with a cleaner, success-counted workflow.
              </h1>
              <p className="mt-5 max-w-lg text-base leading-7" style={{ color: 'rgba(255,255,255,0.72)' }}>
                Paste a supported public link, choose the format, and keep successful results ready for your device without failed checks burning daily limits.
              </p>

              <div className="mt-7 hidden gap-3 sm:grid sm:grid-cols-3">
                {proofPoints.map(point => (
                  <div key={point.label} className="rounded-lg border p-4" style={{ borderColor: 'rgba(255,255,255,0.14)', background: 'rgba(255,255,255,0.07)' }}>
                    <point.icon className="h-5 w-5" style={{ color: '#5eead4' }} />
                    <p className="mt-3 text-xl font-extrabold text-white">{point.value}</p>
                    <p className="mt-1 text-xs font-medium leading-5" style={{ color: 'rgba(255,255,255,0.66)' }}>{point.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-panel min-w-0 rounded-lg p-3 sm:p-4">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-md border px-3 py-2" style={{ borderColor: 'rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.08)' }}>
                <div className="flex items-center gap-2">
                  <img src="/logo.png" alt="" className="h-8 w-8 rounded-md bg-white p-1" />
                  <div>
                    <p className="text-sm font-bold text-white">{siteConfig.name} Console</p>
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>Video and audio extraction</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold" style={{ background: 'rgba(94,234,212,0.14)', color: '#a7fff3' }}>
                  <CheckCircle2 className="h-3.5 w-3.5" /> Online
                </span>
              </div>

              <div className="rounded-lg border p-4 sm:p-5" style={{ borderColor: 'rgba(255,255,255,0.16)', background: 'var(--surface)' }}>
                <DownloaderPanel url={url} setUrl={setUrl} downloadType={type} setDownloadType={setType} isLoading={loading} onDownload={handleDownload} />
                {showResults && <ResultCard videoData={data} />}
              </div>

              <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                {platformRail.map(platform => (
                  <span key={platform} className="shrink-0 rounded-md border px-2.5 py-1 text-xs font-semibold" style={{ borderColor: 'rgba(255,255,255,0.14)', color: 'rgba(255,255,255,0.72)' }}>
                    {platform}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="shell-wide py-12">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="tag"><ShieldCheck className="h-4 w-4" /> Product workflow</span>
              <h2 className="mt-3 text-2xl font-extrabold sm:text-3xl">Built like a utility, not a popup maze.</h2>
            </div>
            <p className="max-w-xl text-sm leading-6" style={{ color: 'var(--ink-600)' }}>
              The interface keeps format choice, link processing, result actions, and browser history in one predictable surface.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {capabilityCards.map(card => (
              <article key={card.title} className="card card-hover">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md" style={{ background: 'var(--brand-50)', color: 'var(--brand-700)' }}>
                  <card.icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold">{card.title}</h3>
                <p className="mt-2 text-sm leading-6" style={{ color: 'var(--ink-600)' }}>{card.desc}</p>
              </article>
            ))}
          </div>
        </section>

        {history.length > 0 && (
          <section className="shell-wide pb-12">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="tag"><Clock3 className="h-4 w-4" /> Browser history</span>
                <h2 className="mt-3 text-2xl font-extrabold">Recent downloads</h2>
              </div>
              <button
                onClick={() => {
                  setHistory([]);
                  localStorage.removeItem(STORAGE_KEYS.downloadHistory);
                  toast.success('History cleared');
                }}
                className="btn-outline"
              >
                <Trash2 className="h-4 w-4" /> Clear history
              </button>
            </div>

            <div className="grid gap-3 lg:grid-cols-2">
              {history.map(item => (
                <article key={item.id} className="table-row sm:grid-cols-[96px_1fr_auto] sm:items-center">
                  {item.thumbnail ? (
                    <img src={item.thumbnail} alt="" className="h-24 w-full rounded-md object-cover sm:h-20 sm:w-24" />
                  ) : (
                    <div className="flex h-24 w-full items-center justify-center rounded-md sm:h-20 sm:w-24" style={{ background: 'var(--brand-50)', color: 'var(--brand-700)' }}>
                      <Video className="h-6 w-6" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="flex flex-wrap gap-1.5">
                      <span className="pill">{item.ext.toUpperCase()}</span>
                      {item.platform && <span className="pill">{fmt(item.platform)}</span>}
                    </div>
                    <h3 className="mt-2 line-clamp-2 text-sm font-bold">{item.title}</h3>
                    <p className="mt-1 text-xs" style={{ color: 'var(--ink-500)' }}>Saved on {item.date}</p>
                  </div>
                  <button onClick={() => downloadAgain(item.downloadUrl, item.title, item.ext)} className="btn-dark w-full sm:w-auto">
                    <Download className="h-4 w-4" /> Save
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
