/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        instagram: {
          brown: '#8B4513',
          light: '#DEB887',
          beige: '#F5DEB3',
          cream: '#FAEBD7',
          dark: '#654321',
          accent: '#CD853F'
        }
      }
    },
  },
  plugins: [],
} 