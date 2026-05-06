/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: '#B8973A',
        cream: '#fafaf8',
        ink: '#1a1a1a',
      },
      fontFamily: {
        serif: ['Georgia', 'Times New Roman', 'serif'],
        sans: ['Inter', 'PingFang SC', 'Noto Sans SC', 'sans-serif'],
      },
      letterSpacing: {
        'widest2': '0.2em',
        'widest3': '0.3em',
      }
    },
  },
  plugins: [],
}
