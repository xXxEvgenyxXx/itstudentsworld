import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import boundaries from "eslint-plugin-boundaries";
import eslintConfigPrettier from "eslint-config-prettier";
import sonarjs from "eslint-plugin-sonarjs";

export default tseslint.config(
  { ignores: ["dist", "node_modules"] },

  js.configs.recommended,
  ...tseslint.configs.recommended,
  reactHooks.configs.flat.recommended,
  reactRefresh.configs.vite,
  eslintConfigPrettier,
  sonarjs.configs.recommended,

  {
    files: ["**/*.{ts,tsx}"],
    plugins: {
      boundaries,
    },
    settings: {
      "boundaries/elements": [
        { type: "app", pattern: "src/app/**/*" },
        { type: "pages", pattern: "src/pages/**/*" },
        { type: "widgets", pattern: "src/widgets/**/*" },
        { type: "features", pattern: "src/features/**/*" },
        { type: "entities", pattern: "src/entities/**/*" },
        { type: "shared", pattern: "src/shared/**/*" },
      ],
    },
    rules: {
      "complexity": ["error", 10],
      
      "boundaries/element-types": [
        "error",
        {
          default: "disallow",
          rules: [
            {
              from: "app",
              allow: ["pages", "widgets", "features", "entities", "shared"],
            },
            {
              from: "pages",
              allow: ["widgets", "features", "entities", "shared"],
            },
            { from: "widgets", allow: ["features", "entities", "shared"] },
            { from: "features", allow: ["entities", "shared"] },
            { from: "entities", allow: ["shared"] },
          ],
        },
      ],
    },
  }
);