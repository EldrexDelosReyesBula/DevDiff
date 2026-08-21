import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/extension.ts"],
  format: ["cjs"],
  external: ["vscode"],
  clean: true,
  sourcemap: false,
  minify: true,
  treeshake: true,
});
