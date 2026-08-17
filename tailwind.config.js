/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#14161C',
          surface: '#181A22',
          card: '#20222C',
          cardHover: '#272A36',
          border: '#2E3240',
          muted: '#8E94A4',
          text: '#E8E8ED',
          heading: '#F5F5F7',
        },
        light: {
          bg: '#F8F9FA',
          surface: '#FFFFFF',
          card: '#FFFFFF',
          cardHover: '#F3F4F6',
          border: '#E5E7EB',
          muted: '#6B7280',
          text: '#1F2937',
          heading: '#111827',
        },
        brand: {
          50: '#EEF2FF',
          100: '#E0E7FF',
          400: '#818CF8',
          500: '#6366F1',
          600: '#4F46E5',
          700: '#4338CA',
        },
        accent: {
          emerald: '#10B981',
          amber: '#F59E0B',
          rose: '#F43F5E',
          sky: '#0EA5E9',
          violet: '#8B5CF6',
        }
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'soft-sm': '0 2px 8px 0 rgba(0, 0, 0, 0.04)',
        'soft-md': '0 4px 16px 0 rgba(0, 0, 0, 0.06)',
        'soft-lg': '0 10px 30px -5px rgba(0, 0, 0, 0.08)',
        'dark-sm': '0 2px 8px 0 rgba(0, 0, 0, 0.25)',
        'dark-md': '0 6px 20px 0 rgba(0, 0, 0, 0.35)',
        'dark-lg': '0 12px 36px 0 rgba(0, 0, 0, 0.45)',
        'card-press': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out forwards',
        'scale-in': 'scaleIn 0.2s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      }
    },
  },
  plugins: [],
};
