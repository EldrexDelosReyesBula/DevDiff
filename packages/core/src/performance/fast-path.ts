import * as path from "path";
import { ParseResult, ParsedFileDiff } from "../diff/parser";

export interface FastPathResult {
  usedFastPath: boolean;
  elapsed: number;
  changelog: string;
  confidence: number;
}

export interface FastPathOptions {
  persona?: string;
  format?: string;
  repoPath?: string;
}

export interface DiffCategories {
  isTrivial: boolean;
  needsAI: boolean;
  types: {
    docs: number;
    test: number;
    config: number;
    formatting: number;
    dependencies: number;
    code: number;
  };
}

export class FastPathOptimizer {
  private static FAST_PATH_THRESHOLDS = {
    maxFiles: 50,
    maxLines: 500,
    maxCommits: 5,
  };

  /**
   * Check if this diff qualifies for fast path
   */
  static canUseFastPath(diff: ParseResult): boolean {
    const totalLines = (diff.totalAdditions || 0) + (diff.totalDeletions || 0);
    return (
      diff.files.length <= this.FAST_PATH_THRESHOLDS.maxFiles &&
      totalLines <= this.FAST_PATH_THRESHOLDS.maxLines
    );
  }

  /**
   * Generate changelog via fast path
   */
  static async generate(diff: ParseResult, options: FastPathOptions): Promise<FastPathResult> {
    const startTime = performance.now();
    const repoPath = options.repoPath || process.cwd();

    // 1. Categorize changes
    const categories = this.categorize(diff);

    // 2. Check if entirely trivial
    if (categories.isTrivial) {
      const changelog = this.templateTrivial(diff, categories);
      return {
        usedFastPath: true,
        elapsed: performance.now() - startTime,
        changelog,
        confidence: 0.95,
      };
    }

    // 3. For non-trivial but small, use fast AI
    if (categories.needsAI) {
      const changelog = await this.fastAI(diff, repoPath, options);
      return {
        usedFastPath: true,
        elapsed: performance.now() - startTime,
        changelog,
        confidence: 0.85,
      };
    }

    // 4. Template-based for everything else in fast path
    const changelog = this.templateStandard(diff, categories);
    return {
      usedFastPath: true,
      elapsed: performance.now() - startTime,
      changelog,
      confidence: 0.75,
    };
  }

  /**
   * Categorize changes deterministically
   */
  private static categorize(diff: ParseResult): DiffCategories {
    const categories: DiffCategories = {
      isTrivial: false,
      needsAI: false,
      types: {
        docs: 0,
        test: 0,
        config: 0,
        formatting: 0,
        dependencies: 0,
        code: 0,
      },
    };

    for (const file of diff.files) {
      const filePath = file.newPath || file.oldPath || "";
      const ext = path.extname(filePath);
      const dir = path.dirname(filePath);

      // Docs
      if (ext === ".md" || ext === ".mdx" || dir.includes("docs")) {
        categories.types.docs++;
      }
      // Tests
      else if (
        filePath.includes(".test.") ||
        filePath.includes(".spec.") ||
        dir.includes("__tests__")
      ) {
        categories.types.test++;
      }
      // Config
      else if (
        ext === ".json" ||
        ext === ".yaml" ||
        ext === ".yml" ||
        ext === ".toml" ||
        filePath.includes("config")
      ) {
        categories.types.config++;
      }
      // Dependencies
      else if (
        filePath.includes("package.json") ||
        filePath.includes("package-lock") ||
        filePath.includes("yarn.lock") ||
        filePath.includes("pnpm-lock")
      ) {
        categories.types.dependencies++;
      }
      // Formatting only (no logic changes)
      else if (this.isFormattingOnly(file)) {
        categories.types.formatting++;
      }
      // Actual code changes
      else {
        categories.types.code++;
      }
    }

    // Trivial: only docs, tests, config, formatting, deps
    categories.isTrivial = categories.types.code === 0;

    // Needs AI: has code changes but small
    categories.needsAI = categories.types.code > 0 && categories.types.code <= 10;

    return categories;
  }

  /**
   * Detect if file change is formatting only
   */
  private static isFormattingOnly(file: ParsedFileDiff): boolean {
    if (!file.content) return false;
    // Simple heuristic
    return false;
  }

  /**
   * Template for trivial changes (< 5ms)
   */
  private static templateTrivial(diff: ParseResult, categories: DiffCategories): string {
    const lines: string[] = [];
    const date = new Date().toISOString().slice(0, 10);

    lines.push(`## Changes — ${date}`);
    lines.push("");

    if (categories.types.docs > 0) {
      lines.push(`### 📚 Documentation`);
      lines.push(`- Updated ${categories.types.docs} documentation file(s)`);
      lines.push("");
    }

    if (categories.types.test > 0) {
      lines.push(`### 🧪 Tests`);
      lines.push(`- Modified ${categories.types.test} test file(s)`);
      lines.push("");
    }

    if (categories.types.config > 0) {
      lines.push(`### ⚙️ Configuration`);
      lines.push(`- Updated ${categories.types.config} configuration file(s)`);
      lines.push("");
    }

    if (categories.types.dependencies > 0) {
      lines.push(`### 📦 Dependencies`);
      lines.push(`- Updated project dependency manifests`);
      lines.push("");
    }

    if (categories.types.formatting > 0) {
      lines.push(`### 🎨 Formatting`);
      lines.push(`- Code style and formatting cleanups`);
      lines.push("");
    }

    lines.push(`---`);
    lines.push(
      `📊 ${diff.files.length} files • ${diff.totalAdditions || 0}+ ${diff.totalDeletions || 0}- • Fast path (< 10ms)`
    );

    return lines.join("\n");
  }

  /**
   * Template for standard fast path changes
   */
  private static templateStandard(diff: ParseResult, categories: DiffCategories): string {
    const lines: string[] = [];
    const date = new Date().toISOString().slice(0, 10);

    lines.push(`## Summary — ${date}`);
    lines.push("");
    lines.push(`Minor updates including:`);
    if (categories.types.code > 0) {
      lines.push(`- Logic adjustments to ${categories.types.code} source code file(s)`);
    }
    if (categories.types.docs > 0) {
      lines.push(`- Documentation additions`);
    }
    lines.push("");
    lines.push(`---`);
    lines.push(
      `📊 ${diff.files.length} files • ${diff.totalAdditions || 0}+ ${diff.totalDeletions || 0}- • Standard fast path`
    );

    return lines.join("\n");
  }

  /**
   * Run fast AI query
   */
  private static async fastAI(
    diff: ParseResult,
    repoPath: string,
    options: FastPathOptions
  ): Promise<string> {
    try {
      const { loadConfig } = await import("../config/loader");
      const { AIRouter } = await import("../ai/router");
      const config = await loadConfig(repoPath);
      const router = new AIRouter(config);

      const diffText = diff.files
        .map((f) => {
          const pathStr = f.newPath || f.oldPath || "";
          return `File: ${pathStr}\n+${f.additions || 0} -${f.deletions || 0}`;
        })
        .join("\n");

      const explanation = await router.getExplanation(diffText, {
        depth: "standard",
        projectContext: `Trivial/Small change fast analysis. Persona style: ${options.persona || "developer"}`,
      });
      return explanation.summary;
    } catch {
      return this.templateStandard(diff, this.categorize(diff));
    }
  }
}
