import { useRef, useState } from 'react';
import { Clipboard, Download, FileAudio2, Link2, Video, X } from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingIndicator from './LoadingIndicator';
import type { DownloadType } from '../lib/downloads';

interface Props {
  url: string;
  setUrl: (value: string) => void;
  downloadType: DownloadType;
  setDownloadType: (type: DownloadType) => void;
  isLoading: boolean;
  onDownload: () => void;
}

export default function DownloaderPanel({ url, setUrl, downloadType, setDownloadType, isLoading, onDownload }: Props) {
  const ref = useRef<HTMLInputElement>(null);
  const [focused, setFocused] = useState(false);

  const paste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text?.trim()) return toast.error('Clipboard is empty');
      setUrl(text);
      toast.success('Link pasted');
      requestAnimationFrame(() => ref.current?.focus());
    } catch {
      toast.error('Failed to read clipboard');
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold" style={{ color: 'var(--ink-900)' }}>Download setup</p>
          <p className="mt-1 text-sm" style={{ color: 'var(--ink-600)' }}>Public source link</p>
        </div>

        <div className="inline-grid grid-cols-2 rounded-md border p-1" style={{ borderColor: 'var(--border)', background: 'var(--surface-soft)' }} aria-label="Download type">
          {(['video', 'audio'] as const).map(type => {
            const active = downloadType === type;
            return (
              <button
                key={type}
                onClick={() => setDownloadType(type)}
                className="inline-flex min-h-9 items-center justify-center gap-2 rounded-md px-3 text-sm font-semibold transition-colors"
                style={active ? { background: 'var(--surface)', color: 'var(--brand-700)', boxShadow: 'var(--shadow-xs)' } : { color: 'var(--ink-600)' }}
                type="button"
              >
                {type === 'video' ? <Video className="h-4 w-4" /> : <FileAudio2 className="h-4 w-4" />}
                {type === 'video' ? 'Video' : 'Audio'}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_auto]">
        <div
          className="grid gap-2 rounded-md border p-2 transition-colors sm:flex sm:min-h-12 sm:items-center sm:px-3"
          style={{
            borderColor: focused ? 'var(--border-strong)' : 'var(--border)',
            background: 'var(--surface)',
            boxShadow: focused ? '0 0 0 4px rgba(20,184,166,0.12)' : 'var(--shadow-xs)',
          }}
        >
          <div className="flex min-h-9 min-w-0 items-center gap-2">
            <Link2 className="h-5 w-5 shrink-0" style={{ color: 'var(--ink-500)' }} />
            <input
              ref={ref}
              type="url"
              value={url}
              onChange={event => setUrl(event.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              onKeyDown={event => event.key === 'Enter' && !isLoading && onDownload()}
              placeholder="https://..."
              className="min-w-0 flex-1 border-0 bg-transparent text-sm outline-none"
              style={{ color: 'var(--ink-900)' }}
              aria-label="Video URL"
            />
            {url && (
              <button
                onClick={() => setUrl('')}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-colors hover:bg-[var(--surface-soft)]"
                style={{ color: 'var(--ink-500)' }}
                type="button"
                aria-label="Clear URL"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <button onClick={paste} className="btn-outline min-h-9 w-full shrink-0 px-2.5 py-1 text-xs sm:min-h-8 sm:w-auto" type="button">
            <Clipboard className="h-3.5 w-3.5" /> Paste
          </button>
        </div>

        <button onClick={onDownload} disabled={isLoading} className="btn-primary min-h-12 px-5">
          {isLoading ? (
            <LoadingIndicator label="Checking..." compact tone="light" />
          ) : (
            <>
              <Download className="h-4 w-4" /> Download {downloadType}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
