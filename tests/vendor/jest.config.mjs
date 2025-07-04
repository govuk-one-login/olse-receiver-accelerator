/**
 * @type {import('ts-jest').JestConfigWithTsJest}
 */
const config = {
  verbose: true,
  rootDir: '../../',
  testMatch: [
    `<rootDir>/examples/express-container/**/*.test.ts`,
    `<rootDir>/**/vendor/**/*.test.ts`
  ],
  preset: 'ts-jest/presets/default-esm',
  extensionsToTreatAsEsm: ['.ts'],
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/tests/vendor/setup.mjs'],
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        useESM: true
      }
    ],
    '^.+\\.js$': [
      'ts-jest',
      {
        useESM: true
      }
    ]
  },
  transformIgnorePatterns: ['node_modules/(?!jose)'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1'
  },
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
  coverageDirectory: `coverage/vendor`,
  collectCoverage: true,
  coverageReporters: ['text']
}

export default config
