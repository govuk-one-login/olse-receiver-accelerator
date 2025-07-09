import { baseJestConfig } from '../../baseJestUnitConfig.mjs'

/**
 * @type {import('ts-jest').JestConfigWithTsJest}
 */
const config = {
  ...baseJestConfig,
  verbose: true,
  rootDir: '../../../',
  testMatch: [`<rootDir>/src/**/*.test.ts`],
  collectCoverageFrom: [
    `src/**/*.ts`,
    // Exclude test files from coverage
    `!src/**/*.test.ts`,
    // exclude vendor code
    `!src/vendor/**/*.ts`,
    // exclude jest config files
    '!**/*/jest.config.{ts,mts,mjs}'
  ],
  coverageDirectory: `coverage/implementor`,
  testPathIgnorePatterns: ['<rootDir>/src/vendor/']
}

export default config
