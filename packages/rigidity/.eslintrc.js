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
    "no-param-reassign": "off",
    "no-plusplus": "off",
    "@typescript-eslint/no-unsafe-assignment": "off",
    "react/prop-types": "off",
    "react/destructuring-assignment": "off",
    "react/jsx-props-no-spreading": "off"
  },
};