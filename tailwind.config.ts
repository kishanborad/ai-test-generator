import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './demo.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      colors: {
        tg: {
          bg: '#0a0e1a',
          surface: '#131829',
          border: '#1e2540',
          text: '#e2e8f0',
          muted: '#64748b',
          accent: '#818cf8',
          accentDim: '#6366f1',
          green: '#22c55e',
          red: '#ef4444',
          amber: '#f59e0b',
          card: '#1a1f35',
        },
      },
      animation: {
        'pulse-record': 'pulse-record 1.5s ease-in-out infinite',
        'cursor-move': 'cursor-move 0.3s ease-out',
      },
      keyframes: {
        'pulse-record': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.3' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
