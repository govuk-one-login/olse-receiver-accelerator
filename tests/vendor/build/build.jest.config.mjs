import { baseJestConfig } from '../../baseJestUnitConfig.mjs'

/**
 * @type {import('ts-jest').JestConfigWithTsJest}
 */
const config = {
  ...baseJestConfig,
  rootDir: '../../../',
  testMatch: [
    `<rootDir>/tests/implementor/build/**/*.spec.ts`,
  ]
}

export default config
