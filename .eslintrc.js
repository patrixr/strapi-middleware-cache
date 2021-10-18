module.exports = {
  parser: '@typescript-eslint/parser',
  extends: ['eslint:recommended', 'google', 'prettier'],
  env: {
    node: true,
    jest: true,
  },
  parserOptions: {
    ecmaFeatures: {
      experimentalObjectRestSpread: true,
      impliedStrict: true,
    },
    sourceType: 'module',
  },
  globals: {
    strapi: true,
  },
  rules: {
    indent: ['error', 2, { SwitchCase: 1 }],
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
  },
};
