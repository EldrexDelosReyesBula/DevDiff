import type { Plugin } from "vite";
import { generateChangelog } from "@eldrex/core";
import { execSync } from "child_process";

export interface DevDiffViteOptions {
  enabled?: boolean;
  output?: string;
  dryRun?: boolean;
}

export function devDiffPlugin(options: DevDiffViteOptions = {}): Plugin {
  const { enabled = true, output = "CHANGELOG.md", dryRun = false } = options;

  return {
    name: "vite-plugin-devdiff",

    async closeBundle() {
      if (!enabled) return;

      console.log("\n[devdiff] Building changelog for recent changes...");

      try {
        // Fetch diff of last commit
        const diffText = execSync("git diff HEAD~1", {
          stdio: ["ignore", "pipe", "ignore"],
        }).toString();
        if (!diffText.trim()) {
          console.log("[devdiff] No changes detected since HEAD~1.");
          return;
        }

        const result = await generateChangelog({
          diffText,
          dryRun,
        });

        console.log(
          `[devdiff] Changelog generated:\n${result.formattedOutput.substring(0, 150)}...\n`,
        );
      } catch (err: any) {
        console.warn(`[devdiff] Failed to generate changelog: ${err.message}`);
      }
    },
  };
}

export default devDiffPlugin;
