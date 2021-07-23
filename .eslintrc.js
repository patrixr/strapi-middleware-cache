module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
    'google',
    'prettier',
  ],
  env: {
    commonjs: true,
    es6: true,
    node: true,
    browser: true,
    jest: true,
  },
  parserOptions: {
    ecmaFeatures: {
      experimentalObjectRestSpread: true,
      jsx: true,
      impliedStrict: true,
    },
    sourceType: 'module',
  },
  globals: {
    strapi: true,
  },
  rules: {
    indent: ['error', 2, { SwitchCase: 1 }],
    'no-console':
      process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger':
      process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'object-curly-spacing': 'off',
    'valid-jsdoc': 'off',
    'require-jsdoc': 'off',
  },
};
