import { Clock3, Cookie, Lock, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { DownloadQuota } from '../lib/downloads';

interface QuotaCardProps {
  activePlan: string;
  effectiveQuota: DownloadQuota;
  effectiveLimit: number;
  cookiesFeatureAvailable: boolean;
  isPremiumUser: boolean;
  cookieVaultMaxCount: number | null;
  config: {
    guestDailyLimit: number;
    userDailyLimit: number;
    monthlyDailyLimit: number;
    lifetimeDailyLimit: number;
  };
}

function planLabel(plan: string) {
  if (plan === 'monthly') return 'Monthly';
  if (plan === 'lifetime') return 'Lifetime';
  if (plan === 'user') return 'Logged-in';
  return 'Guest';
}

function limitLabel(limit: number) {
  return limit <= 0 ? 'Unlimited' : `${limit}/day`;
}

export default function QuotaCard({
  activePlan,
  effectiveQuota,
  effectiveLimit,
  cookiesFeatureAvailable,
  isPremiumUser,
  cookieVaultMaxCount,
  config,
}: QuotaCardProps) {
  const usagePercent =
    effectiveQuota.unlimited || !effectiveQuota.dailyLimit
      ? 0
      : typeof effectiveQuota.remaining === 'number'
        ? Math.round(((effectiveQuota.dailyLimit - effectiveQuota.remaining) / effectiveQuota.dailyLimit) * 100)
        : 0;

  return (
    <div className="glass-panel rounded-[var(--radius-2xl)] p-5 md:p-6">
      {/* Plan Badge */}
      <div
        className="rounded-3xl p-5 text-white animate-gradient-shift"
        style={{
          background: 'linear-gradient(135deg, #d84853 0%, #e86a55 40%, #f49c4d 100%)',
          backgroundSize: '200% 200%',
        }}
      >
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">Current access</p>
        <h2 className="mt-2 text-2xl font-black">{planLabel(activePlan)} plan</h2>
        <p className="mt-2 text-sm leading-6 text-white/85">
          Daily limit: {effectiveQuota.unlimited ? 'Unlimited' : limitLabel(effectiveQuota.dailyLimit ?? effectiveLimit)}
        </p>

        {/* Usage bar */}
        {!effectiveQuota.unlimited && typeof effectiveQuota.remaining === 'number' && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-white/70">
              <span>Used today</span>
              <span>{effectiveQuota.remaining} remaining</span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full rounded-full bg-white/90 transition-all duration-700 ease-out"
                style={{ width: `${usagePercent}%` }}
              />
            </div>
          </div>
        )}

        {cookiesFeatureAvailable && (
          <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
            <Cookie className="h-3.5 w-3.5" />
            {isPremiumUser ? 'Premium cookie vault unlocked' : '2 saved cookie slots'}
          </p>
        )}
      </div>

      {/* Access snapshot */}
      <div className="mt-4 space-y-4">
        <div className="card">
          <p className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: 'var(--brand-700)' }}>
            Access snapshot
          </p>
          <div className="mt-4 space-y-3 text-sm" style={{ color: 'var(--ink-600)' }}>
            <div className="flex items-center justify-between">
              <span>Guest</span>
              <strong style={{ color: 'var(--ink-900)' }}>{limitLabel(config.guestDailyLimit)}</strong>
            </div>
            <div className="flex items-center justify-between">
              <span>Logged-in</span>
              <strong style={{ color: 'var(--ink-900)' }}>{limitLabel(config.userDailyLimit)}</strong>
            </div>
            <div className="flex items-center justify-between">
              <span>Premium</span>
              <strong style={{ color: 'var(--ink-900)' }}>
                {config.monthlyDailyLimit <= 0 || config.lifetimeDailyLimit <= 0 ? 'Unlimited' : 'Higher limits'}
              </strong>
            </div>
            <div className="flex items-center justify-between">
              <span>Cookie Vault</span>
              <strong style={{ color: 'var(--ink-900)' }}>
                {cookiesFeatureAvailable ? (cookieVaultMaxCount ? `${cookieVaultMaxCount} saved` : 'Enabled') : 'Login first'}
              </strong>
            </div>
          </div>
          <Link
            to="/pricing"
            className="mt-5 inline-flex text-sm font-semibold transition hover:opacity-80"
            style={{ color: 'var(--brand-700)' }}
          >
            View plan details →
          </Link>
        </div>

        {/* Tips */}
        <div className="card-inner">
          <ul className="space-y-3 text-sm leading-6" style={{ color: 'var(--ink-600)' }}>
            <li className="flex gap-3">
              <Sparkles className="mt-0.5 h-4 w-4 flex-none" style={{ color: 'var(--brand-600)' }} />
              Use Cookies Mode only with your own session for media you&apos;re authorized to view.
            </li>
            <li className="flex gap-3">
              <Clock3 className="mt-0.5 h-4 w-4 flex-none" style={{ color: 'var(--brand-600)' }} />
              Direct media URLs can expire — save the file locally after SwiftDL prepares it.
            </li>
            <li className="flex gap-3">
              <Lock className="mt-0.5 h-4 w-4 flex-none" style={{ color: 'var(--brand-600)' }} />
              Compatibility depends on the URL and what the source platform exposes.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
