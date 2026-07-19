/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: 'var(--brand-50)',
          100: 'var(--brand-100)',
          200: 'var(--brand-200)',
          300: 'var(--brand-300)',
          400: 'var(--brand-400)',
          500: 'var(--brand-500)',
          600: 'var(--brand-600)',
          700: 'var(--brand-700)',
          800: 'var(--brand-800)',
          900: 'var(--brand-900)',
        },
        ink: {
          heavy: 'var(--ink-heavy)',
          900: 'var(--ink-900)',
          800: 'var(--ink-800)',
          700: 'var(--ink-700)',
          600: 'var(--ink-600)',
          500: 'var(--ink-500)',
          400: 'var(--ink-400)',
          300: 'var(--ink-300)',
          200: 'var(--ink-200)',
        },
        surface: {
          DEFAULT: 'var(--surface)',
          soft: 'var(--surface-soft)',
          elevated: 'var(--surface-elevated)',
        },
        canvas: {
          DEFAULT: 'var(--canvas)',
          alt: 'var(--canvas-alt)',
        },
      },
      fontSize: {
        'xxs': '0.625rem',
        '3xl': ['2rem', { lineHeight: '2.5rem', letterSpacing: '-0.02em' }],
        '4xl': ['2.5rem', { lineHeight: '3rem', letterSpacing: '-0.02em' }],
        '5xl': ['3.5rem', { lineHeight: '4rem', letterSpacing: '-0.03em' }],
      },
      borderRadius: {
        xl: '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'glow': 'var(--shadow-glow)',
        'glow-lg': '0 0 60px rgba(32, 201, 199, 0.4)',
      },
      backgroundImage: {
        'gradient-brand': 'var(--gradient-brand)',
        'gradient-hero': 'var(--gradient-hero)',
        'gradient-surface': 'var(--gradient-surface)',
      },
      animation: {
        'fade-in': 'fade-in 250ms ease-out forwards',
        'fade-up': 'fade-up 400ms cubic-bezier(0.34, 1.56, 0.64, 1) both',
        'slide-up': 'slide-up 350ms cubic-bezier(.34, 1.2, .64, 1) forwards',
        'scale-in': 'scale-in 200ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'glow': 'glow 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};
