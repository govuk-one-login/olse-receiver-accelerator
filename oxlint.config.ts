import { defineConfig } from "oxlint";

export default defineConfig({
  $schema: "./node_modules/oxlint/configuration_schema.json",
  categories: {
    correctness: "error",
    perf: "error",
    // These 3 rules may generate conflicts when running linting, if you are, try and comment these rules out
    restriction: "off", // Warning, if you are migrating an old project, consider if this is appropriate.
    style: "off", // Warning, if you are migrating an old project, consider if this is appropriate.
    suspicious: "off", // Warning, if you are migrating an old project, consider if this is appropriate.
  },
  env: {
    builtin: true,
  },
  ignorePatterns: ["*.test.ts"],
  options: {
    typeAware: true,
    typeCheck: true,
  },
  overrides: [],
  plugins: ["eslint", "typescript", "unicorn", "oxc", "vitest", "import", "node", "promise"],
  rules: {
    "@typescript-eslint/consistent-type-imports": [
      "error",
      {
        fixStyle: "inline-type-imports",
        prefer: "type-imports",
      },
    ],
  },
});
