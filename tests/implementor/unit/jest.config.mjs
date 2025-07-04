/**
 * @type {import('ts-jest').JestConfigWithTsJest}
 */
const config = {
  verbose: true,
  rootDir: '../../../',
  testMatch: [`<rootDir>/src/**/*.test.ts`],
  testPathIgnorePatterns: ['<rootDir>/src/vendor/'],
  preset: 'ts-jest/presets/default-esm',
  extensionsToTreatAsEsm: ['.ts'],
  testEnvironment: 'node',
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        useESM: true
      }
    ]
  },
  transformIgnorePatterns: ['node_modules/(?!(jose)/)'],
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
  collectCoverage: true,
  coverageReporters: ['text']
}

export default config
