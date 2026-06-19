import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

function getInitialTheme(): 'light' | 'dark' {
  const saved = localStorage.getItem('swiftdl-theme');
  if (saved === 'dark' || saved === 'light') return saved;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('swiftdl-theme', theme);
  }, [theme]);

  const toggle = () => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      className="relative rounded-lg border p-2 transition-all duration-200 hover:bg-[var(--surface-soft)]"
      style={{
        borderColor: 'var(--border-soft)',
        color: 'var(--ink-600)',
      }}
    >
      <div className="relative h-4 w-4">
        <Sun
          className={`absolute inset-0 h-4 w-4 transition-all duration-200 ${
            theme === 'light' ? 'rotate-0 scale-100 opacity-100' : 'rotate-90 scale-0 opacity-0'
          }`}
        />
        <Moon
          className={`absolute inset-0 h-4 w-4 transition-all duration-200 ${
            theme === 'dark' ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'
          }`}
        />
      </div>
    </button>
  );
}
