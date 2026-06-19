import { useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import {
  CheckCircle2,
  Download,
  FileAudio2,
  History,
  Search,
  Shield,
  Sparkles,
  Trash2,
  Video,
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { useEntitlement } from '../context/EntitlementContext';
import HomeSeoContent from '../components/HomeSeoContent';
import LoadingIndicator from '../components/LoadingIndicator';
import DownloaderPanel from '../components/DownloaderPanel';
import ResultCard from '../components/ResultCard';
import {
  copyText,
  DownloadHistoryItem,
  DownloadType,
  getOrCreateClientId,
  isSupportedUrl,
  loadDownloadHistory,
  normalizeUrl,
  sanitizeFilename,
  saveDownloadHistory,
} from '../lib/downloads';
import { platformHighlights, siteConfig, siteUrl } from '../lib/site';
import { API_BASE } from '../lib/api';

const blankItem: DownloadHistoryItem = {
  id: '',
  thumbnail: '',
  title: '',
  downloadUrl: '',
  ext: 'mp4',
  date: '',
  type: 'video',
  platform: '',
};

const features = [
  {
    title: 'Wide platform coverage',
    description: 'Works with many major yt-dlp-compatible platforms.',
    icon: Sparkles,
  },
  {
    title: 'Browser-first workflow',
    description: 'Direct downloads in your browser. No app needed.',
    icon: Download,
  },
  {
    title: 'Download history',
    description: 'Recent downloads stay in your browser for quick access.',
    icon: History,
  },
];

export default function Home() {
  const { user } = useAuth();
  const { entitlement } = useEntitlement();

  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [downloadType, setDownloadType] = useState<DownloadType>('video');
  const [history, setHistory] = useState<DownloadHistoryItem[]>([]);
  const [videoData, setVideoData] = useState<DownloadHistoryItem>(blankItem);

  useEffect(() => {
    getOrCreateClientId();
    setHistory(loadDownloadHistory());
  }, []);

  const addToHistory = (data: Omit<DownloadHistoryItem, 'id' | 'date'>) => {
    const next: DownloadHistoryItem = { ...data, id: Date.now().toString(), date: new Date().toLocaleDateString() };
    const updated = [next, ...history].slice(0, 10);
    setHistory(updated);
    saveDownloadHistory(updated);
    setVideoData(next);
  };

  const handleDownload = async () => {
    const nextUrl = normalizeUrl(url);
    if (!nextUrl) return toast.error('Paste a video link first');
    if (!isSupportedUrl(nextUrl)) return toast.error('Enter a valid video URL');

    setIsLoading(true);
    setShowResults(false);
    const loadingToast = toast.loading('Checking the link...');

    try {
      const token = user ? await user.getIdToken() : null;
      const r = await fetch(`${API_BASE}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ url: nextUrl, type: downloadType }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.error || 'The link could not be processed.');

      setUrl(nextUrl);
      addToHistory({
        thumbnail: d.thumbnail || '',
        title: d.title || 'Untitled download',
        downloadUrl: d.downloadUrl,
        ext: d.ext || (downloadType === 'audio' ? 'mp3' : 'mp4'),
        type: downloadType,
        uploader: d.uploader,
        duration: d.duration,
        view_count: d.view_count,
        platform: d.platform || '',
      });
      setShowResults(true);
      toast.success('Ready to download!');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Unexpected error');
    } finally {
      toast.dismiss(loadingToast);
      setIsLoading(false);
    }
  };

  const handleFinalDownload = (downloadUrl: string, title: string, ext: string) => {
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `${sanitizeFilename(title)}.${ext || 'mp4'}`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    toast.success('Download started');
  };

  const formatPlatformLabel = (platform?: string | null) => {
    const normalized = (platform || '').trim();
    if (!normalized || normalized === 'generic') return 'Auto-detected';
    return normalized.split(/[-_.]/g).filter(Boolean).map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
  };

  return (
    <>
      <Helmet>
        <title>SwiftDL | Multi-Platform Video & Audio Downloader</title>
        <meta name="description" content="Download videos and audio from YouTube, Instagram, Facebook, TikTok and more. Fast, free, browser-based downloader." />
        <link rel="canonical" href={siteUrl('/')} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={siteConfig.name} />
        <meta property="og:url" content={siteUrl('/')} />
        <meta property="og:title" content="SwiftDL | Multi-Platform Video Downloader" />
        <meta property="og:description" content="Download videos and audio from many major platforms. Fast, free, no sign-up required." />
        <meta property="og:image" content={siteUrl('/logo.png')} />
      </Helmet>

      <main className="pb-6 pt-8 md:pb-10 md:pt-10">
        <div className="section-shell">
          {/* Hero Section */}
          <section className="relative overflow-hidden rounded-[var(--radius-2xl)] p-8 md:p-12 lg:p-16" style={{ background: 'var(--gradient-brand)' }}>
            <div className="absolute inset-0 opacity-10">
              <div className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-white blur-3xl" />
              <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-white blur-3xl" />
            </div>
            <div className="relative z-10 mx-auto max-w-3xl text-center">
              <span className="inline-block rounded-full bg-white/20 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-white/90">
                Browser-first downloader
              </span>
              <h1 className="mt-6 text-balance text-4xl font-black leading-tight text-white md:text-6xl">
                Download from{' '}
                <span className="text-white/80">
                  any major platform
                </span>
              </h1>
              <p className="mx-auto mt-4 max-w-xl text-base leading-8 text-white/80 md:text-lg">
                Paste a link, choose format, download. Works with YouTube, Instagram, Facebook, TikTok, and many more.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
                {platformHighlights.map((hl) => (
                  <span key={hl} className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3.5 py-2 text-xs font-medium text-white shadow-sm backdrop-blur-sm">
                    <CheckCircle2 className="h-3.5 w-3.5 text-white/70" />
                    {hl}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* Downloader Section */}
          <section className="relative -mt-8 z-20 mx-auto max-w-4xl">
            <div className="rounded-[var(--radius-2xl)] border p-5 shadow-xl backdrop-blur-xl md:p-7" style={{ background: 'var(--glass-bg)', borderColor: 'var(--border-soft)' }}>
              <DownloaderPanel
                url={url}
                setUrl={setUrl}
                downloadType={downloadType}
                setDownloadType={setDownloadType}
                isLoading={isLoading}
                onDownload={handleDownload}
              />
              {showResults && <ResultCard videoData={videoData} />}
            </div>
          </section>

          {/* Features */}
          <section className="mt-20">
            <div className="grid gap-6 md:grid-cols-3">
              {features.map(({ title, description, icon: Icon }) => (
                <article key={title} className="feature-card">
                  <div className="mb-4 inline-flex rounded-2xl p-3" style={{ background: 'var(--surface-soft)', color: 'var(--brand-600)' }}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h2 className="text-lg font-bold" style={{ color: 'var(--ink-900)' }}>{title}</h2>
                  <p className="mt-2 text-sm leading-6" style={{ color: 'var(--ink-600)' }}>{description}</p>
                </article>
              ))}
            </div>
          </section>

          {/* Download History */}
          {history.length > 0 && (
            <section className="mt-16">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="section-eyebrow">Browser history</span>
                  <h2 className="mt-3 text-3xl font-black" style={{ color: 'var(--ink-900)' }}>Recent downloads</h2>
                </div>
                <button
                  type="button"
                  onClick={() => { setHistory([]); localStorage.removeItem('downloadHistory'); toast.success('History cleared'); }}
                  className="btn-outline"
                >
                  <Trash2 className="h-4 w-4" />
                  Clear history
                </button>
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3 stagger-children">
                {history.map((item) => (
                  <article key={item.id} className="feature-card overflow-hidden p-0">
                    {item.thumbnail ? (
                      <img src={item.thumbnail} alt={item.title} className="h-40 w-full object-cover" />
                    ) : (
                      <div className="flex h-40 items-center justify-center" style={{ background: 'var(--surface-soft)', color: 'var(--brand-700)' }}>
                        <Video className="h-7 w-7" />
                      </div>
                    )}
                    <div className="space-y-4 p-5">
                      <div>
                        <div className="flex flex-wrap gap-2">
                          <span className="pill-soft">{item.ext.toUpperCase()}</span>
                          {item.platform && <span className="pill-soft">{formatPlatformLabel(item.platform)}</span>}
                        </div>
                        <h3 className="mt-2 line-clamp-2 text-lg font-black" style={{ color: 'var(--ink-900)' }}>{item.title}</h3>
                        <p className="mt-2 text-xs" style={{ color: 'var(--ink-500)' }}>Saved on {item.date}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleFinalDownload(item.downloadUrl, item.title, item.ext)}
                        className="btn-dark w-full"
                      >
                        <Download className="h-4 w-4" />
                        Download again
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      <div className="border-t border-[var(--border-soft)] bg-white dark:bg-[#0f111a] transition-colors duration-300">
        <HomeSeoContent />
      </div>
    </>
  );
}
