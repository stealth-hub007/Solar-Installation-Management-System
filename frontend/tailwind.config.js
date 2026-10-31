/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Light Blue & White Enterprise Theme
        brand: {
          50: '#F0F7FF',
          100: '#E0F2FE',
          200: '#BAE6FD',
          300: '#7DD3FC',
          400: '#38BDF8',
          500: '#0EA5E9',
          600: '#0284C7', // Primary Accent
          700: '#0369A1',
          800: '#075985',
          900: '#0C4A6E',
          950: '#082F49',
        },
        sky: {
          DEFAULT: '#0284C7',
          50: '#F0F9FF',
          100: '#E0F2FE',
          200: '#BAE6FD',
          300: '#7DD3FC',
          400: '#38BDF8',
          500: '#0EA5E9',
          600: '#0284C7',
          700: '#0369A1',
          800: '#075985',
          900: '#0C4A6E',
        },
        sims: {
          bg: '#F8FAFC',       // Clean, soft ice-blue/slate background
          card: '#FFFFFF',     // Pure white cards
          border: '#E2E8F0',   // Subtle border
          dark: '#0F172A',     // Primary Slate Dark Text
          muted: '#64748B',    // Secondary Muted Text
          accent: '#0284C7',   // Primary Blue Accent
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        subtle: '0 1px 3px 0 rgba(15, 23, 42, 0.04), 0 1px 2px -1px rgba(15, 23, 42, 0.04)',
        card: '0 2px 8px -2px rgba(2, 132, 199, 0.06), 0 2px 4px -2px rgba(15, 23, 42, 0.03)',
        elevated: '0 10px 25px -5px rgba(2, 132, 199, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.04)',
      },
    },
  },
  plugins: [],
};
