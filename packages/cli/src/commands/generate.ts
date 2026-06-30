import * as fs from "fs/promises";
import * as path from "path";
import pc from "picocolors";
import { generateChangelog, ShellSandbox } from "@eldrex/core";

export interface GenerateCmdOptions {
  commitMsgFile?: string;
  range?: string;
  since?: string;
  format?: "markdown" | "json" | "html";
  output?: string;
  dryRun?: boolean;
  persona?: string;
  depth?: string;
}

async function getStagedFiles(): Promise<string[]> {
  try {
    const stdout = await ShellSandbox.exec("git", [
      "diff",
      "--cached",
      "--name-only",
    ]);
    return stdout
      .split("\n")
      .map((f) => f.trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

async function getUnstagedChanges(): Promise<string[]> {
  try {
    const stdout = await ShellSandbox.exec("git", ["diff", "--name-only"]);
    return stdout
      .split("\n")
      .map((f) => f.trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

async function checkForUncommittedChanges(): Promise<boolean> {
  const unstaged = await getUnstagedChanges();
  return unstaged.length > 0;
}

async function getTotalFiles(): Promise<number> {
  try {
    const stdout = await ShellSandbox.exec("git", ["ls-files"]);
    return stdout
      .split("\n")
      .map((f) => f.trim())
      .filter(Boolean).length;
  } catch {
    return 0;
  }
}

async function getLastCommitMessage(): Promise<string> {
  try {
    const stdout = await ShellSandbox.exec("git", ["log", "-1", "--pretty=%s"]);
    return stdout.trim();
  } catch {
    return "unknown";
  }
}

export async function generateCommand(options: GenerateCmdOptions) {
  const repoPath = process.cwd();

  // Check if git repo exists
  let isGitRepo = false;
  try {
    const gitDir = path.join(repoPath, ".git");
    const stat = await fs.stat(gitDir);
    isGitRepo = stat.isDirectory();
  } catch {
    isGitRepo = false;
  }

  if (!isGitRepo) {
    console.log(pc.red("❌ Not a git repository."));
    console.log(
      '   Run: git init && git add . && git commit -m "initial commit"',
    );
    console.log("   Then try: devdiff generate");
    return;
  }

  // Check if there are any commits
  try {
    await ShellSandbox.exec("git", ["rev-parse", "HEAD"]);
  } catch {
    console.log(
      "📭 No commits yet. DevDiff needs at least one commit to generate a changelog.",
    );
    console.log("");
    console.log("   Quick start:");
    console.log("   1. git add .");
    console.log('   2. git commit -m "initial commit"');
    console.log("   3. Make some changes");
    console.log("   4. git add .");
    console.log("   5. devdiff generate");
    console.log("");
    console.log("   Or use devdiff watch to auto-detect changes:");
    console.log("   devdiff watch");
    return;
  }

  const stagedFiles = await getStagedFiles();
  const hasUncommittedChanges = await checkForUncommittedChanges();

  if (stagedFiles.length === 0 && !hasUncommittedChanges) {
    console.log("ℹ️ No changes detected since last commit.");
    console.log("");
    console.log("   DevDiff compares staged changes against your last commit.");
    console.log("");
    console.log("   To see DevDiff in action:");
    console.log("   1. Edit any file (add a comment, change a line)");
    console.log("   2. git add .");
    console.log("   3. devdiff generate");
    console.log("");
    console.log("   Current status:");
    console.log(`   • Files in repo: ${await getTotalFiles()}`);
    console.log(`   • Last commit: ${await getLastCommitMessage()}`);
    console.log(
      `   • Unstaged changes: ${(await getUnstagedChanges()).length} files`,
    );
    console.log(`   • Staged changes: ${stagedFiles.length} files`);
    console.log("");
    console.log('   Tip: Use "devdiff watch" to monitor changes live!');
    return;
  }

  if (stagedFiles.length === 0 && hasUncommittedChanges) {
    console.log("ℹ️ No staged changes detected.");
    console.log("");
    console.log("   DevDiff analyzes staged changes (git add).");
    console.log("   To see changes:");
    console.log("   1. Make changes to your files");
    console.log("   2. git add .");
    console.log("   3. devdiff generate");
    console.log("");
    console.log("   Or use devdiff watch to monitor changes live:");
    console.log("   devdiff watch");
    return;
  }

  // Get diffText
  let diffText = "";
  try {
    const range = options.range || options.since;
    if (range) {
      console.log(pc.blue(`🔍 Fetching diff for range: ${range}...`));
      diffText = await ShellSandbox.exec("git", ["diff", range]);
    } else if (options.commitMsgFile) {
      // Hook mode: analyze staged changes
      diffText = await ShellSandbox.exec("git", ["diff", "--cached"]);
    } else {
      // Default: check staged changes first, then fall back to unstaged changes
      diffText = await ShellSandbox.exec("git", ["diff", "--cached"]);
      if (!diffText.trim()) {
        diffText = await ShellSandbox.exec("git", ["diff"]);
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
