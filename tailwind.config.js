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
        elevate: {
          bg: '#F8FAFC',          // Light canvas (clean slate-50)
          'bg-dark': '#121826',   // Softer Dark canvas
          card: '#FFFFFF',        // Light card surface
          'card-dark': '#1E293B', // Softer Dark card surface
          'card-muted-dark': '#1A2438',
          border: '#E2E8F0',      // Light border (slate-200)
          'border-dark': '#1E293B', // Dark border (slate-800)
          primary: '#0F172A',     // Main text light
          'primary-dark': '#F8FAFC', // Main text dark
          muted: '#64748B',       // Muted slate
          'muted-dark': '#94A3B8',
          accent: '#1e3a5f',      // Navy Blue Brand
          'accent-hover': '#142a45',
          'accent-indigo': '#d4af37', // Gold Secondary
          'accent-indigo-hover': '#b89626',
        },
        brand: {
          50: '#E6FAFF',
          100: '#CCF5FF',
          200: '#99EBFF',
          300: '#66E0FF',
          400: '#33D6FF',
          500: '#00D1FF', // Vivid neon cyan/teal for glowing effects
          600: '#00B8E6', 
          700: '#009ACC',
          800: '#007A99',
          900: '#005C73',
          950: '#003D4D',
        },
        neu: {
          base: '#F8FAFC',
          'base-dark': '#0B0F17',
          primary: '#0F172A',
          muted: '#64748B',
          accent: '#1e3a5f',
          'accent-light': '#325785',
          success: '#10B981',
        }
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'sans-serif'],
        sans: ['"Inter"', '"Plus Jakarta Sans"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      boxShadow: {
        'apple': '0 8px 30px rgba(0, 0, 0, 0.04)',
        'apple-hover': '0 12px 40px rgba(0, 0, 0, 0.08)',
        'apple-lg': '0 30px 60px rgba(0, 0, 0, 0.12)',
        'apple-glass': 'inset 0 0 0 1px rgba(255,255,255,0.4), 0 8px 32px 0 rgba(0, 0, 0, 0.04)',
        'apple-dark': '0 8px 30px rgba(0, 0, 0, 0.4)',
        'apple-dark-hover': '0 12px 40px rgba(0, 0, 0, 0.6)',
        'apple-lg-dark': '0 30px 60px rgba(0, 0, 0, 0.6)',
        'apple-glass-dark': 'inset 0 0 0 1px rgba(255,255,255,0.1), 0 8px 32px 0 rgba(0, 0, 0, 0.4)',
        'glow-brand': '0 0 30px -5px rgba(0, 209, 255, 0.4)',
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
        '4xl': '32px',
        '5xl': '40px',
      },
      keyframes: {
        mesh: {
          '0%, 100%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
        }
      },
      animation: {
        'mesh-slow': 'mesh 15s infinite ease-in-out',
        'mesh-slower': 'mesh 20s infinite ease-in-out reverse',
      }
    },
  },
  plugins: [],
};
