interface Props { label?: string; compact?: boolean; className?: string; tone?: 'default' | 'light'; }

export default function LoadingIndicator({ label = 'Loading...', compact = false, className = '', tone = 'default' }: Props) {
  const size = compact ? 'h-1 w-1' : 'h-1.5 w-1.5';
  return (
    <span className={`inline-flex items-center gap-2 ${className}`.trim()}>
      <span className="inline-flex items-center gap-1">
        <span className={`${size} rounded-full animate-bounce [animation-delay:-0.3s]`} style={{ background: tone === 'light' ? 'rgba(255,255,255,0.7)' : 'var(--brand-500)' }} />
        <span className={`${size} rounded-full animate-bounce [animation-delay:-0.15s]`} style={{ background: tone === 'light' ? 'rgba(255,255,255,0.5)' : 'var(--accent-500)' }} />
        <span className={`${size} rounded-full animate-bounce`} style={{ background: tone === 'light' ? 'rgba(255,255,255,0.35)' : 'var(--ink-500)' }} />
      </span>
      {label && <span className={compact ? 'text-xs font-medium' : 'text-xs font-medium'} style={{ color: tone === 'light' ? 'rgba(255,255,255,0.9)' : 'var(--ink-600)' }}>{label}</span>}
    </span>
  );
}