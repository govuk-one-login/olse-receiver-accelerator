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
    "@typescript-eslint/consistent-type-imports": [
      "error",
      {
        fixStyle: "inline-type-imports",
        prefer: "type-imports",
      },
    ],
    "import/no-default-export": "off",
    "import/no-named-export": "off",
    "import/no-namespace": "off",
    "import/no-nodejs-modules": "off",
    "import/no-relative-parent-imports": "off",
    "max-statements": "off",
    "no-ternary": "off",
    "no-void": "off",
    "node/no-process-env": "off",
    "node/no-sync": "off",
    "object-shorthand": "off",
    "one-var": "off",
    "oxc/no-async-await": "off",
    "oxc/no-optional-chaining": "off",
    "oxc/no-rest-spread-properties": "off",
    "prefer-destructuring": "off",
    "promise/prefer-await-to-then": "off",
    "typescript/dot-notation": "off",
    "typescript/no-unnecessary-type-assertion": "off",
    "typescript/no-unsafe-type-assertion": "off",
    "unicorn/filename-case": "off",
    "unicorn/import-style": "off",
    "unicorn/max-nested-calls": "off",
    "vitest/no-hooks": "off",
    "vitest/prefer-describe-function-title": "off",
    "vitest/prefer-expect-assertions": "off",
    "vitest/prefer-importing-vitest-globals": "off",
    "vitest/prefer-strict-equal": "off",
    "vitest/prefer-to-be-truthy": "off",
    "vitest/require-hook": "off",
    "vitest/require-test-timeout": "off",
    "vitest/require-to-throw-message": "off",
  },
});
