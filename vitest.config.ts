import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      enabled: true,
      reporter: 'text'
    },
    projects: [
      {
        test: {
          name: 'vendor/unit',
          globals: true,
          include: [
            'examples/express-container/**/*.test.ts',
            'examples/aws-lambda/**/*.test.ts',
            '**/vendor/**/*.test.ts'
          ],
          setupFiles: [],
          exclude: ['**/node_modules/**', '**/.git/**', 'tests/**']
        }
      },
      {
        test: {
          name: 'vendor/build',
          globals: true,
          include: ['tests/vendor/build/**/*.spec.ts'],
          setupFiles: []
        }
      },
      {
        test: {
          name: 'vendor/staging',
          globals: true,
          include: ['tests/vendor/staging/**/*.spec.ts'],
          setupFiles: []
        }
      },
      {
        test: {
          name: 'implementor/unit',
          globals: true,
          include: ['src/**/*.test.ts'],
          setupFiles: [],
          exclude: ['**/node_modules/**', '**/.git/**', 'src/vendor/**']
        }
      }
    ]
  }
})
