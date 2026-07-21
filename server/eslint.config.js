import globals from 'globals';

export default [
  { ignores: ['node_modules/**', 'coverage/**'] },
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: { ...globals.node, ...globals.jest },
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_|^(req|res|next)$' }],
      'no-console': 'off',
    },
  },
];
