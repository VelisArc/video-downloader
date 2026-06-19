import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import {
  CheckCircle2,
  Download,
  History,
  Shield,
  Sparkles,
  Trash2,
  Video,
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import HomeSeoContent from '../components/HomeSeoContent';
import DownloaderPanel from '../components/DownloaderPanel';
import ResultCard from '../components/ResultCard';
import {
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

      <main style={{ paddingBottom: '2rem', paddingTop: '1.5rem' }}>
        <div className="section-shell">
          {/* Hero Section */}
          <section
            className="relative overflow-hidden"
            style={{
              borderRadius: 'var(--radius-2xl)',
              background: 'var(--gradient-brand)',
              padding: '2.5rem 1.5rem',
            }}
          >
            {/* Mesh overlay */}
            <div
              className="absolute inset-0"
              style={{
                background: 'var(--gradient-mesh)',
                opacity: 0.4,
              }}
            />
            {/* Decorative orbs */}
            <div className="absolute inset-0" style={{ opacity: 0.08 }}>
              <div
                className="absolute"
                style={{
                  top: '-4rem',
                  right: '-4rem',
                  width: '14rem',
                  height: '14rem',
                  borderRadius: '50%',
                  background: 'white',
                  filter: 'blur(80px)',
                }}
              />
              <div
                className="absolute"
                style={{
                  bottom: '-4rem',
                  left: '-4rem',
                  width: '14rem',
                  height: '14rem',
                  borderRadius: '50%',
                  background: 'white',
                  filter: 'blur(80px)',
                }}
              />
            </div>

            <div className="relative z-10 mx-auto" style={{ maxWidth: '48rem', textAlign: 'center' }}>
              <span
                style={{
                  display: 'inline-block',
                  borderRadius: 'var(--radius-full)',
                  background: 'rgba(255,255,255,0.18)',
                  backdropFilter: 'blur(8px)',
                  padding: '0.375rem 0.875rem',
                  fontSize: '11px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.16em',
                  color: 'rgba(255,255,255,0.9)',
                }}
              >
                Browser-first downloader
              </span>

              <h1
                className="text-balance"
                style={{
                  marginTop: '1.25rem',
                  fontSize: 'clamp(1.875rem, 4vw, 3rem)',
                  fontWeight: 900,
                  lineHeight: 1.1,
                  color: 'white',
                }}
              >
                Download from{' '}
                <span style={{ color: 'rgba(255,255,255,0.8)' }}>
                  any major platform
                </span>
              </h1>

              <p
                className="mx-auto"
                style={{
                  marginTop: '0.875rem',
                  maxWidth: '36rem',
                  fontSize: '0.9rem',
                  lineHeight: 1.7,
                  color: 'rgba(255,255,255,0.78)',
                }}
              >
                Paste a link, choose format, download. Works with YouTube, Instagram, Facebook, TikTok, and many more.
              </p>

              <div
                className="flex flex-wrap items-center justify-center"
                style={{ marginTop: '1.25rem', gap: '0.5rem' }}
              >
                {platformHighlights.map((hl) => (
                  <span
                    key={hl}
                    className="inline-flex items-center gap-1"
                    style={{
                      borderRadius: 'var(--radius-full)',
                      background: 'rgba(255,255,255,0.12)',
                      backdropFilter: 'blur(8px)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      padding: '0.375rem 0.75rem',
                      fontSize: '11px',
                      fontWeight: 500,
                      color: 'white',
                    }}
                  >
                    <CheckCircle2 style={{ width: 12, height: 12, opacity: 0.7 }} />
                    {hl}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* Downloader Section — overlapping hero */}
          <section
            className="relative z-20 mx-auto"
            style={{
              marginTop: '-2.5rem',
              maxWidth: '48rem',
            }}
          >
            <div
              style={{
                borderRadius: 'var(--radius-2xl)',
                background: 'var(--surface)',
                border: '1px solid var(--border-soft)',
                boxShadow: 'var(--shadow-xl)',
                backdropFilter: 'blur(24px) saturate(1.5)',
                padding: '1.25rem',
              }}
            >
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
          <section style={{ marginTop: '3.5rem' }}>
            <div className="grid gap-4 md:grid-cols-3">
              {features.map(({ title, description, icon: Icon }) => (
                <article key={title} className="feature-card">
                  <div
                    style={{
                      display: 'inline-flex',
                      borderRadius: 'var(--radius-md)',
                      padding: '0.625rem',
                      marginBottom: '0.75rem',
                      background: 'var(--brand-100)',
                      color: 'var(--brand-700)',
                    }}
                  >
                    <Icon style={{ width: 16, height: 16 }} />
                  </div>
                  <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--ink-900)' }}>
                    {title}
                  </h2>
                  <p style={{ marginTop: '0.375rem', fontSize: '0.8rem', lineHeight: 1.6, color: 'var(--ink-600)' }}>
                    {description}
                  </p>
                </article>
              ))}
            </div>
          </section>

          {/* Download History */}
          {history.length > 0 && (
            <section style={{ marginTop: '3rem' }}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="section-eyebrow">Browser history</span>
                  <h2 style={{ marginTop: '0.5rem', fontSize: '1.5rem', fontWeight: 900, color: 'var(--ink-900)' }}>
                    Recent downloads
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => { setHistory([]); localStorage.removeItem('downloadHistory'); toast.success('History cleared'); }}
                  className="btn-ghost"
                  style={{ gap: '0.375rem', fontSize: '0.8rem' }}
                >
                  <Trash2 style={{ width: 14, height: 14 }} />
                  Clear
                </button>
              </div>

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3 stagger-children" style={{ marginTop: '1rem' }}>
                {history.map((item) => (
                  <article
                    key={item.id}
                    className="feature-card"
                    style={{ padding: 0, overflow: 'hidden' }}
                  >
                    {item.thumbnail ? (
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        style={{
                          width: '100%',
                          height: '7.5rem',
                          objectFit: 'cover',
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          height: '7.5rem',
                          background: 'var(--surface-soft)',
                          color: 'var(--brand-700)',
                        }}
                      >
                        <Video style={{ width: 24, height: 24 }} />
                      </div>
                    )}

                    <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <div>
                        <div className="flex flex-wrap" style={{ gap: '0.375rem' }}>
                          <span className="pill-soft">{item.ext.toUpperCase()}</span>
                          {item.platform && (
                            <span className="pill-soft">{formatPlatformLabel(item.platform)}</span>
                          )}
                        </div>
                        <h3
                          className="line-clamp-2"
                          style={{
                            marginTop: '0.5rem',
                            fontSize: '0.85rem',
                            fontWeight: 700,
                            color: 'var(--ink-900)',
                          }}
                        >
                          {item.title}
                        </h3>
                        <p style={{ marginTop: '0.25rem', fontSize: '11px', color: 'var(--ink-500)' }}>
                          Saved on {item.date}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleFinalDownload(item.downloadUrl, item.title, item.ext)}
                        className="btn-dark w-full"
                        style={{ fontSize: '0.8rem', padding: '0.5rem 0.75rem' }}
                      >
                        <Download style={{ width: 14, height: 14 }} />
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

      <HomeSeoContent />
    </>
  );
}
