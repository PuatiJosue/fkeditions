import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Legacy tokens (now driven by CSS vars — adapt to light/dark)
        gold: 'var(--token-gold)',
        'gold-light': 'var(--token-gold-light)',
        'gold-dark': 'var(--token-gold-dark)',
        dark: 'var(--token-dark)',
        'dark-2': 'var(--token-dark-2)',
        'dark-3': 'var(--token-dark-3)',
        'dark-4': 'var(--token-dark-4)',
        cream: 'var(--token-cream)',
        'cream-dim': 'var(--token-cream-dim)',
        'cream-muted': 'var(--token-cream-muted)',

        // New design tokens (homepage-aware)
        bg: 'var(--bg)',
        'bg-elev': 'var(--bg-elev)',
        'bg-deep': 'var(--bg-deep)',
        paper: 'var(--paper)',
        ink: 'var(--ink)',
        'ink-soft': 'var(--ink-soft)',
        'ink-mute': 'var(--ink-mute)',
        line: 'var(--line)',
        'line-soft': 'var(--line-soft)',
        accent: 'var(--accent)',
        'accent-deep': 'var(--accent-deep)',
        'accent-soft': 'var(--accent-soft)',
      },
      fontFamily: {
        serif: ['var(--font-cormorant)', 'Georgia', 'serif'],
        'serif-display': ['var(--font-playfair)', 'Georgia', 'serif'],
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'hero-gradient':
          'linear-gradient(135deg, var(--token-dark) 0%, var(--token-dark-3) 50%, var(--token-dark) 100%)',
      },
    },
  },
  plugins: [],
}

export default config
