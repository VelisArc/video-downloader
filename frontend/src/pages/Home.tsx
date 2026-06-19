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

      <div style={{ paddingBottom: '3rem', paddingTop: '1rem' }}>
        {/* Hero - Full width */}
        <section className="relative overflow-hidden" style={{ background: 'var(--ink-heavy)', minHeight: '460px', borderRadius: '1rem', maxWidth: 'calc(100% - 1rem)', margin: '0 auto' }}>
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 70% 50%, rgba(59,130,246,0.12) 0%, transparent 60%)' }} />
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.8) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
          <div className="relative z-10 flex items-center min-h-[460px]">
            <div className="w-full lg:w-1/2 px-8 py-10 lg:px-14 lg:py-12">
              <span className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-wider" style={{ borderColor: 'rgba(255,255,255,0.15)', color: 'var(--brand-400)' }}>
                <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: 'var(--brand-400)' }} />
                Browser-first downloader
              </span>
              <h1 className="mt-5 text-[clamp(1.8rem,4vw,3rem)] font-bold leading-tight text-white">
                Download from<br /><span style={{ color: 'var(--brand-400)' }}>any major platform</span>
              </h1>
              <p className="mt-4 text-sm leading-relaxed max-w-md" style={{ color: 'var(--ink-500)' }}>
                YouTube, Instagram, Facebook, TikTok, and 1000+ other sites. Paste a link, pick your format, download instantly.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                {['No signup required', 'Free to use', 'HD downloads'].map(t => (
                  <span key={t} className="inline-flex items-center gap-1.5 text-xs" style={{ color: 'var(--ink-400)' }}>
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: 'var(--accent-500)' }} />{t}
                  </span>
                ))}
              </div>
            </div>
            <div className="hidden lg:flex w-1/2 items-center justify-center pr-12" style={{ perspective: '1200px' }}>
              <div className="relative" style={{ transform: 'rotateY(-12deg) rotateX(5deg)', transformStyle: 'preserve-3d' }}>
                <div className="rounded-xl overflow-hidden border" style={{ background: 'var(--surface)', borderColor: 'rgba(255,255,255,0.1)', boxShadow: 'var(--shadow-2xl)', width: '380px' }}>
                  <div className="flex items-center gap-1.5 px-3 py-2 border-b" style={{ background: 'var(--surface-soft)', borderColor: 'rgba(255,255,255,0.06)' }}>
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: '#ff5f57' }} />
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: '#febc2e' }} />
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: '#28c840' }} />
                    <div className="flex-1 mx-3 h-5 rounded-md" style={{ background: 'rgba(255,255,255,0.06)' }} />
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="rounded-lg h-24 flex items-center justify-center" style={{ background: 'var(--brand-700)' }}>
                      <span className="text-white/60 text-xs">Video Preview</span>
                    </div>
                    <div className="space-y-2">
                      <div className="h-2.5 rounded-full w-full" style={{ background: 'var(--brand-600)', opacity: 0.3 }} />
                      <div className="h-2 rounded-full w-4/5" style={{ background: 'var(--ink-300)' }} />
                      <div className="h-2 rounded-full w-3/5" style={{ background: 'var(--ink-300)' }} />
                    </div>
                    <div className="flex gap-2 pt-1">
                      <div className="h-7 flex-1 rounded-md" style={{ background: 'var(--brand-600)' }} />
                      <div className="h-7 w-16 rounded-md" style={{ background: 'var(--surface-soft)' }} />
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-4 -right-8 rounded-lg border p-2.5" style={{ background: 'var(--surface)', borderColor: 'rgba(255,255,255,0.08)', boxShadow: 'var(--shadow-xl)', transform: 'translateZ(40px) rotateY(8deg) rotateX(-4deg)' }}>
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-md flex items-center justify-center" style={{ background: 'var(--accent-500)' }}>
                      <span className="text-white text-[10px] font-bold">MP4</span>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-white">Ready to download</p>
                      <p className="text-[9px]" style={{ color: 'var(--ink-500)' }}>1080p • 42.3 MB</p>
                    </div>
                  </div>
                </div>
                <div className="absolute -top-3 -left-6 rounded-full px-2.5 py-1 border text-[9px] font-medium" style={{ background: 'var(--surface)', borderColor: 'rgba(255,255,255,0.08)', color: 'var(--ink-400)', transform: 'translateZ(30px) rotateY(-6deg)' }}>
                  YouTube • Instagram • TikTok
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Downloader + Features + History - contained width */}
        <div className="mx-auto px-4 sm:px-6" style={{ maxWidth: '100%', width: '100%', marginTop: '-2rem', position: 'relative', zIndex: 20 }}>
          <div style={{ maxWidth: '42rem', margin: '0 auto' }}>
            <section className="relative" style={{ margin: '-1rem auto 0' }}>
              <div className="rounded-2xl border p-5" style={{ borderColor: 'var(--border)', background: 'var(--surface)', boxShadow: 'var(--shadow-xl)' }}>
                <DownloaderPanel url={url} setUrl={setUrl} downloadType={type} setDownloadType={setType} isLoading={loading} onDownload={handleDownload} />
                {showResults && <ResultCard videoData={data} />}
              </div>
            </section>

            <section className="mt-12">
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
      </div>

      <HomeSeoContent />
    </>
  );
}