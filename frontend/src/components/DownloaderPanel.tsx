import { useRef, useState } from 'react';
import { Clipboard, Download, FileAudio2, Link2, Video, X } from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingIndicator from './LoadingIndicator';
import type { DownloadType } from '../lib/downloads';

interface Props { url: string; setUrl: (v: string) => void; downloadType: DownloadType; setDownloadType: (t: DownloadType) => void; isLoading: boolean; onDownload: () => void; }

export default function DownloaderPanel({ url, setUrl, downloadType, setDownloadType, isLoading, onDownload }: Props) {
  const ref = useRef<HTMLInputElement>(null);
  const [focused, setFocused] = useState(false);

  const paste = async () => {
    try {
      const t = await navigator.clipboard.readText();
      if (!t?.trim()) return toast.error('Clipboard is empty');
      setUrl(t); toast.success('Link pasted');
      requestAnimationFrame(() => ref.current?.focus());
    } catch { toast.error('Failed to read clipboard'); }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--brand-600)' }}>Downloader</span>
          <h2 className="mt-1 text-[clamp(1rem,2vw,1.25rem)] font-bold" style={{ color: 'var(--ink-900)' }}>Paste your link and download</h2>
          <p className="text-xs mt-0.5" style={{ color: 'var(--ink-600)' }}>Works with public video links from major platforms.</p>
        </div>
        <div className="inline-flex rounded-md p-0.5" style={{ background: 'var(--surface-soft)', border: '1px solid var(--border)' }}>
          {(['video', 'audio'] as const).map(t => (
            <button key={t} onClick={() => setDownloadType(t)} className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors" style={downloadType === t ? { background: 'var(--brand-600)', color: 'white' } : { background: 'transparent', color: 'var(--ink-600)' }}>
              {t === 'video' ? <Video className="h-3 w-3" /> : <FileAudio2 className="h-3 w-3" />}
              {t === 'video' ? 'Video' : 'Audio'}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3 space-y-2.5">
        <div className="relative rounded-lg" style={{ boxShadow: focused ? '0 0 0 3px rgba(59,130,246,0.12)' : 'var(--shadow-sm)' }}>
          <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center" style={{ color: 'var(--ink-500)', pointerEvents: 'none' }}><Link2 className="h-4 w-4" /></div>
          <input ref={ref} type="text" value={url} onChange={e => setUrl(e.target.value)} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} onKeyDown={e => e.key === 'Enter' && !isLoading && onDownload()}
            placeholder="Paste a public video link..."
            className="w-full rounded-lg border bg-[var(--surface)] text-sm outline-none transition-colors" style={{ borderColor: focused ? 'var(--border-strong)' : 'var(--border)', color: 'var(--ink-900)', padding: '0.7rem 7rem 0.7rem 2.5rem' }} />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {url && (
              <button onClick={() => setUrl('')} className="flex items-center justify-center w-7 h-7 rounded-full border-0 bg-transparent cursor-pointer" style={{ color: 'var(--ink-500)' }}
                onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = 'var(--surface-soft)'}
                onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'transparent'}>
                <X className="h-3.5 w-3.5" />
              </button>
            )}
            <button onClick={paste} className="pill text-[9px] gap-1 py-1 px-2 cursor-pointer" style={{ border: '1px solid var(--border)' }}><Clipboard className="h-3 w-3" /> Paste</button>
          </div>
        </div>
        <button onClick={onDownload} disabled={isLoading} className="btn-primary w-full py-2.5 text-sm" style={isLoading ? { opacity: .75, cursor: 'not-allowed' } : {}}>
          {isLoading ? <LoadingIndicator label="Checking the link..." compact tone="light" /> : <><Download className="h-4 w-4" /> Download {downloadType}</>}
        </button>
      </div>
    </div>
  );
}