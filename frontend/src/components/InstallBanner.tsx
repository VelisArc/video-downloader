import { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const InstallBanner = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showBanner, setShowBanner] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);
    const [showIOSInstructions, setShowIOSInstructions] = useState(false);

    useEffect(() => {
        // Check if already installed (running as standalone PWA)
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsInstalled(true);
            return;
        }

        // Check if dismissed recently (within 3 days)
        const dismissedTime = localStorage.getItem('swiftdl-banner-dismissed');
        if (dismissedTime) {
            const daysSinceDismissed = (Date.now() - parseInt(dismissedTime)) / (1000 * 60 * 60 * 24);
            if (daysSinceDismissed < 3) {
                return;
            }
        }

        // Detect iOS
        const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
        setIsIOS(isIOSDevice);

        // Show banner after delay - always show, not dependent on event
        const timer = setTimeout(() => setShowBanner(true), 2000);

        // For Android/Desktop, also listen for beforeinstallprompt
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        window.addEventListener('appinstalled', () => {
            setIsInstalled(true);
            setShowBanner(false);
        });

        return () => {
            clearTimeout(timer);
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstall = async () => {
        // If we have the native prompt, use it
        if (deferredPrompt) {
            try {
                await deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;

                if (outcome === 'accepted') {
                    setIsInstalled(true);
                    setShowBanner(false);
                }

                setDeferredPrompt(null);
            } catch (err) {
                // Ignore error
            }
            return;
        }

        // For iOS, show instructions
        if (isIOS) {
            setShowIOSInstructions(true);
            return;
        }

        // For other browsers without beforeinstallprompt, show instructions
        setShowIOSInstructions(true);
    };

    const handleDismiss = () => {
        setShowBanner(false);
        setShowIOSInstructions(false);
        localStorage.setItem('swiftdl-banner-dismissed', Date.now().toString());
    };

    if (!showBanner || isInstalled) return null;

    return (
        <div className="mt-6 animate-fade-in">
            {/* Main Install Banner */}
            <div className="bg-gradient-to-r from-pink-500 to-pink-600 rounded-xl p-4 shadow-lg">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                    {/* Left - Icon and Text */}
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Smartphone className="w-5 h-5 text-white" />
                        </div>
                        <div className="text-center sm:text-left">
                            <p className="text-white font-semibold text-sm">📱 Install SwiftDL App</p>
                            <p className="text-white/80 text-xs">Quick access • Works offline • No app store</p>
                        </div>
                    </div>

                    {/* Right - Buttons */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleDismiss}
                            className="px-3 py-1.5 text-white/80 hover:text-white text-xs font-medium transition flex items-center gap-1"
                        >
                            <X className="w-3 h-3" />
                            Cancel
                        </button>
                        <button
                            onClick={handleInstall}
                            className="px-4 py-2 bg-white text-pink-600 rounded-lg text-xs font-bold hover:bg-pink-50 transition flex items-center gap-1.5 shadow-md"
                        >
                            <Download className="w-4 h-4" />
                            Download App
                        </button>
                    </div>
                </div>
            </div>

            {/* iOS/Manual Instructions Popup */}
            {showIOSInstructions && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowIOSInstructions(false)}>
                    <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="text-center mb-4">
                            <div className="w-12 h-12 bg-pink-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                                <Smartphone className="w-6 h-6 text-pink-500" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">Install SwiftDL</h3>
                            <p className="text-xs text-gray-500 mt-1">Add to your home screen for quick access</p>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600 space-y-2">
                            {isIOS ? (
                                <>
                                    <p className="font-medium text-gray-800">On iPhone/iPad:</p>
                                    <p>1. Tap the <strong>Share</strong> button <span className="inline-block px-1.5 py-0.5 bg-gray-200 rounded text-xs">□↑</span></p>
                                    <p>2. Scroll down and tap <strong>"Add to Home Screen"</strong></p>
                                    <p>3. Tap <strong>"Add"</strong> to confirm</p>
                                </>
                            ) : (
                                <>
                                    <p className="font-medium text-gray-800">To install:</p>
                                    <p>1. Click the <strong>menu (⋮)</strong> in your browser</p>
                                    <p>2. Select <strong>"Install app"</strong> or <strong>"Add to Home Screen"</strong></p>
                                    <p>3. Follow the prompts to install</p>
                                </>
                            )}
                        </div>

                        <button
                            onClick={() => setShowIOSInstructions(false)}
                            className="w-full mt-4 py-2.5 bg-pink-500 text-white rounded-xl font-semibold text-sm hover:bg-pink-600 transition"
                        >
                            Got it!
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InstallBanner;
