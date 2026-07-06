import * as fs from "fs/promises";
import * as path from "path";
import pc from "picocolors";
import {
  generateChangelog,
  ShellSandbox,
  diffParser,
  ChunkingEngine,
  reconstructDiffForFiles,
  TemplateFallbackGenerator,
  MVPStorage,
  formatMarkdown,
  formatJSON,
  formatHTML,
  ProgressiveChunking,
  OllamaModelDiscovery,
} from "@eldrex/core";
import type {
  ChunkStrategy,
  MVPEntry,
  AIExplanationResult,
} from "@eldrex/core";

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

  // ── PHASE 1: Analyze diff size ──
  const parsedDiff = diffParser.parse(diffText);
  const chunkStrategy = ChunkingEngine.analyze(parsedDiff, 32000); // 32K context

  console.log(pc.blue(`📊 Analyzing ${parsedDiff.files.length} file(s)...`));

  if (chunkStrategy.strategy !== "single") {
    console.log(pc.yellow(`   Strategy: ${chunkStrategy.strategy}`));
    console.log(pc.yellow(`   Chunks: ${chunkStrategy.chunks.length}`));
    console.log(
      pc.yellow(`   Estimated time: ~${chunkStrategy.estimatedTime}s`),
    );
    console.log(pc.yellow(`   ${chunkStrategy.recommendation}`));
    console.log("");
  }

  // ── PHASE 2: Try AI generation ──
  let aiSucceeded = false;
  let changelog = "";

  try {
    if (options.dryRun) {
      const result = await generateChangelog({
        diffText,
        repoPath,
        dryRun: true,
        format: options.format,
        persona: options.persona,
      });
      changelog = result.formattedOutput;
      aiSucceeded = true;
    } else if (chunkStrategy.strategy === "single") {
      const spinner = createSpinner("Generating changelog...");
      spinner.start();
      const result = await generateChangelog({
        diffText,
        repoPath,
        format: options.format,
        persona: options.persona,
      });
      spinner.stop();
      changelog = result.formattedOutput;
      aiSucceeded = true;
    } else {
      // Get active model size & history
      let modelSize = "7b";
      try {
        const installedModels = await OllamaModelDiscovery.discoverModels();
        const active = OllamaModelDiscovery.selectBestModel(installedModels);
        if (active) {
          const sizeMatch =
            active.name.match(/:(\d+)b/i) || active.name.match(/:(\d+)m/i);
          if (sizeMatch) {
            modelSize = `${sizeMatch[1]}b`;
          }
        }
      } catch {}

      // Use progressive chunking strategy
      const results = await ProgressiveChunking.processWithFallback(
        parsedDiff,
        modelSize,
        undefined,
        async (chunk, timeoutMs) => {
          const chunkDiffText = reconstructDiffForFiles(chunk.files);
          const result = await generateChangelog({
            diffText: chunkDiffText,
            repoPath,
            dryRun: options.dryRun,
            format: "json",
            persona: options.persona,
            skipVerification: true,
            timeoutMs,
          });
          return result.rawResult;
        },
        (stage, progress) => {
          console.log(`   [${progress}%] ${stage}`);
        },
      );

      const merged = mergeChunkResults(
        results,
        options.format || "markdown",
        options.persona,
      );
      changelog = merged.formattedOutput;
      aiSucceeded = true;
    }
  } catch (error: any) {
    console.log("");
    console.log(pc.red("⚠️ AI generation failed. Using template fallback..."));
    console.log(pc.red(`   Error: ${error.message}`));
    console.log("");

    // ALWAYS fall back to template
    let projectContext: any = null;
    try {
      const deepContextPath = path.join(
        repoPath,
        ".devdiff/context/deep-context.json",
      );
      const rawDeep = await fs.readFile(deepContextPath, "utf-8");
      projectContext = JSON.parse(rawDeep);
    } catch {}

    changelog = TemplateFallbackGenerator.generate(parsedDiff, projectContext);
  }

  // ── PHASE 3: Output ──
  if (options.commitMsgFile) {
    const commitMsgPath = path.resolve(repoPath, options.commitMsgFile);
    let originalMsg = "";
    try {
      originalMsg = await fs.readFile(commitMsgPath, "utf-8");
    } catch {}

    // Keep original message, append the explanation at the end under a git comment block
    const commentBlock = `\n\n# --- DevDiff AI Changelog Explanation ---\n# The section below contains AI-generated details.\n# Feel free to edit or remove it.\n\n${changelog.replace(/^/gm, "# ")}`;

    await fs.writeFile(commitMsgPath, originalMsg + commentBlock, "utf-8");
    console.log(pc.green(`✅ AI explanation appended to commit message.`));
  } else if (options.output) {
    const outPath = path.resolve(repoPath, options.output);
    await fs.mkdir(path.dirname(outPath), { recursive: true });
    await fs.writeFile(outPath, changelog, "utf-8");
    console.log(pc.green(`✅ Changelog written to: ${outPath}`));
  } else {
    // Print to stdout
    if (aiSucceeded) {
      console.log(pc.cyan("\n--- DevDiff Output ---"));
      console.log(changelog);
      console.log(pc.cyan("----------------------"));
    } else {
      console.log(changelog);
    }
  }

  // ── PHASE 4: Status ──
  console.log("");
  if (aiSucceeded) {
    console.log(pc.green("✅ AI-powered changelog generated"));
  } else {
    console.log(pc.yellow("⚠️ Template-generated changelog (AI unavailable)"));
    console.log("   Fix AI and retry for detailed explanations:");
    console.log("   • Check Ollama: ollama list");
    console.log("   • Pull a model: ollama pull llama3.2:3b");
    console.log("   • Retry: devdiff generate");

    // Save to MVP if AI failed (for background processing later)
    try {
      await saveToMVP(parsedDiff, chunkStrategy);
      console.log(
        pc.blue("   📦 Full analysis saved to MVP queue for later processing"),
      );
      console.log(pc.blue("   Process: devdiff mvp process"));
    } catch (mvpErr: any) {
      console.error(
        pc.red(`   Failed to save to MVP queue: ${mvpErr.message}`),
      );
    }
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

async function processChunks(
  chunkStrategy: ChunkStrategy,
  options: GenerateCmdOptions,
  repoPath: string,
): Promise<AIExplanationResult[]> {
  const results: AIExplanationResult[] = [];
  const totalChunks = chunkStrategy.chunks.length;

  for (let i = 0; i < totalChunks; i++) {
    const chunk = chunkStrategy.chunks[i];
    console.log(
      `⏱️ Chunk ${i + 1}/${totalChunks}: ${chunk.label} (${chunk.files.length} files)`,
    );

    const chunkDiffText = reconstructDiffForFiles(chunk.files);

    const result = await generateChangelog({
      diffText: chunkDiffText,
      repoPath,
      dryRun: options.dryRun,
      format: "json",
      persona: options.persona,
      skipVerification: true,
    });

    results.push(result.rawResult);
    console.log(`✅ Chunk ${i + 1} complete`);
  }

  return results;
}

function mergeChunkResults(
  results: AIExplanationResult[],
  format: "markdown" | "json" | "html",
  persona?: string,
): { rawResult: AIExplanationResult; formattedOutput: string } {
  const mergedResult: AIExplanationResult = {
    summary: results
      .map((r) => r.summary)
      .filter(Boolean)
      .join("\n\n"),
    impact: "none",
    breaking: false,
    files: results.flatMap((r) => r.files),
    relatedIssues: Array.from(new Set(results.flatMap((r) => r.relatedIssues))),
  };

  const impactOrdering = ["none", "minor", "major", "breaking"];
  let maxImpactIndex = 0;
  for (const r of results) {
    const idx = impactOrdering.indexOf(r.impact);
    if (idx > maxImpactIndex) {
      maxImpactIndex = idx;
    }
    if (r.breaking) {
      mergedResult.breaking = true;
    }
  }
  mergedResult.impact = impactOrdering[maxImpactIndex] as any;

  if (persona) {
    try {
      // Optional: apply persona post-processing if needed
    } catch {}
  }

  let formattedOutput = "";
  if (format === "json") {
    formattedOutput = formatJSON(mergedResult);
  } else if (format === "html") {
    formattedOutput = formatHTML(mergedResult);
  } else {
    formattedOutput = formatMarkdown(mergedResult);
  }

  return {
    rawResult: mergedResult,
    formattedOutput,
  };
}

async function saveToMVP(diff: any, chunkStrategy: ChunkStrategy) {
  const repoPath = process.cwd();
  const id = await MVPStorage.generateId(repoPath);
  const entry: MVPEntry = {
    id,
    timestamp: new Date().toISOString(),
    status: "queued",
    change_range: {
      from: "HEAD~1",
      to: "HEAD",
      commits: 1,
      files: diff.files.length,
      additions: diff.totalAdditions || 0,
      deletions: diff.totalDeletions || 0,
    },
    template_summary: `AI generation failed for ${diff.files.length} files. Chunks: ${chunkStrategy.chunks.length}.`,
    diff_snapshot: Buffer.from(reconstructDiffForFiles(diff.files)).toString(
      "base64",
    ),
    retry_count: 0,
    max_retries: 3,
  };
  await MVPStorage.saveMVP(repoPath, entry);
}
