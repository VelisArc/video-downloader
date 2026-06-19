import { useCallback, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { CheckCircle2, CreditCard, ShieldCheck, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import LoadingIndicator from '../components/LoadingIndicator';
import { siteConfig, siteUrl } from '../lib/site';
import { API_BASE } from '../lib/api';

interface ConfigState {
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

const defaultConfig: ConfigState = {
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

export default function PricingPolicy() {
  const { user } = useAuth();
  const [isMonthlyLoading, setIsMonthlyLoading] = useState(false);
  const [isLifetimeLoading, setIsLifetimeLoading] = useState(false);
  const [config, setConfig] = useState<ConfigState>(defaultConfig);

  useEffect(() => {
    let active = true;
    fetch(`${API_BASE}/config`)
      .then((response) => response.json().catch(() => ({})).then((data) => ({ ok: response.ok, data })))
      .then(({ ok, data }) => {
        if (!active || !ok) return;
        setConfig({
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
      })
      .catch(() => {
        if (active) setConfig(defaultConfig);
      });
    return () => { active = false; };
  }, []);

  const loadRazorpay = useCallback(() => {
    return new Promise<boolean>((resolve) => {
      if ((window as Window & { Razorpay?: unknown }).Razorpay) { resolve(true); return; }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }, []);

  const buyMonthly = useCallback(async () => {
    if (config.paymentConfigured === false) return toast.error('Payments are not configured on this deployment');
    if (config.authConfigured === false) return toast.error('Server-side login verification is not configured');
    if (config.firestoreConfigured === false) return toast.error('Billing database is not configured');
    if (!user) return toast.error('Login first to purchase a plan');

    setIsMonthlyLoading(true);
    try {
      const token = await user.getIdToken(true);
      const response = await fetch(`${API_BASE}/create-subscription`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ plan: 'monthly' }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Could not create subscription');

      const loaded = await loadRazorpay();
      if (!loaded) throw new Error('Razorpay checkout failed to load');

      new (window as any).Razorpay({
        key: data.keyId || config.paymentKeyId,
        subscription_id: data.subscriptionId,
        name: siteConfig.name,
        description: 'Monthly ad-free access',
        prefill: { email: user.email || undefined },
        theme: { color: '#2563eb' },
        handler: async (paymentResponse: any) => {
          const verify = await fetch(`${API_BASE}/verify-payment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ type: 'subscription', payment_id: paymentResponse.razorpay_payment_id, subscription_id: paymentResponse.razorpay_subscription_id, signature: paymentResponse.razorpay_signature }),
          });
          const verifyData = await verify.json().catch(() => ({}));
          if (!verify.ok) throw new Error(verifyData.error || 'Payment verification failed');
          toast.success('Monthly plan activated');
          window.location.reload();
        },
      }).open();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Payment failed');
    } finally {
      setIsMonthlyLoading(false);
    }
  }, [config, loadRazorpay, user]);

  const buyLifetime = useCallback(async () => {
    if (config.paymentConfigured === false) return toast.error('Payments are not configured on this deployment');
    if (config.authConfigured === false) return toast.error('Server-side login verification is not configured');
    if (config.firestoreConfigured === false) return toast.error('Billing database is not configured');
    if (!user) return toast.error('Login first to purchase a plan');

    setIsLifetimeLoading(true);
    try {
      const token = await user.getIdToken(true);
      const response = await fetch(`${API_BASE}/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ plan: 'lifetime' }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Could not create order');

      const loaded = await loadRazorpay();
      if (!loaded) throw new Error('Razorpay checkout failed to load');

      new (window as any).Razorpay({
        key: data.keyId || config.paymentKeyId,
        amount: data.amount,
        currency: data.currency,
        order_id: data.orderId,
        name: siteConfig.name,
        description: 'Lifetime ad-free access',
        prefill: { email: user.email || undefined },
        theme: { color: '#2563eb' },
        handler: async (paymentResponse: any) => {
          const verify = await fetch(`${API_BASE}/verify-payment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ type: 'order', payment_id: paymentResponse.razorpay_payment_id, order_id: paymentResponse.razorpay_order_id, signature: paymentResponse.razorpay_signature }),
          });
          const verifyData = await verify.json().catch(() => ({}));
          if (!verify.ok) throw new Error(verifyData.error || 'Payment verification failed');
          toast.success('Lifetime plan activated');
          window.location.reload();
        },
      }).open();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Payment failed');
    } finally {
      setIsLifetimeLoading(false);
    }
  }, [config, loadRazorpay, user]);

  const plans = [
    { icon: Sparkles, title: 'Free', subtitle: 'Best for casual use', price: '$0', features: [`Guest limit: ${config.guestDailyLimit}/day`, `Logged-in limit: ${config.userDailyLimit}/day`, 'No required app install', 'Video or audio workflow when supported'] },
    { icon: CreditCard, title: 'Monthly', subtitle: 'Ad-free plan', price: config.monthlyDisplay, features: [`Daily limit: ${config.monthlyDailyLimit <= 0 ? 'Unlimited' : `${config.monthlyDailyLimit}/day`}`, 'No ads while active', 'Login required to purchase'], highlighted: true },
    { icon: ShieldCheck, title: 'Lifetime', subtitle: 'One-time ad-free access', price: config.lifetimeDisplay, features: [`Daily limit: ${config.lifetimeDailyLimit <= 0 ? 'Unlimited' : `${config.lifetimeDailyLimit}/day`}`, 'No recurring charge', 'Login required to purchase'] },
  ];

  return (
    <div className="section-shell" style={{ maxWidth: 1080, margin: '0 auto', padding: '48px 16px 64px' }}>
      <Helmet>
        <title>Pricing | {siteConfig.name}</title>
        <meta name="description" content="See the free tier, ad-free plans, current daily limits, and billing notes for this SwiftDL deployment." />
        <link rel="canonical" href={siteUrl('/pricing')} />
      </Helmet>

      <div style={{ textAlign: 'center', maxWidth: 560, margin: '0 auto' }}>
        <span className="section-eyebrow">Pricing</span>
        <h1 style={{ marginTop: 12, fontSize: 30, fontWeight: 800, color: 'var(--ink-900)', lineHeight: 1.15 }}>
          Simple, transparent pricing
        </h1>
        <p style={{ marginTop: 12, fontSize: 15, lineHeight: 1.65, color: 'var(--ink-600)' }}>
          SwiftDL keeps a free browser workflow for public links and offers optional paid plans for people who want higher limits and an ad-free experience.
        </p>
      </div>

      <div style={{ marginTop: 40, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, alignItems: 'start' }}>
        {plans.map((plan) => (
          <div
            key={plan.title}
            className="card"
            style={{
              padding: '28px 24px',
              border: plan.highlighted ? '2px solid var(--brand-600)' : '1px solid var(--border-soft)',
              textAlign: 'center',
              position: 'relative',
              boxShadow: plan.highlighted ? 'var(--shadow-lg)' : 'var(--shadow-xs)',
            }}
          >
            {plan.highlighted && (
              <div style={{ position: 'absolute', top: -1, left: '50%', transform: 'translateX(-50%)', background: 'var(--brand-600)', color: '#fff', fontSize: 10, fontWeight: 700, padding: '4px 14px', borderRadius: '0 0 6px 6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Most Popular
              </div>
            )}
            <div style={{ width: 44, height: 44, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--brand-50)', color: 'var(--brand-600)', margin: '0 auto' }}>
              <plan.icon size={20} />
            </div>
            <h2 style={{ marginTop: 16, fontSize: 20, fontWeight: 800, color: 'var(--ink-900)' }}>{plan.title}</h2>
            <p style={{ marginTop: 4, fontSize: 13, color: 'var(--ink-500)' }}>{plan.subtitle}</p>
            <div style={{ marginTop: 16, fontSize: 36, fontWeight: 800, color: 'var(--ink-900)', lineHeight: 1 }}>{plan.price}</div>
            <ul style={{ listStyle: 'none', padding: 0, margin: '20px 0 0', textAlign: 'left' }}>
              {plan.features.map((feat) => (
                <li key={feat} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '7px 0', fontSize: 13, lineHeight: 1.5, color: 'var(--ink-600)' }}>
                  <CheckCircle2 size={15} style={{ marginTop: 2, flexShrink: 0, color: 'var(--brand-500)' }} />
                  {feat}
                </li>
              ))}
            </ul>
            {plan.highlighted && (
              <button
                type="button"
                onClick={buyMonthly}
                disabled={isMonthlyLoading || config.paymentConfigured === false}
                className="btn-brand"
                style={{ marginTop: 24, width: '100%', padding: '12px 24px' }}
              >
                {isMonthlyLoading ? <LoadingIndicator label="Starting checkout..." compact tone="light" /> : 'Buy monthly'}
              </button>
            )}
            {plan.title === 'Lifetime' && (
              <button
                type="button"
                onClick={buyLifetime}
                disabled={isLifetimeLoading || config.paymentConfigured === false}
                className="btn-dark"
                style={{ marginTop: 24, width: '100%', padding: '12px 24px' }}
              >
                {isLifetimeLoading ? <LoadingIndicator label="Starting checkout..." compact tone="light" /> : 'Buy lifetime'}
              </button>
            )}
          </div>
        ))}
      </div>

      <section style={{ marginTop: 40, borderRadius: 12, border: '1px solid var(--border-soft)', background: 'var(--surface-soft)', padding: '24px 28px' }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--ink-900)' }}>Billing notes</h2>
        <ul style={{ marginTop: 12, listStyle: 'none', padding: 0 }}>
          {[
            'Payments are handled by Razorpay when payment configuration is enabled on this deployment.',
            'SwiftDL does not position free use and paid plans as the same thing. Paid plans are optional add-ons, not hidden conversions.',
            'If a deployment is missing server-side billing configuration, checkout buttons will stay limited and the site will remain on the free workflow.',
          ].map((note) => (
            <li key={note} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 0', fontSize: 13, lineHeight: 1.55, color: 'var(--ink-600)' }}>
              <span style={{ marginTop: 6, width: 5, height: 5, borderRadius: '50%', background: 'var(--ink-400)', flexShrink: 0 }} />
              {note}
            </li>
          ))}
        </ul>
      </section>

      <div style={{ marginTop: 32, display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        <Link to="/refund-policy" className="btn-dark" style={{ display: 'inline-flex', alignItems: 'center' }}>Refund policy</Link>
        <Link to="/contact-us" className="btn-outline" style={{ display: 'inline-flex', alignItems: 'center' }}>Contact support</Link>
      </div>
    </div>
  );
}
