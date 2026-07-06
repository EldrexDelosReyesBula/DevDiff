import * as path from "path";
import { ParseResult, ParsedFileDiff } from "../diff/parser";

export interface ContextWindowConfig {
  /**
   * Maximum context tokens for AI prompts.
   * Default: 4000
   * Range: 512 - 128000
   */
  maxContextTokens: number;

  /**
   * Strategy when context exceeds max
   */
  overflowStrategy: "truncate" | "summarize" | "split" | "mcp";

  /**
   * Minimum tokens to reserve for response
   */
  responseReserve: number;

  /**
   * Whether to include full file contents for small files
   */
  includeSmallFiles: boolean;

  /**
   * Maximum file size to include in full (bytes)
   */
  smallFileThreshold: number;
}

export const DEFAULT_CONTEXT_CONFIG: ContextWindowConfig = {
  maxContextTokens: 4000, // 4K default — configurable up to 128K
  overflowStrategy: "summarize", // Smart summary instead of truncation
  responseReserve: 1024, // Reserve 1K for AI response
  includeSmallFiles: true, // Include full content for small files
  smallFileThreshold: 2048, // Files under 2KB included in full
};

export class ContextWindowManager {
  /**
   * Build optimized context within the developer's budget
   */
  static buildContext(
    diff: ParseResult,
    projectContext: any,
    config: ContextWindowConfig = DEFAULT_CONTEXT_CONFIG,
  ): string {
    const budget = config.maxContextTokens - config.responseReserve;
    let usedTokens = 0;
    const sections: string[] = [];

    // 1. Project Context (essential, always include but compress)
    const projectSection = this.compressProjectContext(
      projectContext,
      Math.floor(budget * 0.15),
    );
    sections.push(projectSection);
    usedTokens += this.estimateTokens(projectSection);

    // 2. File Summary (all files, minimal)
    const summarySection = this.buildFileSummary(
      diff,
      Math.floor(budget * 0.1),
    );
    sections.push(summarySection);
    usedTokens += this.estimateTokens(summarySection);

    // 3. Key Files (most changed, prioritized)
    const remainingBudget = budget - usedTokens;
    const keyFilesSection = this.buildKeyFilesSection(
      diff,
      remainingBudget,
      config,
    );
    sections.push(keyFilesSection);

    return sections.join("\n\n");
  }

  /**
   * Compress project context to fit token budget
   */
  private static compressProjectContext(
    context: any,
    tokenBudget: number,
  ): string {
    if (!context) return "No project context available.";

    if (typeof context === "string") {
      const limit = tokenBudget * 4;
      if (context.length <= limit) return context;
      return context.substring(0, limit) + "\n...(truncated for token budget)";
    }

    const lines: string[] = [];
    const monorepo = context?.patterns?.monorepo || false;
    lines.push(`[Project: ${monorepo ? "Monorepo" : "Single Package"}]`);

    const frameworks =
      context?.dependencies?.detectedFrameworks || context?.techStack || [];
    if (frameworks.length) {
      lines.push(`Stack: ${frameworks.join(", ")}`);
    }

    const naming = context?.patterns?.namingConventions || [];
    if (naming.length) {
      lines.push(`Structure: ${naming.slice(0, 5).join("; ")}`);
    }

    // If budget allows, add more detail
    if (tokenBudget > 500) {
      const filesCount = context?.repositorySize?.files || 0;
      if (filesCount > 0) {
        lines.push(`Size: ${filesCount.toLocaleString()} files`);
      }
      const commits = context?.git?.totalCommits || 0;
      if (commits > 0) {
        lines.push(`History: ${commits.toLocaleString()} commits`);
      }
    }

    return lines.join("\n");
  }

  /**
   * Build a lightweight summary of all files in the diff
   */
  private static buildFileSummary(
    diff: ParseResult,
    tokenBudget: number,
  ): string {
    const lines: string[] = [];
    lines.push("=== Diff Summary ===");
    lines.push(`Total additions: ${diff.totalAdditions || 0}`);
    lines.push(`Total deletions: ${diff.totalDeletions || 0}`);
    lines.push(`Files changed: ${diff.files.length}`);

    const maxEntries = Math.floor(tokenBudget / 8);
    const visibleFiles = diff.files.slice(0, maxEntries);

    for (const file of visibleFiles) {
      const pathStr = file.newPath || file.oldPath || "";
      lines.push(`- ${pathStr}`);
    }

    if (diff.files.length > visibleFiles.length) {
      lines.push(`- ... and ${diff.files.length - visibleFiles.length} more`);
    }

    return lines.join("\n");
  }

  /**
   * Build prioritized key files section
   */
  private static buildKeyFilesSection(
    diff: ParseResult,
    tokenBudget: number,
    config: ContextWindowConfig,
  ): string {
    // Sort files by change size (most changed first)
    const sortedFiles = [...diff.files].sort((a, b) => {
      const aSize = (a.additions || 0) + (a.deletions || 0);
      const bSize = (b.additions || 0) + (b.deletions || 0);
      return bSize - aSize;
    });

    const lines: string[] = [];
    let tokensUsed = 0;

    for (const file of sortedFiles) {
      if (tokensUsed >= tokenBudget) break;

      const fileEntry = this.formatFileEntry(file, config);
      const fileTokens = this.estimateTokens(fileEntry);

      if (tokensUsed + fileTokens <= tokenBudget) {
        lines.push(fileEntry);
        tokensUsed += fileTokens;
      }
    }

    if (sortedFiles.length > lines.length) {
      lines.push(`... and ${sortedFiles.length - lines.length} more files`);
    }

    return lines.join("\n");
  }

  /**
   * Format a single file entry
   */
  private static formatFileEntry(
    file: ParsedFileDiff,
    config: ContextWindowConfig,
  ): string {
    const statusLabel = file.isNew
      ? "+"
      : file.isDeleted
        ? "-"
        : file.isRename
          ? "→"
          : "~";
    const pathStr = file.newPath || file.oldPath || "";
    let entry = `${statusLabel} ${pathStr} (+${file.additions || 0} -${file.deletions || 0})`;

    // Include full content for small files
    if (
      config.includeSmallFiles &&
      file.content &&
      file.content.length <= config.smallFileThreshold
    ) {
      entry += `\n\`\`\`\n${file.content}\n\`\`\``;
    }

    return entry;
  }

  /**
   * Estimate token count (approximate, fast)
   */
  private static estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }
}
