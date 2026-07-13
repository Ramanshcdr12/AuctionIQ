/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enabled class-based dark mode
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0B0F19',     // Deep space dark background
          card: '#161F30',   // Card background in dark mode
          border: '#243247', // Border color in dark mode
          text: '#F3F4F6'    // Clean text color in dark mode
        },
        primary: {
          50: '#F0F9FF',
          100: '#E0F2FE',
          200: '#BAE6FD',
          300: '#7DD3FC',
          400: '#38BDF8',
          500: '#0EA5E9', // Custom vibrant sky blue
          600: '#0284C7',
          700: '#0369A1',
          800: '#075985',
          900: '#0C4A6E',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
