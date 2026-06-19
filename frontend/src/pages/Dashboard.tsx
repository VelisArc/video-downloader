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
  if (plan === 'lifetime') return "You have unlimited downloads and no ads - forever.";
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
      <div className="section-shell" style={{ maxWidth: 420, margin: '0 auto', padding: '80px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Helmet>
          <title>Dashboard | {siteConfig.name}</title>
        </Helmet>
        <div className="card" style={{ padding: '48px 32px', textAlign: 'center', width: '100%' }}>
          <div style={{ margin: '0 auto', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 56, height: 56, borderRadius: 12, background: 'var(--brand-50)', color: 'var(--brand-600)' }}>
            <User size={24} />
          </div>
          <h1 style={{ marginTop: 20, fontSize: 22, fontWeight: 800, color: 'var(--ink-900)' }}>Login required</h1>
          <p style={{ marginTop: 8, fontSize: 14, lineHeight: 1.6, color: 'var(--ink-600)', maxWidth: 300, margin: '8px auto 0' }}>
            Sign in with your Google account to access your dashboard and track your usage.
          </p>
          <Link to="/" className="btn-brand" style={{ marginTop: 24, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="section-shell" style={{ maxWidth: 960, margin: '0 auto', padding: '40px 16px' }}>
        <Helmet><title>Dashboard | {siteConfig.name}</title></Helmet>
        <div style={{ width: 200, height: 14, borderRadius: 6, background: 'var(--surface-soft)' }} />
        <div style={{ marginTop: 12, width: 280, height: 28, borderRadius: 8, background: 'var(--surface-soft)' }} />
        <div style={{ marginTop: 32, display: 'grid', gridTemplateColumns: '280px 1fr', gap: 24 }}>
          <div className="card" style={{ height: 360, background: 'var(--surface-soft)' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="card" style={{ height: 100, background: 'var(--surface-soft)' }} />
              <div className="card" style={{ height: 100, background: 'var(--surface-soft)' }} />
            </div>
            <div className="card" style={{ flex: 1, minHeight: 320, background: 'var(--surface-soft)' }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="section-shell" style={{ maxWidth: 960, margin: '0 auto', padding: '40px 16px' }}>
      <Helmet>
        <title>Dashboard | {siteConfig.name}</title>
        <meta name="description" content="Manage your SwiftDL account, view usage, and track your downloads." />
        <link rel="canonical" href={siteUrl('/dashboard')} />
      </Helmet>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <span className="section-eyebrow">Dashboard</span>
          <h1 style={{ marginTop: 8, fontSize: 26, fontWeight: 800, color: 'var(--ink-900)', lineHeight: 1.2 }}>
            Welcome back, {user.displayName?.split(' ')[0] || 'User'}
          </h1>
        </div>
        <button type="button" onClick={() => setShowLogout(true)} className="btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <LogOut size={14} />
          Logout
        </button>
      </div>

      <div style={{ marginTop: 28, display: 'grid', gridTemplateColumns: '280px 1fr', gap: 24, alignItems: 'start' }}>
        {/* Profile sidebar */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '28px 24px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            {user.photoURL ? (
              <img src={user.photoURL} alt={user.displayName || 'User'} style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--border-soft)' }} />
            ) : (
              <div style={{ width: 72, height: 72, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--brand-50)', color: 'var(--brand-600)', border: '3px solid var(--surface)' }}>
                <User size={28} />
              </div>
            )}

            <h2 style={{ marginTop: 14, fontSize: 15, fontWeight: 700, color: 'var(--ink-900)', lineHeight: 1.3 }}>{user.displayName || 'User'}</h2>
            <p style={{ marginTop: 2, fontSize: 12, color: 'var(--ink-500)' }}>{user.email}</p>

            <div style={{ marginTop: 16, width: '100%', borderRadius: 10, padding: '12px 16px', color: '#fff', background: isPremium ? 'var(--brand-600)' : 'var(--ink-900)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                {isPremium ? <Sparkles size={14} /> : <Shield size={14} />}
                <span style={{ fontSize: 12, fontWeight: 700 }}>{planLabel(activePlan)}</span>
              </div>
              <p style={{ marginTop: 4, fontSize: 11, lineHeight: 1.4, opacity: 0.75 }}>{planDescription(activePlan)}</p>
            </div>

            {!isPremium && (
              <Link to="/pricing" className="btn-brand" style={{ marginTop: 16, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <CreditCard size={14} />
                Upgrade to Premium
              </Link>
            )}
          </div>
        </div>

        {/* Main content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="card" style={{ padding: '20px 16px', textAlign: 'center' }}>
              <Download size={18} style={{ margin: '0 auto', color: 'var(--brand-600)' }} />
              <p style={{ marginTop: 10, fontSize: 28, fontWeight: 800, color: 'var(--ink-900)', lineHeight: 1 }}>
                {entitlement.unlimited ? '∞' : activePlan === 'user' ? '3' : '1'}
              </p>
              <p style={{ marginTop: 4, fontSize: 11, color: 'var(--ink-500)' }}>Daily Limit</p>
            </div>
            <div className="card" style={{ padding: '20px 16px', textAlign: 'center' }}>
              <History size={18} style={{ margin: '0 auto', color: 'var(--brand-600)' }} />
              <p style={{ marginTop: 10, fontSize: 28, fontWeight: 800, color: 'var(--ink-900)', lineHeight: 1 }}>{history.length}</p>
              <p style={{ marginTop: 4, fontSize: 11, color: 'var(--ink-500)' }}>Recent Downloads</p>
            </div>
          </div>

          <div className="card" style={{ padding: 0 }}>
            <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-soft)' }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-900)' }}>Recent Downloads</h3>
              <button type="button" onClick={() => refresh().then(() => toast.success('Refreshed'))} style={{ fontSize: 11, fontWeight: 600, color: 'var(--brand-600)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                Refresh
              </button>
            </div>
            {history.length > 0 ? (
              <div style={{ padding: '8px 12px 12px' }}>
                {history.slice(0, 5).map((item) => (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 8, transition: 'background 0.15s' }} onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'var(--surface-soft)'; }} onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}>
                    {item.thumbnail ? (
                      <img src={item.thumbnail} alt="" style={{ width: 40, height: 40, borderRadius: 6, objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: 40, height: 40, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--brand-50)', color: 'var(--brand-600)', flexShrink: 0 }}>
                        <Download size={14} />
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-900)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</p>
                      <p style={{ fontSize: 10, color: 'var(--ink-500)' }}>{item.date} · {item.ext.toUpperCase()}</p>
                    </div>
                    <a href={item.downloadUrl} download={`${sanitizeFilename(item.title)}.${item.ext}`} style={{ width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-600)', flexShrink: 0, transition: 'background 0.15s' }} onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = 'var(--surface-soft)'; }} onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'; }} aria-label="Download item">
                      <Download size={14} />
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-soft)', color: 'var(--ink-400)', marginBottom: 12 }}>
                  <Download size={18} />
                </div>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-600)' }}>No recent downloads</p>
                <p style={{ fontSize: 11, color: 'var(--ink-500)', marginTop: 2 }}>Your download history will appear here.</p>
                <Link to="/" className="btn-brand" style={{ marginTop: 16, fontSize: 12, padding: '8px 20px' }}>Start Downloading</Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {showLogout && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(0,0,0,0.5)' }} onClick={() => setShowLogout(false)}>
          <div className="card" style={{ width: '100%', maxWidth: 340, padding: '24px', boxShadow: 'var(--shadow-2xl)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ margin: '0 auto', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 44, height: 44, borderRadius: 10, background: 'var(--brand-50)', color: 'var(--brand-600)' }}>
              <LogOut size={20} />
            </div>
            <h3 style={{ marginTop: 16, textAlign: 'center', fontSize: 18, fontWeight: 800, color: 'var(--ink-900)' }}>Confirm logout</h3>
            <p style={{ marginTop: 8, textAlign: 'center', fontSize: 13, lineHeight: 1.5, color: 'var(--ink-600)' }}>Are you sure you want to logout?</p>
            <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
              <button type="button" onClick={() => setShowLogout(false)} className="btn-outline" style={{ flex: 1 }}>Cancel</button>
              <button type="button" onClick={async () => { await logout(); setShowLogout(false); }} className="btn-dark" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <LogOut size={14} />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
