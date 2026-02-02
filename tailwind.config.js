/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  plugins: [],
   theme: {
    extend: {
      transitionDelay: {
        DEFAULT: '200ms', // default delay
      },
    },
  },
}