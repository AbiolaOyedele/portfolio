import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import jsxA11y from "eslint-plugin-jsx-a11y";
import eslintConfigPrettier from "eslint-config-prettier";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  // next/core-web-vitals already registers the jsx-a11y plugin, so only the
  // rules from the recommended config are spread here to avoid a duplicate
  // plugin registration error.
  {
    rules: {
      ...jsxA11y.flatConfigs.recommended.rules,
      "@typescript-eslint/no-explicit-any": "error",
      "no-console": ["error", { allow: ["warn", "error"] }],
    },
  },
  eslintConfigPrettier,
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
];

export default eslintConfig;
