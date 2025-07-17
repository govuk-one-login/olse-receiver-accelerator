import { baseJestConfig } from '../../baseJestUnitConfig.mjs'

/**
 * @type {import('ts-jest').JestConfigWithTsJest}
 */
const config = {
  ...baseJestConfig,
  verbose: true,
  rootDir: '../../../',
  testMatch: [`<rootDir>/tests/implementor/staging/**/*.spec.ts`]
}

export default config
