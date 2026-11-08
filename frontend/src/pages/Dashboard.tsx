import { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { AlertCircle, CalendarClock, CreditCard, Download, History, LogOut, RefreshCw, Shield, ShieldCheck, Sparkles, User, ArrowRight, Inbox } from 'lucide-react';
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
    <div className="shell flex flex-col items-center px-4 py-16 sm:py-24">
      <Helmet><title>Dashboard | {siteConfig.name}</title></Helmet>
      <div className="card w-full max-w-md py-10 text-center sm:py-14">
        <div className="icon-tile mx-auto !h-14 !w-14"><User size={24} /></div>
        <span className="eyebrow mt-6 justify-center">Members only</span>
        <h1 className="mt-3 text-2xl font-bold" style={{ color: 'var(--ink-900)' }}>Login required</h1>
        <p className="mx-auto mt-2 max-w-xs text-sm" style={{ color: 'var(--ink-600)' }}>Sign in to access your dashboard, plan status, and download history.</p>
        <Link to="/" className="btn-primary mt-6 w-full sm:w-auto">Go to Home <ArrowRight size={16} /></Link>
      </div>
    </div>
  );

  if (loading) return (
    <div className="shell max-w-6xl py-8 sm:py-10">
      <Helmet><title>Dashboard | {siteConfig.name}</title></Helmet>
      <div className="animate-pulse space-y-4">
        <div className="h-4 w-40 rounded-full" style={{ background: 'var(--surface-soft)' }} />
        <div className="h-9 w-64 rounded-xl" style={{ background: 'var(--surface-soft)' }} />
        <div className="grid grid-cols-1 gap-5 md:grid-cols-[320px_1fr]">
          <div className="bento h-80" style={{ background: 'var(--surface-soft)' }} />
          <div className="bento h-80" style={{ background: 'var(--surface-soft)' }} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="shell max-w-6xl py-6 sm:py-10 lg:py-12">
      <Helmet><title>Dashboard | {siteConfig.name}</title><meta name="description" content="Manage your ShareHub account, plan status, and premium expiry." /><link rel="canonical" href={siteUrl('/dashboard')} /></Helmet>

      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <span className="tag"><ShieldCheck size={12} /> Dashboard</span>
          <h1 className="mt-3 text-2xl font-extrabold sm:text-3xl" style={{ color: 'var(--ink-900)' }}>
            Welcome back, <span className="gradient-text">{user.displayName?.split(' ')[0] || 'User'}</span>
          </h1>
          <p className="mt-2 max-w-md text-sm" style={{ color: 'var(--ink-600)' }}>Your plan, usage, and premium validity are synced live from billing.</p>
        </div>
        <div className="flex w-full gap-2 sm:w-auto">
          <button onClick={() => refresh().then(() => toast.success('Account refreshed'))} className="btn-outline flex-1 text-[13px] sm:flex-none"><RefreshCw size={14} /> Refresh</button>
          <button onClick={() => setShowLogout(true)} className="btn-dark flex-1 text-[13px] sm:flex-none"><LogOut size={14} /> Logout</button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 items-start gap-5 md:grid-cols-[320px_1fr]">
        {/* Profile / plan panel */}
        <aside className="card !p-0">
          <div className="flex flex-col items-center border-b p-6 pb-5 text-center" style={{ borderColor: 'var(--border)' }}>
            {user.photoURL
              ? <img src={user.photoURL} alt="" className="h-20 w-20 rounded-2xl border-2 object-cover" style={{ borderColor: 'var(--border-med)', boxShadow: 'var(--shadow-sm)' }} />
              : <div className="icon-tile !h-20 !w-20 !rounded-3xl"><User size={30} /></div>}
            <h2 className="mt-4 truncate text-base font-bold" style={{ color: 'var(--ink-900)' }}>{user.displayName || 'User'}</h2>
            <p className="mt-1 break-all text-xs" style={{ color: 'var(--ink-500)' }}>{user.email}</p>
          </div>

          <div className="p-5 sm:p-6">
            {/* Plan hero tile */}
            <div className="relative overflow-hidden rounded-2xl p-5 text-white" style={{ background: isPremium ? 'var(--grad-brand)' : 'var(--ink-heavy)', boxShadow: isPremium ? 'var(--glow-brand)' : 'var(--shadow-md)' }}>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 font-['Sora',sans-serif] text-[13px] font-bold">
                  {isPremium ? <Sparkles size={15} /> : <Shield size={15} />}
                  {planLabel(activePlan)}
                </div>
                <span className="rounded-full border border-white/20 bg-white/15 px-2.5 py-1 text-[10px] font-bold uppercase" style={{ letterSpacing: '0.08em' }}>{premiumStatus}</span>
              </div>
              <p className="mt-3 text-[11px] leading-5 text-white/80">
                {isPremium ? 'Premium access is enabled for this account. Enjoy fair-use freedom.' : 'Free access is active. Upgrade for premium fair-use limits and zero ads.'}
              </p>
              {isPremium && (
                <div className="mono mt-3 flex items-center gap-1.5 text-[9px] font-semibold uppercase text-white/60" style={{ letterSpacing: '0.18em' }}>
                  <span className="h-1.5 w-1.5 rounded-full bg-white/80" /> Premium sync active
                </div>
              )}
            </div>

            {!isPremium && (
              <Link to="/pricing" className="btn-primary mt-4 w-full text-xs"><CreditCard size={14} /> Upgrade to Premium <ArrowRight size={14} /></Link>
            )}
          </div>
        </aside>

        {/* Stats + premium validity + history */}
        <main className="space-y-4 sm:space-y-5">
          {/* Bento stat tiles */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
            {[
              { icon: Sparkles, label: 'Current plan', value: planLabel(activePlan) },
              { icon: Download, label: 'Daily limit', value: limitText },
              { icon: History, label: 'Remaining today', value: remainingText },
            ].map(s => (
              <div key={s.label} className="bento flex items-center gap-4 !p-4 sm:flex-col sm:items-start sm:gap-0 sm:!p-5">
                <div className="icon-tile shrink-0"><s.icon size={20} /></div>
                <div className="min-w-0 sm:mt-4">
                  <p className="break-words text-lg font-extrabold leading-tight sm:text-2xl" style={{ color: 'var(--ink-900)' }}>{s.value}</p>
                  <p className="mono mt-1 text-[9px] font-semibold uppercase" style={{ letterSpacing: '0.14em', color: 'var(--ink-500)' }}>{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          {(entitlement.premiumPlan || isPremium) && (
            <section className="card !p-0">
              <div className="flex min-w-0 flex-wrap items-center justify-between gap-3 border-b px-4 py-4 sm:px-6" style={{ borderColor: 'var(--border)' }}>
                <div className="min-w-0">
                  <h2 className="font-['Sora',sans-serif] text-sm font-bold" style={{ color: 'var(--ink-900)' }}>Premium validity</h2>
                  <p className="mt-1 break-all font-['JetBrains_Mono',monospace] text-[10px]" style={{ color: 'var(--ink-500)' }}>{entitlement.subscriptionId || entitlement.orderId || entitlement.paymentId || 'Billing reference pending'}</p>
                </div>
                <span className={`pill ${isPremium ? 'badge-green' : 'badge-amber'}`}>{premiumStatus}</span>
              </div>
              <div className="grid grid-cols-1 gap-0 sm:grid-cols-2">
                {premiumRows.map(row => (
                  <div key={row.label} className="border-b p-4 last:border-b-0 sm:border-r sm:p-5 sm:[&:nth-child(2n)]:border-r-0 sm:[&:nth-child(3)]:border-b-0" style={{ borderColor: 'var(--border)' }}>
                    <div className="mono flex items-center gap-2 text-[9px] font-semibold uppercase" style={{ letterSpacing: '0.14em', color: 'var(--ink-500)' }}><CalendarClock size={13} /> {row.label}</div>
                    <p className="mt-2 break-words text-sm font-bold" style={{ color: 'var(--ink-900)' }}>{row.value}</p>
                  </div>
                ))}
              </div>
              {activePlan === 'monthly' && expiryDays !== null && (
                <div className="border-t px-5 py-4 text-xs leading-5 sm:px-6" style={{ borderColor: 'var(--border)', color: expiryDays <= 3 ? 'var(--warning-600)' : 'var(--ink-600)' }}>
                  {expiryDays >= 0 ? `${expiryDays} day${expiryDays === 1 ? '' : 's'} left in the current premium period.` : 'This monthly premium period has expired.'}
                </div>
              )}
              {!isPremium && entitlement.premiumStatus === 'expired' && (
                <div className="mx-4 mb-4 flex items-start gap-3 rounded-2xl border p-4 sm:mx-5 sm:mb-5" style={{ borderColor: 'var(--warning-100)', background: 'var(--warning-100)' }}>
                  <AlertCircle size={18} className="mt-0.5 shrink-0" style={{ color: 'var(--warning-600)' }} />
                  <div>
                    <p className="text-sm font-bold" style={{ color: 'var(--ink-900)' }}>Premium expired</p>
                    <p className="mt-1 text-xs" style={{ color: 'var(--ink-600)' }}>Renew from pricing to restore premium fair-use access.</p>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* Download history */}
          <section className="card !p-0">
            <div className="flex items-center justify-between gap-3 border-b px-4 py-4 sm:px-6" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-2.5">
                <div className="icon-tile !h-8 !w-8 !rounded-xl"><History size={15} /></div>
                <h2 className="font-['Sora',sans-serif] text-sm font-bold" style={{ color: 'var(--ink-900)' }}>Recent downloads</h2>
              </div>
              <span className="pill">{history.length} saved</span>
            </div>
            {history.length > 0 ? (
              <div className="space-y-2 p-3 sm:p-4">
                {history.slice(0, 5).map(item => (
                  <div key={item.id} className="table-row grid-cols-[auto_minmax(0,1fr)_auto] items-center !gap-3">
                    {item.thumbnail
                      ? <img src={item.thumbnail} alt="" className="h-12 w-12 rounded-xl object-cover" />
                      : <div className="icon-tile !h-12 !w-12 !rounded-xl shrink-0"><Download size={17} /></div>}
                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold sm:text-[13px]" style={{ color: 'var(--ink-900)' }}>{item.title}</p>
                      <p className="mono mt-1 text-[10px]" style={{ color: 'var(--ink-500)' }}>{item.date} · {(item.ext || 'mp4').toUpperCase()}</p>
                    </div>
                    <a href={item.downloadUrl} download={`${sanitizeFilename(item.title)}.${item.ext || 'mp4'}`} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition-all hover:-translate-y-0.5 hover:border-[var(--border-strong)]" style={{ borderColor: 'var(--border)', color: 'var(--brand-700)', background: 'var(--grad-brand-soft)' }} aria-label="Download">
                      <Download size={17} />
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center px-6 py-12 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl" style={{ background: 'var(--grad-brand-soft)', color: 'var(--brand-700)' }}>
                  <Inbox size={26} />
                </div>
                <h3 className="mt-4 font-['Sora',sans-serif] text-base font-bold" style={{ color: 'var(--ink-900)' }}>Nothing downloaded yet</h3>
                <p className="mt-1.5 max-w-[16rem] text-xs leading-5" style={{ color: 'var(--ink-500)' }}>Grab your first video or audio — your recent history will appear right here.</p>
                <Link to="/" className="btn-primary mt-5 text-xs">Start Downloading <ArrowRight size={14} /></Link>
              </div>
            )}
          </section>
        </main>
      </div>

      {/* Logout confirmation modal */}
      {showLogout && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 backdrop-blur-sm" style={{ background: 'color-mix(in srgb, var(--ink-heavy) 55%, transparent)' }} onClick={() => setShowLogout(false)}>
          <div className="card w-full max-w-xs animate-scale-in !p-6 text-center" onClick={e => e.stopPropagation()}>
            <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: 'var(--danger-100)', color: 'var(--danger-600)' }}><LogOut size={22} /></div>
            <h3 className="mt-4 font-['Sora',sans-serif] text-lg font-bold" style={{ color: 'var(--ink-900)' }}>Confirm logout</h3>
            <p className="mt-2 text-xs" style={{ color: 'var(--ink-600)' }}>Are you sure you want to logout?</p>
            <div className="mt-5 flex gap-2">
              <button onClick={() => setShowLogout(false)} className="btn-outline flex-1 text-xs">Cancel</button>
              <button onClick={() => { logout(); setShowLogout(false); }} className="btn-dark flex-1 items-center justify-center gap-1.5 text-xs"><LogOut size={14} /> Logout</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
