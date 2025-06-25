import { JestConfigWithTsJest } from 'ts-jest'

const containerBasePath = 'examples/express-container'

const config: JestConfigWithTsJest = {
  verbose: true,
  rootDir: '../../../',
  testMatch: [`<rootDir>/${containerBasePath}/**/*.test.ts`],
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverageFrom: [
    `${containerBasePath}/**/*.ts`,
    // Exclude test files from coverage
    `!${containerBasePath}/**/*.test.ts`
  ],
  coverageDirectory: `coverage/${containerBasePath}`,
  collectCoverage: true,
  coverageReporters: ['text']
}

export default config
