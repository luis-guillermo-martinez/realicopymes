/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#1B2A4B',
          dark: '#1A1C2E',
          light: '#2A3F6B',
        },
        dorado: {
          DEFAULT: '#C9B24A',
          claro: '#E6B661',
          oscuro: '#A89430',
        },
        crema: '#F4F1E6',
        papel: '#F1E8C9',
        oliva: {
          DEFAULT: '#4A7C59',
          dark: '#3A6247',
        },
      },
      fontFamily: {
        display: ['"Bebas Neue"', 'sans-serif'],
        body: ['"Barlow"', 'sans-serif'],
        label: ['"Barlow Semi Condensed"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}