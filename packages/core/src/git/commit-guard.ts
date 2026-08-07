import { execSync } from "child_process";

export class CommitGuard {
  private static readonly DEVDIFF_GENERATED_FILES = [
    ".devdiff/",
    ".devdiff.config.js",
    ".devdiff.config.ts",
    ".devdiffignore",
    "CHANGELOG.md",
    "changelog.md",
  ];

  /**
   * Check if a file path is generated or managed by DevDiff
   */
  static isDevDiffGenerated(filePath: string): boolean {
    const normalized = filePath.replace(/\\/g, "/");
    return this.DEVDIFF_GENERATED_FILES.some((pattern) =>
      normalized.startsWith(pattern.replace(/\/$/, ""))
    );
  }

  /**
   * Get list of currently staged files in Git repository
   */
  static getStagedFiles(): string[] {
    try {
      const output = execSync("git diff --cached --name-only", { encoding: "utf-8" }).trim();
      return output.split("\n").filter(Boolean);
    } catch {
      return [];
    }
  }

  /**
   * Warn if DevDiff-generated files are staged in Git
   */
  static warnIfStaged(): string[] {
    const staged = this.getStagedFiles();
    const devdiffFiles = staged.filter((f) => this.isDevDiffGenerated(f));

    if (devdiffFiles.length > 0) {
      console.log("");
      console.log("⚠️  DevDiff-generated files are staged:");
      for (const file of devdiffFiles) {
        console.log(`   • ${file}`);
      }
      console.log("");
      console.log("   These files are NOT automatically committed.");
      console.log("   If you want to commit them, do so explicitly:");
      console.log("   git add <file> && git commit -m \"your message\"");
      console.log("");
      console.log("   To unstage: git reset -- <file>");
      console.log("");
    }

    return devdiffFiles;
  }
}
