/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx,jsx,js}"],
  theme: {
    extend: {
      screens: {
        print: { raw: "print" },
      },
      colors: {
        transparent: "transparent",
        current: "currentColor",
        gmd: {
          50: "#fbf6eb",
          100: "#f6e8cb",
          200: "#eed19a",
          300: "#e4b160",
          400: "#da9333",
          500: "#cb7e27",
          600: "#af601f",
          700: "#8c451c",
          800: "#75381e",
          900: "#64311f",
          950: "#3a170e",
        },
      },
    },
  },
  plugins: [],
};
