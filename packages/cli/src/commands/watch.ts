import * as fs from "fs/promises";
import * as path from "path";
import pc from "picocolors";
import { ShellSandbox, generateChangelog } from "@eldrex/core";

export interface WatchOptions {
  persona?: string;
  format?: "markdown" | "json" | "html";
}

async function getStagedFiles(): Promise<
  Array<{ path: string; status: string }>
> {
  try {
    const stdout = await ShellSandbox.exec("git", ["status", "--porcelain"]);
    return stdout
      .split("\n")
      .map((line) => {
        const trimmed = line.trim();
        if (!trimmed) return null;
        const status = trimmed.slice(0, 2);
        const filePath = trimmed.slice(3).trim();

        let statusName = "modified";
        if (status.includes("A")) statusName = "created";
        if (status.includes("D")) statusName = "deleted";

        if (
          status.startsWith("M") ||
          status.startsWith("A") ||
          status.startsWith("D")
        ) {
          return { path: filePath, status: statusName };
        }
        return null;
      })
      .filter((item): item is { path: string; status: string } => !!item);
  } catch {
    return [];
  }
}

function hashFiles(files: Array<{ path: string; status: string }>): string {
  return files
    .map((f) => `${f.path}:${f.status}`)
    .sort()
    .join(",");
}

async function runPrerequisiteChecks() {
  const results = [];

  // Check git
  try {
    await ShellSandbox.exec("git", ["--version"]);
    results.push({ name: "git", passed: true, message: "Git available" });
  } catch {
    results.push({ name: "git", passed: false, message: "Git not found" });
  }

  // Check Ollama
  try {
    const response = await fetch("http://localhost:11434/api/tags", {
      signal: AbortSignal.timeout(3000),
    });
    results.push({
      name: "ollama",
      passed: response.ok,
      message: response.ok ? "Ollama running" : "Ollama not responding",
    });
  } catch {
    results.push({
      name: "ollama",
      passed: false,
      message: "Ollama not running",
    });
  }

  // Check cloud AI
  const hasCloudKey =
    process.env.OPENAI_API_KEY ||
    process.env.ANTHROPIC_API_KEY ||
    process.env.GEMINI_API_KEY;
  results.push({
    name: "cloud",
    passed: !!hasCloudKey,
    message: hasCloudKey ? "Cloud AI configured" : "No cloud AI keys found",
  });

  return {
    allPassed: results.every((r) => r.passed),
    ollamaAvailable: results.find((r) => r.name === "ollama")?.passed || false,
    cloudAvailable: results.find((r) => r.name === "cloud")?.passed || false,
    results,
  };
}

export async function watchCommand(options: WatchOptions) {
  console.log(pc.blue("👀 Starting DevDiff Repository Watcher..."));
  console.log(pc.cyan("Watching git index for staged changes..."));
  console.log(pc.gray("Press Ctrl+C to stop watching."));
  console.log("");

  // Check prerequisites
  const checks = await runPrerequisiteChecks();
  if (!checks.allPassed) {
    console.log(pc.yellow("⚠️ Some features may not work:"));
    for (const check of checks.results) {
      if (!check.passed) {
        console.log(`   • ${check.message}`);
      }
    }
    console.log("");
  }

  let lastStagedHash = "";

  // Watch loop
  const interval = setInterval(async () => {
    try {
      const stagedFiles = await getStagedFiles();

      if (stagedFiles.length === 0) return;

      const currentHash = hashFiles(stagedFiles);
      if (currentHash === lastStagedHash) return;

      lastStagedHash = currentHash;

      console.log(
        pc.bold(
          pc.green(
            `\n⚡ [${new Date().toLocaleTimeString()}] Detected Staged Changes:`,
          ),
        ),
      );
      for (const file of stagedFiles.slice(0, 10)) {
        console.log(`  - ${file.path} [${file.status}]`);
      }
      if (stagedFiles.length > 10) {
        console.log(`  ... and ${stagedFiles.length - 10} more files`);
      }

      // Check if AI is available
      if (!checks.ollamaAvailable && !checks.cloudAvailable) {
        console.log(
          pc.yellow(
            "\n⚠️ No AI provider available. Changes detected but cannot generate explanations.",
          ),
        );
        console.log("   Run: devdiff generate --dry-run  (for plain diff)");
        console.log("   Or install Ollama: https://ollama.com/download");
        console.log("");
        return;
      }

      console.log("🤖 Generating explanation...");

      try {
        const diffText = await ShellSandbox.exec("git", ["diff", "--cached"]);
        const result = await generateChangelog({
          diffText,
          repoPath: process.cwd(),
          format: options.format || "markdown",
        });

        console.log(pc.cyan("\n📝 Changelog generated:"));
        console.log(result.formattedOutput);
        console.log("");
      } catch (aiError: any) {
        console.log(
          pc.red("\n⚠️ AI processing failed, but your changes are SAFE."),
        );
        console.log(`   Error: ${aiError.message}`);
        console.log("");
        console.log("   Options:");
        console.log("   • Fix AI and it will retry on next change");
        console.log("   • Run: devdiff generate --dry-run  (no AI needed)");
        console.log("   • Run: devdiff generate  (retry with AI)");
        console.log("");
        console.log("   DevDiff continues watching...");
      }
    } catch (error: any) {
      console.log(pc.yellow(`⚠️ Watcher error (will retry): ${error.message}`));
    }
  }, 2000); // Check every 2 seconds

  // Graceful shutdown
  process.on("SIGINT", () => {
    clearInterval(interval);
    console.log(pc.blue("\n👋 Stopped repository watcher."));
    process.exit(0);
  });
}
