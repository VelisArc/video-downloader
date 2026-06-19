import { lazy, Suspense, useEffect, useState } from 'react';
import { BrowserRouter as Router, NavLink, Route, Routes, Link } from 'react-router-dom';
import { Download, LogIn, LogOut, Menu, User, X } from 'lucide-react';
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
  return <div className="flex min-h-[50vh] items-center justify-center"><LoadingIndicator label="Loading..." /></div>;
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
    const p = (window as any).__swiftdlDeferredPrompt;
    if (isIOS || !p?.prompt) { setShowInstallHelp(true); return; }
    try { await p.prompt(); await p.userChoice; } finally { delete (window as any).__swiftdlDeferredPrompt; window.dispatchEvent(new Event('swiftdl-install-available')); }
  };

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors ${
      isActive ? 'bg-[var(--brand-100)] text-[var(--brand-700)]' : 'text-[var(--ink-600)] hover:bg-[var(--surface-soft)] hover:text-[var(--ink-900)]'
    }`;

  return (
    <>
      <header className="sticky top-0 z-50 border-b" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
        <div className="shell">
          <div className="flex items-center justify-between py-3">
            <Link to="/" className="flex items-center gap-2" onClick={() => setIsMenuOpen(false)}>
              <div className="rounded-lg p-1.5 text-white" style={{ background: 'var(--brand-600)' }}>
                <Download className="h-4 w-4" />
              </div>
              <span className="text-[15px] font-bold" style={{ color: 'var(--ink-900)' }}>{siteConfig.name}</span>
            </Link>

            <nav className="hidden lg:flex items-center gap-0.5">
              {primaryNav.map(item => <NavLink key={item.to} to={item.to} className={navClass}>{item.label}</NavLink>)}
            </nav>

            <div className="hidden lg:flex items-center gap-2">
              <ThemeToggle />
              {installAvailable && <button onClick={handleInstall} className="btn-ghost text-[13px]">Install</button>}
              {user ? (
                <div className="flex items-center gap-1.5">
                  <Link to="/dashboard" className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-[var(--surface-soft)]">
                    {user.photoURL ? <img src={user.photoURL} alt="" className="h-7 w-7 rounded-full border border-[var(--border)]" /> : (
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full" style={{ background: 'var(--surface-soft)', color: 'var(--brand-600)' }}><User className="h-3.5 w-3.5" /></span>
                    )}
                    <span className="text-[13px] font-medium max-w-[100px] truncate hidden xl:inline" style={{ color: 'var(--ink-700)' }}>{user.displayName?.split(' ')[0] || 'Account'}</span>
                  </Link>
                  <button onClick={() => setShowLogoutConfirm(true)} className="btn-ghost text-[13px]"><LogOut className="h-3.5 w-3.5" /></button>
                </div>
              ) : (
                <button onClick={signInWithGoogle} className="btn-primary text-[13px]"><LogIn className="h-3.5 w-3.5" /> Sign in</button>
              )}
            </div>

            <div className="flex lg:hidden items-center gap-1.5">
              <ThemeToggle />
              <button onClick={() => setIsMenuOpen(v => !v)} className="rounded-md border p-2" style={{ borderColor: 'var(--border)', color: 'var(--ink-600)' }}>
                {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {isMenuOpen && (
            <div className="pb-3 lg:hidden animate-fade-in">
              <div className="rounded-xl border p-3" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
                <div className="flex flex-col gap-0.5">
                  {primaryNav.map(item => <NavLink key={item.to} to={item.to} className={navClass} onClick={() => setIsMenuOpen(false)}>{item.label}</NavLink>)}
                  {user && <NavLink to="/dashboard" className={navClass} onClick={() => setIsMenuOpen(false)}>Dashboard</NavLink>}
                </div>
                <div className="mt-2 flex flex-col gap-1.5 border-t pt-2" style={{ borderColor: 'var(--border)' }}>
                  {installAvailable && <button onClick={() => { handleInstall(); setIsMenuOpen(false); }} className="btn-outline w-full text-[13px]">Install app</button>}
                  {user ? <button onClick={() => { setShowLogoutConfirm(true); setIsMenuOpen(false); }} className="btn-dark w-full text-[13px]">Logout</button>
                  : <button onClick={() => { signInWithGoogle(); setIsMenuOpen(false); }} className="btn-primary w-full text-[13px]">Sign in with Google</button>}
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {showInstallHelp && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={() => setShowInstallHelp(false)}>
          <div className="w-full max-w-xs animate-scale-in rounded-xl p-5" style={{ background: 'var(--surface)', boxShadow: 'var(--shadow-2xl)' }} onClick={e => e.stopPropagation()}>
            <div className="mx-auto inline-flex rounded-lg p-2.5" style={{ background: 'var(--brand-600)', color: 'white' }}><Download className="h-5 w-5" /></div>
            <h3 className="mt-3 text-center text-lg font-bold" style={{ color: 'var(--ink-900)' }}>Install {siteConfig.name}</h3>
            <p className="mt-1.5 text-center text-xs leading-5" style={{ color: 'var(--ink-600)' }}>Add the app for quicker access from your home screen.</p>
            <div className="mt-4 rounded-lg p-3 text-xs leading-5" style={{ background: 'var(--surface-soft)', color: 'var(--ink-600)' }}>
              {isIOS ? <ol className="space-y-1.5"><li>1. Tap <strong>Share</strong> in Safari</li><li>2. Choose <strong>Add to Home Screen</strong></li><li>3. Tap <strong>Add</strong></li></ol>
              : <ol className="space-y-1.5"><li>1. Open your browser menu</li><li>2. Choose <strong>Install App</strong></li><li>3. Confirm the prompt</li></ol>}
            </div>
            <button onClick={() => setShowInstallHelp(false)} className="btn-dark mt-4 w-full text-[13px]">Close</button>
          </div>
        </div>
      )}

      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={() => { if (!isLoggingOut) setShowLogoutConfirm(false); }}>
          <div className="w-full max-w-xs animate-scale-in rounded-xl p-5" style={{ background: 'var(--surface)', boxShadow: 'var(--shadow-2xl)' }} onClick={e => e.stopPropagation()}>
            <div className="mx-auto inline-flex rounded-lg p-2.5" style={{ background: 'var(--danger-100)', color: 'var(--danger-600)' }}><LogOut className="h-5 w-5" /></div>
            <h3 className="mt-3 text-center text-lg font-bold" style={{ color: 'var(--ink-900)' }}>Sign out</h3>
            <p className="mt-1.5 text-center text-xs leading-5" style={{ color: 'var(--ink-600)' }}>Are you sure you want to sign out?</p>
            <div className="mt-4 flex gap-2">
              <button onClick={() => setShowLogoutConfirm(false)} disabled={isLoggingOut} className="btn-outline flex-1 text-[13px]">Cancel</button>
              <button onClick={() => { setIsLoggingOut(true); logout().finally(() => { setShowLogoutConfirm(false); setIsLoggingOut(false); }); }} disabled={isLoggingOut} className="btn-dark flex-1 text-[13px]">
                {isLoggingOut ? <LoadingIndicator label="" compact tone="light" /> : <span className="inline-flex items-center gap-1.5"><LogOut className="h-3.5 w-3.5" /> Sign out</span>}
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
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[101] focus:rounded-md focus:px-3 focus:py-1.5 focus:text-xs focus:font-semibold focus:text-white" style={{ background: 'var(--ink-heavy)' }}>Skip to content</a>
      <div className="min-h-screen flex flex-col">
        <Toaster position="top-right" toastOptions={{ duration: 3000, style: { background: 'var(--surface)', color: 'var(--ink-900)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '13px', fontWeight: 500, boxShadow: 'var(--shadow-lg)', padding: '10px 14px' }, success: { iconTheme: { primary: 'var(--brand-600)', secondary: 'white' } }, error: { iconTheme: { primary: 'var(--danger-600)', secondary: 'white' } } }} />
        <ScrollToTop /><AdsenseAutoAds /><InstallPrompt /><Navbar />
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
          <div className="shell py-10">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              <div className="sm:col-span-2 lg:col-span-1">
                <Link to="/" className="flex items-center gap-2">
                  <div className="rounded-md p-1.5 text-white" style={{ background: 'var(--brand-600)' }}><Download className="h-3.5 w-3.5" /></div>
                  <span className="text-sm font-bold" style={{ color: 'var(--ink-900)' }}>{siteConfig.name}</span>
                </Link>
                <p className="mt-3 text-xs leading-5 max-w-[260px]" style={{ color: 'var(--ink-600)' }}>Download videos and audio from many major platforms with a fast, clean browser workflow.</p>
                <p className="mt-3 text-xs" style={{ color: 'var(--ink-500)' }}>Support: <a href={siteConfig.supportMailto} className="font-medium hover:underline" style={{ color: 'var(--brand-600)' }}>{siteConfig.supportEmail}</a></p>
              </div>
              {footerGroups.map(group => (
                <div key={group.title}>
                  <h3 className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--ink-500)' }}>{group.title}</h3>
                  <ul className="mt-3 space-y-2">
                    {group.links.map(item => <li key={item.to}><Link to={item.to} className="text-xs hover:underline" style={{ color: 'var(--ink-600)' }}>{item.label}</Link></li>)}
                  </ul>
                </div>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t pt-6" style={{ borderColor: 'var(--border)' }}>
              <p className="text-[11px]" style={{ color: 'var(--ink-500)' }}>&copy; {new Date().getFullYear()} {siteConfig.name}. All rights reserved.</p>
              <div className="flex items-center gap-4">
                <Link to="/privacy-policy" className="text-[11px] hover:underline" style={{ color: 'var(--ink-500)' }}>Privacy</Link>
                <Link to="/terms-of-service" className="text-[11px] hover:underline" style={{ color: 'var(--ink-500)' }}>Terms</Link>
                <Link to="/dmca" className="text-[11px] hover:underline" style={{ color: 'var(--ink-500)' }}>DMCA</Link>
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
    if (saved === 'dark' || saved === 'light') document.documentElement.setAttribute('data-theme', saved);
    else if (window.matchMedia('(prefers-color-scheme: dark)').matches) document.documentElement.setAttribute('data-theme', 'dark');
  }, []);
  return <HelmetProvider><AuthProvider><EntitlementProvider><AppShell /></EntitlementProvider></AuthProvider></HelmetProvider>;
}