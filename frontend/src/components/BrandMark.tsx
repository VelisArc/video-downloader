export default function BrandMark({ className = 'h-10 w-10' }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="sharehub-mark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#8b5cf6" />
          <stop offset="0.5" stopColor="#d946ef" />
          <stop offset="1" stopColor="#fb7185" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="13" fill="url(#sharehub-mark)" />
      <path d="M24 11v14" stroke="#ffffff" strokeWidth="3.6" strokeLinecap="round" />
      <path d="M15 20.6 24 29.5l9-8.9" fill="none" stroke="#ffffff" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14.5 36h19" stroke="#ffffff" strokeWidth="3.6" strokeLinecap="round" opacity="0.9" />
    </svg>
  );
}
