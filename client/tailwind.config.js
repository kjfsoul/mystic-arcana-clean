/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Lato', 'sans-serif'],
        serif: ['Cinzel', 'serif'],
      },
      colors: {
        mystic: {
          purple: {
            light: '#9f7aea',
            DEFAULT: '#805ad5',
            dark: '#6b46c1',
          },
          blue: {
            light: '#4299e1',
            DEFAULT: '#3182ce',
            dark: '#2c5282',
          },
          indigo: {
            light: '#7f9cf5',
            DEFAULT: '#5a67d8',
            dark: '#434190',
          },
        },
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
