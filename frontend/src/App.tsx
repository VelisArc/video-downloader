import { lazy, Suspense, useEffect, useState } from 'react';
import { BrowserRouter as Router, Link, NavLink, Route, Routes } from 'react-router-dom';
import { Download, LogIn, LogOut, Menu, ShieldCheck, User, X } from 'lucide-react';
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
const InstagramGuide = lazy(() => import('./pages/HowToDownloadInstagramReels'));
const FacebookGuide = lazy(() => import('./pages/HowToDownloadFacebookVideos'));
const FAQ = lazy(() => import('./pages/FAQ'));
const RefundPolicy = lazy(() => import('./pages/RefundPolicy'));
const ShippingDeliveryPolicy = lazy(() => import('./pages/ShippingDeliveryPolicy'));
const PricingPolicy = lazy(() => import('./pages/PricingPolicy'));
const NotFound = lazy(() => import('./pages/NotFound'));

function PageLoader() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <LoadingIndicator label="Loading..." />
    </div>
  );
}

function BrandLogo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <span className="flex h-9 w-9 items-center justify-center rounded-md border bg-white shadow-sm" style={{ borderColor: 'var(--border)' }}>
        <img src="/logo.png" alt="" className="h-7 w-7 object-contain" />
      </span>
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className="text-sm font-extrabold" style={{ color: 'var(--ink-900)' }}>{siteConfig.name}</span>
          <span className="mt-1 text-[11px] font-medium" style={{ color: 'var(--ink-500)' }}>Media downloader</span>
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
      const prompt = (window as any).__swiftdlDeferredPrompt;
      setInstallAvailable(!installed && (Boolean(prompt) || ios));
    };
    update();
    window.addEventListener('swiftdl-install-available', update);
    return () => window.removeEventListener('swiftdl-install-available', update);
  }, []);

  const handleInstall = async () => {
    const prompt = (window as any).__swiftdlDeferredPrompt;
    if (isIOS || !prompt?.prompt) {
      setShowInstallHelp(true);
      return;
    }

    try {
      await prompt.prompt();
      await prompt.userChoice;
    } finally {
      delete (window as any).__swiftdlDeferredPrompt;
      window.dispatchEvent(new Event('swiftdl-install-available'));
    }
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `rounded-md px-3 py-2 text-sm font-semibold transition-colors ${
      isActive
        ? 'bg-[var(--brand-50)] text-[var(--brand-700)]'
        : 'text-[var(--ink-600)] hover:bg-[var(--surface-soft)] hover:text-[var(--ink-900)]'
    }`;

  return (
    <>
      <header className="sticky top-0 z-50 border-b backdrop-blur-xl" style={{ borderColor: 'var(--border)', background: 'color-mix(in srgb, var(--surface) 88%, transparent)' }}>
        <div className="shell-wide">
          <div className="flex h-16 items-center justify-between gap-4">
            <Link to="/" className="shrink-0" onClick={() => setIsMenuOpen(false)} aria-label={`${siteConfig.name} home`}>
              <BrandLogo />
            </Link>

            <nav className="hidden items-center gap-1 lg:flex">
              {primaryNav.map(item => (
                <NavLink key={item.to} to={item.to} className={navLinkClass}>
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <div className="hidden items-center gap-2 lg:flex">
              <ThemeToggle />
              {installAvailable && (
                <button onClick={handleInstall} className="btn-outline min-h-9 px-3 py-1.5 text-xs">
                  <Download className="h-3.5 w-3.5" /> Install
                </button>
              )}
              {user ? (
                <div className="flex items-center gap-2">
                  <Link to="/dashboard" className="flex min-h-10 items-center gap-2 rounded-md border px-2.5 py-1.5 transition-colors hover:bg-[var(--surface-soft)]" style={{ borderColor: 'var(--border)' }}>
                    {user.photoURL ? (
                      <img src={user.photoURL} alt="" className="h-7 w-7 rounded-md object-cover" />
                    ) : (
                      <span className="flex h-7 w-7 items-center justify-center rounded-md" style={{ background: 'var(--brand-50)', color: 'var(--brand-700)' }}>
                        <User className="h-4 w-4" />
                      </span>
                    )}
                    <span className="max-w-[120px] truncate text-sm font-semibold" style={{ color: 'var(--ink-700)' }}>
                      {user.displayName?.split(' ')[0] || 'Account'}
                    </span>
                  </Link>
                  <button onClick={() => setShowLogoutConfirm(true)} className="btn-ghost min-h-10 px-3" aria-label="Sign out">
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <button onClick={signInWithGoogle} className="btn-primary min-h-10 px-4">
                  <LogIn className="h-4 w-4" /> Sign in
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 lg:hidden">
              <ThemeToggle />
              <button
                onClick={() => setIsMenuOpen(value => !value)}
                className="flex h-10 w-10 items-center justify-center rounded-md border"
                style={{ borderColor: 'var(--border)', color: 'var(--ink-700)', background: 'var(--surface)' }}
                aria-label="Open menu"
              >
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {isMenuOpen && (
            <div className="pb-4 lg:hidden">
              <div className="animate-fade-in rounded-lg border p-2" style={{ borderColor: 'var(--border)', background: 'var(--surface)', boxShadow: 'var(--shadow-lg)' }}>
                <div className="grid gap-1">
                  {primaryNav.map(item => (
                    <NavLink key={item.to} to={item.to} className={navLinkClass} onClick={() => setIsMenuOpen(false)}>
                      {item.label}
                    </NavLink>
                  ))}
                  {user && (
                    <NavLink to="/dashboard" className={navLinkClass} onClick={() => setIsMenuOpen(false)}>
                      Dashboard
                    </NavLink>
                  )}
                </div>
                <div className="mt-2 grid gap-2 border-t pt-2" style={{ borderColor: 'var(--border)' }}>
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
        </div>
      </header>

      {showInstallHelp && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ background: 'rgba(9, 12, 11, 0.6)' }} onClick={() => setShowInstallHelp(false)}>
          <div className="w-full max-w-sm animate-scale-in rounded-lg border p-5" style={{ borderColor: 'var(--border)', background: 'var(--surface)', boxShadow: 'var(--shadow-2xl)' }} onClick={event => event.stopPropagation()}>
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md" style={{ background: 'var(--brand-50)', color: 'var(--brand-700)' }}>
                <Download className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-base font-bold">Install {siteConfig.name}</h3>
                <p className="mt-1 text-sm" style={{ color: 'var(--ink-600)' }}>Add it to your home screen for faster access.</p>
              </div>
            </div>
            <div className="mt-4 rounded-md border p-3 text-sm leading-6" style={{ borderColor: 'var(--border)', background: 'var(--surface-soft)', color: 'var(--ink-700)' }}>
              {isIOS ? (
                <ol>
                  <li>1. Tap Share in Safari</li>
                  <li>2. Choose Add to Home Screen</li>
                  <li>3. Tap Add</li>
                </ol>
              ) : (
                <ol>
                  <li>1. Open your browser menu</li>
                  <li>2. Choose Install App</li>
                  <li>3. Confirm the prompt</li>
                </ol>
              )}
            </div>
            <button onClick={() => setShowInstallHelp(false)} className="btn-dark mt-4 w-full">Close</button>
          </div>
        </div>
      )}

      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4" style={{ background: 'rgba(9, 12, 11, 0.6)' }} onClick={() => { if (!isLoggingOut) setShowLogoutConfirm(false); }}>
          <div className="w-full max-w-sm animate-scale-in rounded-lg border p-5" style={{ borderColor: 'var(--border)', background: 'var(--surface)', boxShadow: 'var(--shadow-2xl)' }} onClick={event => event.stopPropagation()}>
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md" style={{ background: 'var(--danger-100)', color: 'var(--danger-600)' }}>
                <LogOut className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-base font-bold">Sign out?</h3>
                <p className="mt-1 text-sm" style={{ color: 'var(--ink-600)' }}>Your local download history will stay on this device.</p>
              </div>
            </div>
            <div className="mt-5 flex gap-2">
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

function AppShell() {
  return (
    <Router>
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[101] focus:rounded-md focus:px-3 focus:py-2 focus:text-sm focus:font-semibold focus:text-white" style={{ background: 'var(--ink-heavy)' }}>
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
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              boxShadow: 'var(--shadow-lg)',
              padding: '12px 14px',
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
        <footer className="border-t" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
          <div className="shell-wide py-12">
            <div className="grid gap-10 lg:grid-cols-[1.3fr_2fr]">
              <div>
                <Link to="/" aria-label={`${siteConfig.name} home`}>
                  <BrandLogo />
                </Link>
                <p className="mt-4 max-w-sm text-sm leading-6" style={{ color: 'var(--ink-600)' }}>
                  A clean browser workspace for saving public video and audio from supported platforms.
                </p>
                <div className="mt-5 inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-semibold" style={{ borderColor: 'var(--border)', background: 'var(--surface-soft)', color: 'var(--ink-700)' }}>
                  <ShieldCheck className="h-4 w-4" style={{ color: 'var(--brand-600)' }} />
                  Public links only
                </div>
                <p className="mt-4 text-sm" style={{ color: 'var(--ink-500)' }}>
                  Support: <a href={siteConfig.supportMailto} className="font-semibold hover:underline" style={{ color: 'var(--brand-700)' }}>{siteConfig.supportEmail}</a>
                </p>
              </div>
              <div className="grid gap-8 sm:grid-cols-3">
                {footerGroups.map(group => (
                  <div key={group.title}>
                    <h3 className="text-sm font-bold">{group.title}</h3>
                    <ul className="mt-3 space-y-2">
                      {group.links.map(item => (
                        <li key={item.to}>
                          <Link to={item.to} className="text-sm font-medium hover:underline" style={{ color: 'var(--ink-600)' }}>
                            {item.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t pt-6" style={{ borderColor: 'var(--border)' }}>
              <p className="text-sm" style={{ color: 'var(--ink-500)' }}>&copy; {new Date().getFullYear()} {siteConfig.name}. All rights reserved.</p>
              <div className="flex items-center gap-4">
                <Link to="/privacy-policy" className="text-sm font-medium hover:underline" style={{ color: 'var(--ink-500)' }}>Privacy</Link>
                <Link to="/terms-of-service" className="text-sm font-medium hover:underline" style={{ color: 'var(--ink-500)' }}>Terms</Link>
                <Link to="/dmca" className="text-sm font-medium hover:underline" style={{ color: 'var(--ink-500)' }}>DMCA</Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default function App() {
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
