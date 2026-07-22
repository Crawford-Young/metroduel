/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/assets/(.*)$': '<rootDir>/assets/$1',
  },
  collectCoverageFrom: [
    'src/lib/**/*.{ts,tsx}',
    'src/hooks/**/*.{ts,tsx}',
    'src/stores/**/*.{ts,tsx}',
    // Expo template theming hooks — presentation infra, not game logic.
    // Removed when the UI is rebuilt; drop these exclusions then.
    '!src/hooks/use-color-scheme*.ts',
    '!src/hooks/use-theme.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
}
