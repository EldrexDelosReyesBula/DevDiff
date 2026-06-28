import * as fs from "fs/promises";
import * as path from "path";
import pc from "picocolors";
import chokidar from "chokidar";
import { execSync } from "child_process";
import { diffParser } from "@eldrex/core";

export async function watchCommand() {
  console.log(pc.blue("👀 Starting DevDiff Repository Watcher..."));

  // 1. Resolve Git repository root
  let gitDir = "";
  try {
    const gitRoot = execSync("git rev-parse --show-toplevel", {
      stdio: ["ignore", "pipe", "ignore"],
    })
      .toString()
      .trim();
    gitDir = path.resolve(gitRoot, ".git");
  } catch {
    console.error(
      pc.red("Error: Not a Git repository. Cannot watch for changes."),
    );
    process.exit(1);
  }

  const indexPath = path.resolve(gitDir, "index");
  console.log(pc.cyan(`Watching git index for staged changes...`));
  console.log(pc.gray("Press Ctrl+C to stop watching.\n"));

  let lastDiff = "";

  const checkChanges = () => {
    try {
      const diffText = execSync("git diff --cached", {
        stdio: ["ignore", "pipe", "ignore"],
      })
        .toString()
        .trim();
      if (diffText === lastDiff) return;

      lastDiff = diffText;

      if (!diffText) {
        console.log(
          pc.gray(
            `[${new Date().toLocaleTimeString()}] No changes currently staged.`,
          ),
        );
        return;
      }

      const parsed = diffParser.parse(diffText);
      console.log(
        pc.bold(
          pc.green(
            `\n⚡ [${new Date().toLocaleTimeString()}] Detected Staged Changes:`,
          ),
        ),
      );

      for (const file of parsed.files) {
        let status = pc.yellow("modified");
        if (file.isNew) status = pc.green("created");
        if (file.isDeleted) status = pc.red("deleted");

        console.log(`  - ${pc.cyan(file.newPath || file.oldPath)} [${status}]`);
      }

      console.log(
        pc.gray("Run `devdiff generate` to get full AI explanations."),
      );
    } catch (err: any) {
      console.warn("Failed to parse active changes:", err.message);
    }
  };

  // Initial check
  checkChanges();

  // Watch .git/index
  const watcher = chokidar.watch(indexPath, {
    persistent: true,
    ignoreInitial: true,
  });

  watcher.on("change", () => {
    // Add small delay to allow git to finish writing index
    setTimeout(checkChanges, 300);
  });

  // Handle termination
  process.on("SIGINT", () => {
    watcher.close();
    console.log(pc.blue("\n👋 Stopped repository watcher."));
    process.exit(0);
  });
}
