import { Clock3, Copy, Download, Eye, Share2, Sparkles, User, Video } from 'lucide-react';
import toast from 'react-hot-toast';
import type { DownloadHistoryItem } from '../lib/downloads';
import { copyText, sanitizeFilename } from '../lib/downloads';
import { siteConfig } from '../lib/site';

function formatPlatformLabel(platform?: string | null) {
  const normalized = (platform || '').trim();
  if (!normalized || normalized === 'generic') return 'Auto-detected';
  return normalized
    .split(/[-_.]/g)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

interface ResultCardProps {
  videoData: DownloadHistoryItem;
}

export default function ResultCard({ videoData }: ResultCardProps) {
  const handleFinalDownload = () => {
    const link = document.createElement('a');
    link.href = videoData.downloadUrl;
    link.target = '_blank';
    link.download = `${sanitizeFilename(videoData.title)}.${videoData.ext || 'mp4'}`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    toast.success('Download started');
  };

  const handleCopyLink = async () => {
    await copyText(videoData.downloadUrl);
    toast.success('Download link copied');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${siteConfig.name} download`,
          text: videoData.title,
          url: videoData.downloadUrl,
        });
        toast.success('Shared');
        return;
      } catch { /* user cancelled */ }
    }
    await handleCopyLink();
  };

  return (
    <article className="card mt-4 animate-fade-in-up overflow-hidden shadow-lg">
      <div className="flex flex-col gap-3 md:flex-row">
        {/* Thumbnail */}
        <div className="relative w-full overflow-hidden rounded-xl md:w-44 md:flex-none">
          {videoData.thumbnail ? (
            <img
              src={videoData.thumbnail}
              alt={videoData.title}
              className="h-36 w-full object-cover transition-transform duration-500 hover:scale-105"
            />
          ) : (
            <div
              className="flex h-36 items-center justify-center rounded-xl"
              style={{ background: 'var(--surface-soft)', color: 'var(--brand-700)' }}
            >
              <Video className="h-7 w-7" />
            </div>
          )}
          <span className="pill-soft absolute left-2 top-2 backdrop-blur-sm">{videoData.ext.toUpperCase()}</span>
        </div>

        {/* Details */}
        <div className="min-w-0 flex-1">
          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 text-[10px] font-medium" style={{ color: 'var(--ink-600)' }}>
            {videoData.platform && (
              <span className="pill-soft">
                <Sparkles className="h-3 w-3" style={{ color: 'var(--brand-600)' }} />
                {formatPlatformLabel(videoData.platform)}
              </span>
            )}
            {videoData.uploader && (
              <span className="pill-soft">
                <User className="h-3 w-3" style={{ color: 'var(--brand-600)' }} />
                {videoData.uploader}
              </span>
            )}
            {videoData.duration && videoData.duration !== 'Unknown' && (
              <span className="pill-soft">
                <Clock3 className="h-3 w-3" style={{ color: 'var(--brand-600)' }} />
                {videoData.duration}
              </span>
            )}
            {videoData.view_count && videoData.view_count !== 'N/A' && (
              <span className="pill-soft">
                <Eye className="h-3 w-3" style={{ color: 'var(--brand-600)' }} />
                {videoData.view_count}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="mt-2 line-clamp-2 text-base font-black" style={{ color: 'var(--ink-900)' }}>
            {videoData.title}
          </h3>

          {/* Actions */}
          <div className="mt-3 flex flex-col gap-1.5 sm:flex-row">
            <button type="button" onClick={handleFinalDownload} className="btn-brand flex-1 py-2" aria-label="Save file to device">
              <Download className="h-3.5 w-3.5" />
              Save to device
            </button>
            <button type="button" onClick={handleCopyLink} className="btn-outline" aria-label="Copy direct download link">
              <Copy className="h-3.5 w-3.5" />
              Copy link
            </button>
            <button type="button" onClick={handleShare} className="btn-outline" aria-label="Share this download">
              <Share2 className="h-3.5 w-3.5" />
              Share
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
