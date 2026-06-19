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
    : 'inline-flex items-center gap-2.5';
  const dotClass = compact ? 'h-1 w-1' : 'h-1.5 w-1.5';
  const textClass = compact ? 'text-xs font-medium' : 'text-xs font-medium';

  const textToneClass = tone === 'light' ? 'text-white/90' : 'text-[var(--ink-600)]';

  return (
    <span className={`${containerClass} ${className}`.trim()}>
      <span className="inline-flex items-center gap-1">
        <span className={`${dotClass} rounded-full bg-[var(--brand-500)] animate-bounce [animation-delay:-0.3s]`} />
        <span className={`${dotClass} rounded-full bg-[var(--accent-500)] animate-bounce [animation-delay:-0.15s]`} />
        <span className={`${dotClass} rounded-full bg-[var(--ink-500)] animate-bounce`} />
      </span>
      {label && <span className={`${textClass} ${textToneClass}`}>{label}</span>}
    </span>
  );
}
