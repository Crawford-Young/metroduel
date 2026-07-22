import expoConfig from 'eslint-config-expo/flat.js'

export default [
  ...expoConfig,
  {
    ignores: ['dist/*', 'coverage/*', '.expo/*', 'node_modules/*'],
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },
]
