/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{tsx, jsx}', './components/**/*.{tsx, jsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
  presets: [require("nativewind/preset")],
}