import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      enabled: true,
      reporter: "text",
    },
    projects: [
      {
        test: {
          exclude: ["**/node_modules/**", "**/.git/**", "tests/**"],
          globals: true,
          include: [
            "examples/express-container/**/*.test.ts",
            "examples/aws-lambda/**/*.test.ts",
            "**/vendor/**/*.test.ts",
          ],
          name: "vendor/unit",
          setupFiles: [],
        },
      },
      {
        test: {
          globals: true,
          include: ["tests/vendor/build/**/*.spec.ts"],
          name: "vendor/build",
          setupFiles: [],
        },
      },
      {
        test: {
          globals: true,
          include: ["tests/vendor/staging/**/*.spec.ts"],
          name: "vendor/staging",
          setupFiles: [],
        },
      },
      {
        test: {
          exclude: ["**/node_modules/**", "**/.git/**", "src/vendor/**"],
          globals: true,
          include: ["src/**/*.test.ts"],
          name: "implementor/unit",
          setupFiles: [],
        },
      },
    ],
  },
});
