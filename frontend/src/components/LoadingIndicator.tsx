type LoadingIndicatorProps = {
  label?: string;
  compact?: boolean;
  className?: string;
  tone?: 'default' | 'light';
};

export default function LoadingIndicator({
  label = 'Loading...',
  compact = false,
  className = '',
  tone = 'default',
}: LoadingIndicatorProps) {
  const containerClass = compact
    ? 'inline-flex items-center gap-2'
    : 'inline-flex items-center gap-3';
  const haloClass = compact ? 'h-7 w-7' : 'h-10 w-10';
  const dotWrapClass = compact ? 'gap-1' : 'gap-1.5';
  const dotClass = compact ? 'h-1.5 w-1.5' : 'h-2 w-2';
  const textClass = compact ? 'text-sm font-semibold' : 'text-sm font-semibold tracking-[0.04em]';

  const textToneClass = tone === 'light' ? 'text-white' : 'text-[var(--ink-700)]';
  const haloToneClass = tone === 'light' ? 'bg-white/15' : 'bg-[rgba(240,95,107,0.16)]';
  const innerToneClass = tone === 'light'
    ? 'border-white/20 bg-white/10'
    : 'border-[rgba(240,95,107,0.2)] bg-white/90';

  return (
    <span className={`${containerClass} ${className}`.trim()}>
      <span className={`relative inline-flex items-center justify-center ${haloClass}`}>
        <span className={`absolute inset-0 animate-ping rounded-full [animation-duration:1.8s] ${haloToneClass}`} />
        <span className={`absolute inset-[18%] rounded-full border shadow-[0_10px_24px_rgba(31,34,51,0.08)] ${innerToneClass}`} />
        <span className={`relative inline-flex ${dotWrapClass}`}>
          <span className={`${dotClass} animate-bounce rounded-full bg-[var(--brand-500)] [animation-delay:-0.3s]`} />
          <span className={`${dotClass} animate-bounce rounded-full bg-[var(--accent-400)] [animation-delay:-0.15s]`} />
          <span className={`${dotClass} animate-bounce rounded-full bg-[var(--ink-900)]`} />
        </span>
      </span>
      <span className={`${textClass} ${textToneClass}`}>{label}</span>
    </span>
  );
}
