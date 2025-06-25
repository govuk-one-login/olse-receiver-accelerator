import { JestConfigWithTsJest } from 'ts-jest'

const vendorBasePath = '**/vendor'

const config: JestConfigWithTsJest = {
  verbose: true,
  rootDir: '../../../',
  testMatch: [
    `<rootDir>/src/**/*.test.ts`,
    // exclude vendor tests
    `!<rootDir>/${vendorBasePath}/**/*.test.ts`
  ],
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverageFrom: [
    `src/**/*.ts`,
    // Exclude test files from coverage
    `!src/**/*.test.ts`,
    // exclude vendor code
    `${vendorBasePath}/**/*.ts`,
    `!${vendorBasePath}/**/*.test.ts`,
    // exclude jest config file
    '!**/*/jest.config.ts'
  ],
  coverageDirectory: `coverage/implementor`,
  collectCoverage: true,
  coverageReporters: ['text']
}

export default config
