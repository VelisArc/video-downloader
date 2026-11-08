import { useState } from 'react';
import { Clock3, Copy, Download, Eye, Share2, Sparkles, User, Video } from 'lucide-react';
import toast from 'react-hot-toast';
import type { DownloadHistoryItem } from '../lib/downloads';
import { copyText, sanitizeFilename } from '../lib/downloads';
import { siteConfig } from '../lib/site';

function fmt(platform?: string | null) {
  const name = (platform || '').trim();
  if (!name || name === 'generic') return 'Auto-detected';
  return name.split(/[-_.]/g).filter(Boolean).map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
}

interface Props {
  videoData: DownloadHistoryItem;
}

export default function ResultCard({ videoData }: Props) {
  const [imageFailed, setImageFailed] = useState(false);
  const hasThumbnail = Boolean(videoData.thumbnail) && !imageFailed;

  const download = () => {
    const anchor = document.createElement('a');
    anchor.href = videoData.downloadUrl;
    anchor.download = `${sanitizeFilename(videoData.title)}.${videoData.ext || 'mp4'}`;
    anchor.rel = 'noopener noreferrer';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    toast.success('Download started');
  };

  const copy = async () => {
    await copyText(videoData.downloadUrl);
    toast.success('Link copied');
  };

  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: `${siteConfig.name} download`, text: videoData.title, url: videoData.downloadUrl });
        toast.success('Shared');
        return;
      } catch {
        // Fall back to copying below.
      }
    }
    await copy();
  };

  return (
    <article
      className="animate-fade-up mt-4 overflow-hidden rounded-2xl border"
      style={{ borderColor: 'color-mix(in srgb, var(--brand-600) 24%, var(--border))', background: 'var(--surface)', boxShadow: 'var(--shadow-sm)' }}
    >
      <div className="flex items-center gap-2 border-b px-3 py-2" style={{ borderColor: 'var(--border)', background: 'var(--grad-brand-soft)' }}>
        <span className="flex h-5 w-5 items-center justify-center rounded-full text-white" style={{ background: 'var(--grad-brand)' }}>
          <Sparkles className="h-3 w-3" />
        </span>
        <span className="text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: 'var(--brand-700)' }}>Ready to save</span>
      </div>

      <div className="grid gap-4 p-3 sm:grid-cols-[168px_1fr] sm:p-4">
        <div className="overflow-hidden rounded-xl border" style={{ borderColor: 'var(--border)', background: 'var(--surface-soft)' }}>
          {hasThumbnail ? (
            <img src={videoData.thumbnail} alt="" className="h-32 w-full object-cover sm:h-full" loading="lazy" referrerPolicy="no-referrer" onError={() => setImageFailed(true)} />
          ) : (
            <div className="flex h-32 items-center justify-center sm:h-full" style={{ background: 'var(--grad-brand-soft)', color: 'var(--brand-600)' }}>
              <Video className="h-9 w-9" />
            </div>
          )}
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap gap-1.5">
            <span className="pill"><Sparkles className="h-3.5 w-3.5" />{(videoData.ext || 'mp4').toUpperCase()}</span>
            {videoData.platform && <span className="pill">{fmt(videoData.platform)}</span>}
            {videoData.uploader && <span className="pill"><User className="h-3.5 w-3.5" /><span className="truncate">{videoData.uploader}</span></span>}
            {videoData.duration && videoData.duration !== 'Unknown' && <span className="pill"><Clock3 className="h-3.5 w-3.5" />{videoData.duration}</span>}
            {videoData.view_count && videoData.view_count !== 'N/A' && <span className="pill"><Eye className="h-3.5 w-3.5" />{videoData.view_count}</span>}
          </div>

          <h3 className="mt-3 line-clamp-2 break-words text-base font-extrabold leading-snug">{videoData.title}</h3>

          <div className="mt-4 flex flex-wrap gap-2">
            <button onClick={download} className="btn-primary min-h-10 flex-1 px-4">
              <Download className="h-4 w-4" /> Save to device
            </button>
            <button onClick={copy} className="btn-outline min-h-10 px-3" aria-label="Copy link">
              <Copy className="h-4 w-4" /> <span className="hidden sm:inline">Copy</span>
            </button>
            <button onClick={share} className="btn-outline min-h-10 px-3" aria-label="Share">
              <Share2 className="h-4 w-4" /> <span className="hidden sm:inline">Share</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
