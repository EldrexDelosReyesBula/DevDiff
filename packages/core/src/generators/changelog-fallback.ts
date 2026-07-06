import * as path from "path";
import { ParseResult, ParsedFileDiff } from "../diff/parser";
import { DeepContext } from "../context/deep-indexer";

/**
 * Template Fallback Generator
 *
 * When ALL AI attempts fail, generate a useful changelog
 * from deterministic data. Never return empty or error.
 */
export class TemplateFallbackGenerator {
  /**
   * Generate changelog without ANY AI
   * Uses: git metadata, file structure, heuristics
   */
  static generate(diff: ParseResult, context: DeepContext | null): string {
    const lines: string[] = [];
    const date = new Date().toISOString().slice(0, 10);
    const time = new Date().toLocaleTimeString();

    // ── Header ──
    lines.push(`# Changelog — ${date} at ${time}`);
    lines.push("");
    lines.push(
      `> ⚠️ **Template-generated** — AI was unavailable for this analysis.`,
    );
    lines.push(`> This changelog is based on deterministic git analysis.`);
    lines.push(
      `> For AI-powered explanations, ensure your AI provider is running and try again:`,
    );
    lines.push(`> \`\`\`bash`);
    lines.push(`> devdiff generate`);
    lines.push(`> \`\`\``);
    lines.push("");
    lines.push("---");
    lines.push("");

    // ── Summary ──
    lines.push(`## 📊 Summary`);
    lines.push("");
    lines.push(`| Metric | Value |`);
    lines.push(`|--------|-------|`);
    lines.push(`| Files Changed | ${diff.files.length} |`);
    lines.push(
      `| Lines Added | +${(diff.totalAdditions || 0).toLocaleString()} |`,
    );
    lines.push(
      `| Lines Removed | -${(diff.totalDeletions || 0).toLocaleString()} |`,
    );

    const commitCount =
      (diff as any).commitCount !== undefined
        ? (diff as any).commitCount
        : context?.git?.totalCommits || 1;
    lines.push(`| Commits | ${commitCount} |`);

    const branchesList =
      (diff as any).branches ||
      (context?.git?.activeBranch ? [context.git.activeBranch] : ["current"]);
    lines.push(`| Branches | ${branchesList.join(", ")} |`);
    lines.push("");

    // ── Changes by Type ──
    const byStatus = this.groupByStatus(diff.files);

    if (byStatus.added.length > 0) {
      lines.push(`## ✨ Added (${byStatus.added.length} files)`);
      lines.push("");
      for (const file of byStatus.added.slice(0, 20)) {
        const filePath = file.path || file.newPath || file.oldPath || "unknown";
        lines.push(`- \`${filePath}\` (${file.additions || 0} lines)`);
      }
      if (byStatus.added.length > 20) {
        lines.push(`- *... and ${byStatus.added.length - 20} more files*`);
      }
      lines.push("");
    }

    if (byStatus.modified.length > 0) {
      lines.push(`## 📝 Modified (${byStatus.modified.length} files)`);
      lines.push("");
      for (const file of byStatus.modified.slice(0, 20)) {
        const filePath = file.path || file.newPath || file.oldPath || "unknown";
        lines.push(
          `- \`${filePath}\` (+${file.additions || 0} -${file.deletions || 0})`,
        );
      }
      if (byStatus.modified.length > 20) {
        lines.push(`- *... and ${byStatus.modified.length - 20} more files*`);
      }
      lines.push("");
    }

    if (byStatus.deleted.length > 0) {
      lines.push(`## 🗑️ Deleted (${byStatus.deleted.length} files)`);
      lines.push("");
      for (const file of byStatus.deleted.slice(0, 20)) {
        const filePath = file.path || file.newPath || file.oldPath || "unknown";
        lines.push(`- \`${filePath}\``);
      }
      if (byStatus.deleted.length > 20) {
        lines.push(`- *... and ${byStatus.deleted.length - 20} more files*`);
      }
      lines.push("");
    }

    if (byStatus.renamed.length > 0) {
      lines.push(`## 🔄 Renamed (${byStatus.renamed.length} files)`);
      lines.push("");
      for (const file of byStatus.renamed) {
        lines.push(`- \`${file.oldPath}\` → \`${file.newPath}\``);
      }
      lines.push("");
    }

    // ── Directory Breakdown ──
    const byDir = this.groupByDirectory(diff.files);
    if (byDir.size > 1) {
      lines.push(`## 📁 Changes by Directory`);
      lines.push("");
      for (const [dir, count] of Array.from(byDir.entries()).sort(
        (a, b) => b[1] - a[1],
      )) {
        lines.push(`- **${dir}** — ${count} file(s)`);
      }
      lines.push("");
    }

    // ── Potential Issues ──
    const issues = this.detectPotentialIssues(diff);
    if (issues.length > 0) {
      lines.push(`## ⚠️ Potential Issues Detected`);
      lines.push("");
      for (const issue of issues) {
        lines.push(`- ${issue}`);
      }
      lines.push("");
    }

    // ── Next Steps ──
    lines.push(`## 🔄 Next Steps`);
    lines.push("");
    lines.push(`1. **Fix AI**: Ensure Ollama is running (\`ollama list\`)`);
    lines.push(`2. **Retry**: \`devdiff generate\` for AI-powered changelog`);
    lines.push(
      `3. **MVP Queue**: Full analysis saved for background processing`,
    );
    lines.push(`4. **Manual Review**: Review this template changelog`);
    lines.push("");
    lines.push("---");
    lines.push(
      "*Generated by DevDiff v1.0.6 — Template Mode (AI unavailable)*",
    );

    return lines.join("\n");
  }

