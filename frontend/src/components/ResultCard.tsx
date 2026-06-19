import { Clock3, Cookie, Copy, Download, Eye, Share2, Sparkles, User, Video } from 'lucide-react';
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
    // Set target blank in case cross-origin prevents actual download attribute from working
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
    <article className="card mt-6 animate-fade-in-up overflow-hidden shadow-lg">
      <div className="flex flex-col gap-4 md:flex-row">
        {/* Thumbnail */}
        <div className="relative w-full overflow-hidden rounded-2xl md:w-56 md:flex-none">
          {videoData.thumbnail ? (
            <img
              src={videoData.thumbnail}
              alt={videoData.title}
              className="h-44 w-full object-cover transition-transform duration-500 hover:scale-105"
            />
          ) : (
            <div
              className="flex h-44 items-center justify-center rounded-2xl"
              style={{ background: 'var(--surface-soft)', color: 'var(--brand-700)' }}
            >
              <Video className="h-8 w-8" />
            </div>
          )}
          <span className="pill-soft absolute left-3 top-3 backdrop-blur-sm">{videoData.ext.toUpperCase()}</span>
        </div>

        {/* Details */}
        <div className="min-w-0 flex-1">
          {/* Tags */}
          <div className="flex flex-wrap gap-2 text-xs font-medium" style={{ color: 'var(--ink-600)' }}>
            {videoData.platform && (
              <span className="pill-soft">
                <Sparkles className="h-3.5 w-3.5" style={{ color: 'var(--brand-600)' }} />
                {formatPlatformLabel(videoData.platform)}
              </span>
            )}
            {videoData.cookieMatch && (
              <span className="pill-soft" style={{ borderColor: 'var(--brand-300)', background: 'var(--brand-100)' }}>
                <Cookie className="h-3.5 w-3.5" />
                {videoData.cookieMatch.label}
              </span>
            )}
            {videoData.uploader && (
              <span className="pill-soft">
                <User className="h-3.5 w-3.5" style={{ color: 'var(--brand-600)' }} />
                {videoData.uploader}
              </span>
            )}
            {videoData.duration && videoData.duration !== 'Unknown' && (
              <span className="pill-soft">
                <Clock3 className="h-3.5 w-3.5" style={{ color: 'var(--brand-600)' }} />
                {videoData.duration}
              </span>
            )}
            {videoData.view_count && videoData.view_count !== 'N/A' && (
              <span className="pill-soft">
                <Eye className="h-3.5 w-3.5" style={{ color: 'var(--brand-600)' }} />
                {videoData.view_count}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="mt-3 line-clamp-2 text-xl font-black" style={{ color: 'var(--ink-900)' }}>
            {videoData.title}
          </h3>

          {/* Cookie match info */}
          {videoData.cookieMatch && (
            <p className="mt-3 rounded-2xl px-4 py-3 text-sm leading-6" style={{ background: 'var(--surface-soft)', color: 'var(--ink-600)' }}>
              Auto-matched <strong style={{ color: 'var(--ink-900)' }}>{videoData.cookieMatch.label}</strong> for{' '}
              {formatPlatformLabel(videoData.cookieMatch.platform)}.
            </p>
          )}

          {/* Actions */}
          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            <button type="button" onClick={handleFinalDownload} className="btn-brand flex-1 py-3" aria-label="Save file to device">
              <Download className="h-4 w-4" />
              Save to device
            </button>
            <button type="button" onClick={handleCopyLink} className="btn-outline" aria-label="Copy direct download link">
              <Copy className="h-4 w-4" />
              Copy link
            </button>
            <button type="button" onClick={handleShare} className="btn-outline" aria-label="Share this download">
              <Share2 className="h-4 w-4" />
              Share
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
