import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

function getTheme(): 'light' | 'dark' {
  const saved = localStorage.getItem('swiftdl-theme');
  if (saved === 'dark' || saved === 'light') return saved;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>(getTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('swiftdl-theme', theme);
  }, [theme]);

  return (
    <button
      onClick={() => setTheme(p => p === 'dark' ? 'light' : 'dark')}
      className="relative flex h-10 w-10 items-center justify-center rounded-md border transition-colors hover:bg-[var(--surface-soft)]"
      style={{ borderColor: 'var(--border)', color: 'var(--ink-600)', background: 'var(--surface)' }}
      aria-label="Toggle theme"
      title="Toggle theme"
    >
      <Sun className={`absolute h-4 w-4 transition-all ${theme === 'light' ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`} />
      <Moon className={`absolute h-4 w-4 transition-all ${theme === 'dark' ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`} />
    </button>
  );
}
