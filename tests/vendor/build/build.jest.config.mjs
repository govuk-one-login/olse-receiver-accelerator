import { baseJestConfig } from '../../baseJestUnitConfig.mjs'

/**
 * @type {import('ts-jest').JestConfigWithTsJest}
 */
const config = {
  ...baseJestConfig,
  rootDir: '../../../',
  testMatch: [
    `<rootDir>/tests/vendor/build/**/*.spec.ts`,
  ],
  testPathIgnorePatterns: []
}

export default config
