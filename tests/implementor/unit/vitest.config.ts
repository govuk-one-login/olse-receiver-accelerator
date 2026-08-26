// oxlint-disable sort-keys
import { defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "../../../vitest.config";

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      coverage: {
        include: [`src/**/*.ts`],
        exclude: [
          // Exclude test files from coverage
          `!src/**/*.test.ts`,
          // Exclude vendor code
          `!src/vendor/**/*.ts`,
          // Exclude jest config files
          "!**/*/jest.config.{ts,mts,mjs}",
        ],
      },
      reporters: ["default", "junit"],
      outputFile: "coverage/implementor/junit.xml",
    },
  }),
);
