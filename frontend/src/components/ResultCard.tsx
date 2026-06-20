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
    anchor.target = '_blank';
    anchor.download = `${sanitizeFilename(videoData.title)}.${videoData.ext || 'mp4'}`;
    anchor.click();
    anchor.remove();
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
    <article className="animate-fade-up mt-4 overflow-hidden rounded-lg border" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
      <div className="grid gap-4 p-3 sm:grid-cols-[156px_1fr] sm:p-4">
        <div className="overflow-hidden rounded-md border" style={{ borderColor: 'var(--border)' }}>
          {hasThumbnail ? (
            <img src={videoData.thumbnail} alt="" className="h-40 w-full object-cover sm:h-full" loading="lazy" referrerPolicy="no-referrer" onError={() => setImageFailed(true)} />
          ) : (
            <div className="flex h-40 items-center justify-center" style={{ background: 'var(--brand-50)', color: 'var(--brand-700)' }}>
              <Video className="h-8 w-8" />
            </div>
          )}
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap gap-1.5">
            <span className="pill"><Sparkles className="h-3.5 w-3.5" />{videoData.ext.toUpperCase()}</span>
            {videoData.platform && <span className="pill">{fmt(videoData.platform)}</span>}
            {videoData.uploader && <span className="pill"><User className="h-3.5 w-3.5" /><span className="truncate">{videoData.uploader}</span></span>}
            {videoData.duration && videoData.duration !== 'Unknown' && <span className="pill"><Clock3 className="h-3.5 w-3.5" />{videoData.duration}</span>}
            {videoData.view_count && videoData.view_count !== 'N/A' && <span className="pill"><Eye className="h-3.5 w-3.5" />{videoData.view_count}</span>}
          </div>

          <h3 className="mt-3 line-clamp-2 break-words text-base font-extrabold">{videoData.title}</h3>

          <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_auto_auto]">
            <button onClick={download} className="btn-primary w-full">
              <Download className="h-4 w-4" /> Save to device
            </button>
            <button onClick={copy} className="btn-outline">
              <Copy className="h-4 w-4" /> Copy
            </button>
            <button onClick={share} className="btn-outline">
              <Share2 className="h-4 w-4" /> Share
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
