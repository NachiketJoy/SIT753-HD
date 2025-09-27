// eslint.config.cjs
module.exports = [
    {
      env: {
        node: true,
        es2021: true,
      },
      extends: ['eslint:recommended'],
      parserOptions: {
        ecmaVersion: 12,
        sourceType: 'script', // use 'module' if using ES modules (import/export)
      },
      rules: {
        'no-unused-vars': 'warn',
        'no-console': 'off',
        'semi': ['error', 'always'],
        'quotes': ['error', 'single'],
      },
    },
  ];
  