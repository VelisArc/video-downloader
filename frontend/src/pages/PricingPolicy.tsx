import { useCallback, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { CheckCircle2, CreditCard, ShieldCheck, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import LoadingIndicator from '../components/LoadingIndicator';
import { siteConfig, siteUrl } from '../lib/site';
import { API_BASE } from '../lib/api';

interface Config { paymentConfigured: boolean | null; authConfigured: boolean | null; firestoreConfigured: boolean | null; paymentKeyId: string | null; monthlyDisplay: string; lifetimeDisplay: string; guestDailyLimit: number; userDailyLimit: number; monthlyDailyLimit: number; lifetimeDailyLimit: number; }

const def: Config = { paymentConfigured: null, authConfigured: null, firestoreConfigured: null, paymentKeyId: null, monthlyDisplay: 'Rs199', lifetimeDisplay: 'Rs999', guestDailyLimit: 1, userDailyLimit: 3, monthlyDailyLimit: 0, lifetimeDailyLimit: 0 };

export default function PricingPolicy() {
  const { user } = useAuth();
  const [ml, setMl] = useState(false);
  const [ll, setLl] = useState(false);
  const [cfg, setCfg] = useState<Config>(def);

  useEffect(() => {
    let active = true;
    fetch(`${API_BASE}/config`).then(r => r.json().catch(() => ({})).then(d => ({ ok: r.ok, data: d }))).then(({ ok, data }) => {
      if (!active || !ok) return;
      setCfg({ paymentConfigured: Boolean(data?.razorpayConfigured), authConfigured: Boolean(data?.authConfigured), firestoreConfigured: Boolean(data?.firestoreConfigured), paymentKeyId: data?.razorpayKeyId || null, monthlyDisplay: String(data?.monthlyDisplay || 'Rs199'), lifetimeDisplay: String(data?.lifetimeDisplay || 'Rs999'), guestDailyLimit: Number(data?.guestDailyLimit ?? 1), userDailyLimit: Number(data?.userDailyLimit ?? 3), monthlyDailyLimit: Number(data?.monthlyDailyLimit ?? 0), lifetimeDailyLimit: Number(data?.lifetimeDailyLimit ?? 0) });
    }).catch(() => { if (active) setCfg(def); });
    return () => { active = false; };
  }, []);

  const loadRzp = useCallback(() => new Promise<boolean>(resolve => {
    if ((window as any).Razorpay) { resolve(true); return; }
    const s = document.createElement('script'); s.src = 'https://checkout.razorpay.com/v1/checkout.js'; s.onload = () => resolve(true); s.onerror = () => resolve(false); document.body.appendChild(s);
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
      const r = await fetch(`${API_BASE}/${endpoint}`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ plan }) });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.error || 'Failed');

      await loadRzp();
      const opts: Record<string, any> = plan === 'monthly'
        ? { key: d.keyId || cfg.paymentKeyId, subscription_id: d.subscriptionId }
        : { key: d.keyId || cfg.paymentKeyId, amount: d.amount, currency: d.currency, order_id: d.orderId };
      Object.assign(opts, { name: siteConfig.name, description: plan === 'monthly' ? 'Monthly ad-free' : 'Lifetime ad-free', prefill: { email: user.email || '' }, theme: { color: '#2563eb' },
        handler: async (pr: any) => {
          const v = await fetch(`${API_BASE}/verify-payment`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ type: plan === 'monthly' ? 'subscription' : 'order', payment_id: pr.razorpay_payment_id, subscription_id: pr.razorpay_subscription_id, order_id: pr.razorpay_order_id, signature: pr.razorpay_signature }) });
          const vd = await v.json().catch(() => ({}));
          if (!v.ok) throw new Error(vd.error || 'Verification failed');
          toast.success(plan === 'monthly' ? 'Monthly plan activated' : 'Lifetime plan activated');
          window.location.reload();
        }
      });
      new (window as any).Razorpay(opts).open();
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Payment failed'); }
    finally { set(false); }
  }, [cfg, loadRzp, user]);

  const plans = [
    { icon: Sparkles, title: 'Free', s: 'Best for casual', price: '$0', features: [`Guest: ${cfg.guestDailyLimit}/day`, `Logged-in: ${cfg.userDailyLimit}/day`, 'Video or audio', 'Browser-based'] },
    { icon: CreditCard, title: 'Monthly', s: 'Ad-free plan', price: cfg.monthlyDisplay, features: [`Limit: ${cfg.monthlyDailyLimit <= 0 ? 'Unlimited' : cfg.monthlyDailyLimit + '/day'}`, 'No ads', 'Login required'], highlight: true, action: () => buy('monthly'), load: ml },
    { icon: ShieldCheck, title: 'Lifetime', s: 'One-time payment', price: cfg.lifetimeDisplay, features: [`Limit: ${cfg.lifetimeDailyLimit <= 0 ? 'Unlimited' : cfg.lifetimeDailyLimit + '/day'}`, 'No recurring charge', 'Login required'], action: () => buy('lifetime'), load: ll },
  ];

  return (
    <div className="shell" style={{ maxWidth: 1080, padding: '3rem 1rem 4rem' }}>
      <Helmet><title>Pricing | {siteConfig.name}</title><meta name="description" content="SwiftDL pricing plans." /><link rel="canonical" href={siteUrl('/pricing')} /></Helmet>

      <div className="text-center max-w-lg mx-auto mb-10">
        <span className="tag">Pricing</span>
        <h1 className="text-3xl font-bold mt-3" style={{ color: 'var(--ink-900)' }}>Simple, transparent pricing</h1>
        <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--ink-600)' }}>Free tier for basic use. Paid plans for higher limits and an ad-free experience.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
        {plans.map(p => (
          <div key={p.title} className="card text-center relative" style={{ padding: '1.75rem 1.5rem', border: p.highlight ? '2px solid var(--brand-600)' : '1px solid var(--border)', boxShadow: p.highlight ? 'var(--shadow-md)' : 'var(--shadow-xs)' }}>
            {p.highlight && <div className="absolute -top-[1px] left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-wider text-white px-3 py-1 rounded-b-md" style={{ background: 'var(--brand-600)' }}>Most Popular</div>}
            <div className="w-11 h-11 rounded-lg flex items-center justify-center mx-auto" style={{ background: 'var(--brand-50)', color: 'var(--brand-600)' }}><p.icon size={20} /></div>
            <h2 className="mt-4 text-lg font-bold" style={{ color: 'var(--ink-900)' }}>{p.title}</h2>
            <p className="text-xs mt-1" style={{ color: 'var(--ink-500)' }}>{p.s}</p>
            <div className="mt-4 text-3xl font-bold" style={{ color: 'var(--ink-900)' }}>{p.price}</div>
            <ul className="mt-5 space-y-2 text-left">
              {p.features.map(f => <li key={f} className="flex items-start gap-2 text-xs" style={{ color: 'var(--ink-600)' }}><CheckCircle2 size={14} className="mt-0.5 shrink-0" style={{ color: 'var(--brand-500)' }} />{f}</li>)}
            </ul>
            {p.action && (
              <button onClick={p.action} disabled={p.load || cfg.paymentConfigured === false} className={`w-full mt-6 py-2.5 text-sm font-semibold rounded-lg ${p.highlight ? 'btn-primary' : 'btn-dark'}`}>
                {p.load ? <LoadingIndicator label="" compact tone="light" /> : `Buy ${p.title.toLowerCase()}`}
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-xl p-5" style={{ background: 'var(--surface-soft)', border: '1px solid var(--border)' }}>
        <h3 className="text-sm font-bold" style={{ color: 'var(--ink-900)' }}>Billing notes</h3>
        <ul className="mt-3 space-y-2">
          {['Payments handled by Razorpay.', 'Paid plans are optional add-ons.', 'Without billing config, site stays on free workflow.'].map(n => <li key={n} className="flex items-start gap-2 text-xs" style={{ color: 'var(--ink-600)' }}><span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ background: 'var(--ink-400)' }} />{n}</li>)}
        </ul>
      </div>

      <div className="mt-6 flex gap-3">
        <Link to="/refund-policy" className="btn-dark text-xs">Refund policy</Link>
        <Link to="/contact-us" className="btn-outline text-xs">Contact support</Link>
      </div>
    </div>
  );
}