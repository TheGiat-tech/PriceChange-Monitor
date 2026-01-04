import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        ios: {
          bg: '#F2F2F7',
          card: '#FFFFFF',
          label: '#111111',
          secondary: '#6B7280',
          separator: 'rgba(60,60,67,0.12)',
          tint: '#007AFF',
        },
      },
      borderRadius: {
        ios: '20px',
        ioslg: '24px',
      },
      boxShadow: {
        ios: '0 1px 2px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.06)',
      },
    },
  },
  plugins: [],
}
export default config
