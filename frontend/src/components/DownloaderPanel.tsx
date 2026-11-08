import { useRef, useState } from 'react';
import { ArrowRight, Clipboard, FileAudio2, Link2, Video, X } from 'lucide-react';
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
          <p className="text-sm font-bold" style={{ color: 'var(--ink-900)' }}>Paste a public link</p>
          <p className="mt-0.5 text-xs" style={{ color: 'var(--ink-500)' }}>Video or audio - we detect the rest.</p>
        </div>

        <div
          className="inline-grid grid-cols-2 gap-1 rounded-full border p-1"
          style={{ borderColor: 'var(--border)', background: 'var(--surface-soft)' }}
          aria-label="Download type"
          role="group"
        >
          {(['video', 'audio'] as const).map(type => {
            const active = downloadType === type;
            return (
              <button
                key={type}
                onClick={() => setDownloadType(type)}
                className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-full px-3.5 text-xs font-bold transition-all duration-200"
                style={
                  active
                    ? { background: 'var(--grad-brand)', color: '#ffffff', boxShadow: '0 6px 16px -6px rgba(192,38,211,0.55)' }
                    : { color: 'var(--ink-500)' }
                }
                type="button"
                aria-pressed={active}
              >
                {type === 'video' ? <Video className="h-3.5 w-3.5" /> : <FileAudio2 className="h-3.5 w-3.5" />}
                {type === 'video' ? 'Video' : 'Audio'}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4 grid gap-2.5 lg:grid-cols-[1fr_auto]">
        <div
          className="flex min-h-[3.25rem] items-center gap-2 rounded-2xl border px-3 transition-all duration-200"
          style={{
            borderColor: focused ? 'color-mix(in srgb, var(--brand-600) 60%, var(--border))' : 'var(--border)',
            background: 'var(--surface)',
            boxShadow: focused ? '0 0 0 4px rgba(192,38,211,0.14)' : 'var(--shadow-xs)',
          }}
        >
          <Link2 className="h-5 w-5 shrink-0" style={{ color: focused ? 'var(--brand-600)' : 'var(--ink-400)' }} />
          <input
            ref={ref}
            type="url"
            value={url}
            onChange={event => setUrl(event.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyDown={event => event.key === 'Enter' && !isLoading && onDownload()}
            placeholder="https://instagram.com/reel/..."
            className="min-w-0 flex-1 border-0 bg-transparent py-3 text-sm font-medium outline-none placeholder:text-[var(--ink-400)]"
            style={{ color: 'var(--ink-900)' }}
            aria-label="Video URL"
          />
          {url && (
            <button
              onClick={() => setUrl('')}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-[var(--surface-soft)]"
              style={{ color: 'var(--ink-500)' }}
              type="button"
              aria-label="Clear URL"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={paste}
            className="hidden min-h-9 shrink-0 items-center gap-1.5 rounded-full border px-3 text-xs font-bold transition-colors hover:bg-[var(--surface-soft)] sm:inline-flex"
            style={{ borderColor: 'var(--border)', color: 'var(--ink-600)' }}
            type="button"
          >
            <Clipboard className="h-3.5 w-3.5" /> Paste
          </button>
        </div>

        <button onClick={onDownload} disabled={isLoading} className="btn-primary min-h-[3.25rem] px-6 text-[15px]">
          {isLoading ? (
            <LoadingIndicator label="Checking..." compact tone="light" />
          ) : (
            <>
              Download {downloadType}
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>

        <button
          onClick={paste}
          className="btn-outline min-h-11 w-full text-xs sm:hidden"
          type="button"
        >
          <Clipboard className="h-4 w-4" /> Paste from clipboard
        </button>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-medium" style={{ color: 'var(--ink-400)' }}>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: 'var(--success-500)' }} />
          Public links only
        </span>
        <span aria-hidden>|</span>
        <span>Failed checks don&apos;t use your daily limit</span>
      </div>
    </div>
  );
}
