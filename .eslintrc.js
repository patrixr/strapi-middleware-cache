module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:jsdoc/recommended',
    'google',
    'prettier',
  ],
  env: {
    node: true,
    jest: true,
  },
  parserOptions: {
    project: './tsconfig.json',
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
    // jsdoc
    'require-jsdoc': 'off',
    'valid-jsdoc': 'off',
    'jsdoc/require-param-description': 'off',
    'jsdoc/require-returns': 'off',
    'jsdoc/require-returns-description': 'off',
    'jsdoc/no-undefined-types': [
      'warn',
      {
        definedTypes: ['never'],
      },
    ],

    // JS requirements
    '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/no-unsafe-call': 'off',
    '@typescript-eslint/no-unsafe-assignment': 'off',
    '@typescript-eslint/no-unsafe-member-access': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',

    // TODO
    '@typescript-eslint/no-unsafe-return': 'off',
    '@typescript-eslint/no-unsafe-argument': 'off',
    '@typescript-eslint/restrict-template-expressions': 'off',
  },
  settings: {
    'import/resolver': {
      typescript: {},
    },
    jsdoc: {
      // mode: 'typescript',
      tagNamePreference: {
        param: 'param',
        returns: 'return',
      },
    },
  },
};
