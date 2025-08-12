import js from "@eslint/js";
import prettier from "eslint-plugin-prettier/recommended";
import ts from "typescript-eslint";

export default ts.config(
  { ignores: ["lib/"] },
  js.configs.recommended,
  ts.configs.recommended,
  prettier,
);
