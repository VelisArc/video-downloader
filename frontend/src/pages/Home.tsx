import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { Download, History, Trash2, Video } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import HomeSeoContent from '../components/HomeSeoContent';
import DownloaderPanel from '../components/DownloaderPanel';
import ResultCard from '../components/ResultCard';
import { DownloadHistoryItem, DownloadType, getOrCreateClientId, isSupportedUrl, loadDownloadHistory, normalizeUrl, sanitizeFilename, saveDownloadHistory } from '../lib/downloads';
import { siteConfig, siteUrl } from '../lib/site';
import { API_BASE } from '../lib/api';

const blank: DownloadHistoryItem = { id: '', thumbnail: '', title: '', downloadUrl: '', ext: 'mp4', date: '', type: 'video', platform: '' };

export default function Home() {
  const { user } = useAuth();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [type, setType] = useState<DownloadType>('video');
  const [history, setHistory] = useState<DownloadHistoryItem[]>([]);
  const [data, setData] = useState<DownloadHistoryItem>(blank);

  useEffect(() => { getOrCreateClientId(); setHistory(loadDownloadHistory()); }, []);

  const add = (d: Omit<DownloadHistoryItem, 'id' | 'date'>) => {
    const item: DownloadHistoryItem = { ...d, id: Date.now().toString(), date: new Date().toLocaleDateString() };
    const next = [item, ...history].slice(0, 10);
    setHistory(next); saveDownloadHistory(next); setData(item);
  };

  const handleDownload = async () => {
    const nu = normalizeUrl(url);
    if (!nu) return toast.error('Paste a video link first');
    if (!isSupportedUrl(nu)) return toast.error('Enter a valid video URL');
    setLoading(true); setShowResults(false);
    const t = toast.loading('Checking the link...');
    try {
      const token = user ? await user.getIdToken() : null;
      const r = await fetch(API_BASE, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify({ url: nu, type }) });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.error || 'The link could not be processed.');
      setUrl(nu);
      add({ thumbnail: d.thumbnail || '', title: d.title || 'Untitled', downloadUrl: d.downloadUrl, ext: d.ext || (type === 'audio' ? 'mp3' : 'mp4'), type, uploader: d.uploader, duration: d.duration, view_count: d.view_count, platform: d.platform || '' });
      setShowResults(true); toast.success('Ready to download!');
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Unexpected error'); }
    finally { toast.dismiss(t); setLoading(false); }
  };

  const dl = (url: string, title: string, ext: string) => {
    const a = document.createElement('a'); a.href = url; a.download = `${sanitizeFilename(title)}.${ext || 'mp4'}`; a.click(); a.remove(); toast.success('Download started');
  };

  const fmt = (p?: string | null) => {
    const n = (p || '').trim(); if (!n || n === 'generic') return 'Auto-detected'; return n.split(/[-_.]/g).filter(Boolean).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
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

      <div style={{ paddingBottom: '4rem', paddingTop: '2rem' }}>
        <div className="shell">
          {/* Hero */}
          <section className="relative rounded-xl p-8 md:p-12 text-center" style={{ background: 'var(--ink-heavy)', overflow: 'hidden' }}>
            <div className="absolute inset-0 opacity-[0.04]" style={{ background: 'radial-gradient(ellipse at 50% 40%, var(--brand-400), transparent 70%)' }} />
            <div className="relative z-10 max-w-2xl mx-auto">
              <span className="inline-block rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-wider" style={{ borderColor: 'rgba(255,255,255,0.12)', color: 'var(--brand-400)' }}>
                Browser-first downloader
              </span>
              <h1 className="mt-5 text-[clamp(1.6rem,4vw,2.8rem)] font-bold leading-tight text-white">
                Download from <span style={{ color: 'var(--brand-400)' }}>any major platform</span>
              </h1>
              <p className="mt-3 text-sm leading-relaxed max-w-xl mx-auto" style={{ color: 'var(--ink-500)' }}>
                YouTube, Instagram, Facebook, TikTok, and many more. Paste a link, choose format, download.
              </p>
            </div>
          </section>

          {/* Downloader */}
          <section className="relative z-20" style={{ margin: '-1.25rem auto 0', maxWidth: '40rem' }}>
            <div className="rounded-xl border p-5" style={{ borderColor: 'var(--border)', background: 'var(--surface)', boxShadow: 'var(--shadow-lg)' }}>
              <DownloaderPanel url={url} setUrl={setUrl} downloadType={type} setDownloadType={setType} isLoading={loading} onDownload={handleDownload} />
              {showResults && <ResultCard videoData={data} />}
            </div>
          </section>

          {/* Features */}
          <section className="mt-10">
            <div className="grid-features">
              {[
                { title: 'Wide platform coverage', desc: 'Works with many major yt-dlp-compatible platforms.', icon: Download },
                { title: 'Browser-first workflow', desc: 'Direct downloads in your browser. No app needed.', icon: Video },
                { title: 'Download history', desc: 'Recent downloads stay in your browser for quick access.', icon: History },
              ].map(f => (
                <article key={f.title} className="card card-hover">
                  <div className="inline-flex rounded-lg p-2 mb-3" style={{ background: 'var(--brand-50)', color: 'var(--brand-600)' }}><f.icon className="h-4 w-4" /></div>
                  <h2 className="text-sm font-bold" style={{ color: 'var(--ink-900)' }}>{f.title}</h2>
                  <p className="mt-1 text-xs leading-relaxed" style={{ color: 'var(--ink-600)' }}>{f.desc}</p>
                </article>
              ))}
            </div>
          </section>

          {/* History */}
          {history.length > 0 && (
            <section className="mt-10">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <span className="tag">Browser history</span>
                  <h2 className="mt-2 text-xl font-bold" style={{ color: 'var(--ink-900)' }}>Recent downloads</h2>
                </div>
                <button onClick={() => { setHistory([]); localStorage.removeItem('downloadHistory'); toast.success('History cleared'); }} className="btn-ghost text-[13px]"><Trash2 className="h-3.5 w-3.5" /> Clear</button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mt-4 stagger">
                {history.map(item => (
                  <article key={item.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    {item.thumbnail ? <img src={item.thumbnail} alt="" className="w-full h-28 object-cover" /> : (
                      <div className="flex items-center justify-center h-28" style={{ background: 'var(--brand-50)', color: 'var(--brand-600)' }}><Video className="h-6 w-6" /></div>
                    )}
                    <div className="p-3 space-y-2">
                      <div className="flex flex-wrap gap-1">
                        <span className="pill">{item.ext.toUpperCase()}</span>
                        {item.platform && <span className="pill">{fmt(item.platform)}</span>}
                      </div>
                      <h3 className="text-sm font-semibold line-clamp-2" style={{ color: 'var(--ink-900)' }}>{item.title}</h3>
                      <p className="text-[10px]" style={{ color: 'var(--ink-500)' }}>Saved on {item.date}</p>
                      <button onClick={() => dl(item.downloadUrl, item.title, item.ext)} className="btn-dark w-full text-[12px] py-2"><Download className="h-3.5 w-3.5" /> Download again</button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      <HomeSeoContent />
    </>
  );
}