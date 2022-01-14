module.exports = {
  "extends": [
    'lxsmnsyc/typescript/react',
  ],
  "parserOptions": {
    "project": "./tsconfig.eslint.json",
    "tsconfigRootDir": __dirname,
  },
  "rules": {
    "import/no-extraneous-dependencies": [
      "error", {
        "devDependencies": ["**/*.test.tsx"]
      }
    ],
    "react/no-unknown-property": "off",
    "react/destructuring-assignment": "off",
    "react/no-unstable-nested-components": "off",
    "react/prop-types": "off"
  },
};