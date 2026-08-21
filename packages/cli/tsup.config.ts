import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  outExtension() {
    return {
      js: ".js",
    };
  },
  clean: true,
  sourcemap: false,
  minify: true,
  banner: {
    js: "#!/usr/bin/env node",
  },
});
