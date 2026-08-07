import * as fs from "fs";
import * as path from "path";

export class FlexibleIgnore {
  /**
   * Engine-level exclusions (NOT in .devdiffignore)
   * These are always excluded from analysis.
   * Developer doesn't need to manage these.
   */
  private static readonly ENGINE_EXCLUSIONS = [
    ".devdiff/security-audit.json",
    ".devdiff/security-audit.enc",
    ".devdiff/audit/",
    ".devdiff/mvp/",
    ".devdiff/cache.json",
    ".devdiff/checkpoints/",
    ".devdiff/sessions/",
    ".devdiff/file-memory.json",
    ".devdiff/index/",
    ".devdiff/plugins/",
  ];

  /**
   * Check if file should be excluded
   * Uses BOTH engine exclusions AND developer's .devdiffignore
   */
  static shouldExclude(filePath: string): boolean {
    // Engine exclusions (always applied, never in ignore file)
    for (const pattern of this.ENGINE_EXCLUSIONS) {
      if (this.matchPattern(filePath, pattern)) {
        return true;
      }
    }

    // Developer's .devdiffignore (fully controlled by developer)
    const ignorePath = path.join(process.cwd(), ".devdiffignore");

    if (fs.existsSync(ignorePath)) {
      const patterns = fs
        .readFileSync(ignorePath, "utf-8")
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith("#"));

      for (const pattern of patterns) {
        if (this.matchPattern(filePath, pattern)) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Suggest patterns but NEVER auto-add
   */
  static suggestPatterns(): string[] {
    const suggestions: string[] = [];

    const ignorePath = path.join(process.cwd(), ".devdiffignore");
    const existing = fs.existsSync(ignorePath) ? fs.readFileSync(ignorePath, "utf-8") : "";

    const recommended = [
      { pattern: "node_modules/", reason: "Dependencies" },
      { pattern: "dist/", reason: "Build output" },
      { pattern: ".turbo/", reason: "Build cache" },
      { pattern: "*.tsbuildinfo", reason: "TypeScript build info" },
    ];

    for (const { pattern, reason } of recommended) {
      if (!existing.includes(pattern)) {
        suggestions.push(`${pattern}  # ${reason}`);
      }
    }

    return suggestions;
  }

  /**
   * Show suggestions but let developer decide
   */
  static showSuggestions(): void {
    const suggestions = this.suggestPatterns();
    if (suggestions.length === 0) return;

    console.log("");
    console.log("💡 Suggested .devdiffignore patterns:");
    for (const suggestion of suggestions) {
      console.log(`   ${suggestion}`);
    }
    console.log("");
    console.log("   Add these to .devdiffignore to exclude them from analysis.");
    console.log("   DevDiff will NOT modify this file automatically.");
    console.log("");
  }

  private static matchPattern(filePath: string, pattern: string): boolean {
    const normalizedFile = filePath.replace(/\\/g, "/");
    const normalizedPattern = pattern.replace(/\\/g, "/");

    if (normalizedPattern.endsWith("/")) {
      const dir = normalizedPattern.slice(0, -1);
      return (
        normalizedFile.startsWith(dir + "/") ||
        normalizedFile.includes("/" + dir + "/") ||
        normalizedFile === dir
      );
    }

    const regex = new RegExp(
      "^" +
        normalizedPattern
          .replace(/\./g, "\\.")
          .replace(/\*\*/g, "<<<STAR>>>")
          .replace(/\*/g, "[^/]*")
          .replace(/<<<STAR>>>/g, ".*") +
        "$"
    );
    return regex.test(normalizedFile);
  }
}
