import * as path from "path";
import { ParseResult, ParsedFileDiff } from "../diff/parser";

export interface ChunkStrategy {
  shouldChunk: boolean;
  chunks: DiffChunk[];
  strategy: "single" | "by-directory" | "by-package" | "summary-only";
  estimatedTime: number;
  recommendation: string;
}

export interface DiffChunk {
  id: string;
  files: ParsedFileDiff[];
  label: string; // "src/auth/", "packages/core/", etc.
  estimatedTokens: number;
  priority: number; // 1 = most important, process first
}

export class ChunkingEngine {
  /**
   * Determine the best chunking strategy
   */
  static analyze(diff: ParseResult, modelContextLimit = 32000): ChunkStrategy {
    const totalFiles = diff.files.length;
    const estimatedTokens = this.estimateTotalTokens(diff);

    // ── Single request: Small diffs ──
    if (totalFiles <= 10 && estimatedTokens < modelContextLimit * 0.7) {
      return {
        shouldChunk: false,
        chunks: [
          {
            id: "single",
            files: diff.files,
            label: "All changes",
            estimatedTokens,
            priority: 1,
          },
        ],
        strategy: "single",
        estimatedTime: this.estimateTime(estimatedTokens, "single"),
        recommendation: "Single AI request — fastest path",
      };
    }

    // ── By directory: Medium diffs ──
    if (totalFiles <= 50) {
      const chunks = this.chunkByDirectory(diff);
      return {
        shouldChunk: true,
        chunks,
        strategy: "by-directory",
        estimatedTime: this.estimateTime(estimatedTokens, "by-directory"),
        recommendation: `Split into ${chunks.length} chunks by directory — ${chunks.length} sequential AI calls`,
      };
    }

    // ── By package: Large diffs ──
    if (totalFiles <= 200) {
      const chunks = this.chunkByPackage(diff);
      return {
        shouldChunk: true,
        chunks,
        strategy: "by-package",
        estimatedTime: this.estimateTime(estimatedTokens, "by-package"),
        recommendation: `Split into ${chunks.length} chunks by package — parallel processing where possible`,
      };
    }

    // ── Summary only: Massive diffs ──
    const topFiles = diff.files.slice(0, 50);
    return {
      shouldChunk: true,
      chunks: [
        {
          id: "summary",
          files: topFiles,
          label: "Top 50 most changed files",
          estimatedTokens: this.estimateTotalTokens({
            ...diff,
            files: topFiles,
          }),
          priority: 1,
        },
      ],
      strategy: "summary-only",
      estimatedTime: this.estimateTime(estimatedTokens, "summary-only"),
      recommendation: `${totalFiles} files is very large. Generating summary of top 50 files. Full analysis saved to MVP for background processing.`,
    };
  }

  /**
   * Chunk by directory
   */
  private static chunkByDirectory(diff: ParseResult): DiffChunk[] {
    const byDir = new Map<string, ParsedFileDiff[]>();

    for (const file of diff.files) {
      const filePath = file.path || file.newPath || file.oldPath || "unknown";
      const normalized = filePath.replace(/\\/g, "/");
      const dir = normalized.split("/").slice(0, 2).join("/");
      if (!byDir.has(dir)) byDir.set(dir, []);
      byDir.get(dir)!.push(file);
    }

    return Array.from(byDir.entries())
      .sort((a, b) => b[1].length - a[1].length) // Most files first
      .map(([dir, files], index) => ({
        id: `chunk-${index}`,
        files,
        label: dir,
        estimatedTokens: this.estimateTotalTokens({ ...diff, files }),
        priority: files.length > 5 ? 1 : 2,
      }));
  }

  /**
   * Chunk by package (monorepo)
   */
  private static chunkByPackage(diff: ParseResult): DiffChunk[] {
    const byPackage = new Map<string, ParsedFileDiff[]>();

    for (const file of diff.files) {
      const filePath = file.path || file.newPath || file.oldPath || "unknown";
      const pkg = this.detectPackage(filePath);
      if (!byPackage.has(pkg)) byPackage.set(pkg, []);
      byPackage.get(pkg)!.push(file);
    }

    return Array.from(byPackage.entries())
      .sort((a, b) => b[1].length - a[1].length)
      .map(([pkg, files], index) => ({
        id: `chunk-${index}`,
        files,
        label: pkg,
        estimatedTokens: this.estimateTotalTokens({ ...diff, files }),
        priority: index === 0 ? 1 : 2, // First chunk is most important
      }));
  }

  /**
   * Detect which package a file belongs to
   */
  private static detectPackage(filePath: string): string {
    const normalized = filePath.replace(/\\/g, "/");
    // packages/core/src/file.ts → "packages/core"
    const match = normalized.match(/packages\/([^/]+)/);
    if (match) return `packages/${match[1]}`;

    // src/components/ → "src"
    const parts = normalized.split("/");
    return parts[0] || "root";
  }

  private static estimateFileTokens(file: ParsedFileDiff): number {
    let tokens = 100; // File metadata
    let lineLengthTotal = 0;
    if (file.hunks) {
      for (const hunk of file.hunks) {
        for (const line of hunk.lines) {
          lineLengthTotal += line.content.length;
        }
      }
    }
    tokens += lineLengthTotal / 3.5;
    return Math.ceil(tokens);
  }

  private static estimateTotalTokens(diff: {
    files: ParsedFileDiff[];
  }): number {
    let tokens = 500; // Base prompt overhead
    for (const file of diff.files) {
      tokens += this.estimateFileTokens(file);
    }
    return Math.ceil(tokens);
  }

  private static estimateTime(tokenCount: number, strategy: string): number {
    const msPerToken = 15; // Conservative estimate for local models

    switch (strategy) {
      case "single":
        return Math.ceil((tokenCount * msPerToken) / 1000);
      case "by-directory":
        return Math.ceil((tokenCount * msPerToken * 1.2) / 1000);
      case "by-package":
        return Math.ceil((tokenCount * msPerToken * 0.8) / 1000); // Parallel
      case "summary-only":
        return Math.ceil((tokenCount * msPerToken * 0.3) / 1000);
      default:
        return 60;
    }
  }
}

export function reconstructDiffForFiles(files: ParsedFileDiff[]): string {
  const parts: string[] = [];
  for (const file of files) {
    const oldPath = file.oldPath !== null ? `a/${file.oldPath}` : "/dev/null";
    const newPath = file.newPath !== null ? `b/${file.newPath}` : "/dev/null";
    parts.push(`diff --git ${oldPath} ${newPath}`);
    if (file.isNew) {
      parts.push(`new file mode 100644`);
    } else if (file.isDeleted) {
      parts.push(`deleted file mode 100644`);
    }
    if (file.isRename && file.oldPath && file.newPath) {
      parts.push(`rename from ${file.oldPath}`);
      parts.push(`rename to ${file.newPath}`);
    }
    if (file.hunks) {
      for (const hunk of file.hunks) {
        parts.push(hunk.header);
        for (const line of hunk.lines) {
          if (line.type === "addition") {
            parts.push(`+${line.content}`);
          } else if (line.type === "deletion") {
            parts.push(`-${line.content}`);
          } else {
            parts.push(` ${line.content}`);
          }
        }
      }
    }
  }
  return parts.join("\n");
}
