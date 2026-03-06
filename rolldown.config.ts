import { defineConfig } from "rolldown";

export default defineConfig([
  {
    input: "src/index.ts",
    output: {
      file: "lib/index.js",
      format: "esm",
      comments: false,
    },
    platform: "node",
  },
  {
    input: "src/cleanup.ts",
    output: {
      file: "lib/cleanup.js",
      format: "esm",
      comments: false,
    },
    platform: "node",
  },
]);
