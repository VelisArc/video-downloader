import { useEffect, useMemo, useState } from 'react';
import { Download, Monitor, Share2, Smartphone, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event { prompt: () => Promise<void>; userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>; }

const DISMISS_KEY = 'swiftdl-install-dismissed';
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
      (window as any).__swiftdlDeferredPrompt = ev;
      window.dispatchEvent(new Event('swiftdl-install-available'));
      if (shouldShow) setShow(true);
    };
    const installedHandler = () => { setInstalled(true); setShow(false); setDeferredPrompt(null); localStorage.removeItem(DISMISS_KEY); delete (window as any).__swiftdlDeferredPrompt; window.dispatchEvent(new Event('swiftdl-install-available')); };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', installedHandler);

    if (ios && !inStandalone && shouldShow) {
      const t = setTimeout(() => setShow(true), 2200);
      return () => { clearTimeout(t); window.removeEventListener('beforeinstallprompt', handler); window.removeEventListener('appinstalled', installedHandler); };
    }

    return () => { window.removeEventListener('beforeinstallprompt', handler); window.removeEventListener('appinstalled', installedHandler); };
  }, []);

  const label = useMemo(() => isIOS ? 'Save SwiftDL to your home screen for faster access.' : 'Install SwiftDL as a lightweight web app.', [isIOS]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    try { await deferredPrompt.prompt(); const { outcome } = await deferredPrompt.userChoice; if (outcome === 'accepted') setInstalled(true); }
    finally { setDeferredPrompt(null); setShow(false); localStorage.setItem(DISMISS_KEY, String(Date.now())); }
  };

  const dismiss = () => { setShow(false); localStorage.setItem(DISMISS_KEY, String(Date.now())); };

  if (installed || !show) return null;

  return (
    <div className="pointer-events-none fixed bottom-0 left-0 right-0 z-50 p-4 animate-slide-up">
      <div className="pointer-events-auto mx-auto max-w-md overflow-hidden rounded-xl border shadow-xl" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
        <div className="flex items-center justify-between px-4 py-3 text-white" style={{ background: 'var(--brand-600)' }}>
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-white/15 p-1.5"><Download className="h-4 w-4" /></div>
            <div><p className="text-sm font-semibold">Install SwiftDL</p><p className="text-[10px] uppercase tracking-wider text-white/70">Faster repeat use</p></div>
          </div>
          <button onClick={dismiss} className="rounded-full p-1 text-white/70 hover:bg-white/10"><X className="h-4 w-4" /></button>
        </div>
        <div className="p-4 space-y-3">
          <p className="text-xs leading-relaxed" style={{ color: 'var(--ink-600)' }}>{label}</p>
          <div className="grid grid-cols-2 gap-2 rounded-lg p-2.5" style={{ background: 'var(--surface-soft)' }}>
            {[
              { icon: Smartphone, title: 'Mobile friendly', desc: 'Cleaner repeat downloads.' },
              { icon: Monitor, title: 'Desktop ready', desc: 'Launch from your taskbar.' },
            ].map(c => <div key={c.title} className="rounded-lg p-2.5" style={{ background: 'var(--surface)' }}>
              <c.icon className="h-4 w-4 mb-1.5" style={{ color: 'var(--brand-600)' }} />
              <p className="text-xs font-semibold" style={{ color: 'var(--ink-900)' }}>{c.title}</p>
              <p className="text-[10px] mt-0.5 leading-relaxed" style={{ color: 'var(--ink-500)' }}>{c.desc}</p>
            </div>)}
          </div>
          {isIOS ? (
            <div className="rounded-lg p-3 text-xs" style={{ background: 'var(--surface-soft)' }}>
              <p className="font-semibold" style={{ color: 'var(--ink-900)' }}>Install on iPhone/iPad</p>
              <ol className="mt-2 space-y-1" style={{ color: 'var(--ink-600)' }}>
                <li>1. Tap <strong>Share</strong> in Safari</li>
                <li>2. Choose <strong>Add to Home Screen</strong></li>
                <li>3. Tap <strong>Add</strong></li>
              </ol>
              <div className="mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium" style={{ background: 'var(--brand-50)', color: 'var(--brand-600)' }}><Share2 className="h-3 w-3" /> Safari only</div>
            </div>
          ) : <button onClick={handleInstall} className="btn-dark w-full text-xs py-2.5"><Download className="h-3.5 w-3.5" /> Install App</button>}
        </div>
      </div>
    </div>
  );
}