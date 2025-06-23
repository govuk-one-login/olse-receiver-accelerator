import { JestConfigWithTsJest } from 'ts-jest'

const config: JestConfigWithTsJest = {
  verbose: true,
  rootDir: '../../',
  testMatch: ['<rootDir>/src/**/*.test.ts'],
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverageFrom: [
    'src/**/*.ts',
    // Exclude test files from coverage
    '!src/**/*.test.ts'
  ],
  coverageDirectory: 'coverage',
  collectCoverage: true,
  coverageReporters: ['text']
}

export default config
