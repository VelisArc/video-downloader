import { lazy, Suspense, useEffect, useState } from 'react';
import { BrowserRouter as Router, Link, NavLink, Route, Routes } from 'react-router-dom';
import { ArrowUp, ArrowUpRight, Download, LogIn, LogOut, Menu, ShieldCheck, Sparkles, User, X } from 'lucide-react';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import ScrollToTop from './components/ScrollToTop';
import InstallPrompt from './components/InstallPrompt';
import AdsenseAutoAds from './components/AdsenseAutoAds';
import LoadingIndicator from './components/LoadingIndicator';
import ThemeToggle from './components/ThemeToggle';
import BrandMark from './components/BrandMark';
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
const InstagramGuide = lazy(() => import('./pages/HowToDownloadInstagramReels'));
const FacebookGuide = lazy(() => import('./pages/HowToDownloadFacebookVideos'));
const FAQ = lazy(() => import('./pages/FAQ'));
const RefundPolicy = lazy(() => import('./pages/RefundPolicy'));
const ShippingDeliveryPolicy = lazy(() => import('./pages/ShippingDeliveryPolicy'));
const PricingPolicy = lazy(() => import('./pages/PricingPolicy'));
const NotFound = lazy(() => import('./pages/NotFound'));

function PageLoader() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <LoadingIndicator label="Loading..." />
    </div>
  );
}

