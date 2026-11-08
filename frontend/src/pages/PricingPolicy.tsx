import { useCallback, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { CheckCircle2, CreditCard, ShieldCheck, Sparkles, Star, BadgeCheck, Receipt, Wallet, Lock, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useEntitlement } from '../context/EntitlementContext';
import LoadingIndicator from '../components/LoadingIndicator';
import { siteConfig, siteUrl } from '../lib/site';
import { API_BASE } from '../lib/api';

interface Config {
  paymentConfigured: boolean | null;
  authConfigured: boolean | null;
  firestoreConfigured: boolean | null;
  paymentKeyId: string | null;
  monthlyDisplay: string;
  lifetimeDisplay: string;
  guestDailyLimit: number;
  userDailyLimit: number;
  monthlyDailyLimit: number;
  lifetimeDailyLimit: number;
}

const def: Config = {
  paymentConfigured: null,
  authConfigured: null,
  firestoreConfigured: null,
  paymentKeyId: null,
  monthlyDisplay: 'Rs199',
  lifetimeDisplay: 'Rs999',
  guestDailyLimit: 1,
  userDailyLimit: 3,
  monthlyDailyLimit: 0,
  lifetimeDailyLimit: 0,
};

function formatDate(value?: string | null) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(date);
}

export default function PricingPolicy() {
  const { user } = useAuth();
  const { entitlement, refresh } = useEntitlement();
  const navigate = useNavigate();
  const [ml, setMl] = useState(false);
  const [ll, setLl] = useState(false);
  const [cfg, setCfg] = useState<Config>(def);

  useEffect(() => {
    let active = true;
    fetch(`${API_BASE}/config`).then(r => r.json().catch(() => ({})).then(d => ({ ok: r.ok, data: d }))).then(({ ok, data }) => {
      if (!active || !ok) return;
      setCfg({
        paymentConfigured: Boolean(data?.razorpayConfigured),
        authConfigured: Boolean(data?.authConfigured),
        firestoreConfigured: Boolean(data?.firestoreConfigured),
        paymentKeyId: data?.razorpayKeyId || null,
        monthlyDisplay: String(data?.monthlyDisplay || 'Rs199'),
        lifetimeDisplay: String(data?.lifetimeDisplay || 'Rs999'),
        guestDailyLimit: Number(data?.guestDailyLimit ?? 1),
        userDailyLimit: Number(data?.userDailyLimit ?? 3),
        monthlyDailyLimit: Number(data?.monthlyDailyLimit ?? 0),
        lifetimeDailyLimit: Number(data?.lifetimeDailyLimit ?? 0),
      });
    }).catch(() => { if (active) setCfg(def); });
    return () => { active = false; };
  }, []);

  const loadRzp = useCallback(() => new Promise<boolean>(resolve => {
    if ((window as any).Razorpay) { resolve(true); return; }
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.async = true;
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  }), []);

  const buy = useCallback(async (plan: 'monthly' | 'lifetime') => {
    if (cfg.paymentConfigured === false) return toast.error('Payments not configured');
    if (cfg.authConfigured === false) return toast.error('Auth not configured');
    if (cfg.firestoreConfigured === false) return toast.error('Billing DB not configured');
    if (!user) return toast.error('Login first');

    const set = plan === 'monthly' ? setMl : setLl;
    set(true);
    try {
      const token = await user.getIdToken(true);
      const endpoint = plan === 'monthly' ? 'create-subscription' : 'create-order';
      const r = await fetch(`${API_BASE}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ plan }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.error || 'Could not start payment');

      const loaded = await loadRzp();
      if (!loaded || !(window as any).Razorpay) throw new Error('Payment checkout failed to load');

      const opts: Record<string, any> = plan === 'monthly'
        ? { key: d.keyId || cfg.paymentKeyId, subscription_id: d.subscriptionId }
        : { key: d.keyId || cfg.paymentKeyId, amount: d.amount, currency: d.currency, order_id: d.orderId };
      if (!opts.key) throw new Error('Payment key missing');

      Object.assign(opts, {
        name: siteConfig.name,
        description: plan === 'monthly' ? 'Monthly premium access' : 'Lifetime premium access',
        prefill: { email: user.email || '' },
        theme: { color: '#c026d3' },
        modal: { ondismiss: () => set(false) },
        handler: async (pr: any) => {
          try {
            const freshToken = await user.getIdToken(true);
            const v = await fetch(`${API_BASE}/verify-payment`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${freshToken}` },
              body: JSON.stringify({
                type: plan === 'monthly' ? 'subscription' : 'order',
                payment_id: pr.razorpay_payment_id,
                subscription_id: pr.razorpay_subscription_id,
                order_id: pr.razorpay_order_id,
                signature: pr.razorpay_signature,
              }),
            });
            const vd = await v.json().catch(() => ({}));
            if (!v.ok) throw new Error(vd.error || 'Verification failed');
            await refresh();
            const suffix = plan === 'monthly' && vd.expiresAt ? ` until ${formatDate(vd.expiresAt)}` : '';
            toast.success(`${plan === 'monthly' ? 'Monthly' : 'Lifetime'} plan activated${suffix}`);
            navigate('/dashboard');
          } catch (e) {
            toast.error(e instanceof Error ? e.message : 'Payment verification failed');
          } finally {
            set(false);
          }
        },
      });

      new (window as any).Razorpay(opts).open();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Payment failed');
      set(false);
    }
  }, [cfg, loadRzp, navigate, refresh, user]);

  const plans = [
    {
      icon: Sparkles,
      title: 'Free',
      s: 'Best for casual downloads',
      price: '$0',
      cadence: 'forever',
      badge: null as string | null,
      features: [`Guest: ${cfg.guestDailyLimit}/day`, `Logged-in: ${cfg.userDailyLimit}/day`, 'Video or audio', 'Browser-based — no installs'],
      note: 'Included in every account',
    },
    {
      icon: CreditCard,
      title: 'Monthly',
      s: 'Premium plan, billed monthly',
      price: cfg.monthlyDisplay,
      cadence: 'per month',
      badge: 'Most popular',
      features: [`Limit: ${cfg.monthlyDailyLimit <= 0 ? 'Unlimited' : cfg.monthlyDailyLimit + '/day'}`, 'No ads for active plan', 'Expiry visible in dashboard', 'Cancel anytime'],
      highlight: true,
      action: () => buy('monthly'),
      load: ml,
    },
    {
      icon: ShieldCheck,
      title: 'Lifetime',
      s: 'One-time payment, yours forever',
      price: cfg.lifetimeDisplay,
      cadence: 'one-time',
      badge: 'Best value',
      features: [`Limit: ${cfg.lifetimeDailyLimit <= 0 ? 'Unlimited' : cfg.lifetimeDailyLimit + '/day'}`, 'No recurring charge — ever', 'Purchase date visible in dashboard', 'All future premium perks included'],
      action: () => buy('lifetime'),
      load: ll,
    },
  ];

  return (
    <div className="shell max-w-6xl py-8 sm:py-12 lg:py-16">
      <Helmet><title>Pricing | {siteConfig.name}</title><meta name="description" content="ShareHub pricing plans with free, monthly, and lifetime premium access." /><link rel="canonical" href={siteUrl('/pricing')} /></Helmet>

      {/* Header */}
      <div className="mx-auto max-w-2xl text-center">
        <span className="tag"><BadgeCheck size={12} /> Pricing</span>
        <h1 className="section-heading text-balance text-3xl sm:text-4xl lg:text-5xl" style={{ color: 'var(--ink-900)' }}>Simple, <span className="gradient-text">transparent</span> pricing</h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed sm:text-base" style={{ color: 'var(--ink-600)' }}>Free tier for basic use. Premium unlocks higher fair-use limits and an ad-free account experience.</p>

        {/* Social proof strip */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11px] font-semibold" style={{ color: 'var(--ink-500)' }}>
          <span className="flex items-center gap-1.5">
            <span className="flex items-center">
              {[0, 1, 2, 3, 4].map(i => <Star key={i} size={12} fill="currentColor" style={{ color: 'var(--warning-500)' }} />)}
            </span>
            4.9/5 · 12,000+ downloads
          </span>
          <span className="hidden h-3 w-px sm:block" style={{ background: 'var(--border-med)' }} />
          <span className="flex items-center gap-1.5"><Lock size={12} /> Secured by Razorpay</span>
        </div>

        {user && entitlement.plan !== 'guest' && (
          <div className="mt-6 inline-flex max-w-full flex-wrap items-center justify-center gap-x-3 gap-y-1.5 rounded-2xl border px-4 py-2.5 text-xs font-semibold sm:px-5" style={{ borderColor: 'var(--border-med)', background: 'var(--grad-brand-soft)', color: 'var(--ink-700)' }}>
            <span className="mono uppercase" style={{ color: 'var(--brand-700)', letterSpacing: '0.12em', fontSize: '9px' }}>Current plan</span>
            <span style={{ color: 'var(--ink-900)' }}>{entitlement.plan === 'monthly' ? 'Monthly Premium' : entitlement.plan === 'lifetime' ? 'Lifetime Premium' : 'Free Account'}</span>
            {entitlement.expiresAt && <span className="pill">Expires: {formatDate(entitlement.expiresAt)}</span>}
          </div>
        )}
      </div>

      {/* Plan cards */}
      <div className="mt-10 grid grid-cols-1 items-stretch gap-5 sm:mt-14 md:grid-cols-3 lg:gap-6">
        {plans.map(p => (
          <div
            key={p.title}
            className={`card card-hover relative flex flex-col !p-6 sm:!p-7 ${p.highlight ? 'z-10' : ''}`}
            style={p.highlight
              ? { border: '2px solid transparent', background: 'linear-gradient(var(--surface), var(--surface)) padding-box, var(--grad-brand) border-box', boxShadow: 'var(--glow-brand)' }
              : { boxShadow: 'var(--shadow-md)' }}
          >
            {p.badge && (
              <div
                className="absolute -top-3.5 left-1/2 flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-1.5 text-[10px] font-extrabold uppercase text-white"
                style={{ background: 'var(--grad-brand)', boxShadow: 'var(--glow-violet)', letterSpacing: '0.12em', fontFamily: "'JetBrains Mono', ui-monospace, monospace" }}
              >
                <Sparkles size={11} /> {p.badge}
              </div>
            )}

            <div className="flex items-center gap-3">
              <div className="icon-tile"><p.icon size={22} /></div>
              <div className="min-w-0">
                <h2 className="font-['Sora',sans-serif] text-lg font-bold leading-tight" style={{ color: 'var(--ink-900)' }}>{p.title}</h2>
                <p className="mt-0.5 text-[11px] leading-snug" style={{ color: 'var(--ink-500)' }}>{p.s}</p>
              </div>
            </div>

            <div className="mt-5 flex items-end gap-2 border-b pb-5" style={{ borderColor: 'var(--border)' }}>
              <span className="font-['Sora',sans-serif] text-4xl font-extrabold leading-none sm:text-5xl" style={{ color: 'var(--ink-900)' }}>{p.price}</span>
              <span className="mono pb-1 text-[9px] font-semibold uppercase" style={{ letterSpacing: '0.14em', color: 'var(--ink-500)' }}>{p.cadence}</span>
            </div>

            <ul className="mt-5 flex-1 space-y-3">
              {p.features.map(f => (
                <li key={f} className="flex items-start gap-2.5 text-[13px] font-medium leading-snug" style={{ color: 'var(--ink-700)' }}>
                  <CheckCircle2 size={16} className="mt-0.5 shrink-0" style={{ color: 'var(--brand-600)' }} />{f}
                </li>
              ))}
            </ul>

            {p.action ? (
              <button
                onClick={p.action}
                disabled={p.load || cfg.paymentConfigured === false}
                className={`mt-6 min-h-12 w-full text-sm font-bold ${p.highlight ? 'btn-primary' : 'btn-dark'}`}
              >
                {p.load ? <LoadingIndicator label="Processing..." compact tone="light" /> : <>Buy {p.title.toLowerCase()} <ArrowRight size={16} /></>}
              </button>
            ) : (
              <p className="mono mt-6 flex min-h-12 w-full items-center justify-center rounded-xl border border-dashed text-[10px] font-semibold uppercase" style={{ borderColor: 'var(--border-med)', color: 'var(--ink-500)', letterSpacing: '0.14em' }}>
                {p.note}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Billing notes */}
      <div className="bento mt-8 !p-5 sm:mt-10 sm:!p-7">
        <div className="flex items-center gap-3">
          <div className="icon-tile"><Receipt size={20} /></div>
          <h3 className="font-['Sora',sans-serif] text-base font-bold" style={{ color: 'var(--ink-900)' }}>Billing notes</h3>
        </div>
        <ul className="mt-4 grid gap-3 sm:grid-cols-3 sm:gap-5">
          {[
            { icon: Lock, text: 'Payments are handled securely by Razorpay. We never see your card details.' },
            { icon: Wallet, text: 'Monthly access stores purchase and expiry dates on your account.' },
            { icon: ShieldCheck, text: 'Failed media requests do not consume your daily limit, and premium plans include fair-use caps.' },
          ].map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-start gap-2.5 rounded-2xl border p-3.5 text-xs leading-5" style={{ borderColor: 'var(--border)', background: 'var(--surface-soft)', color: 'var(--ink-600)' }}>
              <Icon size={15} className="mt-0.5 shrink-0" style={{ color: 'var(--brand-600)' }} />{text}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:gap-3">
        <Link to="/refund-policy" className="btn-dark flex-1 justify-center text-xs sm:flex-none">Refund policy</Link>
        <Link to="/contact-us" className="btn-outline flex-1 justify-center text-xs sm:flex-none">Contact support</Link>
      </div>
    </div>
  );
}
