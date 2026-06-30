import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from '../../../vitest.config'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      coverage: {
        include: [
          `examples/express-container/**/*.ts`,
          `examples/aws-lambda/**/*.ts`,
          `**/vendor/**/*.ts`
        ],
        exclude: [
          // Exclude test files from coverage
          `examples/express-container/**/*.test.ts`,
          `examples/aws-lambda/**/*.test.ts`,
          `**/vendor/**/*.test.ts`,
          // Exclude tests directory from coverage
          `tests/**/*`,
          // exclude jest config files
          '**/*/jest.config.{ts,mts,mjs}',
          // exclude server.ts
          `examples/express-container/server.ts`,
          `examples/aws-lambda/**/handler.ts`
        ]
      },
      reporters: ['default', 'junit'],
      outputFile: 'coverage/vendor/junit.xml'
    }
  })
)
