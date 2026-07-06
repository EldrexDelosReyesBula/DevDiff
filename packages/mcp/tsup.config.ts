import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/server-v2.ts"],
  format: ["cjs", "esm"],
  dts: true,
  clean: true,
  sourcemap: true,
  minify: false,
});
