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
          <p className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: 'var(--brand-700)' }}>
            Downloader
          </p>
          <h2 className="mt-2 text-2xl font-black md:text-3xl" style={{ color: 'var(--ink-900)' }}>
            Paste your link and download
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6" style={{ color: 'var(--ink-600)' }}>
            Works with public video links from major platforms.
          </p>
        </div>
        <div className="inline-flex rounded-full border p-1 shadow-sm" style={{ borderColor: 'var(--border-soft)', background: 'var(--surface)' }}>
          <button
            type="button"
            onClick={() => setDownloadType('video')}
            className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200"
            style={downloadType === 'video' ? { background: 'var(--ink-900)', color: '#fff' } : { color: 'var(--ink-600)' }}
          >
            <Video className="h-3.5 w-3.5" /> Video
          </button>
          <button
            type="button"
            onClick={() => setDownloadType('audio')}
            className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200"
            style={downloadType === 'audio' ? { background: 'var(--ink-900)', color: '#fff' } : { color: 'var(--ink-600)' }}
          >
            <FileAudio2 className="h-3.5 w-3.5" /> Audio
          </button>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {/* URL Input */}
        <div
          className="relative rounded-[22px] transition-all duration-300"
          style={{
            boxShadow: isFocused ? '0 0 0 4px rgba(240,95,107,0.1), 0 8px 24px rgba(0,0,0,0.06)' : '0 4px 16px rgba(0,0,0,0.04)',
          }}
        >
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4" style={{ color: 'var(--ink-500)' }}>
            <Link2 className="h-5 w-5" />
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
            className="w-full rounded-[22px] border py-4 pl-12 pr-36 text-base transition-all duration-200"
            style={{
              borderColor: isFocused ? 'var(--brand-500)' : 'var(--border-soft)',
              background: 'var(--surface)',
              color: 'var(--ink-900)',
            }}
          />
          <div className="absolute right-2.5 top-1/2 flex -translate-y-1/2 items-center gap-1">
            {url && (
              <button
                type="button"
                onClick={() => setUrl('')}
                className="rounded-full p-2 transition hover:bg-[var(--surface-soft)]"
                style={{ color: 'var(--ink-500)' }}
                aria-label="Clear link"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <button
              type="button"
              onClick={handlePaste}
              className="pill-soft gap-1.5 px-3 py-2 text-xs transition hover:bg-[var(--brand-200)]"
              aria-label="Paste from clipboard"
            >
              <Clipboard className="h-3.5 w-3.5" />
              Paste
            </button>
          </div>
        </div>

        {/* Download button */}
        <button
          type="button"
          onClick={onDownload}
          disabled={isLoading}
          className="btn-brand w-full py-4 text-base"
          style={isLoading ? { opacity: 0.75, cursor: 'not-allowed' } : {}}
        >
          {isLoading ? (
            <LoadingIndicator label="Checking the link..." compact tone="light" />
          ) : (
            <>
              <Download className="h-5 w-5" />
              {`Download ${downloadType === 'video' ? 'video' : 'audio'}`}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
