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
          50: '#F0F9FF',   // ultra-light ice blue background
          100: '#E0F2FE',  // light blue badge background
          200: '#BAE6FD',  // subtle light blue border
          300: '#7DD3FC',  // soft sky blue accent
          400: '#38BDF8',  // sky blue highlight
          500: '#0EA5E9',  // vivid sky blue
          600: '#0284C7',  // Primary Brand Accent (Clean Light Blue)
          700: '#0369A1',  // Deep Sky Blue
          800: '#075985',  // Dark Navy Accent
          900: '#0C4A6E',  // Heading Slate Dark
          950: '#082F49',  // Deepest Navy
        },
        sky: {
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
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        subtle: '0 1px 3px 0 rgba(15, 23, 42, 0.04), 0 1px 2px -1px rgba(15, 23, 42, 0.04)',
        card: '0 4px 6px -1px rgba(2, 132, 199, 0.05), 0 2px 4px -2px rgba(2, 132, 199, 0.05)',
        elevated: '0 10px 25px -3px rgba(2, 132, 199, 0.08), 0 4px 6px -4px rgba(2, 132, 199, 0.04)',
      },
    },
  },
  plugins: [],
};

