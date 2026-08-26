import { defineConfig } from "oxlint";

export default defineConfig({
  $schema: "./node_modules/oxlint/configuration_schema.json",
  categories: {
    correctness: "error",
    perf: "error",
    // These 3 rules may generate conflicts when running linting, if you are, try and comment these rules out
    restriction: "error", // Warning, if you are migrating an old project, consider if this is appropriate.
    style: "error", // Warning, if you are migrating an old project, consider if this is appropriate.
    suspicious: "error", // Warning, if you are migrating an old project, consider if this is appropriate.
  },
  env: {
    builtin: true,
  },
  options: {
    typeAware: true,
    typeCheck: true,
  },
  overrides: [],
  plugins: ["eslint", "typescript", "unicorn", "oxc", "vitest", "import", "node", "promise"],
  rules: {
    "import/no-relative-parent-imports": "off",
    "node/no-process-env": "off",
    "oxc/no-async-await": "off",
    "typescript/no-unsafe-type-assertion": "off",
    "vitest/require-to-throw-message": "off"
  },
});
