import js from "@eslint/js";
import globals from "globals";

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
      },
    },
    rules: {
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    },
  },
  {
    ignores: [
      "node_modules/**",
      "**/node_modules/**",
      "build/**",
      "**/build/**",
      ".cache/**",
      "public/build/**",
      ".wrangler/**",
      "**/*.config.js",
      "**/*.config.ts",
      "studio/dist/**",
      "**/dist/**",
    ],
  },
];
