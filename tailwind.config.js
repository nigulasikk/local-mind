/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      animation: {
        bounce200: 'bounce 1s infinite 200ms',
        bounce400: 'bounce 1s infinite 400ms',
      },
      keyframes: {
        bounce: {
          '0%, 100%': { transform: 'scale(0.618)', opacity: 0.5 },
          '50%': { transform: 'scale(1.0)', opacity: 1 },
        },
      },
      minWidth: {
        '250': '250px',
      }
    },
  },
  plugins: [],
}
