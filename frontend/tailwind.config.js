/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        'surface-elevated': 'var(--surface-elevated)',
        'surface-subtle': 'var(--surface-subtle)',
        border: 'var(--border)',
        'border-focus': 'var(--border-focus)',
        ink: {
          DEFAULT: 'var(--text-ink)',
          muted: 'var(--text-muted)',
          faint: 'var(--text-faint)',
        },
        primary: {
          50: '#F0FDF9',
          100: '#CCFBEE',
          200: '#99F6DF',
          500: '#14B8A6',
          600: '#0D9488',
          700: '#0F766E',
          800: '#115E59',
          900: '#134E48',
        },
        forest: {
          800: '#132A26',
          900: '#0C1B19',
          950: '#071210',
        },
        accent: 'var(--accent)',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        subtle: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        card: '0 2px 8px -2px rgba(15, 23, 42, 0.05), 0 1px 3px -1px rgba(15, 23, 42, 0.03)',
        dock: '0 8px 30px -4px rgba(15, 41, 38, 0.15)',
        'dock-dark': '0 8px 30px -4px rgba(0, 0, 0, 0.5)',
      },
    },
  },
  plugins: [],
};
