/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Sora', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        brand: {
          50: '#f5f3ff',
          100: '#e9e4ff',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        },
        magenta: {
          500: '#d946ef',
          600: '#c026d3',
        },
        rose: {
          400: '#fb7185',
          500: '#f43f5e',
        },
      },
      fontSize: {
        xxs: '0.625rem',
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.25rem',
        '3xl': '1.75rem',
        '4xl': '2.25rem',
      },
      boxShadow: {
        glow: '0 18px 54px -14px rgba(192, 38, 211, 0.5)',
        violet: '0 18px 54px -14px rgba(124, 58, 237, 0.55)',
      },
    },
  },
  plugins: [],
};
