import * as fs from "fs/promises";
import * as path from "path";
import pc from "picocolors";
import { execSync } from "child_process";
import { generateChangelog } from "@eldrex/core";

export interface GenerateCmdOptions {
  commitMsgFile?: string;
  range?: string;
  format?: "markdown" | "json" | "html";
  output?: string;
  dryRun?: boolean;
}

export async function generateCommand(options: GenerateCmdOptions) {
  let diffText = "";
  const repoPath = process.cwd();

  try {
    if (options.range) {
      console.log(pc.blue(`🔍 Fetching diff for range: ${options.range}...`));
      diffText = execSync(`git diff ${options.range}`, {
        stdio: ["ignore", "pipe", "ignore"],
      }).toString();
    } else if (options.commitMsgFile) {
      // Hook mode: analyze staged changes
      diffText = execSync("git diff --cached", {
        stdio: ["ignore", "pipe", "ignore"],
      }).toString();
    } else {
      // Default: check staged changes first, then fall back to unstaged changes
      diffText = execSync("git diff --cached", {
        stdio: ["ignore", "pipe", "ignore"],
      }).toString();
      if (!diffText.trim()) {
        diffText = execSync("git diff", {
          stdio: ["ignore", "pipe", "ignore"],
        }).toString();
      }
    }
  } catch (error) {
    console.error(
      pc.red(
        "Error: Failed to execute Git commands. Ensure you are in a Git repository.",
      ),
    );
    process.exit(1);
  }

  if (!diffText.trim()) {
    console.log(pc.yellow("ℹ️ No changes detected to explain."));
    return;
  }

  try {
    const spinner = createSpinner("Generating changelog...");
    spinner.start();

    const result = await generateChangelog({
      diffText,
      repoPath,
      dryRun: options.dryRun,
      format: options.format,
    });

    spinner.stop();

    if (options.commitMsgFile) {
      // Git Hook mode: prepend or append the explanation to the commit message
      const commitMsgPath = path.resolve(repoPath, options.commitMsgFile);
      let originalMsg = "";
      try {
        originalMsg = await fs.readFile(commitMsgPath, "utf-8");
      } catch {}

      // Keep original message, append the explanation at the end under a git comment block
      const commentBlock = `\n\n# --- DevDiff AI Changelog Explanation ---\n# The section below contains AI-generated details.\n# Feel free to edit or remove it.\n\n${result.formattedOutput.replace(/^/gm, "# ")}`;

      await fs.writeFile(commitMsgPath, originalMsg + commentBlock, "utf-8");
      console.log(pc.green(`✅ AI explanation appended to commit message.`));
    } else if (options.output) {
      const outPath = path.resolve(repoPath, options.output);
      await fs.mkdir(path.dirname(outPath), { recursive: true });
      await fs.writeFile(outPath, result.formattedOutput, "utf-8");
      console.log(pc.green(`✅ Changelog written to: ${outPath}`));
    } else {
      // Print to stdout
      console.log(pc.cyan("\n--- DevDiff Output ---"));
      console.log(result.formattedOutput);
      console.log(pc.cyan("----------------------"));
    }
  } catch (error: any) {
    console.error(pc.red(`\n❌ Error generating changelog: ${error.message}`));
    process.exit(1);
  }
}

// Simple text spinner helper
function createSpinner(text: string) {
  const frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
  let idx = 0;
  let intervalId: NodeJS.Timeout | null = null;

  return {
    start() {
      process.stdout.write(`${frames[idx]} ${text}`);
      intervalId = setInterval(() => {
        idx = (idx + 1) % frames.length;
        process.stdout.write(`\r${frames[idx]} ${text}`);
      }, 80);
    },
    stop() {
      if (intervalId) {
        clearInterval(intervalId);
      }
      process.stdout.write("\r\x1b[K"); // Clear line
    },
  };
}
