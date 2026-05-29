import { FlatCompat } from "@eslint/eslintrc";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const compat = new FlatCompat({ baseDirectory: __dirname });

export default [
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "dist/**",
      "data/audit/snapshots/**",
      ".vercel/**",
    ],
  },
  ...compat.extends("next/core-web-vitals"),
  {
    rules: {
      // β版段階のコード品質を許容する緩和ルール
      "@next/next/no-html-link-for-pages": "off",
    },
  },
];
