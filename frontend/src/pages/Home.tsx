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

      <main className="pb-5 pt-6 md:pb-8 md:pt-8">
        <div className="section-shell">
          {/* Hero Section */}
          <section className="relative overflow-hidden rounded-[var(--radius-xl)] p-6 md:p-10 lg:p-12" style={{ background: 'var(--gradient-brand)' }}>
            <div className="absolute inset-0 opacity-10">
              <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-white blur-3xl" />
              <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-white blur-3xl" />
            </div>
            <div className="relative z-10 mx-auto max-w-3xl text-center">
              <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/90">
                Browser-first downloader
              </span>
              <h1 className="mt-4 text-balance text-3xl font-black leading-tight text-white md:text-5xl">
                Download from{' '}
                <span className="text-white/80">
                  any major platform
                </span>
              </h1>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-white/80 md:text-base">
                Paste a link, choose format, download. Works with YouTube, Instagram, Facebook, TikTok, and many more.
              </p>
              <div className="mt-5 flex flex-wrap items-center justify-center gap-1.5">
                {platformHighlights.map((hl) => (
                  <span key={hl} className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1.5 text-[11px] font-medium text-white shadow-sm backdrop-blur-sm">
                    <CheckCircle2 className="h-3 w-3 text-white/70" />
                    {hl}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* Downloader Section */}
          <section className="relative -mt-7 z-20 mx-auto max-w-4xl">
            <div className="rounded-[var(--radius-xl)] border p-4 shadow-xl backdrop-blur-xl md:p-5" style={{ background: 'var(--glass-bg)', borderColor: 'var(--border-soft)' }}>
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
          <section className="mt-14">
            <div className="grid gap-4 md:grid-cols-3">
              {features.map(({ title, description, icon: Icon }) => (
                <article key={title} className="feature-card">
                  <div className="mb-3 inline-flex rounded-xl p-2.5" style={{ background: 'var(--surface-soft)', color: 'var(--brand-600)' }}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <h2 className="text-base font-bold" style={{ color: 'var(--ink-900)' }}>{title}</h2>
                  <p className="mt-1.5 text-xs leading-5" style={{ color: 'var(--ink-600)' }}>{description}</p>
                </article>
              ))}
            </div>
          </section>

          {/* Download History */}
          {history.length > 0 && (
            <section className="mt-12">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="section-eyebrow">Browser history</span>
                  <h2 className="mt-2 text-2xl font-black" style={{ color: 'var(--ink-900)' }}>Recent downloads</h2>
                </div>
                <button
                  type="button"
                  onClick={() => { setHistory([]); localStorage.removeItem('downloadHistory'); toast.success('History cleared'); }}
                  className="btn-outline"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Clear history
                </button>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3 stagger-children">
                {history.map((item) => (
                  <article key={item.id} className="feature-card overflow-hidden p-0">
                    {item.thumbnail ? (
                      <img src={item.thumbnail} alt={item.title} className="h-32 w-full object-cover" />
                    ) : (
                      <div className="flex h-32 items-center justify-center" style={{ background: 'var(--surface-soft)', color: 'var(--brand-700)' }}>
                        <Video className="h-6 w-6" />
                      </div>
                    )}
                    <div className="space-y-3 p-4">
                      <div>
                        <div className="flex flex-wrap gap-1.5">
                          <span className="pill-soft">{item.ext.toUpperCase()}</span>
                          {item.platform && <span className="pill-soft">{formatPlatformLabel(item.platform)}</span>}
                        </div>
                        <h3 className="mt-1.5 line-clamp-2 text-sm font-black" style={{ color: 'var(--ink-900)' }}>{item.title}</h3>
                        <p className="mt-1 text-[11px]" style={{ color: 'var(--ink-500)' }}>Saved on {item.date}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleFinalDownload(item.downloadUrl, item.title, item.ext)}
                        className="btn-dark w-full"
                      >
                        <Download className="h-3.5 w-3.5" />
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
