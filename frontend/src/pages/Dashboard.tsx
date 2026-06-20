import { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { AlertCircle, CalendarClock, CreditCard, Download, History, LogOut, RefreshCw, Shield, Sparkles, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useEntitlement } from '../context/EntitlementContext';
import { siteConfig, siteUrl } from '../lib/site';
import { loadDownloadHistory, sanitizeFilename, type DownloadHistoryItem } from '../lib/downloads';

function planLabel(p: string) {
  return p === 'monthly' ? 'Monthly Premium' : p === 'lifetime' ? 'Lifetime Premium' : p === 'user' ? 'Free Account' : 'Guest';
}

function statusLabel(status?: string | null) {
  if (status === 'active') return 'Active';
  if (status === 'expired') return 'Expired';
  if (status === 'cancelled') return 'Cancelled';
  if (status === 'guest') return 'Guest';
  return 'Inactive';
}

function formatDateTime(value?: string | null) {
  if (!value) return 'Not available';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not available';
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

function daysUntil(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return Math.ceil((date.getTime() - Date.now()) / 86400000);
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { entitlement, loading, refresh } = useEntitlement();
  const [history, setHistory] = useState<DownloadHistoryItem[]>([]);
  const [showLogout, setShowLogout] = useState(false);

  const activePlan = entitlement.plan || (user ? 'user' : 'guest');
  const isPremium = entitlement.unlimited;
  const expiryDays = daysUntil(entitlement.expiresAt);
  const limitValue = entitlement.dailyLimit ?? (activePlan === 'monthly' ? 75 : activePlan === 'lifetime' ? 150 : activePlan === 'user' ? 3 : 1);
  const limitText = limitValue && limitValue > 0 ? `${limitValue}/day` : 'Unlimited';
  const remainingText = limitValue && limitValue > 0 ? (entitlement.remaining == null ? 'Not loaded' : String(entitlement.remaining)) : 'Unlimited';
  const premiumStatus = statusLabel(entitlement.premiumStatus);

  const premiumRows = useMemo(() => [
    { label: 'Purchased', value: formatDateTime(entitlement.purchasedAt) },
    { label: 'Activated', value: formatDateTime(entitlement.activatedAt || entitlement.purchasedAt) },
    {
      label: activePlan === 'lifetime' ? 'Expires' : entitlement.cancelAtPeriodEnd ? 'Access until' : 'Renews / expires',
      value: activePlan === 'lifetime' ? 'Never' : formatDateTime(entitlement.renewsAt || entitlement.expiresAt),
    },
    { label: 'Last synced', value: formatDateTime(entitlement.updatedAt) },
  ], [activePlan, entitlement]);

  useEffect(() => { setHistory(loadDownloadHistory()); }, []);

  if (!user) return (
    <div className="shell" style={{ maxWidth: 420, margin: '0 auto', padding: '5rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Helmet><title>Dashboard | {siteConfig.name}</title></Helmet>
      <div className="card text-center w-full" style={{ padding: '3rem 2rem' }}>
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-lg" style={{ background: 'var(--brand-50)', color: 'var(--brand-600)' }}><User size={24} /></div>
        <h1 className="mt-5 text-xl font-bold" style={{ color: 'var(--ink-900)' }}>Login required</h1>
        <p className="mt-2 text-sm" style={{ color: 'var(--ink-600)' }}>Sign in with your Google account to access your dashboard.</p>
        <Link to="/" className="btn-primary inline-flex items-center gap-2 mt-6">Go to Home</Link>
      </div>
    </div>
  );

  if (loading) return (
    <div className="shell" style={{ maxWidth: 1100, margin: '0 auto', padding: '2.5rem 1rem' }}>
      <Helmet><title>Dashboard | {siteConfig.name}</title></Helmet>
      <div className="animate-pulse space-y-4">
        <div className="h-4 w-48 rounded" style={{ background: 'var(--surface-soft)' }} />
        <div className="h-8 w-72 rounded" style={{ background: 'var(--surface-soft)' }} />
        <div className="grid grid-cols-1 gap-5 md:grid-cols-[300px_1fr]">
          <div className="card h-80" style={{ background: 'var(--surface-soft)' }} />
          <div className="card h-80" style={{ background: 'var(--surface-soft)' }} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="shell" style={{ maxWidth: 1100, margin: '0 auto', padding: '2.5rem 1rem 4rem' }}>
      <Helmet><title>Dashboard | {siteConfig.name}</title><meta name="description" content="Manage your SwiftDL account, plan status, and premium expiry." /><link rel="canonical" href={siteUrl('/dashboard')} /></Helmet>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <span className="tag">Dashboard</span>
          <h1 className="mt-2 text-2xl font-extrabold" style={{ color: 'var(--ink-900)' }}>Welcome back, {user.displayName?.split(' ')[0] || 'User'}</h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--ink-600)' }}>Your plan, usage, and premium validity are synced from billing.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => refresh().then(() => toast.success('Account refreshed'))} className="btn-outline text-[13px]"><RefreshCw size={14} /> Refresh</button>
          <button onClick={() => setShowLogout(true)} className="btn-dark text-[13px]"><LogOut size={14} /> Logout</button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-[300px_1fr] gap-5 items-start">
        <aside className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="p-6 flex flex-col items-center text-center">
            {user.photoURL ? <img src={user.photoURL} alt="" className="w-16 h-16 rounded-lg border-2 object-cover" style={{ borderColor: 'var(--border)' }} />
            : <div className="w-16 h-16 rounded-lg flex items-center justify-center" style={{ background: 'var(--brand-50)', color: 'var(--brand-600)' }}><User size={24} /></div>}
            <h2 className="mt-3 text-sm font-bold" style={{ color: 'var(--ink-900)' }}>{user.displayName || 'User'}</h2>
            <p className="text-xs mt-0.5 break-all" style={{ color: 'var(--ink-500)' }}>{user.email}</p>
            <div className="mt-5 w-full rounded-lg p-4 text-white text-left" style={{ background: isPremium ? 'var(--brand-600)' : 'var(--ink-heavy)' }}>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs font-bold">{isPremium ? <Sparkles size={14} /> : <Shield size={14} />}{planLabel(activePlan)}</div>
                <span className="rounded-md bg-white/15 px-2 py-1 text-[10px] font-bold">{premiumStatus}</span>
              </div>
              <p className="mt-2 text-[11px] leading-5 opacity-80">{isPremium ? 'Premium access is enabled for this account.' : 'Free access is active. Upgrade for premium fair-use limits.'}</p>
            </div>
            {!isPremium && <Link to="/pricing" className="btn-primary w-full mt-4 text-xs"><CreditCard size={14} /> Upgrade to Premium</Link>}
          </div>
        </aside>

        <main className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { icon: Sparkles, label: 'Plan', value: planLabel(activePlan) },
              { icon: Download, label: 'Daily limit', value: limitText },
              { icon: History, label: 'Remaining today', value: remainingText },
            ].map(s => (
              <div key={s.label} className="card" style={{ padding: '1.25rem 1rem' }}>
                <s.icon size={18} style={{ color: 'var(--brand-600)' }} />
                <p className="mt-3 break-words text-xl font-bold" style={{ color: 'var(--ink-900)' }}>{s.value}</p>
                <p className="text-[11px] mt-1" style={{ color: 'var(--ink-500)' }}>{s.label}</p>
              </div>
            ))}
          </div>

          {(entitlement.premiumPlan || isPremium) && (
            <section className="card" style={{ padding: 0 }}>
              <div className="flex min-w-0 flex-wrap items-center justify-between gap-3 border-b px-4 py-4 sm:px-5" style={{ borderColor: 'var(--border)' }}>
                <div>
                  <h2 className="text-sm font-bold" style={{ color: 'var(--ink-900)' }}>Premium validity</h2>
                  <p className="mt-1 break-all text-xs" style={{ color: 'var(--ink-500)' }}>{entitlement.subscriptionId || entitlement.orderId || entitlement.paymentId || 'Billing reference pending'}</p>
                </div>
                <span className={`pill ${isPremium ? 'badge-green' : 'badge-amber'}`}>{premiumStatus}</span>
              </div>
              <div className="grid gap-0 sm:grid-cols-2">
                {premiumRows.map(row => (
                  <div key={row.label} className="border-b p-5 sm:border-r" style={{ borderColor: 'var(--border)' }}>
                    <div className="flex items-center gap-2 text-xs font-semibold" style={{ color: 'var(--ink-500)' }}><CalendarClock size={14} /> {row.label}</div>
                    <p className="mt-2 text-sm font-bold" style={{ color: 'var(--ink-900)' }}>{row.value}</p>
                  </div>
                ))}
              </div>
              {activePlan === 'monthly' && expiryDays !== null && (
                <div className="px-5 py-4 text-xs leading-5" style={{ color: expiryDays <= 3 ? 'var(--warning-600)' : 'var(--ink-600)' }}>
                  {expiryDays >= 0 ? `${expiryDays} day${expiryDays === 1 ? '' : 's'} left in the current premium period.` : 'This monthly premium period has expired.'}
                </div>
              )}
              {!isPremium && entitlement.premiumStatus === 'expired' && (
                <div className="mx-5 mb-5 flex items-start gap-3 rounded-lg border p-4" style={{ borderColor: 'var(--warning-100)', background: 'var(--surface-soft)' }}>
                  <AlertCircle size={18} style={{ color: 'var(--warning-600)' }} />
                  <div>
                    <p className="text-sm font-bold" style={{ color: 'var(--ink-900)' }}>Premium expired</p>
                    <p className="mt-1 text-xs" style={{ color: 'var(--ink-600)' }}>Renew from pricing to restore premium fair-use access.</p>
                  </div>
                </div>
              )}
            </section>
          )}

          <section className="card" style={{ padding: 0 }}>
            <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
              <h2 className="text-sm font-bold" style={{ color: 'var(--ink-900)' }}>Recent downloads</h2>
              <span className="text-[11px] font-semibold" style={{ color: 'var(--ink-500)' }}>{history.length} saved locally</span>
            </div>
            {history.length > 0 ? (
              <div className="p-2 space-y-0.5">
                {history.slice(0, 5).map(item => (
                  <div key={item.id} className="flex items-center gap-3 p-2.5 rounded-lg transition-colors hover:bg-[var(--surface-soft)]">
                    {item.thumbnail ? <img src={item.thumbnail} alt="" className="w-10 h-10 rounded object-cover" /> : <div className="w-10 h-10 rounded flex items-center justify-center shrink-0" style={{ background: 'var(--brand-50)', color: 'var(--brand-600)' }}><Download size={14} /></div>}
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold truncate" style={{ color: 'var(--ink-900)' }}>{item.title}</p>
                      <p className="text-[10px]" style={{ color: 'var(--ink-500)' }}>{item.date} - {item.ext.toUpperCase()}</p>
                    </div>
                    <a href={item.downloadUrl} download={`${sanitizeFilename(item.title)}.${item.ext}`} className="w-8 h-8 rounded-md flex items-center justify-center shrink-0 transition-colors hover:bg-[var(--surface-soft)]" style={{ color: 'var(--brand-600)' }} aria-label="Download"><Download size={14} /></a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center">
                <div className="w-10 h-10 rounded-md flex items-center justify-center mx-auto mb-3" style={{ background: 'var(--surface-soft)', color: 'var(--ink-400)' }}><Download size={18} /></div>
                <p className="text-sm font-semibold" style={{ color: 'var(--ink-600)' }}>No recent downloads</p>
                <p className="text-xs mt-1" style={{ color: 'var(--ink-500)' }}>Your browser download history will appear here.</p>
                <Link to="/" className="btn-primary inline-flex mt-4 text-xs py-2 px-4">Start Downloading</Link>
              </div>
            )}
          </section>
        </main>
      </div>

      {showLogout && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={() => setShowLogout(false)}>
          <div className="card w-full max-w-xs animate-scale-in" style={{ padding: '1.5rem' }} onClick={e => e.stopPropagation()}>
            <div className="mx-auto inline-flex items-center justify-center w-11 h-11 rounded-lg" style={{ background: 'var(--danger-100)', color: 'var(--danger-600)' }}><LogOut size={20} /></div>
            <h3 className="mt-4 text-center text-base font-bold" style={{ color: 'var(--ink-900)' }}>Confirm logout</h3>
            <p className="mt-2 text-center text-xs" style={{ color: 'var(--ink-600)' }}>Are you sure you want to logout?</p>
            <div className="mt-4 flex gap-2">
              <button onClick={() => setShowLogout(false)} className="btn-outline flex-1 text-xs">Cancel</button>
              <button onClick={() => { logout(); setShowLogout(false); }} className="btn-dark flex-1 text-xs flex items-center justify-center gap-1.5"><LogOut size={14} /> Logout</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}