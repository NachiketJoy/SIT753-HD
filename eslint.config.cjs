module.exports = {
    env: { node: true, es2021: true, jest: true, node: true},
    extends: ["eslint:recommended"],
    parserOptions: { ecmaVersion: 12, sourceType: "script" },
    rules: {
      "no-unused-vars": "warn",
      "no-console": "off",
      "semi": ["error","always"],
      "quotes": ["error","single"]
    }
  };
  