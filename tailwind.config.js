/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        bgmain: 'var(--color-bg)',
        txtmain: 'var(--color-text)',
      },
      fontFamily: {
        theme: 'var(--font-family)',
      }
    },
  },
  plugins: [],
}
