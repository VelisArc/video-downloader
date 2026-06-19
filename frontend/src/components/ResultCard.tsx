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
    <article
      className="animate-fade-in-up"
      style={{
        marginTop: '1rem',
        borderRadius: 'var(--radius-2xl)',
        background: 'var(--surface)',
        border: '1px solid var(--border-soft)',
        boxShadow: 'var(--shadow-lg)',
        overflow: 'hidden',
      }}
    >
      <div className="flex flex-col gap-3 md:flex-row" style={{ padding: '1rem' }}>
        {/* Thumbnail */}
        <div
          style={{
            width: '100%',
            borderRadius: 'var(--radius-xl)',
            overflow: 'hidden',
            flex: 'none',
          }}
          className="md:w-40"
        >
          {videoData.thumbnail ? (
            <img
              src={videoData.thumbnail}
              alt={videoData.title}
              style={{
                width: '100%',
                height: '9rem',
                objectFit: 'cover',
                borderRadius: 'var(--radius-xl)',
                transition: 'transform 500ms ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
            />
          ) : (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                height: '9rem',
                borderRadius: 'var(--radius-xl)',
                background: 'var(--surface-soft)',
                color: 'var(--brand-700)',
              }}
            >
              <Video style={{ width: 28, height: 28 }} />
            </div>
          )}
        </div>

        {/* Details */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Tags */}
          <div
            className="flex flex-wrap"
            style={{ gap: '0.375rem', fontSize: '10px', fontWeight: 500, color: 'var(--ink-600)' }}
          >
            {videoData.platform && (
              <span className="pill-soft">
                <Sparkles style={{ width: 12, height: 12, color: 'var(--brand-600)' }} />
                {formatPlatformLabel(videoData.platform)}
              </span>
            )}
            {videoData.uploader && (
              <span className="pill-soft">
                <User style={{ width: 12, height: 12, color: 'var(--brand-600)' }} />
                {videoData.uploader}
              </span>
            )}
            {videoData.duration && videoData.duration !== 'Unknown' && (
              <span className="pill-soft">
                <Clock3 style={{ width: 12, height: 12, color: 'var(--brand-600)' }} />
                {videoData.duration}
              </span>
            )}
            {videoData.view_count && videoData.view_count !== 'N/A' && (
              <span className="pill-soft">
                <Eye style={{ width: 12, height: 12, color: 'var(--brand-600)' }} />
                {videoData.view_count}
              </span>
            )}
          </div>

          {/* Title */}
          <h3
            className="line-clamp-2"
            style={{
              marginTop: '0.625rem',
              fontSize: '0.95rem',
              fontWeight: 700,
              color: 'var(--ink-900)',
              lineHeight: 1.4,
            }}
          >
            {videoData.title}
          </h3>

          {/* Actions */}
          <div
            className="flex flex-col gap-1.5 sm:flex-row"
            style={{ marginTop: '0.875rem' }}
          >
            <button
              type="button"
              onClick={handleFinalDownload}
              className="btn-brand flex-1"
              style={{ padding: '0.5rem 0.875rem', fontSize: '0.8rem' }}
              aria-label="Save file to device"
            >
              <Download style={{ width: 14, height: 14 }} />
              Save to device
            </button>
            <button
              type="button"
              onClick={handleCopyLink}
              className="btn-ghost"
              style={{ fontSize: '0.8rem' }}
              aria-label="Copy direct download link"
            >
              <Copy style={{ width: 14, height: 14 }} />
              Copy link
            </button>
            <button
              type="button"
              onClick={handleShare}
              className="btn-ghost"
              style={{ fontSize: '0.8rem' }}
              aria-label="Share this download"
            >
              <Share2 style={{ width: 14, height: 14 }} />
              Share
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
