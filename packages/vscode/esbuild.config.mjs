import { build } from "esbuild";
import { readFileSync, existsSync } from "fs";

let pkg = {};
try {
  pkg = JSON.parse(readFileSync("./package.json", "utf-8"));
} catch {
  pkg = {};
}

// VS Code API is ALWAYS external (provided by the host editor)
const externals = ["vscode"];

const isWatch = process.argv.includes("--watch");

const buildOptions = {
  entryPoints: ["src/extension.ts"],
  bundle: true,
  outfile: "dist/extension.js",
  format: "cjs",
  platform: "node",
  target: "node20",
  external: externals,
  minify: false,
  sourcemap: true,
  treeShaking: true,
  resolveExtensions: [".ts", ".js", ".json"],
  define: {
    "process.env.NODE_ENV": '"production"',
  },
  metafile: true,
};

if (isWatch) {
  const ctx = await import("esbuild").then((m) => m.context(buildOptions));
  await ctx.watch();
  console.log("👀 Watching for changes...");
} else {
  build(buildOptions)
    .then((result) => {
      console.log("✅ Build complete");
      const outputs = Object.entries(result.metafile?.outputs || {});
      for (const [file, info] of outputs) {
        console.log(`   ${file}: ${(info.bytes / 1024).toFixed(1)}KB`);
      }
    })
    .catch((err) => {
      console.error("❌ Build failed:", err);
      process.exit(1);
    });
}
