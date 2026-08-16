import * as path from "path";

export interface VersionBumpReason {
  type:
    | "breaking-change"
    | "new-feature"
    | "bug-fix"
    | "refactor"
    | "docs"
    | "dependency"
    | "unknown";
  description: string;
  files: string[];
  confidence: number;
}

export interface VersionBump {
  type: "major" | "minor" | "patch" | "none";
  from: string;
  to: string;
  reasons: VersionBumpReason[];
  confidence: number;
}

export interface FileChangeInfo {
  path: string;
  status: "added" | "modified" | "deleted" | "renamed";
  content?: string;
  oldContent?: string;
  commitMessage?: string;
  additions?: number;
  deletions?: number;
  isBreaking?: boolean;
  diffSnippet?: string;
}

export interface ParsedDiff {
  files: FileChangeInfo[];
  totalAdditions?: number;
  totalDeletions?: number;
}

export class SemverDetector {
  /**
   * Analyze changes and determine version bump
   */
  static detect(diff: ParsedDiff, currentVersion: string): VersionBump {
    const reasons: VersionBumpReason[] = [];

    // Check 1: Breaking Changes
    const breakingChanges = this.detectBreakingChanges(diff);
    if (breakingChanges.length > 0) {
      reasons.push(...breakingChanges);
      return {
        type: "major",
        from: currentVersion,
        to: this.bumpVersion(currentVersion, "major"),
        reasons,
        confidence: 0.95,
      };
    }

    // Check 2: New Features
    const newFeatures = this.detectNewFeatures(diff);
    if (newFeatures.length > 0) {
      reasons.push(...newFeatures);
      return {
        type: "minor",
        from: currentVersion,
        to: this.bumpVersion(currentVersion, "minor"),
        reasons,
        confidence: 0.9,
      };
    }

    // Check 3: Bug Fixes / Patch changes
    if (diff.files.length > 0) {
      const hasFix = diff.files.some(
        (f) =>
          f.path.includes("fix") ||
          (f.commitMessage && f.commitMessage.toLowerCase().startsWith("fix")),
      );
      reasons.push({
        type: hasFix ? "bug-fix" : "refactor",
        description: `${diff.files.length} file(s) modified`,
        files: diff.files.map((f) => f.path),
        confidence: 0.85,
      });

      return {
        type: "patch",
        from: currentVersion,
        to: this.bumpVersion(currentVersion, "patch"),
        reasons,
        confidence: 0.85,
      };
    }

    // No Changes
    return {
      type: "none",
      from: currentVersion,
      to: currentVersion,
      reasons: [],
      confidence: 1.0,
    };
  }

  /**
   * Bump version string (e.g. "1.5.0" -> "1.6.0")
   */
  static bumpVersion(
    current: string,
    type: "major" | "minor" | "patch",
  ): string {
    const clean = current.replace(/^v/, "");
    const parts = clean.split(".").map((n) => parseInt(n, 10) || 0);

    while (parts.length < 3) parts.push(0);

    switch (type) {
      case "major":
        return `${parts[0] + 1}.0.0`;
      case "minor":
        return `${parts[0]}.${parts[1] + 1}.0`;
      case "patch":
        return `${parts[0]}.${parts[1]}.${parts[2] + 1}`;
    }
  }

  private static detectBreakingChanges(diff: ParsedDiff): VersionBumpReason[] {
    const reasons: VersionBumpReason[] = [];

    for (const file of diff.files) {
      const content = file.content || "";
      const oldContent = file.oldContent || "";

      const removedExports = this.extractExports(oldContent).filter(
        (e) => !this.extractExports(content).includes(e),
      );
      if (removedExports.length > 0) {
        reasons.push({
          type: "breaking-change",
          description: `Removed exports: ${removedExports.join(", ")}`,
          files: [file.path],
          confidence: 0.9,
        });
      }

      if (
        file.commitMessage?.includes("BREAKING CHANGE") ||
        file.commitMessage?.includes("BREAKING:")
      ) {
        reasons.push({
          type: "breaking-change",
          description: "Breaking change declared in commit message",
          files: [file.path],
          confidence: 1.0,
        });
      }

      if (this.isAPIRoute(file.path) && file.status === "deleted") {
        reasons.push({
          type: "breaking-change",
          description: `API route removed: ${file.path}`,
          files: [file.path],
          confidence: 0.95,
        });
      }

      if (
        file.path.includes("migration") &&
        content.toUpperCase().includes("DROP")
      ) {
        reasons.push({
          type: "breaking-change",
          description: "Database migration drops columns/tables",
          files: [file.path],
          confidence: 0.9,
        });
      }
    }

    return reasons;
  }

  private static detectNewFeatures(diff: ParsedDiff): VersionBumpReason[] {
    const reasons: VersionBumpReason[] = [];

    for (const file of diff.files) {
      const content = file.content || "";
      const oldContent = file.oldContent || "";

      if (
        file.status === "added" &&
        !this.isTest(file.path) &&
        !this.isDocs(file.path)
      ) {
        reasons.push({
          type: "new-feature",
          description: `New file: ${file.path}`,
          files: [file.path],
          confidence: 0.7,
        });
      }

      const newExports = this.extractExports(content).filter(
        (e) => !this.extractExports(oldContent).includes(e),
      );
      if (newExports.length > 0) {
        reasons.push({
          type: "new-feature",
          description: `New exports: ${newExports.join(", ")}`,
          files: [file.path],
          confidence: 0.75,
        });
      }

      if (file.commitMessage?.toLowerCase().startsWith("feat")) {
        reasons.push({
          type: "new-feature",
          description: `Feature in commit: ${file.commitMessage}`,
          files: [file.path],
          confidence: 0.95,
        });
      }
    }

    return reasons;
  }

  private static extractExports(content: string): string[] {
    const exports: string[] = [];
    const pattern =
      /export\s+(?:default\s+)?(?:class|function|const|let|var|interface|type|enum)\s+(\w+)/g;
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(content)) !== null) {
      exports.push(match[1]);
    }
    return [...new Set(exports)];
  }

  private static isTest(filePath: string): boolean {
    return (
      /\.(test|spec)\.(ts|js|tsx|jsx)$/.test(filePath) ||
      filePath.includes("__tests__")
    );
  }

  private static isDocs(filePath: string): boolean {
    return /\.(md|mdx)$/.test(filePath) || filePath.includes("/docs/");
  }

  private static isAPIRoute(filePath: string): boolean {
    return filePath.includes("/api/") || filePath.includes("/routes/");
  }
}
