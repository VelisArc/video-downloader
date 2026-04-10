import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';

type Entitlement = {
  plan: 'guest' | 'user' | 'monthly' | 'lifetime';
  unlimited: boolean;
  uid?: string | null;
};

type EntitlementState = {
  loading: boolean;
  entitlement: Entitlement;
  refresh: () => Promise<void>;
};

const EntitlementContext = createContext<EntitlementState | null>(null);

export function EntitlementProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [entitlement, setEntitlement] = useState<Entitlement>({ plan: 'guest', unlimited: false });

  const refresh = useCallback(async () => {
    if (!user) {
      setEntitlement({ plan: 'guest', unlimited: false, uid: null });
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/me', {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Failed to load entitlement');
      const plan = (data?.plan || 'user') as Entitlement['plan'];
      const unlimited = Boolean(data?.unlimited);
      setEntitlement({ plan, unlimited, uid: data?.uid || user.uid });
    } catch {
      setEntitlement({ plan: 'user', unlimited: false, uid: user.uid });
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
