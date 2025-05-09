/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: "#0f0f1a",
        light: "#f8f9fa",
        gold: "#d4af37",
        primary: {
          900: "#1a1a2e",
          800: "#16213e",
          700: "#0f3460",
          600: "#533483",
          500: "#6831f5",
        },
      },
      fontFamily: {
        heading: ["Cinzel", "serif"],
        body: ["Raleway", "sans-serif"],
      },
    },
  },
  plugins: [],
};
