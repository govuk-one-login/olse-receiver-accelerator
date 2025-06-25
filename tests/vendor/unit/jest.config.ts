import { JestConfigWithTsJest } from 'ts-jest'

const containerBasePath = 'examples/express-container'
const vendorBasePath = '**/vendor'

const config: JestConfigWithTsJest = {
  verbose: true,
  rootDir: '../../../',
  testMatch: [
    `<rootDir>/${containerBasePath}/**/*.test.ts`,
    `<rootDir>/${vendorBasePath}/**/*.test.ts`
  ],
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverageFrom: [
    `${containerBasePath}/**/*.ts`,
    `${vendorBasePath}/**/*.ts`,
    // Exclude test files from coverage
    `!${containerBasePath}/**/*.test.ts`,
    `!${vendorBasePath}/**/*.test.ts`,
    '!**/*/jest.config.ts'
  ],
  coverageDirectory: `coverage/vendor`,
  collectCoverage: true,
  coverageReporters: ['text']
}

export default config
