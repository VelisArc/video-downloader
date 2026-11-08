import { useEffect, useState } from 'react';
import { Download, Share2, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event { prompt: () => Promise<void>; userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>; }

const DISMISS_KEY = 'sharehub-install-dismissed';
const DISMISS_WINDOW = 1000 * 60 * 60 * 24 * 3;

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const inStandalone = window.matchMedia('(display-mode: standalone)').matches;
    setIsIOS(ios); setInstalled(inStandalone);

    const dismissedAt = Number(localStorage.getItem(DISMISS_KEY) || 0);
    const shouldShow = !dismissedAt || Date.now() - dismissedAt > DISMISS_WINDOW;

    const handler = (e: Event) => {
      e.preventDefault();
      const ev = e as BeforeInstallPromptEvent;
      setDeferredPrompt(ev);
      (window as any).__sharehubDeferredPrompt = ev;
      window.dispatchEvent(new Event('sharehub-install-available'));
      if (shouldShow) setShow(true);
    };
    const installedHandler = () => { setInstalled(true); setShow(false); setDeferredPrompt(null); localStorage.removeItem(DISMISS_KEY); delete (window as any).__sharehubDeferredPrompt; window.dispatchEvent(new Event('sharehub-install-available')); };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', installedHandler);

    if (ios && !inStandalone && shouldShow) {
      const t = setTimeout(() => setShow(true), 2600);
      return () => { clearTimeout(t); window.removeEventListener('beforeinstallprompt', handler); window.removeEventListener('appinstalled', installedHandler); };
    }

    return () => { window.removeEventListener('beforeinstallprompt', handler); window.removeEventListener('appinstalled', installedHandler); };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    try { await deferredPrompt.prompt(); const { outcome } = await deferredPrompt.userChoice; if (outcome === 'accepted') setInstalled(true); }
    finally { setDeferredPrompt(null); setShow(false); localStorage.setItem(DISMISS_KEY, String(Date.now())); }
  };

  const dismiss = () => { setShow(false); localStorage.setItem(DISMISS_KEY, String(Date.now())); };

  if (installed || !show) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 z-50 flex justify-center px-4" style={{ bottom: 'calc(1.25rem + env(safe-area-inset-bottom))' }}>
      <div
        className="pointer-events-auto flex max-w-sm animate-slide-up items-center gap-2.5 rounded-full border py-1.5 pl-1.5 pr-2"
        style={{ borderColor: 'color-mix(in srgb, var(--border) 80%, transparent)', background: 'color-mix(in srgb, var(--surface) 92%, transparent)', boxShadow: 'var(--shadow-md)', backdropFilter: 'blur(18px)' }}
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white" style={{ background: 'var(--grad-brand)' }}>
          {isIOS ? <Share2 className="h-4 w-4" /> : <Download className="h-4 w-4" />}
        </span>
        <p className="min-w-0 flex-1 truncate text-xs font-semibold" style={{ color: 'var(--ink-800)' }}>
          {isIOS ? 'Safari: Share → Add to Home Screen' : 'Install ShareHub for one tap'}
        </p>
        {!isIOS && (
          <button onClick={handleInstall} className="btn-primary min-h-9 shrink-0 rounded-full px-4 text-xs">
            Install
          </button>
        )}
        <button onClick={dismiss} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-[var(--surface-soft)]" style={{ color: 'var(--ink-400)' }} aria-label="Dismiss install prompt">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
