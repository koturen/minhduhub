import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        base: '#111111',
        surface: '#181818',
        card: '#202020',
        line: '#303030',
        ink: '#F5F5F5',
        muted: '#A3A3A3',
        accent: '#F5A623',
        danger: '#EF4444',
        ok: '#22C55E',
      },
      borderRadius: { md: '8px' },
      fontFamily: { sans: ['"Inter"', 'system-ui', 'Segoe UI', 'Roboto', 'sans-serif'] },
    },
  },
  plugins: [],
} satisfies Config;
