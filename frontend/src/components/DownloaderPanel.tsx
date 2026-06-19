import { useRef, useState } from 'react';
import { Clipboard, Download, FileAudio2, Link2, Video, X } from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingIndicator from './LoadingIndicator';
import type { DownloadType } from '../lib/downloads';

interface DownloaderPanelProps {
  url: string;
  setUrl: (url: string) => void;
  downloadType: DownloadType;
  setDownloadType: (t: DownloadType) => void;
  isLoading: boolean;
  onDownload: () => void;
}

export default function DownloaderPanel({
  url,
  setUrl,
  downloadType,
  setDownloadType,
  isLoading,
  onDownload,
}: DownloaderPanelProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isFocused, setIsFocused] = useState(false);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text || text.trim() === '') {
        toast.error('Clipboard is empty');
        return;
      }
      setUrl(text);
      toast.success('Link pasted successfully');
      window.requestAnimationFrame(() => inputRef.current?.focus());
    } catch (err: any) {
      if (err.name === 'NotAllowedError') {
        toast.error('Please allow clipboard access to use this feature');
      } else {
        toast.error('Failed to read clipboard');
      }
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <span
            style={{
              fontSize: '10px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: 'var(--brand-600)',
            }}
          >
            Downloader
          </span>
          <h2
            style={{
              marginTop: '0.25rem',
              fontSize: 'clamp(1.1rem, 2vw, 1.35rem)',
              fontWeight: 800,
              color: 'var(--ink-900)',
            }}
          >
            Paste your link and download
          </h2>
          <p style={{ marginTop: '0.2rem', fontSize: '0.8rem', lineHeight: 1.5, color: 'var(--ink-600)' }}>
            Works with public video links from major platforms.
          </p>
        </div>

        <div
          style={{
            display: 'inline-flex',
            borderRadius: 'var(--radius-md)',
            padding: '3px',
            background: 'var(--surface-soft)',
            border: '1px solid var(--border-soft)',
          }}
        >
          <button
            type="button"
            onClick={() => setDownloadType('video')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.375rem',
              borderRadius: 'var(--radius-md)',
              padding: '0.375rem 0.75rem',
              fontSize: '0.75rem',
              fontWeight: 600,
              transition: 'all 150ms ease',
              ...(downloadType === 'video'
                ? {
                    background: 'var(--brand-600)',
                    color: 'white',
                  }
                : {
                    background: 'transparent',
                    color: 'var(--ink-600)',
                  }),
            }}
          >
            <Video style={{ width: 12, height: 12 }} /> Video
          </button>
          <button
            type="button"
            onClick={() => setDownloadType('audio')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.375rem',
              borderRadius: 'var(--radius-md)',
              padding: '0.375rem 0.75rem',
              fontSize: '0.75rem',
              fontWeight: 600,
              transition: 'all 150ms ease',
              ...(downloadType === 'audio'
                ? {
                    background: 'var(--brand-600)',
                    color: 'white',
                  }
                : {
                    background: 'transparent',
                    color: 'var(--ink-600)',
                  }),
            }}
          >
            <FileAudio2 style={{ width: 12, height: 12 }} /> Audio
          </button>
        </div>
      </div>

      <div style={{ marginTop: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
        <div
          style={{
            position: 'relative',
            borderRadius: 'var(--radius-lg)',
            boxShadow: isFocused
              ? '0 0 0 3px rgba(37, 99, 235, 0.1)'
              : 'var(--shadow-sm)',
            transition: 'box-shadow 200ms ease',
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: '0.75rem',
              top: '50%',
              transform: 'translateY(-50%)',
              display: 'flex',
              alignItems: 'center',
              color: 'var(--ink-500)',
              pointerEvents: 'none',
            }}
          >
            <Link2 style={{ width: 16, height: 16 }} />
          </div>

          <input
            ref={inputRef}
            id="url-input"
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !isLoading) onDownload(); }}
            placeholder="Paste a public video link..."
            style={{
              width: '100%',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid',
              borderColor: isFocused ? 'var(--brand-500)' : 'var(--border-soft)',
              background: 'var(--surface)',
              color: 'var(--ink-900)',
              padding: '0.75rem 7rem 0.75rem 2.5rem',
              fontSize: '0.875rem',
              outline: 'none',
              transition: 'border-color 150ms ease',
            }}
          />

          <div
            style={{
              position: 'absolute',
              right: '0.5rem',
              top: '50%',
              transform: 'translateY(-50%)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
            }}
          >
            {url && (
              <button
                type="button"
                onClick={() => setUrl('')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '1.75rem',
                  height: '1.75rem',
                  borderRadius: 'var(--radius-full)',
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--ink-500)',
                  cursor: 'pointer',
                  transition: 'background 150ms ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-soft)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                aria-label="Clear link"
              >
                <X style={{ width: 14, height: 14 }} />
              </button>
            )}
            <button
              type="button"
              onClick={handlePaste}
              className="pill-soft"
              style={{
                gap: '0.25rem',
                padding: '0.3rem 0.5rem',
                fontSize: '10px',
                cursor: 'pointer',
              }}
              aria-label="Paste from clipboard"
            >
              <Clipboard style={{ width: 12, height: 12 }} />
              Paste
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={onDownload}
          disabled={isLoading}
          className="btn-brand w-full"
          style={{
            padding: '0.75rem',
            fontSize: '0.875rem',
            ...(isLoading ? { opacity: 0.75, cursor: 'not-allowed' } : {}),
          }}
        >
          {isLoading ? (
            <LoadingIndicator label="Checking the link..." compact tone="light" />
          ) : (
            <>
              <Download style={{ width: 16, height: 16 }} />
              {`Download ${downloadType === 'video' ? 'video' : 'audio'}`}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
