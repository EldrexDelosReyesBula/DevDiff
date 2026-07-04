import { generateChangelog } from "./generators/changelog";
import { ShellSandbox } from "./security/shell-sandbox";
import { loadConfig } from "./config/loader";
import { MVPDetector } from "./mvp/detector";
import { MVPStorage, MVPEntry } from "./mvp/storage";
import { IDEGuardian } from "./performance/ide-guardian";
import { diffParser } from "./diff/parser";

export class DevDiffEngine {
  private workspacePath: string;

  constructor(options: { workspacePath: string }) {
    this.workspacePath = options.workspacePath || process.cwd();
  }

  async getStagedFiles(): Promise<Array<{ path: string }>> {
    try {
      const stdout = await ShellSandbox.exec("git", [
        "diff",
        "--cached",
        "--name-only",
      ]);
      return stdout
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .map((filePath) => ({ path: filePath }));
    } catch {
      return [];
    }
  }

  async analyze(options: { staged?: boolean }): Promise<{ summary: string }> {
    try {
      const diffArg = options.staged ? ["--cached"] : [];
      const diffText = await ShellSandbox.exec("git", ["diff", ...diffArg]);

      const config = await loadConfig(this.workspacePath);
      if (MVPDetector.shouldUseMVP(diffText, config)) {
        const parsedDiff = diffParser.parse(diffText);
        const template = MVPDetector.buildTemplateSummary(parsedDiff);
        const id = await MVPStorage.generateId(this.workspacePath);
        const entry: MVPEntry = {
          id,
          timestamp: new Date().toISOString(),
          status: "queued",
          change_range: {
            from: "HEAD",
            to: "staged",
            commits: 1,
            files: parsedDiff.files.length,
            additions: template.additions,
            deletions: template.deletions,
          },
          template_summary: `MVP Mode triggered: ${template.filesCount} files changed (${template.additions} additions, ${template.deletions} deletions).`,
          diff_snapshot: Buffer.from(diffText).toString("base64"),
          retry_count: 0,
          max_retries: 3,
        };
        await MVPStorage.saveMVP(this.workspacePath, entry);

        return {
          summary:
            `[MVP Mode Triggered - Saved as ${id}]\n` +
            `• Files changed: ${template.filesCount}\n` +
            `• Additions: ${template.additions} | Deletions: ${template.deletions}\n` +
            `• Directories affected: ${template.directoriesCount}\n` +
            `• Largest change: ${template.largestChangeFile}\n` +
            `• Status: Queued for AI (Run 'devdiff mvp process' to process)`,
        };
      }

      const result = await IDEGuardian.processSafely(async () => {
        return generateChangelog({
          diffText,
          repoPath: this.workspacePath,
        });
      });

      return {
        summary: result.formattedOutput,
      };
    } catch (error: any) {
      return {
        summary: `Analysis failed: ${error.message}`,
      };
    }
  }

  async generateChangelog(options: {
    format?: "markdown" | "json" | "html";
  }): Promise<string> {
    try {
      let diffText = await ShellSandbox.exec("git", ["diff", "--cached"]);
      if (!diffText.trim()) {
        diffText = await ShellSandbox.exec("git", ["diff"]);
      }

      const config = await loadConfig(this.workspacePath);
      if (MVPDetector.shouldUseMVP(diffText, config)) {
        const parsedDiff = diffParser.parse(diffText);
        const template = MVPDetector.buildTemplateSummary(parsedDiff);
        const id = await MVPStorage.generateId(this.workspacePath);
        const entry: MVPEntry = {
          id,
          timestamp: new Date().toISOString(),
          status: "queued",
          change_range: {
            from: "HEAD",
            to: "staged",
            commits: 1,
            files: parsedDiff.files.length,
            additions: template.additions,
            deletions: template.deletions,
          },
          template_summary: `MVP Mode triggered: ${template.filesCount} files changed (${template.additions} additions, ${template.deletions} deletions).`,
          diff_snapshot: Buffer.from(diffText).toString("base64"),
          retry_count: 0,
          max_retries: 3,
        };
        await MVPStorage.saveMVP(this.workspacePath, entry);

        return (
          `[MVP Mode Triggered - Saved as ${id}]\n` +
          `• Files changed: ${template.filesCount}\n` +
          `• Additions: ${template.additions} | Deletions: ${template.deletions}\n` +
          `• Directories affected: ${template.directoriesCount}\n` +
          `• Largest change: ${template.largestChangeFile}\n` +
          `• Status: Queued for AI (Run 'devdiff mvp process' to process)`
        );
      }

      const result = await IDEGuardian.processSafely(async () => {
        return generateChangelog({
          diffText,
          repoPath: this.workspacePath,
          format: options.format || "markdown",
        });
      });

      return result.formattedOutput;
    } catch (error: any) {
      return `Failed to generate changelog: ${error.message}`;
    }
  }
}
