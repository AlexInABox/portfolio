/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        pb_border: "#413480",
      },
    },
    fontFamily: {
        alex: ["alex-handwriting", "sans-serif"],
    },
  },
  plugins: [],
};
