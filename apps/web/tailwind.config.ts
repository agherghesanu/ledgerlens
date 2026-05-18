import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        'bg-2': 'var(--bg-2)',
        card: 'var(--card)',
        'card-2': 'var(--card-2)',
        'card-3': 'var(--card-3)',
        border: 'var(--border)',
        'border-dim': 'var(--border-dim)',
        text: 'var(--text)',
        'text-dim': 'var(--text-dim)',
        'text-mute': 'var(--text-mute)',
        indigo: {
          DEFAULT: 'var(--indigo)',
          soft: 'var(--indigo-soft)',
          dark: 'var(--indigo-dark)',
        },
        green: {
          DEFAULT: 'var(--green)',
          soft: 'var(--green-soft)',
        },
        rose: {
          DEFAULT: 'var(--rose)',
          soft: 'var(--rose-soft)',
        },
        amber: {
          DEFAULT: 'var(--amber)',
          soft: 'var(--amber-soft)',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'sans-serif'],
        body: ['var(--font-geist-sans)', 'ui-sans-serif', 'system-ui'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
}

export default config