function BrandLogo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-3">
      <BrandMark className="h-10 w-10 drop-shadow-[0_10px_24px_rgba(192,38,211,0.4)]" />
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className="font-display text-[17px] font-bold tracking-tight" style={{ color: 'var(--ink-900)' }}>
            {siteConfig.name}
          </span>
          <span className="mono mt-1 text-[9px] font-medium uppercase" style={{ color: 'var(--ink-400)', letterSpacing: '0.22em' }}>
            Media downloader
          </span>
        </span>
      )}
    </span>
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
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(ios);
    const update = () => {
      const installed = window.matchMedia('(display-mode: standalone)').matches;
      const prompt = (window as any).__sharehubDeferredPrompt;
      setInstallAvailable(!installed && (Boolean(prompt) || ios));
    };
    update();
    window.addEventListener('sharehub-install-available', update);
    return () => window.removeEventListener('sharehub-install-available', update);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  const handleInstall = async () => {
    const prompt = (window as any).__sharehubDeferredPrompt;
    if (isIOS || !prompt?.prompt) {
      setShowInstallHelp(true);
      return;
    }

    try {
      await prompt.prompt();
      await prompt.userChoice;
    } finally {
      delete (window as any).__sharehubDeferredPrompt;
      window.dispatchEvent(new Event('sharehub-install-available'));
    }
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `relative rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 ${
      isActive
        ? 'text-white shadow-sm'
        : 'text-[var(--ink-600)] hover:bg-[var(--surface-soft)] hover:text-[var(--ink-900)]'
    }`;

  const navLinkStyle = ({ isActive }: { isActive: boolean }) =>
    isActive ? { background: 'var(--grad-brand)', boxShadow: 'var(--glow-brand)' } : undefined;

  return (
    <>
      <header className="sticky top-0 z-50 px-3 pt-3 sm:px-4">
        <div
          className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 rounded-2xl border px-3 backdrop-blur-xl sm:px-4"
          style={{
            borderColor: 'color-mix(in srgb, var(--border) 80%, transparent)',
            background: 'color-mix(in srgb, var(--surface) 82%, transparent)',
            boxShadow: '0 10px 40px -24px rgba(13, 8, 31, 0.42)',
          }}
        >
          <Link to="/" className="shrink-0" onClick={() => setIsMenuOpen(false)} aria-label={`${siteConfig.name} home`}>
            <BrandLogo />
          </Link>

          <nav className="hidden items-center gap-1 rounded-full border p-1 lg:flex" style={{ borderColor: 'var(--border)', background: 'var(--surface-soft)' }}>
            {primaryNav.map(item => (
              <NavLink key={item.to} to={item.to} className={navLinkClass} style={navLinkStyle}>
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            <ThemeToggle />
            {installAvailable && (
              <button onClick={handleInstall} className="btn-outline min-h-9 rounded-full px-3 py-1.5 text-xs">
                <Download className="h-3.5 w-3.5" /> Install
              </button>
            )}
            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/dashboard"
                  className="flex min-h-10 items-center gap-2 rounded-full border px-2.5 py-1.5 transition-colors hover:bg-[var(--surface-soft)]"
                  style={{ borderColor: 'var(--border)' }}
                >
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="" className="h-7 w-7 rounded-full object-cover" />
                  ) : (
                    <span className="flex h-7 w-7 items-center justify-center rounded-full" style={{ background: 'var(--grad-brand-soft)', color: 'var(--brand-700)' }}>
                      <User className="h-4 w-4" />
                    </span>
                  )}
                  <span className="max-w-[120px] truncate text-sm font-semibold" style={{ color: 'var(--ink-700)' }}>
                    {user.displayName?.split(' ')[0] || 'Account'}
                  </span>
                </Link>
                <button onClick={() => setShowLogoutConfirm(true)} className="btn-ghost min-h-10 rounded-full px-3" aria-label="Sign out">
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button onClick={signInWithGoogle} className="btn-primary min-h-10 rounded-full px-5">
                <LogIn className="h-4 w-4" /> Sign in
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <ThemeToggle />
            <button
              onClick={() => setIsMenuOpen(value => !value)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border"
              style={{ borderColor: 'var(--border)', color: 'var(--ink-700)', background: 'var(--surface)' }}
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="mx-auto mt-2 max-w-7xl lg:hidden">
            <div
              className="animate-fade-in rounded-2xl border p-3"
              style={{ borderColor: 'var(--border)', background: 'var(--surface)', boxShadow: 'var(--shadow-lg)' }}
            >
              <div className="grid gap-1">
                {primaryNav.map(item => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setIsMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold ${
                        isActive ? 'text-white' : 'text-[var(--ink-600)] hover:bg-[var(--surface-soft)]'
                      }`
                    }
                    style={({ isActive }) => (isActive ? { background: 'var(--grad-brand)' } : undefined)}
                  >
                    {item.label}
                    <ArrowUpRight className="h-4 w-4 opacity-60" />
                  </NavLink>
                ))}
                {user && (
                  <NavLink
                    to="/dashboard"
                    className={({ isActive }) =>
                      `flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold ${
                        isActive ? 'text-white' : 'text-[var(--ink-600)] hover:bg-[var(--surface-soft)]'
                      }`
                    }
                    style={({ isActive }) => (isActive ? { background: 'var(--grad-brand)' } : undefined)}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                    <ArrowUpRight className="h-4 w-4 opacity-60" />
                  </NavLink>
                )}
              </div>
              <div className="mt-3 grid gap-2 border-t pt-3" style={{ borderColor: 'var(--border)' }}>
                {installAvailable && (
                  <button onClick={() => { handleInstall(); setIsMenuOpen(false); }} className="btn-outline w-full text-sm">
                    <Download className="h-4 w-4" /> Install app
                  </button>
                )}
                {user ? (
                  <button onClick={() => { setShowLogoutConfirm(true); setIsMenuOpen(false); }} className="btn-dark w-full text-sm">
                    <LogOut className="h-4 w-4" /> Sign out
                  </button>
                ) : (
                  <button onClick={() => { signInWithGoogle(); setIsMenuOpen(false); }} className="btn-primary w-full text-sm">
                    <LogIn className="h-4 w-4" /> Sign in with Google
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {showInstallHelp && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ background: 'rgba(4, 8, 20, 0.66)', backdropFilter: 'blur(6px)' }} onClick={() => setShowInstallHelp(false)}>
          <div className="w-full max-w-sm animate-scale-in rounded-3xl border p-6" style={{ borderColor: 'var(--border)', background: 'var(--surface)', boxShadow: 'var(--shadow-2xl)' }} onClick={event => event.stopPropagation()}>
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl" style={{ background: 'var(--grad-brand-soft)', color: 'var(--brand-700)' }}>
                <Download className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-lg font-bold">Install {siteConfig.name}</h3>
                <p className="mt-1 text-sm" style={{ color: 'var(--ink-600)' }}>Add it to your home screen for one-tap access.</p>
              </div>
            </div>
            <div className="mt-5 space-y-2 rounded-2xl border p-4 text-sm leading-6" style={{ borderColor: 'var(--border)', background: 'var(--surface-soft)', color: 'var(--ink-700)' }}>
              {(isIOS
                ? ['Tap Share in Safari', 'Choose Add to Home Screen', 'Tap Add']
                : ['Open your browser menu', 'Choose Install app', 'Confirm the prompt']
              ).map((step, index) => (
                <div key={step} className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white" style={{ background: 'var(--grad-brand)' }}>{index + 1}</span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
            <button onClick={() => setShowInstallHelp(false)} className="btn-dark mt-5 w-full">Got it</button>
          </div>
        </div>
      )}

      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4" style={{ background: 'rgba(4, 8, 20, 0.66)', backdropFilter: 'blur(6px)' }} onClick={() => { if (!isLoggingOut) setShowLogoutConfirm(false); }}>
          <div className="w-full max-w-sm animate-scale-in rounded-3xl border p-6" style={{ borderColor: 'var(--border)', background: 'var(--surface)', boxShadow: 'var(--shadow-2xl)' }} onClick={event => event.stopPropagation()}>
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl" style={{ background: 'var(--danger-100)', color: 'var(--danger-600)' }}>
                <LogOut className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-lg font-bold">Sign out?</h3>
                <p className="mt-1 text-sm" style={{ color: 'var(--ink-600)' }}>Your local download history will stay on this device.</p>
              </div>
            </div>
            <div className="mt-6 flex gap-2">
              <button onClick={() => setShowLogoutConfirm(false)} disabled={isLoggingOut} className="btn-outline flex-1">Cancel</button>
              <button
                onClick={() => {
                  setIsLoggingOut(true);
                  logout().finally(() => {
                    setShowLogoutConfirm(false);
                    setIsLoggingOut(false);
                  });
                }}
                disabled={isLoggingOut}
                className="btn-dark flex-1"
              >
                {isLoggingOut ? <LoadingIndicator label="" compact tone="light" /> : <><LogOut className="h-4 w-4" /> Sign out</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 900);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="animate-scale-in fixed right-4 z-40 flex h-11 w-11 items-center justify-center rounded-full border backdrop-blur-xl"
      style={{ bottom: 'calc(1.25rem + env(safe-area-inset-bottom))', background: 'color-mix(in srgb, var(--surface) 88%, transparent)', borderColor: 'var(--border)', color: 'var(--ink-700)', boxShadow: 'var(--shadow-md)' }}
      aria-label="Back to top"
    >
      <ArrowUp className="h-5 w-5" strokeWidth={2} />
    </button>
  );
}

function Footer() {
  return (
    <footer className="px-3 pb-4 pt-10 sm:px-4">
      <div
        className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] border px-5 py-10 sm:px-10 sm:py-12"
        style={{ borderColor: 'rgba(255,255,255,0.1)', background: 'linear-gradient(165deg, #0d081f 0%, #181030 55%, #100a24 100%)' }}
      >
        <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full opacity-30 blur-3xl" style={{ background: 'radial-gradient(circle, #7c3aed, transparent 65%)' }} />
        <div className="pointer-events-none absolute -bottom-28 right-0 h-72 w-72 rounded-full opacity-25 blur-3xl" style={{ background: 'radial-gradient(circle, #f43f5e, transparent 65%)' }} />

        <div className="relative grid gap-10 lg:grid-cols-[1.15fr_2fr]">
          <div>
            <Link to="/" aria-label={`${siteConfig.name} home`} className="inline-flex items-center gap-3">
              <BrandMark className="h-11 w-11" />
              <span className="font-display text-2xl font-bold tracking-tight text-white">{siteConfig.name}</span>
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-7" style={{ color: 'rgba(255,255,255,0.62)' }}>
              A fast, browser-based workspace for saving public video and audio from supported platforms - no install required.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold" style={{ borderColor: 'rgba(255,255,255,0.14)', background: 'rgba(255,255,255,0.06)', color: '#c7d6ff' }}>
                <ShieldCheck className="h-3.5 w-3.5" /> Public links only
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold" style={{ borderColor: 'rgba(255,255,255,0.14)', background: 'rgba(255,255,255,0.06)', color: '#c7d6ff' }}>
                <Sparkles className="h-3.5 w-3.5" /> Free to start
              </span>
            </div>
            <p className="mt-5 text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Support:{' '}
              <a href={siteConfig.supportMailto} className="font-semibold text-white hover:underline">
                {siteConfig.supportEmail}
              </a>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3">
            {footerGroups.map(group => (
              <div key={group.title}>
                <h3 className="text-xs font-bold uppercase tracking-[0.16em]" style={{ color: 'rgba(255,255,255,0.45)' }}>{group.title}</h3>
                <ul className="mt-4 space-y-2.5">
                  {group.links.map(item => (
                    <li key={item.to}>
                      <Link to={item.to} className="text-sm font-medium transition-colors hover:text-white" style={{ color: 'rgba(255,255,255,0.68)' }}>
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="relative mt-12 flex flex-wrap items-center justify-between gap-4 border-t pt-6" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.44)' }}>
            &copy; {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-5">
            <Link to="/privacy-policy" className="text-sm font-medium transition-colors hover:text-white" style={{ color: 'rgba(255,255,255,0.55)' }}>Privacy</Link>
            <Link to="/terms-of-service" className="text-sm font-medium transition-colors hover:text-white" style={{ color: 'rgba(255,255,255,0.55)' }}>Terms</Link>
            <Link to="/dmca" className="text-sm font-medium transition-colors hover:text-white" style={{ color: 'rgba(255,255,255,0.55)' }}>DMCA</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function AppShell() {
  return (
    <Router>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[101] focus:rounded-xl focus:px-4 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-white"
        style={{ background: 'var(--grad-brand)' }}
      >
        Skip to content
      </a>
      <div className="flex min-h-screen flex-col">
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: 'var(--surface)',
              color: 'var(--ink-900)',
              border: '1px solid var(--border)',
              borderRadius: '14px',
              fontSize: '14px',
              fontWeight: 600,
              boxShadow: 'var(--shadow-lg)',
              padding: '12px 16px',
            },
            success: { iconTheme: { primary: 'var(--brand-600)', secondary: 'white' } },
            error: { iconTheme: { primary: 'var(--danger-600)', secondary: 'white' } },
          }}
        />
        <ScrollToTop />
        <AdsenseAutoAds />
        <InstallPrompt />
        <Navbar />
        <main id="main-content" className="flex-1">
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
                <Route path="/how-to-download-instagram-reels" element={<InstagramGuide />} />
                <Route path="/how-to-download-facebook-videos" element={<FacebookGuide />} />
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
        <Footer />
        <BackToTop />
      </div>
    </Router>
  );
}

export default function App() {
  useEffect(() => {
    const saved = localStorage.getItem('sharehub-theme');
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


