import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // Next.js + TypeScript rules
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  // Project ignores
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      // Ignore generated Convex code
      "convex/_generated/**",
      "convex/functions/_generated/**",
    ],
  },
  // Project rules
  {
    rules: {
      // Allow usage of any in early iterations and in Convex functions
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  // Ensure Prettier formatting takes precedence (must be last)
  ...compat.extends("prettier"),
];

export default eslintConfig;
