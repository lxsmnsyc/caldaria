module.exports = {
  mode: 'jit',
  content: [
    './src/**/*.tsx',
    './src/**/*.mdx',
  ],
  darkMode: 'class', // or 'media' or 'class'
  theme: {
    extend: {
    },
  },
  variants: {},
  plugins: [
    require('@tailwindcss/typography')
  ],
};