  private static groupByStatus(files: ParsedFileDiff[]) {
    return {
      added: files.filter((f) => f.isNew),
      modified: files.filter((f) => !f.isNew && !f.isDeleted && !f.isRename),
      deleted: files.filter((f) => f.isDeleted),
      renamed: files.filter((f) => f.isRename),
    };
  }

  private static groupByDirectory(
    files: ParsedFileDiff[],
  ): Map<string, number> {
    const byDir = new Map<string, number>();
    for (const file of files) {
      const filePath = file.path || file.newPath || file.oldPath || "unknown";
      const normalized = filePath.replace(/\\/g, "/");
      const dir = normalized.split("/").slice(0, 2).join("/");
      byDir.set(dir, (byDir.get(dir) || 0) + 1);
    }
    return byDir;
  }

  private static detectPotentialIssues(diff: ParseResult): string[] {
    const issues: string[] = [];

    // Check for deleted files with potential dangling references
    const deletedFiles = diff.files.filter((f) => f.isDeleted);
    for (const deleted of deletedFiles) {
      if (!deleted.oldPath) continue;
      const deletedBasename = path.basename(deleted.oldPath);
      const isReferenced = diff.files.some((f) => {
        if (f.isDeleted || !f.hunks) return false;
        return f.hunks.some((h) =>
          h.lines.some((l) => l.content.includes(deletedBasename)),
        );
      });
      if (isReferenced) {
        issues.push(
          `⚠️ Deleted \`${deleted.oldPath}\` may still be referenced in modified files`,
        );
      }
    }

    // Check for large files
    const largeFiles = diff.files.filter(
      (f) => (f.additions || 0) + (f.deletions || 0) > 1000,
    );
    if (largeFiles.length > 0) {
      issues.push(
        `📏 ${largeFiles.length} file(s) with >1000 line changes — consider reviewing`,
      );
    }

    // Check for config changes
    const configChanges = diff.files.filter((f) => {
      const p = f.newPath || f.oldPath || "";
      return p.includes(".env") || p.includes("config") || p.includes("secret");
    });
    if (configChanges.length > 0) {
      issues.push(
        `🔒 ${configChanges.length} configuration file(s) changed — verify no secrets exposed`,
      );
    }

    return issues;
  }
}
