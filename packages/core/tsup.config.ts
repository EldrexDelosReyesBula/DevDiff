import { defineConfig } from "tsup";

export default defineConfig((options) => ({
  entry: ["src/index.ts"],
  format: ["cjs", "esm"],
  dts: true,
  clean: !options.watch,
  sourcemap: false,
  minify: true,
  treeshake: true,
  shims: true,
}));
