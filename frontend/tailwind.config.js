/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#007A33', // Green from Cameroon flag
          light: '#00A644',
          dark: '#005E27',
        },
        secondary: {
          DEFAULT: '#FCD116', // Yellow from Cameroon flag
          light: '#FDE16D',
          dark: '#D4AF00',
        },
        accent: {
          DEFAULT: '#CE1126', // Red from Cameroon flag
          light: '#EF4444',
          dark: '#B91C1C',
        },
        background: '#F8FAFC',
        surface: '#FFFFFF',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'premium': '0 4px 20px -2px rgba(0, 0, 0, 0.05), 0 2px 10px -1px rgba(0, 0, 0, 0.03)',
      }
    },
  },
  plugins: [],
}
