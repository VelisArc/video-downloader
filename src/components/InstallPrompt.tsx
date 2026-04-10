import { useEffect, useMemo, useState } from 'react';
import { Download, Monitor, Share2, Smartphone, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_KEY = 'swiftdl-install-dismissed';
const DISMISS_WINDOW_MS = 1000 * 60 * 60 * 24 * 3;

function shouldShowPrompt() {
  const dismissedAt = Number(localStorage.getItem(DISMISS_KEY) || 0);
  return !dismissedAt || Date.now() - dismissedAt > DISMISS_WINDOW_MS;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const iosDevice =
      /iPad|iPhone|iPod/.test(navigator.userAgent) &&
      !(window as Window & { MSStream?: unknown }).MSStream;

    const inStandalone = window.matchMedia('(display-mode: standalone)').matches;
    setIsIOS(iosDevice);
    setIsInstalled(inStandalone);

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      const nextEvent = event as BeforeInstallPromptEvent;
      setDeferredPrompt(nextEvent);
      (window as Window & { __swiftdlDeferredPrompt?: BeforeInstallPromptEvent }).__swiftdlDeferredPrompt =
        nextEvent;
      window.dispatchEvent(new Event('swiftdl-install-available'));
      if (shouldShowPrompt()) {
        setShowPrompt(true);
      }
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
      localStorage.removeItem(DISMISS_KEY);
      try {
        delete (window as Window & { __swiftdlDeferredPrompt?: BeforeInstallPromptEvent })
          .__swiftdlDeferredPrompt;
      } catch {
        (window as Window & { __swiftdlDeferredPrompt?: BeforeInstallPromptEvent }).__swiftdlDeferredPrompt =
          undefined;
      }
      window.dispatchEvent(new Event('swiftdl-install-available'));
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    if (iosDevice && !inStandalone && shouldShowPrompt()) {
      const timer = window.setTimeout(() => setShowPrompt(true), 2200);
      return () => {
        window.clearTimeout(timer);
        window.removeEventListener(
          'beforeinstallprompt',
          handleBeforeInstallPrompt,
        );
        window.removeEventListener('appinstalled', handleAppInstalled);
      };
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const promptLabel = useMemo(
    () =>
      isIOS
        ? 'Save SwiftDL to your home screen for faster access and a cleaner full-screen experience.'
        : 'Install SwiftDL as a lightweight web app for quicker launches and a better mobile workflow.',
    [isIOS],
  );

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
    } finally {
      setDeferredPrompt(null);
      setShowPrompt(false);
      localStorage.setItem(DISMISS_KEY, Date.now().toString());
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
  };

  if (isInstalled || !showPrompt) return null;

  return (
    <div className="pointer-events-none fixed bottom-0 left-0 right-0 z-50 p-4 animate-slide-up">
      <div className="pointer-events-auto mx-auto max-w-md overflow-hidden rounded-3xl border border-[var(--border-strong)] bg-white shadow-[0_28px_60px_rgba(31,34,51,0.18)]">
        <div className="flex items-center justify-between bg-[linear-gradient(135deg,_#d84853,_#f49c4d)] px-5 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-white/15 p-2">
              <Download className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold">Install SwiftDL</p>
              <p className="text-[11px] uppercase tracking-[0.18em] text-white/75">
                Faster repeat use
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleDismiss}
            className="rounded-full p-1.5 text-white/85 transition hover:bg-white/10 hover:text-white"
            aria-label="Dismiss install prompt"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 p-5">
          <p className="text-sm leading-6 text-[var(--ink-600)]">{promptLabel}</p>

          <div className="grid grid-cols-2 gap-3 rounded-2xl bg-[var(--surface-soft)] p-3">
            <div className="rounded-2xl bg-white p-3">
              <Smartphone className="mb-2 h-4 w-4 text-[var(--brand-600)]" />
              <p className="text-xs font-semibold text-[var(--ink-900)]">
                Mobile friendly
              </p>
              <p className="mt-1 text-[11px] leading-5 text-[var(--ink-500)]">
                Cleaner repeat downloads without opening app stores.
              </p>
            </div>
            <div className="rounded-2xl bg-white p-3">
              <Monitor className="mb-2 h-4 w-4 text-[var(--brand-600)]" />
              <p className="text-xs font-semibold text-[var(--ink-900)]">
                Desktop ready
              </p>
              <p className="mt-1 text-[11px] leading-5 text-[var(--ink-500)]">
                Launch from your taskbar or browser shelf.
              </p>
            </div>
          </div>

          {isIOS ? (
            <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] p-4 text-sm text-[var(--ink-600)]">
              <p className="font-semibold text-[var(--ink-900)]">
                Install on iPhone or iPad
              </p>
              <ol className="mt-3 space-y-2 text-xs leading-5">
                <li>1. Tap <strong>Share</strong> in Safari.</li>
                <li>2. Choose <strong>Add to Home Screen</strong>.</li>
                <li>3. Tap <strong>Add</strong> to finish.</li>
              </ol>
              <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-[var(--surface-soft)] px-3 py-1 text-[11px] font-medium text-[var(--brand-700)]">
                <Share2 className="h-3.5 w-3.5" />
                Safari installation only
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleInstall}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--ink-900)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--ink-700)]"
            >
              <Download className="h-4 w-4" />
              Install App
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
