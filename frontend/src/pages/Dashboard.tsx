import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { CreditCard, Download, History, LogOut, Shield, Sparkles, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useEntitlement } from '../context/EntitlementContext';
import { siteConfig, siteUrl } from '../lib/site';
import { loadDownloadHistory, sanitizeFilename, type DownloadHistoryItem } from '../lib/downloads';

function planLabel(p: string) { return p === 'monthly' ? 'Monthly' : p === 'lifetime' ? 'Lifetime' : p === 'user' ? 'Free' : 'Guest'; }
function planDesc(p: string) { return p === 'monthly' ? 'Unlimited downloads, no ads.' : p === 'lifetime' ? 'Unlimited downloads, no ads forever.' : p === 'user' ? 'Limited daily downloads. Upgrade for more.' : 'Login to increase your daily limit.'; }

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { entitlement, loading, refresh } = useEntitlement();
  const [history, setHistory] = useState<DownloadHistoryItem[]>([]);
  const [showLogout, setShowLogout] = useState(false);
  const activePlan = entitlement.plan || (user ? 'user' : 'guest');
  const isPremium = activePlan === 'monthly' || activePlan === 'lifetime';

  useEffect(() => { setHistory(loadDownloadHistory()); }, []);

  if (!user) return (
    <div className="shell" style={{ maxWidth: 400, margin: '0 auto', padding: '5rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Helmet><title>Dashboard | {siteConfig.name}</title></Helmet>
      <div className="card text-center w-full" style={{ padding: '3rem 2rem' }}>
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl" style={{ background: 'var(--brand-50)', color: 'var(--brand-600)' }}><User size={24} /></div>
        <h1 className="mt-5 text-xl font-bold" style={{ color: 'var(--ink-900)' }}>Login required</h1>
        <p className="mt-2 text-sm" style={{ color: 'var(--ink-600)' }}>Sign in with your Google account to access your dashboard.</p>
        <Link to="/" className="btn-primary inline-flex items-center gap-2 mt-6">Go to Home</Link>
      </div>
    </div>
  );

  if (loading) return (
    <div className="shell" style={{ maxWidth: 960, margin: '0 auto', padding: '2.5rem 1rem' }}>
      <Helmet><title>Dashboard | {siteConfig.name}</title></Helmet>
      <div className="animate-pulse space-y-4">
        <div className="h-4 w-48 rounded" style={{ background: 'var(--surface-soft)' }} />
        <div className="h-8 w-64 rounded" style={{ background: 'var(--surface-soft)' }} />
        <div className="grid grid-cols-[280px_1fr] gap-6">
          <div className="card h-80" style={{ background: 'var(--surface-soft)' }} />
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="card h-24" style={{ background: 'var(--surface-soft)' }} />
              <div className="card h-24" style={{ background: 'var(--surface-soft)' }} />
            </div>
            <div className="card h-72" style={{ background: 'var(--surface-soft)' }} />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="shell" style={{ maxWidth: 960, margin: '0 auto', padding: '2.5rem 1rem' }}>
      <Helmet><title>Dashboard | {siteConfig.name}</title><meta name="description" content="Manage your SwiftDL account." /><link rel="canonical" href={siteUrl('/dashboard')} /></Helmet>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <span className="tag">Dashboard</span>
          <h1 className="mt-2 text-xl font-bold" style={{ color: 'var(--ink-900)' }}>Welcome back, {user.displayName?.split(' ')[0] || 'User'}</h1>
        </div>
        <button onClick={() => setShowLogout(true)} className="btn-outline text-[13px]"><LogOut size={14} /> Logout</button>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6 items-start">
        {/* Sidebar */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="p-6 flex flex-col items-center text-center">
            {user.photoURL ? <img src={user.photoURL} alt="" className="w-16 h-16 rounded-full border-2" style={{ borderColor: 'var(--border)' }} />
            : <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: 'var(--brand-50)', color: 'var(--brand-600)' }}><User size={24} /></div>}
            <h2 className="mt-3 text-sm font-bold" style={{ color: 'var(--ink-900)' }}>{user.displayName || 'User'}</h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--ink-500)' }}>{user.email}</p>
            <div className="mt-4 w-full rounded-lg p-3 text-sm text-white text-center" style={{ background: isPremium ? 'var(--brand-600)' : 'var(--ink-heavy)' }}>
              <div className="flex items-center justify-center gap-1.5 text-xs font-bold">{isPremium ? <Sparkles size={14} /> : <Shield size={14} />}{planLabel(activePlan)}</div>
              <p className="mt-1 text-[10px] opacity-75">{planDesc(activePlan)}</p>
            </div>
            {!isPremium && <Link to="/pricing" className="btn-primary w-full mt-4 text-xs"><CreditCard size={14} /> Upgrade to Premium</Link>}
          </div>
        </div>

        {/* Main */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {[{
              icon: Download, label: 'Daily Limit',
              value: entitlement.unlimited ? '∞' : activePlan === 'user' ? '3' : activePlan === 'guest' ? '1' : '0'
            }, {
              icon: History, label: 'Recent Downloads', value: String(history.length)
            }].map(s => (
              <div key={s.label} className="card text-center" style={{ padding: '1.25rem 1rem' }}>
                <s.icon size={18} className="mx-auto" style={{ color: 'var(--brand-600)' }} />
                <p className="mt-2 text-2xl font-bold" style={{ color: 'var(--ink-900)' }}>{s.value}</p>
                <p className="text-[11px] mt-1" style={{ color: 'var(--ink-500)' }}>{s.label}</p>
              </div>
            ))}
          </div>

          <div className="card" style={{ padding: 0 }}>
            <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
              <h3 className="text-sm font-bold" style={{ color: 'var(--ink-900)' }}>Recent Downloads</h3>
              <button onClick={() => refresh().then(() => toast.success('Refreshed'))} className="text-[11px] font-semibold border-0 bg-transparent cursor-pointer" style={{ color: 'var(--brand-600)' }}>Refresh</button>
            </div>
            {history.length > 0 ? (
              <div className="p-2 space-y-0.5">
                {history.slice(0, 5).map(item => (
                  <div key={item.id} className="flex items-center gap-3 p-2.5 rounded-lg transition-colors hover:bg-[var(--surface-soft)]">
                    {item.thumbnail ? <img src={item.thumbnail} alt="" className="w-10 h-10 rounded object-cover" /> : <div className="w-10 h-10 rounded flex items-center justify-center shrink-0" style={{ background: 'var(--brand-50)', color: 'var(--brand-600)' }}><Download size={14} /></div>}
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold truncate" style={{ color: 'var(--ink-900)' }}>{item.title}</p>
                      <p className="text-[10px]" style={{ color: 'var(--ink-500)' }}>{item.date} · {item.ext.toUpperCase()}</p>
                    </div>
                    <a href={item.downloadUrl} download={`${sanitizeFilename(item.title)}.${item.ext}`} className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors hover:bg-[var(--surface-soft)]" style={{ color: 'var(--brand-600)' }} aria-label="Download"><Download size={14} /></a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center">
                <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: 'var(--surface-soft)', color: 'var(--ink-400)' }}><Download size={18} /></div>
                <p className="text-sm font-semibold" style={{ color: 'var(--ink-600)' }}>No recent downloads</p>
                <p className="text-xs mt-1" style={{ color: 'var(--ink-500)' }}>Your download history will appear here.</p>
                <Link to="/" className="btn-primary inline-flex mt-4 text-xs py-2 px-4">Start Downloading</Link>
              </div>
            )}
          </div>
        </div>
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