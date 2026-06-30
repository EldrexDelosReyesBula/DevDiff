import { generateChangelog } from "./generators/changelog";
import { ShellSandbox } from "./security/shell-sandbox";

export class DevDiffEngine {
  private workspacePath: string;

  constructor(options: { workspacePath: string }) {
    this.workspacePath = options.workspacePath || process.cwd();
  }

  async getStagedFiles(): Promise<Array<{ path: string }>> {
    try {
      const stdout = await ShellSandbox.exec("git", ["diff", "--cached", "--name-only"]);
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

      const result = await generateChangelog({
        diffText,
        repoPath: this.workspacePath,
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

  async generateChangelog(options: { format?: "markdown" | "json" | "html" }): Promise<string> {
    try {
      let diffText = await ShellSandbox.exec("git", ["diff", "--cached"]);
      if (!diffText.trim()) {
        diffText = await ShellSandbox.exec("git", ["diff"]);
      }

      const result = await generateChangelog({
        diffText,
        repoPath: this.workspacePath,
        format: options.format || "markdown",
      });

      return result.formattedOutput;
    } catch (error: any) {
      return `Failed to generate changelog: ${error.message}`;
    }
  }
}
