/** @type {import('tailwindcss').Config} */
export default {
  // darkMode: 'class',
  content: [
    "./src/**/*.{html,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gray: {
          50: '#f9f9f9',
          100: '#ececec',
          200: '#e3e3e3',
          300: '#cdcdcd',
          400: '#b4b4b4',
          500: '#9b9b9b',
          600: '#676767',
          700: '#4e4e4e',
          800: '#333',
          850: '#262626',

          900: '#171717',
          950: '#0d0d0d'
        }
      },
      typography: {
        DEFAULT: {
          css: {
            pre: false,
            code: false,
            'pre code': false,
            'code::before': false,
            'code::after': false
          }
        }
      }
    }
  },
  plugins: [require('@tailwindcss/typography', 'tailwind-scrollbar')]
}