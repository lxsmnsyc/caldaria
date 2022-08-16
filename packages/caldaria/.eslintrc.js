module.exports = {
  "extends": [
    'lxsmnsyc/typescript/solid',
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
    "import/no-unresolved": "off",
    "no-param-reassign": "off",
    "no-plusplus": "off",
    "@typescript-eslint/no-unsafe-assignment": "off"
  },
};