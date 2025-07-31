import { baseJestConfig } from '../../baseJestUnitConfig.mjs'

/**
 * @type {import('ts-jest').JestConfigWithTsJest}
 */
const config = {
  ...baseJestConfig,
  rootDir: '../../../',
  testPathIgnorePatterns: ['<rootDir>/tests/'],
  testMatch: [
    `<rootDir>/examples/express-container/**/*.test.ts`,
    `<rootDir>/examples/aws-lambda/**/*.test.ts`,
    `<rootDir>/**/vendor/**/*.test.ts`
  ],
  collectCoverageFrom: [
    `examples/express-container/**/*.ts`,
    `examples/aws-lambda/**/*.ts`,
    `**/vendor/**/*.ts`,
    // Exclude test files from coverage
    `!examples/express-container/**/*.test.ts`,
    `!examples/aws-lambda/**/*.test.ts`,
    `!**/vendor/**/*.test.ts`,
    // Exclude tests directory from coverage
    `!tests/**/*`,
    // exclude jest config files
    '!**/*/jest.config.{ts,mts,mjs}',
    // exclude server.ts
    `!examples/express-container/server.ts`,
    `!examples/aws-lambda/**/handler.ts`
  ],
  coverageDirectory: `coverage/vendor`
}

export default config
