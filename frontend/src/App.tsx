import { lazy, Suspense, useEffect, useState } from 'react';
import {
  BrowserRouter as Router,
  NavLink,
  Route,
  Routes,
  Link,
} from 'react-router-dom';
import {
  Download,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  User,
  X,
} from 'lucide-react';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import ScrollToTop from './components/ScrollToTop';
import InstallPrompt from './components/InstallPrompt';
import AdsenseAutoAds from './components/AdsenseAutoAds';
import LoadingIndicator from './components/LoadingIndicator';
import ThemeToggle from './components/ThemeToggle';
import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider, useAuth } from './context/AuthContext';
import { EntitlementProvider } from './context/EntitlementContext';
import { footerGroups, primaryNav, siteConfig } from './lib/site';

const Home = lazy(() => import('./pages/Home'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));
const DMCA = lazy(() => import('./pages/DMCA'));
const AboutUs = lazy(() => import('./pages/AboutUs'));
const ContactUs = lazy(() => import('./pages/ContactUs'));
const SupportedPlatforms = lazy(() => import('./pages/SupportedPlatforms'));

const HowToDownloadInstagramReels = lazy(() => import('./pages/HowToDownloadInstagramReels'));
const HowToDownloadFacebookVideos = lazy(() => import('./pages/HowToDownloadFacebookVideos'));
const FAQ = lazy(() => import('./pages/FAQ'));
const RefundPolicy = lazy(() => import('./pages/RefundPolicy'));
const ShippingDeliveryPolicy = lazy(() => import('./pages/ShippingDeliveryPolicy'));
const PricingPolicy = lazy(() => import('./pages/PricingPolicy'));
const NotFound = lazy(() => import('./pages/NotFound'));

