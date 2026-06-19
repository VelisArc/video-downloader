import { Clock3, Copy, Download, Eye, Share2, Sparkles, User, Video } from 'lucide-react';
import toast from 'react-hot-toast';
import type { DownloadHistoryItem } from '../lib/downloads';
import { copyText, sanitizeFilename } from '../lib/downloads';
import { siteConfig } from '../lib/site';

function fmt(p?: string | null) {
  const n = (p || '').trim(); if (!n || n === 'generic') return 'Auto-detected';
  return n.split(/[-_.]/g).filter(Boolean).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
}

interface Props { videoData: DownloadHistoryItem; }

export default function ResultCard({ videoData }: Props) {
  const dl = () => {
    const a = document.createElement('a'); a.href = videoData.downloadUrl; a.target = '_blank'; a.download = `${sanitizeFilename(videoData.title)}.${videoData.ext || 'mp4'}`; a.click(); a.remove(); toast.success('Download started');
  };
  const copy = async () => { await copyText(videoData.downloadUrl); toast.success('Link copied'); };
  const share = async () => {
    if (navigator.share) { try { await navigator.share({ title: `${siteConfig.name} download`, text: videoData.title, url: videoData.downloadUrl }); toast.success('Shared'); return; } catch {} }
    await copy();
  };

  return (
    <article className="animate-fade-up mt-3 rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
      <div className="flex flex-col sm:flex-row gap-3 p-3">
        <div className="w-full sm:w-32 shrink-0 rounded-lg overflow-hidden">
          {videoData.thumbnail ? <img src={videoData.thumbnail} alt="" className="w-full h-28 object-cover" /> : (
            <div className="flex items-center justify-center h-28" style={{ background: 'var(--brand-50)', color: 'var(--brand-600)' }}><Video className="h-7 w-7" /></div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap gap-1 text-[10px]">
            {videoData.platform && <span className="pill"><Sparkles className="h-3 w-3" />{fmt(videoData.platform)}</span>}
            {videoData.uploader && <span className="pill"><User className="h-3 w-3" />{videoData.uploader}</span>}
            {videoData.duration && videoData.duration !== 'Unknown' && <span className="pill"><Clock3 className="h-3 w-3" />{videoData.duration}</span>}
            {videoData.view_count && videoData.view_count !== 'N/A' && <span className="pill"><Eye className="h-3 w-3" />{videoData.view_count}</span>}
          </div>
          <h3 className="mt-1.5 text-sm font-bold line-clamp-2" style={{ color: 'var(--ink-900)' }}>{videoData.title}</h3>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <button onClick={dl} className="btn-primary flex-1 text-xs py-2"><Download className="h-3.5 w-3.5" /> Save to device</button>
            <button onClick={copy} className="btn-ghost text-xs"><Copy className="h-3.5 w-3.5" /> Copy</button>
            <button onClick={share} className="btn-ghost text-xs"><Share2 className="h-3.5 w-3.5" /> Share</button>
          </div>
        </div>
      </div>
    </article>
  );
}