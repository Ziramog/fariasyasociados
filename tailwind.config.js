/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#EC6D13', hover: '#D4600F', light: '#FFF3E8' },
        accent: { DEFAULT: '#EC6D13', hover: '#D4600F' },
        navy: { DEFAULT: '#0F172A', light: '#1E293B', 50: '#F8FAFC' },
        whatsapp: { DEFAULT: '#25D366', hover: '#20BD5A' },
        gold: '#C5A880',
        surface: { DEFAULT: '#F8FAFC', alt: '#FFFFFF', muted: '#F1F5F9' },
        site: '#F6F6F6',
        heading: '#0F172A',
        body: '#475569',
        muted: '#94A3B8',
        success: '#25D366',
      },
      fontFamily: {
        sans: ['var(--font-body)', 'Lato', 'system-ui', 'sans-serif'],
        heading: ['var(--font-heading)', 'PT Serif', 'Georgia', 'serif'],
        serif: ['var(--font-heading)', 'PT Serif', 'Georgia', 'serif'],
        display: ['var(--font-heading)', 'PT Serif', 'Georgia', 'serif'],
      },
      borderRadius: {
        card: '12px',
        btn: '10px',
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        card: '0 1px 3px 0 rgb(0 0 0 / 0.04), 0 1px 2px -1px rgb(0 0 0 / 0.03)',
        'card-hover': '0 10px 30px -6px rgb(0 0 0 / 0.1), 0 4px 10px -4px rgb(0 0 0 / 0.04)',
        'card-lift': '0 20px 40px -8px rgb(0 0 0 / 0.12), 0 8px 16px -8px rgb(0 0 0 / 0.04)',
        float: '0 12px 28px -5px rgb(0 0 0 / 0.12), 0 4px 8px -4px rgb(0 0 0 / 0.06)',
        subtle: '0 1px 2px 0 rgb(0 0 0 / 0.04)',
        glass: '0 8px 32px 0 rgb(0 0 0 / 0.06)',
        hero: '0 20px 60px rgba(0, 0, 0, 0.35), 0 8px 24px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
      },
      animation: {
        'fade-up': 'fadeUp 0.5s ease-out forwards',
        shimmer: 'shimmer 1.5s infinite',
        'pulse-wa': 'pulseWA 2s ease-in-out infinite',
        marquee: 'marquee 30s linear infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulseWA: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.08)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      gridTemplateColumns: {
        '70/30': '70% 28%',
      },
    },
  },
  plugins: [],
};
