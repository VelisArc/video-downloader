import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import {
  CheckCircle2,
  Cookie,
  Download,
  FileAudio2,
  History,
  RefreshCw,
  Shield,
  Sparkles,
  Trash2,
  Video,
  X,
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { useEntitlement } from '../context/EntitlementContext';
import HomeSeoContent from '../components/HomeSeoContent';
import LoadingIndicator from '../components/LoadingIndicator';
import DownloaderPanel from '../components/DownloaderPanel';
import ResultCard from '../components/ResultCard';
import QuotaCard from '../components/QuotaCard';
import {
  copyText,
  CookieVaultItem,
  CookieVaultState,
  DownloadHistoryItem,
  DownloadQuota,
  DownloadType,
  getOrCreateClientId,
  isSupportedUrl,
  loadDownloadHistory,
  normalizeUrl,
  sanitizeFilename,
  saveDownloadHistory,
} from '../lib/downloads';
import { platformHighlights, siteConfig, siteUrl } from '../lib/site';
import { API_BASE } from '../lib/api';

interface ConfigState {
  guestDailyLimit: number;
  userDailyLimit: number;
  monthlyDailyLimit: number;
  lifetimeDailyLimit: number;
}

const defaultConfig: ConfigState = {
  guestDailyLimit: 1,
  userDailyLimit: 3,
  monthlyDailyLimit: 0,
  lifetimeDailyLimit: 0,
};

const emptyCookieVault: CookieVaultState = {
  hasCookies: false,
  items: [],
  totalCount: 0,
  activeCount: 0,
  expiredCount: 0,
  canUseCookies: false,
};

const blankItem: DownloadHistoryItem = {
  id: '',
  thumbnail: '',
  title: '',
  downloadUrl: '',
  ext: 'mp4',
  date: '',
  type: 'video',
  platform: '',
  cookieMatch: null,
};

const valueCards = [
  {
    title: 'Wide platform coverage',
    description: 'Works with many major yt-dlp-compatible platforms.',
    icon: Sparkles,
  },
  {
    title: 'Saved cookie vault',
    description: 'Logged-in users can save cookies for restricted links.',
    icon: Cookie,
  },
  {
    title: 'Local history',
    description: 'Recent downloads stay in your browser for quick access.',
    icon: History,
  },
];

const useCaseCards = [
  {
    title: 'Offline review',
    description: 'Save approved links for flights, poor connections, or review cycles.',
    icon: Video,
  },
  {
    title: 'Creator archive',
    description: 'Keep backups of your uploads and campaign assets.',
    icon: Shield,
  },
  {
    title: 'Audio reference',
    description: 'Extract audio for notes, research, or rough review work.',
    icon: FileAudio2,
  },
];

function limitLabel(limit: number) {
  return limit <= 0 ? 'Unlimited' : `${limit}/day`;
}

function resolveLimit(plan: string, config: ConfigState) {
  if (plan === 'monthly') return config.monthlyDailyLimit;
  if (plan === 'lifetime') return config.lifetimeDailyLimit;
  if (plan === 'user') return config.userDailyLimit;
  return config.guestDailyLimit;
}

function isPremiumPlan(plan: string) {
  return plan === 'monthly' || plan === 'lifetime';
}

function toBase64Utf8(text: string) {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  for (let index = 0; index < bytes.length; index += 1) binary += String.fromCharCode(bytes[index]);
  return btoa(binary);
}

function formatPlatformLabel(platform?: string | null) {
  const normalized = (platform || '').trim();
  if (!normalized || normalized === 'generic') return 'Auto-detected';
  return normalized.split(/[-_.]/g).filter(Boolean).map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
}

function formatEpoch(epoch?: number | null) {
  if (!epoch) return 'Not available';
  return new Date(epoch * 1000).toLocaleString();
}

function domainSummary(domains?: string[]) {
  if (!domains?.length) return 'No domains detected';
  if (domains.length === 1) return domains[0];
  return `${domains[0]} +${domains.length - 1} more`;
}

function normalizeCookieVaultState(raw: any, fallbackPlan: string): CookieVaultState {
  const items = Array.isArray(raw?.items) ? (raw.items as CookieVaultItem[]) : [];
  const activeCount = Number(raw?.activeCount ?? items.filter((item) => !item?.expired).length);
  const expiredCount = Number(raw?.expiredCount ?? items.filter((item) => item?.expired).length);
  return {
    requiresLogin: Boolean(raw?.requiresLogin),
    canUseCookies: Boolean(raw?.canUseCookies),
    plan: typeof raw?.plan === 'string' ? raw.plan : fallbackPlan,
    hasCookies: Boolean(raw?.hasCookies ?? items.length),
    items,
    totalCount: Number(raw?.totalCount ?? items.length),
    activeCount,
    expiredCount,
    maxCount: raw?.maxCount ?? null,
    remainingSlots: raw?.remainingSlots ?? null,
  };
}

export default function Home() {
  const { user } = useAuth();
  const { entitlement } = useEntitlement();

  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [downloadType, setDownloadType] = useState<DownloadType>('video');
  const [history, setHistory] = useState<DownloadHistoryItem[]>([]);
  const [videoData, setVideoData] = useState<DownloadHistoryItem>(blankItem);
  const [quotaSnapshot, setQuotaSnapshot] = useState<DownloadQuota | null>(null);
  const [config, setConfig] = useState(defaultConfig);
  const [useCookies, setUseCookies] = useState(false);
  const [cookiesB64, setCookiesB64] = useState<string | null>(null);
  const [cookiesName, setCookiesName] = useState<string | null>(null);
  const [cookieLabel, setCookieLabel] = useState('');
  const [savedCookies, setSavedCookies] = useState<CookieVaultState>(emptyCookieVault);
  const [isCookieVaultLoading, setIsCookieVaultLoading] = useState(false);
  const [isCookieVaultBusy, setIsCookieVaultBusy] = useState(false);

  const activePlan = entitlement.plan || (user ? 'user' : 'guest');
  const isPremiumUser = isPremiumPlan(activePlan);
  const cookiesFeatureAvailable = Boolean(user);
  const cookieVaultMaxCount = savedCookies.maxCount ?? (isPremiumUser ? null : user ? 2 : 0);
  const isCookieLimitReached = Boolean(cookieVaultMaxCount && savedCookies.totalCount >= cookieVaultMaxCount);
  const effectiveLimit = resolveLimit(activePlan, config);
  const effectiveQuota = quotaSnapshot || {
    plan: activePlan,
    unlimited: entitlement.unlimited,
    dailyLimit: effectiveLimit,
  };

  useEffect(() => {
    getOrCreateClientId();
    setHistory(loadDownloadHistory());
    fetch(`${API_BASE}/config`)
      .then((r) => r.json().catch(() => ({})).then((d) => ({ ok: r.ok, d })))
      .then(({ ok, d }) => {
        if (!ok) return;
        setConfig({
          guestDailyLimit: Number(d?.guestDailyLimit ?? 1),
          userDailyLimit: Number(d?.userDailyLimit ?? 3),
          monthlyDailyLimit: Number(d?.monthlyDailyLimit ?? 0),
          lifetimeDailyLimit: Number(d?.lifetimeDailyLimit ?? 0),
        });
      })
      .catch(() => setConfig(defaultConfig));
  }, []);

  useEffect(() => {
    let active = true;
    if (!user) {
      setSavedCookies(normalizeCookieVaultState({ requiresLogin: true, canUseCookies: false, plan: 'guest' }, activePlan));
      return () => { active = false; };
    }
    setIsCookieVaultLoading(true);
    user.getIdToken()
      .then((token) => fetch(`${API_BASE}/cookies`, { method: 'GET', headers: { Authorization: `Bearer ${token}` } }))
      .then((r) => r.json().catch(() => ({})).then((d) => ({ ok: r.ok, d })))
      .then(({ ok, d }) => { if (active) setSavedCookies(normalizeCookieVaultState(ok ? d : { plan: activePlan }, activePlan)); })
      .catch(() => { if (active) setSavedCookies(normalizeCookieVaultState({ plan: activePlan }, activePlan)); })
      .finally(() => { if (active) setIsCookieVaultLoading(false); });
    return () => { active = false; };
  }, [user, activePlan]);

  useEffect(() => {
    if (cookiesFeatureAvailable) return;
    setUseCookies(false);
    setCookiesB64(null);
    setCookiesName(null);
    setCookieLabel('');
  }, [cookiesFeatureAvailable]);

  const refreshCookieVault = async () => {
    if (!user) {
      const next = normalizeCookieVaultState({ requiresLogin: true, canUseCookies: false, plan: 'guest' }, activePlan);
      setSavedCookies(next);
      return next;
    }
    setIsCookieVaultLoading(true);
    try {
      const token = await user.getIdToken();
      const r = await fetch(`${API_BASE}/cookies`, { method: 'GET', headers: { Authorization: `Bearer ${token}` } });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.error || 'Could not load cookie vault');
      const next = normalizeCookieVaultState(d, activePlan);
      setSavedCookies(next);
      return next;
    } finally {
      setIsCookieVaultLoading(false);
    }
  };

  const addToHistory = (data: Omit<DownloadHistoryItem, 'id' | 'date'>) => {
    const next: DownloadHistoryItem = { ...data, id: Date.now().toString(), date: new Date().toLocaleDateString() };
    const updated = [next, ...history].slice(0, 10);
    setHistory(updated);
    saveDownloadHistory(updated);
    setVideoData(next);
  };

  const handleCookiesFile = async (file: File | null) => {
    if (!file) return;
    if (file.size > 1024 * 1024) return toast.error('Cookies file is too large (max 1 MB).');
    const text = await file.text();
    if (!text.trim()) return toast.error('Cookies file is empty');
    setCookiesB64(toBase64Utf8(text));
    setCookiesName(file.name);
    setCookieLabel((c) => c || file.name.replace(/\.[^.]+$/, '').slice(0, 80));
    toast.success('Temporary cookies loaded');
  };

  const saveCookiesToAccount = async () => {
    if (!user) throw new Error('Login first to save cookies');
    if (!cookiesB64) throw new Error('Upload cookies.txt first');
    if (isCookieLimitReached) throw new Error(cookieVaultMaxCount ? `Limit ${cookieVaultMaxCount} reached. Delete one or upgrade.` : 'Limit reached.');
    setIsCookieVaultBusy(true);
    try {
      const token = await user.getIdToken();
      const r = await fetch(`${API_BASE}/cookies`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ cookiesB64, label: cookieLabel.trim() || undefined }) });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.error || 'Could not store cookies');
      await refreshCookieVault();
      setCookiesB64(null);
      setCookiesName(null);
      setCookieLabel('');
    } finally {
      setIsCookieVaultBusy(false);
    }
  };

  const removeSavedCookie = async (entryId: string) => {
    if (!user) throw new Error('Login first');
    setIsCookieVaultBusy(true);
    try {
      const token = await user.getIdToken();
      const r = await fetch(`${API_BASE}/cookies?id=${encodeURIComponent(entryId)}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.error || 'Could not delete');
      await refreshCookieVault();
    } finally {
      setIsCookieVaultBusy(false);
    }
  };

  const removeExpiredCookies = async () => {
    if (!user) throw new Error('Login first');
    setIsCookieVaultBusy(true);
    try {
      const token = await user.getIdToken();
      const r = await fetch(`${API_BASE}/cookies?expiredOnly=1`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.error || 'Could not remove expired');
      await refreshCookieVault();
    } finally {
      setIsCookieVaultBusy(false);
    }
  };

  const clearCookieVault = async () => {
    if (!user) throw new Error('Login first');
    setIsCookieVaultBusy(true);
    try {
      const token = await user.getIdToken();
      const r = await fetch(`${API_BASE}/cookies`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.error || 'Could not clear vault');
      await refreshCookieVault();
    } finally {
      setIsCookieVaultBusy(false);
    }
  };

  const handleCookiesToggle = () => {
    if (useCookies) {
      setUseCookies(false);
      setCookiesB64(null);
      setCookiesName(null);
      setCookieLabel('');
      return;
    }
    if (!user) return toast.error('Login first to use saved cookies');
    setUseCookies(true);
  };

  const handleDownload = async () => {
    const nextUrl = normalizeUrl(url);
    if (!nextUrl) return toast.error('Paste a video link first');
    if (!isSupportedUrl(nextUrl)) return toast.error('Enter a valid video URL');
    if (useCookies && !cookiesFeatureAvailable) return toast.error('Login first');
    if (useCookies && !cookiesB64 && savedCookies.activeCount <= 0) return toast.error('Add cookies first');

    setIsLoading(true);
    setShowResults(false);
    const loadingToast = toast.loading('Checking the link...');

    try {
      const token = user ? await user.getIdToken() : null;
      const r = await fetch(`${API_BASE}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({
          url: nextUrl,
          type: downloadType,
          useCookies: useCookies && cookiesFeatureAvailable,
          cookiesB64: useCookies && cookiesB64 ? cookiesB64 : undefined,
        }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.error || 'The link could not be processed.');

      setUrl(nextUrl);
      setQuotaSnapshot(d.quota || null);
      addToHistory({
        thumbnail: d.thumbnail || '',
        title: d.title || 'Untitled download',
        downloadUrl: d.downloadUrl,
        ext: d.ext || (downloadType === 'audio' ? 'mp3' : 'mp4'),
        type: downloadType,
        uploader: d.uploader,
        duration: d.duration,
        view_count: d.view_count,
        quota: d.quota || null,
        platform: d.platform || '',
        cookieMatch: d.cookieMatch || null,
      });
      setShowResults(true);

      const msg = typeof d?.quota?.remaining === 'number'
        ? `Ready! ${d.quota.remaining} left today.`
        : d?.cookieMatch?.label
          ? `Ready! Matched ${d.cookieMatch.label}.`
          : 'Ready to download!';
      toast.success(msg);

      if (useCookies && cookiesFeatureAvailable) await refreshCookieVault().catch(() => undefined);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Unexpected error');
    } finally {
      toast.dismiss(loadingToast);
      setIsLoading(false);
    }
  };

  const handleFinalDownload = (downloadUrl: string, title: string, ext: string) => {
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `${sanitizeFilename(title)}.${ext || 'mp4'}`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    toast.success('Download started');
  };

  return (
    <>
      <Helmet>
        <title>SwiftDL | Multi-Platform Video Downloader</title>
        <meta name="description" content="Download video and audio from many major platforms with a cleaner browser workflow and a saved cookie vault for authorized links." />
        <link rel="canonical" href={siteUrl('/')} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={siteConfig.name} />
        <meta property="og:url" content={siteUrl('/')} />
        <meta property="og:title" content="SwiftDL | Multi-Platform Video Downloader" />
        <meta property="og:description" content="Broad platform coverage, browser-first downloads, and smart cookie matching." />
        <meta property="og:image" content={siteUrl('/logo.png')} />
      </Helmet>

      <main className="pb-6 pt-8 md:pb-10 md:pt-10">
        <div className="section-shell">
          {/* Hero Section */}
          <section className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr]">
            <div className="space-y-6">
              <span className="section-eyebrow">Browser-first downloader</span>
              <div className="space-y-4">
                <h1 className="text-balance text-4xl font-black md:text-6xl" style={{ color: 'var(--ink-900)' }}>
                  Download videos from{' '}
                  <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'var(--gradient-brand)' }}>
                    many major platforms
                  </span>
                </h1>
                <p className="max-w-2xl text-base leading-8 md:text-lg" style={{ color: 'var(--ink-600)' }}>
                  SwiftDL handles yt-dlp-compatible links for public downloads, creator archives, and offline reference.
                  Logged-in users get a cookie vault for restricted links.
                </p>
              </div>

              {/* Platform pills */}
              <div className="flex flex-wrap gap-2 stagger-children">
                {platformHighlights.map((hl) => (
                  <span key={hl} className="pill-soft gap-2 border px-3.5 py-2 text-xs shadow-sm" style={{ borderColor: 'var(--border-soft)', background: 'var(--surface)' }}>
                    <CheckCircle2 className="h-3.5 w-3.5" style={{ color: 'var(--brand-600)' }} />
                    {hl}
                  </span>
                ))}
              </div>

              {/* Feature cards */}
              <div className="grid gap-4 md:grid-cols-3 stagger-children">
                {valueCards.map(({ title, description, icon: Icon }) => (
                  <article key={title} className="feature-card">
                    <div className="mb-4 inline-flex rounded-2xl p-3" style={{ background: 'var(--surface-soft)', color: 'var(--brand-600)' }}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <h2 className="text-lg font-bold" style={{ color: 'var(--ink-900)' }}>{title}</h2>
                    <p className="mt-2 text-sm leading-6" style={{ color: 'var(--ink-600)' }}>{description}</p>
                  </article>
                ))}
              </div>
            </div>

            {/* Quota Card */}
            <QuotaCard
              activePlan={activePlan}
              effectiveQuota={effectiveQuota}
              effectiveLimit={effectiveLimit}
              cookiesFeatureAvailable={cookiesFeatureAvailable}
              isPremiumUser={isPremiumUser}
              cookieVaultMaxCount={cookieVaultMaxCount}
              config={config}
            />
          </section>

          {/* Downloader Section */}
          <section className="glass-panel mt-10 rounded-[var(--radius-2xl)] p-5 md:p-7">
            <div className="grid gap-6 xl:grid-cols-[1.14fr_0.86fr]">
              <div>
                <DownloaderPanel
                  url={url}
                  setUrl={setUrl}
                  downloadType={downloadType}
                  setDownloadType={setDownloadType}
                  useCookies={useCookies}
                  onCookiesToggle={handleCookiesToggle}
                  cookiesFeatureAvailable={cookiesFeatureAvailable}
                  isLoading={isLoading}
                  onDownload={handleDownload}
                />
                {showResults && <ResultCard videoData={videoData} />}
              </div>

              {/* Cookie Vault Sidebar */}
              <aside className="space-y-5">
                <article className="card">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: 'var(--brand-700)' }}>Cookies Mode</p>
                      <h3 className="mt-2 text-lg font-black" style={{ color: 'var(--ink-900)' }}>Saved cookie vault</h3>
                    </div>
                    <button
                      type="button"
                      onClick={handleCookiesToggle}
                      className="rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] transition-all duration-200"
                      style={useCookies
                        ? { background: 'var(--brand-600)', color: '#fff' }
                        : { background: 'var(--surface-soft)', color: 'var(--brand-700)' }
                      }
                    >
                      {useCookies ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>
                  <p className="mt-3 text-sm leading-6" style={{ color: 'var(--ink-600)' }}>
                    Logged-in users can save cookies for restricted links. Standard accounts get 2 slots, premium plans get more.
                  </p>

                  {!user && (
                    <div className="mt-5 card-inner">
                      <div className="rounded-2xl p-4" style={{ background: 'var(--surface)' }}>
                        <p className="text-sm font-semibold" style={{ color: 'var(--ink-900)' }}>Login required</p>
                        <p className="mt-2 text-sm leading-6" style={{ color: 'var(--ink-600)' }}>
                          Login to save cookies for restricted links.
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <Link to="/pricing" className="btn-outline text-xs">View premium</Link>
                        </div>
                      </div>
                    </div>
                  )}

                  {user && cookiesFeatureAvailable && (
                    <div className="mt-5 space-y-4 card-inner">
                      {/* Vault status */}
                      <div className="rounded-2xl p-4" style={{ background: 'var(--surface)' }}>
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold" style={{ color: 'var(--ink-900)' }}>
                              {cookiesB64 ? 'Temporary session ready' : savedCookies.activeCount > 0 ? `${savedCookies.activeCount} cookie${savedCookies.activeCount === 1 ? '' : 's'} ready` : 'No cookies saved'}
                            </p>
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              <span className="pill-soft">Total {savedCookies.totalCount}</span>
                              <span className="pill-soft">Active {savedCookies.activeCount}</span>
                              <span className="pill-soft">Expired {savedCookies.expiredCount}</span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => refreshCookieVault().then(() => toast.success('Refreshed')).catch((e) => toast.error(e instanceof Error ? e.message : 'Error'))}
                            disabled={isCookieVaultLoading || isCookieVaultBusy}
                            className="btn-outline px-3 py-2 text-xs disabled:opacity-70"
                          >
                            <RefreshCw className={`h-3.5 w-3.5 ${isCookieVaultLoading ? 'animate-spin' : ''}`} />
                            Refresh
                          </button>
                        </div>
                      </div>

                      {/* Upload cookies */}
                      <div className="rounded-2xl p-4" style={{ background: 'var(--surface)' }}>
                        <p className="text-sm font-semibold" style={{ color: 'var(--ink-900)' }}>Add cookies.txt</p>
                        <input
                          type="text"
                          value={cookieLabel}
                          onChange={(e) => setCookieLabel(e.target.value.slice(0, 80))}
                          placeholder="Optional label"
                          className="input-field mt-3"
                        />
                        <div className="mt-3 flex flex-wrap gap-2">
                          <label className="btn-dark cursor-pointer text-xs">
                            <Cookie className="h-3.5 w-3.5" /> Upload
                            <input type="file" accept=".txt" className="hidden" onChange={(e) => handleCookiesFile(e.target.files?.[0] || null)} />
                          </label>
                          {cookiesB64 && (
                            <button type="button" onClick={() => { setCookiesB64(null); setCookiesName(null); setCookieLabel(''); toast.success('Cleared'); }} className="btn-outline text-xs">
                              Clear
                            </button>
                          )}
                          {cookiesB64 && (
                            <button
                              type="button"
                              onClick={() => saveCookiesToAccount().then(() => toast.success('Saved!')).catch((e) => toast.error(e instanceof Error ? e.message : 'Error'))}
                              disabled={isCookieVaultBusy || isCookieLimitReached}
                              className="btn-brand text-xs py-2 disabled:opacity-70"
                            >
                              Save to vault
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Vault actions */}
                      <div className="flex flex-wrap gap-2">
                        {savedCookies.expiredCount > 0 && (
                          <button type="button" onClick={() => removeExpiredCookies().then(() => toast.success('Removed')).catch((e) => toast.error(e instanceof Error ? e.message : 'Error'))} disabled={isCookieVaultBusy} className="btn-outline text-xs disabled:opacity-70">
                            Delete expired
                          </button>
                        )}
                        {savedCookies.totalCount > 0 && (
                          <button type="button" onClick={() => clearCookieVault().then(() => toast.success('Cleared')).catch((e) => toast.error(e instanceof Error ? e.message : 'Error'))} disabled={isCookieVaultBusy} className="btn-outline text-xs disabled:opacity-70">
                            Delete all
                          </button>
                        )}
                      </div>

                      {/* Cookie list */}
                      <div className="space-y-3">
                        {isCookieVaultLoading ? (
                          <div className="space-y-3">
                            <div className="animate-pulse rounded-2xl h-24 bg-[var(--surface)] border" style={{ borderColor: 'var(--border-soft)' }}></div>
                            <div className="animate-pulse rounded-2xl h-24 bg-[var(--surface)] border" style={{ borderColor: 'var(--border-soft)' }}></div>
                          </div>
                        ) : savedCookies.items.length > 0 ? (
                          savedCookies.items.map((item) => (
                            <article key={item.id} className="rounded-2xl border p-4 transition-colors" style={{ borderColor: 'var(--border-soft)', background: item.expired ? 'var(--surface-soft)' : 'var(--surface)' }}>
                              <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                  <div className="flex flex-wrap items-center gap-2">
                                    <p className="text-sm font-semibold" style={{ color: 'var(--ink-900)' }}>{item.label}</p>
                                    <span className="pill-soft">{formatPlatformLabel(item.platform)}</span>
                                    <span className={`pill-soft ${item.expired ? '' : ''}`} style={item.expired ? { background: 'var(--surface-soft)', color: 'var(--ink-500)' } : { background: 'var(--brand-100)', color: 'var(--brand-700)' }}>
                                      {item.expired ? 'Expired' : 'Active'}
                                    </span>
                                  </div>
                                  <p className="mt-1 text-xs leading-5" style={{ color: 'var(--ink-500)' }}>{domainSummary(item.domains)}</p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeSavedCookie(item.id).then(() => toast.success('Removed')).catch((e) => toast.error(e instanceof Error ? e.message : 'Error'))}
                                  disabled={isCookieVaultBusy}
                                  className="rounded-full border p-2 transition hover:text-[var(--brand-700)] disabled:opacity-70"
                                  style={{ borderColor: 'var(--border-soft)', color: 'var(--ink-600)' }}
                                  aria-label={`Delete ${item.label}`}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                              <div className="mt-3 grid gap-1 text-xs leading-5 sm:grid-cols-2" style={{ color: 'var(--ink-500)' }}>
                                <p>Created: {formatEpoch(item.createdAtEpoch)}</p>
                                <p>Updated: {formatEpoch(item.updatedAtEpoch)}</p>
                                <p>{item.expiresAtEpoch ? `Expires: ${formatEpoch(item.expiresAtEpoch)}` : 'Expires: Unknown'}</p>
                                <p>{item.lastUsedAtEpoch ? `Last used: ${formatEpoch(item.lastUsedAtEpoch)}` : 'Last used: Never'}</p>
                              </div>
                            </article>
                          ))
                        ) : (
                          <div className="rounded-2xl p-4 text-sm leading-6" style={{ background: 'var(--surface)', color: 'var(--ink-600)' }}>
                            No saved cookies yet. Upload a <code>cookies.txt</code> file to start.
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </article>

                {/* Use cases */}
                <article className="card">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: 'var(--brand-700)' }}>Use cases</p>
                  <div className="mt-4 space-y-3 text-sm leading-6" style={{ color: 'var(--ink-600)' }}>
                    {useCaseCards.map(({ title, description, icon: Icon }) => (
                      <div key={title} className="card-inner">
                        <div className="flex items-center gap-2" style={{ color: 'var(--ink-900)' }}>
                          <Icon className="h-4 w-4" style={{ color: 'var(--brand-600)' }} />
                          <strong>{title}:</strong>
                        </div>
                        <p className="mt-2">{description}</p>
                      </div>
                    ))}
                  </div>
                </article>
              </aside>
            </div>
          </section>

          {/* Download History */}
          {history.length > 0 && (
            <section className="mt-10">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="section-eyebrow">Browser history</span>
                  <h2 className="mt-3 text-3xl font-black" style={{ color: 'var(--ink-900)' }}>Recent downloads</h2>
                </div>
                <button
                  type="button"
                  onClick={() => { setHistory([]); localStorage.removeItem('downloadHistory'); toast.success('History cleared'); }}
                  className="btn-outline"
                >
                  <Trash2 className="h-4 w-4" />
                  Clear history
                </button>
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3 stagger-children">
                {history.map((item) => (
                  <article key={item.id} className="feature-card overflow-hidden p-0">
                    {item.thumbnail ? (
                      <img src={item.thumbnail} alt={item.title} className="h-40 w-full object-cover" />
                    ) : (
                      <div className="flex h-40 items-center justify-center" style={{ background: 'var(--surface-soft)', color: 'var(--brand-700)' }}>
                        <Video className="h-7 w-7" />
                      </div>
                    )}
                    <div className="space-y-4 p-5">
                      <div>
                        <div className="flex flex-wrap gap-2">
                          <span className="pill-soft">{item.ext.toUpperCase()}</span>
                          {item.platform && <span className="pill-soft">{formatPlatformLabel(item.platform)}</span>}
                        </div>
                        <h3 className="mt-2 line-clamp-2 text-lg font-black" style={{ color: 'var(--ink-900)' }}>{item.title}</h3>
                        <p className="mt-2 text-xs" style={{ color: 'var(--ink-500)' }}>Saved on {item.date}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleFinalDownload(item.downloadUrl, item.title, item.ext)}
                        className="btn-dark w-full"
                      >
                        <Download className="h-4 w-4" />
                        Download again
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      <div className="border-t border-[var(--border-soft)] bg-white dark:bg-[#0f111a] transition-colors duration-300">
        <HomeSeoContent />
      </div>
    </>
  );
}
