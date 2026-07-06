import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/registry.ts"],
  format: ["cjs", "esm"],
  dts: true,
  clean: true,
  sourcemap: true,
  minify: false,
});
