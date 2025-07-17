import { baseJestConfig } from '../../baseJestUnitConfig.mjs'

/**
 * @type {import('ts-jest').JestConfigWithTsJest}
 */
const config = {
  ...baseJestConfig,
  rootDir: '../../../',
  testMatch: [
    `<rootDir>/examples/express-container/**/*.test.ts`,
    `<rootDir>/**/vendor/**/*.test.ts`
  ],
  collectCoverageFrom: [
    `examples/express-container/**/*.ts`,
    `**/vendor/**/*.ts`,
    // Exclude test files from coverage
    `!examples/express-container/**/*.test.ts`,
    `!**/vendor/**/*.test.ts`,
    // exclude jest config files
    '!**/*/jest.config.{ts,mts,mjs}',
    // exclude server.ts
    `!examples/express-container/server.ts`
  ],
  coverageDirectory: `coverage/vendor`
}

export default config
