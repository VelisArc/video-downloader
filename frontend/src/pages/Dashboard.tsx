import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import {
  CreditCard,
  Download,
  History,
  LogOut,
  Shield,
  Sparkles,
  User,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useEntitlement } from '../context/EntitlementContext';
import LoadingIndicator from '../components/LoadingIndicator';
import { siteConfig, siteUrl } from '../lib/site';
import {
  loadDownloadHistory,
  sanitizeFilename,
  type DownloadHistoryItem,
} from '../lib/downloads';

function planLabel(plan: string) {
  if (plan === 'monthly') return 'Monthly Premium';
  if (plan === 'lifetime') return 'Lifetime Premium';
  if (plan === 'user') return 'Free';
  return 'Guest';
}

function planDescription(plan: string) {
  if (plan === 'monthly') return 'You have unlimited downloads and no ads this month.';
  if (plan === 'lifetime') return "You have unlimited downloads and no ads — forever.";
  if (plan === 'user') return 'You have limited daily downloads with ads. Upgrade for more.';
  return 'Login to increase your daily download limit.';
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { entitlement, loading, refresh } = useEntitlement();
  const [history, setHistory] = useState<DownloadHistoryItem[]>([]);
  const [showLogout, setShowLogout] = useState(false);

  const activePlan = entitlement.plan || (user ? 'user' : 'guest');
  const isPremium = activePlan === 'monthly' || activePlan === 'lifetime';

  useEffect(() => {
    setHistory(loadDownloadHistory());
  }, []);

  if (!user) {
    return (
      <div className="section-shell max-w-2xl py-20 text-center">
        <Helmet>
          <title>Dashboard | {siteConfig.name}</title>
        </Helmet>
        <div className="card p-10">
          <div className="mx-auto rounded-2xl p-4" style={{ background: 'var(--surface-soft)', color: 'var(--brand-700)', display: 'inline-flex' }}>
            <User className="h-8 w-8" />
          </div>
          <h1 className="mt-5 text-3xl font-black" style={{ color: 'var(--ink-900)' }}>Login required</h1>
          <p className="mt-3 text-sm leading-6" style={{ color: 'var(--ink-600)' }}>
            Login with your Google account to access your dashboard and track your usage.
          </p>
          <Link to="/" className="btn-brand mt-6 inline-flex">
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="section-shell max-w-5xl py-10 animate-pulse">
        <div className="h-10 w-64 rounded-xl bg-[var(--surface-soft)] mb-8"></div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="card h-64 lg:col-span-1 bg-[var(--surface-soft)]"></div>
          <div className="card h-64 lg:col-span-2 bg-[var(--surface-soft)]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="section-shell max-w-5xl py-10">
      <Helmet>
        <title>Dashboard | {siteConfig.name}</title>
        <meta name="description" content="Manage your SwiftDL account, view usage, and track your downloads." />
        <link rel="canonical" href={siteUrl('/dashboard')} />
      </Helmet>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <span className="section-eyebrow">Dashboard</span>
          <h1 className="mt-3 text-3xl font-black md:text-4xl" style={{ color: 'var(--ink-900)' }}>
            Welcome back, {user.displayName?.split(' ')[0] || 'User'}
          </h1>
        </div>
        <button
          type="button"
          onClick={() => setShowLogout(true)}
          className="btn-outline"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Profile Card */}
        <div className="card lg:col-span-1">
          <div className="flex flex-col items-center text-center">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || 'User'}
                className="h-20 w-20 rounded-full border-4 shadow-lg"
                style={{ borderColor: 'var(--surface-soft)' }}
              />
            ) : (
              <div
                className="flex h-20 w-20 items-center justify-center rounded-full"
                style={{ background: 'var(--surface-soft)', color: 'var(--brand-700)' }}
              >
                <User className="h-8 w-8" />
              </div>
            )}
            <h2 className="mt-4 text-lg font-black" style={{ color: 'var(--ink-900)' }}>
              {user.displayName || 'User'}
            </h2>
            <p className="mt-1 text-sm" style={{ color: 'var(--ink-500)' }}>
              {user.email}
            </p>

            {/* Plan badge */}
            <div
              className="mt-4 w-full rounded-2xl p-4 text-white"
              style={{
                background: isPremium
                  ? 'linear-gradient(135deg, #d84853, #f49c4d)'
                  : 'var(--ink-900)',
              }}
            >
              <div className="flex items-center justify-center gap-2">
                {isPremium ? <Sparkles className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
                <span className="text-sm font-bold">{planLabel(activePlan)}</span>
              </div>
              <p className="mt-1 text-xs text-white/70">
                {planDescription(activePlan)}
              </p>
            </div>

            {!isPremium && (
              <Link to="/pricing" className="btn-brand mt-4 w-full">
                <CreditCard className="h-4 w-4" />
                Upgrade to Premium
              </Link>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="space-y-6 lg:col-span-2">
          {/* Stats Grid */}
          <div className="grid gap-4 sm:grid-cols-3 stagger-children">
            <div className="card text-center">
              <Download className="mx-auto h-5 w-5" style={{ color: 'var(--brand-600)' }} />
              <p className="mt-3 text-2xl font-black" style={{ color: 'var(--ink-900)' }}>
                {entitlement.unlimited ? '∞' : (activePlan === 'user' ? '3' : '1')}
              </p>
              <p className="mt-1 text-xs" style={{ color: 'var(--ink-500)' }}>Daily Limit</p>
            </div>
            <div className="card text-center">
              <History className="mx-auto h-5 w-5" style={{ color: 'var(--brand-600)' }} />
              <p className="mt-3 text-2xl font-black" style={{ color: 'var(--ink-900)' }}>
                {history.length}
              </p>
              <p className="mt-1 text-xs" style={{ color: 'var(--ink-500)' }}>Recent Downloads</p>
            </div>
          </div>

          {/* Recent Downloads */}
          <div className="card">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black" style={{ color: 'var(--ink-900)' }}>
                Recent Downloads
              </h3>
              <button
                type="button"
                onClick={() => refresh().then(() => toast.success('Refreshed'))}
                className="text-xs font-semibold transition hover:opacity-70"
                style={{ color: 'var(--brand-700)' }}
              >
                Refresh
              </button>
            </div>
            {history.length > 0 ? (
              <div className="mt-4 space-y-3">
                {history.slice(0, 5).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 rounded-xl p-3"
                    style={{ background: 'var(--surface-soft)' }}
                  >
                    {item.thumbnail ? (
                      <img src={item.thumbnail} alt="" className="h-10 w-10 rounded-lg object-cover" />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: 'var(--surface)', color: 'var(--brand-700)' }}>
                        <Download className="h-4 w-4" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold" style={{ color: 'var(--ink-900)' }}>
                        {item.title}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--ink-500)' }}>
                        {item.date} · {item.ext.toUpperCase()}
                      </p>
                    </div>
                    <a
                      href={item.downloadUrl}
                      download={`${sanitizeFilename(item.title)}.${item.ext}`}
                      className="rounded-full p-2 transition hover:bg-[var(--surface)]"
                      style={{ color: 'var(--brand-700)' }}
                      aria-label="Download item"
                    >
                      <Download className="h-4 w-4" />
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-4 flex flex-col items-center rounded-xl py-12 text-center" style={{ background: 'var(--surface-soft)' }}>
                <div className="mb-3 rounded-full bg-white p-3 shadow-sm">
                   <Download className="h-6 w-6" style={{ color: 'var(--ink-400)' }} />
                </div>
                <p className="text-sm font-medium" style={{ color: 'var(--ink-600)' }}>No recent downloads</p>
                <p className="mt-1 text-xs" style={{ color: 'var(--ink-500)' }}>Your download history will appear here.</p>
                <Link to="/" className="mt-4 btn-brand py-2 px-5 text-xs">
                  Start Downloading
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Logout confirm modal */}
      {showLogout && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center p-4 backdrop-blur-sm"
          style={{ background: 'rgba(0,0,0,0.55)' }}
          onClick={() => setShowLogout(false)}
        >
          <div
            className="w-full max-w-sm animate-scale-up rounded-3xl p-6 shadow-2xl"
            style={{ background: 'var(--surface)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto inline-flex rounded-2xl p-3" style={{ background: 'var(--surface-soft)', color: 'var(--brand-700)' }}>
              <LogOut className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-center text-2xl font-black" style={{ color: 'var(--ink-900)' }}>
              Confirm logout
            </h3>
            <p className="mt-3 text-center text-sm leading-6" style={{ color: 'var(--ink-600)' }}>
              Are you sure you want to logout?
            </p>
            <div className="mt-6 flex gap-2">
              <button type="button" onClick={() => setShowLogout(false)} className="btn-outline flex-1">
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => { await logout(); setShowLogout(false); }}
                className="btn-dark flex-1"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