function PageLoader() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="glass-panel flex items-center justify-center rounded-2xl px-5 py-4">
        <LoadingIndicator label="Loading..." />
      </div>
    </div>
  );
}

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [installAvailable, setInstallAvailable] = useState(false);
  const [showInstallHelp, setShowInstallHelp] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const { user, signInWithGoogle, logout } = useAuth();

  useEffect(() => {
    const iosDevice =
      /iPad|iPhone|iPod/.test(navigator.userAgent) &&
      !(window as Window & { MSStream?: unknown }).MSStream;
    setIsIOS(iosDevice);

    const updateInstallAvailability = () => {
      const installed = window.matchMedia('(display-mode: standalone)').matches;
      const deferredPrompt = (
        window as Window & { __swiftdlDeferredPrompt?: unknown }
      ).__swiftdlDeferredPrompt;
      setInstallAvailable(!installed && (Boolean(deferredPrompt) || iosDevice));
    };

    updateInstallAvailability();
    window.addEventListener('swiftdl-install-available', updateInstallAvailability);
    return () => {
      window.removeEventListener('swiftdl-install-available', updateInstallAvailability);
    };
  }, []);

  const handleInstallClick = async () => {
    const deferredPrompt = (
      window as Window & {
        __swiftdlDeferredPrompt?: {
          prompt?: () => Promise<void>;
          userChoice?: Promise<unknown>;
        } | null;
      }
    ).__swiftdlDeferredPrompt;

    if (isIOS || !deferredPrompt?.prompt) {
      setShowInstallHelp(true);
      return;
    }

    try {
      await deferredPrompt.prompt();
      await deferredPrompt.userChoice;
    } finally {
      try {
        delete (window as Window & { __swiftdlDeferredPrompt?: unknown }).__swiftdlDeferredPrompt;
      } catch {
        (window as Window & { __swiftdlDeferredPrompt?: unknown }).__swiftdlDeferredPrompt = undefined;
      }
      window.dispatchEvent(new Event('swiftdl-install-available'));
    }
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `rounded-full px-3 py-1.5 text-[13px] font-semibold transition-all duration-200 ${
      isActive
        ? 'bg-[var(--surface-soft)] text-[var(--brand-700)]'
        : 'text-[var(--ink-600)] hover:bg-[var(--surface-soft)] hover:text-[var(--brand-700)]'
    }`;

  const handleLogoutConfirm = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      setShowLogoutConfirm(false);
      setIsMenuOpen(false);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      <header
        className="sticky top-0 z-50 border-b backdrop-blur-xl"
        style={{
          borderColor: 'var(--border-soft)',
          background: 'var(--surface-glass)',
        }}
      >
        <div className="section-shell">
          <div className="flex items-center justify-between py-3">
            <Link
              to="/"
              className="flex items-center gap-2.5"
              onClick={() => setIsMenuOpen(false)}
            >
              <div className="rounded-xl bg-[linear-gradient(135deg,_#d84853,_#f49c4d)] p-2 text-white shadow-lg">
                <Download className="h-4 w-4" />
              </div>
              <div>
                <p className="text-base font-black" style={{ color: 'var(--ink-900)' }}>
                  {siteConfig.name}
                </p>
                <p className="text-[10px] uppercase tracking-[0.14em]" style={{ color: 'var(--ink-500)' }}>
                  Browser downloader
                </p>
              </div>
            </Link>

            <nav className="hidden items-center gap-1 lg:flex">
              {primaryNav.map((item) => (
                <NavLink key={item.to} to={item.to} className={navLinkClass}>
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <div className="hidden items-center gap-3 lg:flex">
              <ThemeToggle />

              {installAvailable && (
                <button
                  type="button"
                  onClick={handleInstallClick}
                  className="btn-outline"
                >
                  Install
                </button>
              )}

              {user ? (
                <div className="flex items-center gap-3">
                  <Link to="/dashboard" className="flex items-center gap-2">
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt={user.displayName || 'User'}
                        className="h-8 w-8 rounded-full border-2 shadow-sm transition-transform hover:scale-105"
                        style={{ borderColor: 'var(--surface-soft)' }}
                      />
                    ) : (
                      <span
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full"
                        style={{ background: 'var(--surface-soft)', color: 'var(--brand-700)' }}
                      >
                        <User className="h-3.5 w-3.5" />
                      </span>
                    )}
                  </Link>
                  <Link to="/dashboard" className="btn-outline hidden xl:inline-flex">
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>
                  <button
                    type="button"
                    onClick={() => setShowLogoutConfirm(true)}
                    className="btn-dark"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={signInWithGoogle}
                  className="btn-brand"
                >
                  <LogIn className="h-4 w-4" />
                  Login
                </button>
              )}
            </div>

            {/* Mobile menu toggle */}
            <div className="flex items-center gap-1.5 lg:hidden">
              <ThemeToggle />
              <button
                type="button"
                onClick={() => setIsMenuOpen((value) => !value)}
                className="rounded-xl border p-2 lg:hidden"
                style={{
                  borderColor: 'var(--border-soft)',
                  background: 'var(--surface)',
                  color: 'var(--ink-700)',
                }}
                aria-label="Toggle menu"
              >
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {isMenuOpen && (
            <div className="pb-3 lg:hidden animate-fade-in">
              <div
                className="rounded-2xl border p-3 shadow-lg"
                style={{
                  borderColor: 'var(--border-soft)',
                  background: 'var(--surface)',
                }}
              >
                <div className="flex flex-col gap-2">
                  {primaryNav.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={navLinkClass}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.label}
                    </NavLink>
                  ))}
                  {user && (
                    <NavLink
                      to="/dashboard"
                      className={navLinkClass}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Dashboard
                    </NavLink>
                  )}
                </div>

                <div className="mt-4 flex flex-col gap-2 border-t pt-4" style={{ borderColor: 'var(--border-soft)' }}>
                  {installAvailable && (
                    <button
                      type="button"
                      onClick={() => {
                        handleInstallClick();
                        setIsMenuOpen(false);
                      }}
                      className="btn-outline w-full"
                    >
                      Install app
                    </button>
                  )}
                  {user ? (
                    <button
                      type="button"
                      onClick={() => {
                        setShowLogoutConfirm(true);
                        setIsMenuOpen(false);
                      }}
                      className="btn-dark w-full"
                    >
                      Logout
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        signInWithGoogle();
                        setIsMenuOpen(false);
                      }}
                      className="btn-brand w-full"
                    >
                      Login with Google
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Install help modal */}
      {showInstallHelp && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-sm"
          style={{ background: 'rgba(0,0,0,0.55)' }}
          onClick={() => setShowInstallHelp(false)}
        >
          <div
            className="w-full max-w-xs animate-scale-up rounded-2xl p-5 shadow-2xl"
            style={{ background: 'var(--surface)' }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mx-auto inline-flex rounded-xl p-2" style={{ background: 'var(--surface-soft)', color: 'var(--brand-700)' }}>
              <Download className="h-5 w-5" />
            </div>
            <h3 className="mt-3 text-center text-xl font-black" style={{ color: 'var(--ink-900)' }}>
              Install {siteConfig.name}
            </h3>
            <p className="mt-2 text-center text-xs leading-6" style={{ color: 'var(--ink-600)' }}>
              Add the app to your device for quicker access.
            </p>
            <div className="mt-4 rounded-xl p-3 text-xs leading-6" style={{ background: 'var(--surface-soft)', color: 'var(--ink-600)' }}>
              {isIOS ? (
                <ol className="space-y-2">
                  <li>1. Tap <strong>Share</strong> in Safari.</li>
                  <li>2. Choose <strong>Add to Home Screen</strong>.</li>
                  <li>3. Tap <strong>Add</strong> to finish.</li>
                </ol>
              ) : (
                <ol className="space-y-2">
                  <li>1. Open your browser menu.</li>
                  <li>2. Choose <strong>Install App</strong> or <strong>Add to Home Screen</strong>.</li>
                  <li>3. Confirm the prompt.</li>
                </ol>
              )}
            </div>
            <button
              type="button"
              onClick={() => setShowInstallHelp(false)}
              className="btn-dark mt-5 w-full"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Logout confirm modal */}
      {showLogoutConfirm && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center p-4 backdrop-blur-sm"
          style={{ background: 'rgba(0,0,0,0.55)' }}
          onClick={() => { if (!isLoggingOut) setShowLogoutConfirm(false); }}
        >
          <div
            className="w-full max-w-xs animate-scale-up rounded-2xl p-5 shadow-2xl"
            style={{ background: 'var(--surface)' }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mx-auto inline-flex rounded-xl p-2" style={{ background: 'var(--surface-soft)', color: 'var(--brand-700)' }}>
              <LogOut className="h-5 w-5" />
            </div>
            <h3 className="mt-3 text-center text-xl font-black" style={{ color: 'var(--ink-900)' }}>
              Confirm logout
            </h3>
            <p className="mt-2 text-center text-xs leading-6" style={{ color: 'var(--ink-600)' }}>
              Are you sure you want to logout?
            </p>
            <div className="mt-6 flex gap-2">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                disabled={isLoggingOut}
                className="btn-outline flex-1"
              >
                Stay logged in
              </button>
              <button
                type="button"
                onClick={handleLogoutConfirm}
                disabled={isLoggingOut}
                className="btn-dark flex-1"
              >
                {isLoggingOut ? (
                  <LoadingIndicator label="Logging out..." compact tone="light" />
                ) : (
                  <span className="inline-flex items-center gap-2">
                    <LogOut className="h-4 w-4" />
                    Logout
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function AppShell() {
  return (
    <Router>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[101] focus:rounded-full focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
        style={{ background: 'var(--ink-900)' }}
      >
        Skip to content
      </a>
      <div className="min-h-screen" style={{ color: 'var(--ink-900)' }}>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'var(--surface)',
              color: 'var(--ink-900)',
              border: '1px solid var(--border-soft)',
              borderRadius: '16px',
            },
          }}
        />
        <ScrollToTop />
        <AdsenseAutoAds />
        <InstallPrompt />
        <Navbar />

        <main id="main-content" className="min-h-[60vh]">
          <ErrorBoundary>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/terms-of-service" element={<TermsOfService />} />
                <Route path="/dmca" element={<DMCA />} />
                <Route path="/about-us" element={<AboutUs />} />
                <Route path="/contact-us" element={<ContactUs />} />
                <Route path="/supported-platforms" element={<SupportedPlatforms />} />
                <Route path="/how-to-download-instagram-reels" element={<HowToDownloadInstagramReels />} />
                <Route path="/how-to-download-facebook-videos" element={<HowToDownloadFacebookVideos />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/refund-policy" element={<RefundPolicy />} />
                <Route path="/shipping-delivery" element={<ShippingDeliveryPolicy />} />
                <Route path="/pricing" element={<PricingPolicy />} />
                <Route path="/index.html" element={<Home />} />
                <Route path="/about-us.html" element={<AboutUs />} />
                <Route path="/contact-us.html" element={<ContactUs />} />
                <Route path="/supported-platforms.html" element={<SupportedPlatforms />} />
                <Route path="/terms-of-service.html" element={<TermsOfService />} />
                <Route path="/privacy-policy.html" element={<PrivacyPolicy />} />
                <Route path="/dmca.html" element={<DMCA />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </main>

        <footer
          className="border-t py-7"
          style={{
            borderColor: 'var(--border-soft)',
            background: 'var(--surface-glass)',
          }}
        >
          <div className="section-shell">
            <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr]">
              <div>
                <div className="flex items-center gap-2.5">
                  <div className="rounded-xl bg-[linear-gradient(135deg,_#d84853,_#f49c4d)] p-2 text-white shadow-lg">
                    <Download className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <p className="text-base font-black" style={{ color: 'var(--ink-900)' }}>
                      {siteConfig.name}
                    </p>
                    <p className="text-[11px]" style={{ color: 'var(--ink-500)' }}>
                      Multi-platform video downloader
                    </p>
                  </div>
                </div>
                <p className="mt-3 max-w-sm text-xs leading-6" style={{ color: 'var(--ink-600)' }}>
                  Download videos and audio from many major platforms with a clean browser workflow.
                </p>
                <p className="mt-3 text-xs" style={{ color: 'var(--ink-600)' }}>
                  Support:{' '}
                  <a
                    href={siteConfig.supportMailto}
                    className="font-semibold transition hover:underline"
                    style={{ color: 'var(--brand-700)' }}
                  >
                    {siteConfig.supportEmail}
                  </a>
                </p>
              </div>

              {footerGroups.map((group) => (
                <div key={group.title}>
                  <h2 className="text-xs font-black uppercase tracking-[0.16em]" style={{ color: 'var(--ink-900)' }}>
                    {group.title}
                  </h2>
                  <ul className="mt-3 space-y-2 text-xs">
                    {group.links.map((item) => (
                      <li key={item.to}>
                        <Link
                          to={item.to}
                          className="transition hover:text-[var(--brand-700)]"
                          style={{ color: 'var(--ink-600)' }}
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div
              className="mt-6 border-t pt-4 text-xs"
              style={{ borderColor: 'var(--border-soft)', color: 'var(--ink-500)' }}
            >
              © 2026 {siteConfig.name}. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default function App() {
  // Apply saved theme on mount
  useEffect(() => {
    const saved = localStorage.getItem('swiftdl-theme');
    if (saved === 'dark' || saved === 'light') {
      document.documentElement.setAttribute('data-theme', saved);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, []);

  return (
    <HelmetProvider>
      <AuthProvider>
        <EntitlementProvider>
          <AppShell />
        </EntitlementProvider>
      </AuthProvider>
    </HelmetProvider>
  );
}
