import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';
import { API_BASE } from '../lib/api';

type Entitlement = {
  plan: 'guest' | 'user' | 'monthly' | 'lifetime';
  unlimited: boolean;
  uid?: string | null;
  premiumPlan?: 'monthly' | 'lifetime' | null;
  premiumStatus?: 'guest' | 'inactive' | 'active' | 'expired' | 'cancelled' | string | null;
  purchasedAt?: string | null;
  activatedAt?: string | null;
  renewedAt?: string | null;
  expiresAt?: string | null;
  renewsAt?: string | null;
  updatedAt?: string | null;
  paymentId?: string | null;
  orderId?: string | null;
  subscriptionId?: string | null;
  cancelAtPeriodEnd?: boolean;
  dailyLimit?: number | null;
  remaining?: number | null;
};

type EntitlementState = {
  loading: boolean;
  entitlement: Entitlement;
  refresh: () => Promise<void>;
};

const EntitlementContext = createContext<EntitlementState | null>(null);

const guestEntitlement: Entitlement = { plan: 'guest', unlimited: false, uid: null, premiumStatus: 'guest', dailyLimit: 1 };

function normalizeEntitlement(data: any, fallbackUid?: string | null): Entitlement {
  const plan = (data?.plan || (fallbackUid ? 'user' : 'guest')) as Entitlement['plan'];
  return {
    plan,
    unlimited: Boolean(data?.unlimited),
    uid: data?.uid || fallbackUid || null,
    premiumPlan: data?.premiumPlan || null,
    premiumStatus: data?.premiumStatus || (plan === 'guest' ? 'guest' : 'inactive'),
    purchasedAt: data?.purchasedAt || null,
    activatedAt: data?.activatedAt || null,
    renewedAt: data?.renewedAt || null,
    expiresAt: data?.expiresAt || null,
    renewsAt: data?.renewsAt || null,
    updatedAt: data?.updatedAt || null,
    paymentId: data?.paymentId || null,
    orderId: data?.orderId || null,
    subscriptionId: data?.subscriptionId || null,
    cancelAtPeriodEnd: Boolean(data?.cancelAtPeriodEnd),
    dailyLimit: typeof data?.dailyLimit === 'number' ? data.dailyLimit : null,
    remaining: typeof data?.remaining === 'number' ? data.remaining : null,
  };
}

export function EntitlementProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [entitlement, setEntitlement] = useState<Entitlement>(guestEntitlement);

  const refresh = useCallback(async () => {
    if (!user) {
      setEntitlement(guestEntitlement);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch(`${API_BASE}/me`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Failed to load entitlement');
      setEntitlement(normalizeEntitlement(data, user.uid));
    } catch {
      setEntitlement(normalizeEntitlement({ plan: 'user', unlimited: false }, user.uid));
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value = useMemo(() => ({ loading, entitlement, refresh }), [loading, entitlement, refresh]);

  return <EntitlementContext.Provider value={value}>{children}</EntitlementContext.Provider>;
}

export function useEntitlement() {
  const ctx = useContext(EntitlementContext);
  if (!ctx) throw new Error('useEntitlement must be used within EntitlementProvider');
  return ctx;
}