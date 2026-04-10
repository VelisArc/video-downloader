import { useEffect } from 'react';
import { useEntitlement } from '../context/EntitlementContext';

const ADSENSE_CLIENT =
  import.meta.env.VITE_ADSENSE_CLIENT || 'ca-pub-8549549826417735';
const SCRIPT_ID = 'adsense-auto-ads';

export default function AdsenseAutoAds() {
  const { loading, entitlement } = useEntitlement();

  useEffect(() => {
    if (loading) return;
    if (entitlement.unlimited) return;
    if (!ADSENSE_CLIENT) return;
    if (document.getElementById(SCRIPT_ID)) return;

    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.async = true;
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`;
    script.crossOrigin = 'anonymous';
    document.head.appendChild(script);
  }, [loading, entitlement.unlimited]);

  return null;
}
