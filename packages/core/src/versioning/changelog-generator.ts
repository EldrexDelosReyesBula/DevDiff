import * as fs from "fs";
import * as path from "path";
import { ParsedDiff, FileChangeInfo } from "./semver-detector";

export interface ChangelogEntry {
  version: string;
  date: string;
  sections: {
    added: string[];
    changed: string[];
    deprecated: string[];
    removed: string[];
    fixed: string[];
    security: string[];
  };
  compareUrl?: string;
}

export class ChangelogGenerator {
  static async generate(
    diff: ParsedDiff,
    options: {
      version: string;
      previousVersion?: string;
      repositoryUrl?: string;
      outputPath?: string;
      prepend?: boolean;
      dryRun?: boolean;
    }
  ): Promise<ChangelogEntry> {
    const entry: ChangelogEntry = {
      version: options.version,
      date: new Date().toISOString().slice(0, 10),
      sections: {
        added: [],
        changed: [],
        deprecated: [],
        removed: [],
        fixed: [],
        security: [],
      },
    };

    for (const file of diff.files) {
      const category =
        this.categorizeFromCommit(file.commitMessage) ||
        this.categorizeFromPath(file.path) ||
        this.categorizeFromContent(file);

      const description = this.generateDescription(file, category);

      switch (category) {
        case "added":
          entry.sections.added.push(description);
          break;
        case "changed":
          entry.sections.changed.push(description);
          break;
        case "deprecated":
          entry.sections.deprecated.push(description);
          break;
        case "removed":
          entry.sections.removed.push(description);
          break;
        case "fixed":
          entry.sections.fixed.push(description);
          break;
        case "security":
          entry.sections.security.push(description);
          break;
      }
    }

    if (options.repositoryUrl && options.previousVersion) {
      entry.compareUrl = `${options.repositoryUrl}/compare/v${options.previousVersion}...v${options.version}`;
    }

    if (!options.dryRun && options.outputPath) {
      this.writeChangelog(entry, options);
    }

    return entry;
  }

  static formatMarkdown(entry: ChangelogEntry): string {
    const lines: string[] = [];

    lines.push(`## [${entry.version}] — ${entry.date}`);
    lines.push("");

    const sections: Array<{ key: keyof ChangelogEntry["sections"]; title: string }> = [
      { key: "added", title: "Added" },
      { key: "changed", title: "Changed" },
      { key: "deprecated", title: "Deprecated" },
      { key: "removed", title: "Removed" },
      { key: "fixed", title: "Fixed" },
      { key: "security", title: "Security" },
    ];

    for (const section of sections) {
      const items = entry.sections[section.key];
      if (items.length === 0) continue;

      lines.push(`### ${section.title}`);
      lines.push("");

      for (const item of items) {
        lines.push(`- ${item}`);
      }
      lines.push("");
    }

    if (entry.compareUrl) {
      lines.push(`**Full Changelog:** [v${entry.version}](${entry.compareUrl})`);
      lines.push("");
    }

    return lines.join("\n");
  }

  private static categorizeFromCommit(message?: string): string | null {
    if (!message) return null;
    const lower = message.toLowerCase();
    if (lower.startsWith("feat") || lower.startsWith("add")) return "added";
    if (lower.startsWith("fix") || lower.startsWith("bug")) return "fixed";
    if (lower.startsWith("sec") || lower.includes("vulnerability")) return "security";
    if (lower.startsWith("deprecate")) return "deprecated";
    if (lower.startsWith("remove") || lower.startsWith("delete")) return "removed";
    if (lower.startsWith("refactor") || lower.startsWith("docs") || lower.startsWith("chore")) return "changed";
    return null;
  }

  private static categorizeFromPath(filePath: string): string | null {
    const lower = filePath.toLowerCase();
    if (lower.includes("/fix/") || lower.includes("/bug/")) return "fixed";
    if (lower.includes("/security/")) return "security";
    if (lower.includes("/deprecated/")) return "deprecated";
    return null;
  }

  private static categorizeFromContent(file: FileChangeInfo): string {
    if (file.status === "added") return "added";
    if (file.status === "deleted") return "removed";
    return "changed";
  }

  private static generateDescription(file: FileChangeInfo, category: string): string {
    const fileName = path.basename(file.path);
    let description = "";

    if (file.commitMessage) {
      description = file.commitMessage.replace(/^(feat|fix|docs|refactor|chore):\s*/i, "").trim();
    }

    if (!description) {
      switch (category) {
        case "added":
          description = `Added **${fileName}**`;
          break;
        case "removed":
          description = `Removed **${fileName}**`;
          break;
        default:
          description = `Updated **${fileName}**`;
      }
    }

    if (file.isBreaking) {
      description += " — **BREAKING CHANGE**";
    }

    return description;
  }

  private static writeChangelog(
    entry: ChangelogEntry,
    options: { outputPath?: string; prepend?: boolean }
  ): void {
    if (!options.outputPath) return;
    const newContent = this.formatMarkdown(entry);

    if (options.prepend && fs.existsSync(options.outputPath)) {
      const existing = fs.readFileSync(options.outputPath, "utf-8");
      const headerEnd = existing.indexOf("\n## ");
      const header = headerEnd > 0 ? existing.slice(0, headerEnd) : "# Changelog\n\n";
      const rest = headerEnd > 0 ? existing.slice(headerEnd) : existing;

      fs.writeFileSync(options.outputPath, `${header}\n\n${newContent}\n\n${rest}`);
    } else {
      const fullContent = `# Changelog\n\nAll notable changes to this project will be documented in this file.\n\n---\n\n${newContent}`;
      fs.writeFileSync(options.outputPath, fullContent);
    }
  }
}
