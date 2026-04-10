import { useCallback, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { CheckCircle2, CreditCard, ShieldCheck, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import LoadingIndicator from '../components/LoadingIndicator';
import { siteConfig, siteUrl } from '../lib/site';

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
    fetch('/api/config')
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
    return () => {
      active = false;
    };
  }, []);

  const loadRazorpay = useCallback(() => {
    return new Promise<boolean>((resolve) => {
      if ((window as Window & { Razorpay?: unknown }).Razorpay) {
        resolve(true);
        return;
      }
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
      const response = await fetch('/api/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ plan: 'monthly' }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Could not create subscription');

      const loaded = await loadRazorpay();
      if (!loaded) throw new Error('Razorpay checkout failed to load');

      const options = {
        key: data.keyId || config.paymentKeyId,
        subscription_id: data.subscriptionId,
        name: siteConfig.name,
        description: 'Monthly ad-free access',
        prefill: { email: user.email || undefined },
        theme: { color: '#d84853' },
        handler: async (paymentResponse: any) => {
          const verify = await fetch('/api/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({
              type: 'subscription',
              payment_id: paymentResponse.razorpay_payment_id,
              subscription_id: paymentResponse.razorpay_subscription_id,
              signature: paymentResponse.razorpay_signature,
            }),
          });
          const verifyData = await verify.json().catch(() => ({}));
          if (!verify.ok) throw new Error(verifyData.error || 'Payment verification failed');
          toast.success('Monthly plan activated');
          window.location.reload();
        },
      };

      new (window as any).Razorpay(options).open();
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
      const response = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ plan: 'lifetime' }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Could not create order');

      const loaded = await loadRazorpay();
      if (!loaded) throw new Error('Razorpay checkout failed to load');

      const options = {
        key: data.keyId || config.paymentKeyId,
        amount: data.amount,
        currency: data.currency,
        order_id: data.orderId,
        name: siteConfig.name,
        description: 'Lifetime ad-free access',
        prefill: { email: user.email || undefined },
        theme: { color: '#d84853' },
        handler: async (paymentResponse: any) => {
          const verify = await fetch('/api/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({
              type: 'order',
              payment_id: paymentResponse.razorpay_payment_id,
              order_id: paymentResponse.razorpay_order_id,
              signature: paymentResponse.razorpay_signature,
            }),
          });
          const verifyData = await verify.json().catch(() => ({}));
          if (!verify.ok) throw new Error(verifyData.error || 'Payment verification failed');
          toast.success('Lifetime plan activated');
          window.location.reload();
        },
      };

      new (window as any).Razorpay(options).open();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Payment failed');
    } finally {
      setIsLifetimeLoading(false);
    }
  }, [config, loadRazorpay, user]);

  return (
    <div className="section-shell max-w-6xl py-10">
      <Helmet>
        <title>Pricing | {siteConfig.name}</title>
        <meta
          name="description"
          content="See the free tier, ad-free plans, current daily limits, and billing notes for this SwiftDL deployment."
        />
        <link rel="canonical" href={siteUrl('/pricing')} />
      </Helmet>

      <div className="mx-auto max-w-3xl text-center">
        <span className="section-eyebrow">Pricing</span>
        <h1 className="mt-4 text-4xl font-black text-[var(--ink-900)] md:text-5xl">
          Free tier plus optional ad-free plans
        </h1>
        <p className="mt-4 text-base leading-8 text-[var(--ink-600)]">
          SwiftDL keeps a free browser workflow for public links and offers
          optional paid plans for people who want higher or unlimited limits and
          an ad-free experience.
        </p>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <article className="feature-card">
          <Sparkles className="mb-4 h-5 w-5 text-[var(--brand-600)]" />
          <h2 className="text-2xl font-black text-[var(--ink-900)]">Free</h2>
          <p className="mt-2 text-sm text-[var(--ink-500)]">Best for most casual use</p>
          <div className="mt-5 text-4xl font-black text-[var(--ink-900)]">$0</div>
          <ul className="mt-5 space-y-3 text-sm leading-7 text-[var(--ink-600)]">
            <li className="flex gap-3"><CheckCircle2 className="mt-1 h-4 w-4 flex-none text-[var(--brand-600)]" />Guest limit: {config.guestDailyLimit}/day</li>
            <li className="flex gap-3"><CheckCircle2 className="mt-1 h-4 w-4 flex-none text-[var(--brand-600)]" />Logged-in limit: {config.userDailyLimit}/day</li>
            <li className="flex gap-3"><CheckCircle2 className="mt-1 h-4 w-4 flex-none text-[var(--brand-600)]" />No required app install</li>
            <li className="flex gap-3"><CheckCircle2 className="mt-1 h-4 w-4 flex-none text-[var(--brand-600)]" />Video or audio workflow when supported</li>
          </ul>
        </article>

        <article className="feature-card border-[var(--border-strong)]">
          <CreditCard className="mb-4 h-5 w-5 text-[var(--brand-600)]" />
          <h2 className="text-2xl font-black text-[var(--ink-900)]">Monthly</h2>
          <p className="mt-2 text-sm text-[var(--ink-500)]">Ad-free plan</p>
          <div className="mt-5 text-4xl font-black text-[var(--ink-900)]">{config.monthlyDisplay}</div>
          <ul className="mt-5 space-y-3 text-sm leading-7 text-[var(--ink-600)]">
            <li className="flex gap-3"><CheckCircle2 className="mt-1 h-4 w-4 flex-none text-[var(--brand-600)]" />Daily limit: {config.monthlyDailyLimit <= 0 ? 'Unlimited' : `${config.monthlyDailyLimit}/day`}</li>
            <li className="flex gap-3"><CheckCircle2 className="mt-1 h-4 w-4 flex-none text-[var(--brand-600)]" />No ads while active</li>
            <li className="flex gap-3"><CheckCircle2 className="mt-1 h-4 w-4 flex-none text-[var(--brand-600)]" />Login required to purchase</li>
          </ul>
          <button type="button" onClick={buyMonthly} disabled={isMonthlyLoading || config.paymentConfigured === false} className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-[var(--brand-600)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--brand-700)] disabled:opacity-70">
            {isMonthlyLoading ? <LoadingIndicator label="Starting checkout..." compact tone="light" /> : 'Buy monthly'}
          </button>
        </article>

        <article className="feature-card">
          <ShieldCheck className="mb-4 h-5 w-5 text-[var(--brand-600)]" />
          <h2 className="text-2xl font-black text-[var(--ink-900)]">Lifetime</h2>
          <p className="mt-2 text-sm text-[var(--ink-500)]">One-time ad-free access</p>
          <div className="mt-5 text-4xl font-black text-[var(--ink-900)]">{config.lifetimeDisplay}</div>
          <ul className="mt-5 space-y-3 text-sm leading-7 text-[var(--ink-600)]">
            <li className="flex gap-3"><CheckCircle2 className="mt-1 h-4 w-4 flex-none text-[var(--brand-600)]" />Daily limit: {config.lifetimeDailyLimit <= 0 ? 'Unlimited' : `${config.lifetimeDailyLimit}/day`}</li>
            <li className="flex gap-3"><CheckCircle2 className="mt-1 h-4 w-4 flex-none text-[var(--brand-600)]" />No recurring charge</li>
            <li className="flex gap-3"><CheckCircle2 className="mt-1 h-4 w-4 flex-none text-[var(--brand-600)]" />Login required to purchase</li>
          </ul>
          <button type="button" onClick={buyLifetime} disabled={isLifetimeLoading || config.paymentConfigured === false} className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-[var(--ink-900)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--ink-700)] disabled:opacity-70">
            {isLifetimeLoading ? <LoadingIndicator label="Starting checkout..." compact tone="light" /> : 'Buy lifetime'}
          </button>
        </article>
      </div>

      <section className="mt-10 rounded-[36px] border border-[var(--border-soft)] bg-[var(--surface-soft)] p-6 md:p-8">
        <h2 className="text-3xl font-black text-[var(--ink-900)]">Billing notes</h2>
        <ul className="mt-5 space-y-3 text-sm leading-7 text-[var(--ink-600)]">
          <li>Payments are handled by Razorpay when payment configuration is enabled on this deployment.</li>
          <li>SwiftDL does not position free use and paid plans as the same thing. Paid plans are optional add-ons, not hidden conversions.</li>
          <li>If a deployment is missing server-side billing configuration, checkout buttons will stay limited and the site will remain on the free workflow.</li>
        </ul>
      </section>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link to="/refund-policy" className="rounded-full bg-[var(--ink-900)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--ink-700)]">
          Refund policy
        </Link>
        <Link to="/contact-us" className="rounded-full border border-[var(--border-soft)] bg-white px-5 py-3 text-sm font-semibold text-[var(--ink-700)] transition hover:border-[var(--brand-300)] hover:text-[var(--brand-700)]">
          Contact support
        </Link>
      </div>
    </div>
  );
}
