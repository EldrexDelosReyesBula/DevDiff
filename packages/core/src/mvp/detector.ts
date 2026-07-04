import { DevDiffConfig } from "../config/schema";
import { ParseResult, diffParser } from "../diff/parser";

export interface TemplateSummary {
  filesCount: number;
  additions: number;
  deletions: number;
  directoriesCount: number;
  largestChangeFile: string;
  status: string;
}

export class MVPDetector {
  /**
   * Determine if the diff should be deferred to MVP Mode.
   */
  static shouldUseMVP(diffText: string, config?: DevDiffConfig): boolean {
    // Default threshold is 50,000 characters (~12,500 tokens)
    const threshold = (config as any)?.mvp?.charThreshold || 50000;

    if (diffText.length > threshold) {
      return true;
    }

    // Check if number of files changed is extremely high (e.g. > 30 files)
    const fileCount = (diffText.match(/^diff --git /gm) || []).length;
    if (fileCount > ((config as any)?.mvp?.fileThreshold || 30)) {
      return true;
    }

    return false;
  }

  /**
   * Build an immediate template summary from the parsed diff.
   */
  static buildTemplateSummary(parsedDiff: ParseResult): TemplateSummary {
    const filesCount = parsedDiff.files.length;
    let additions = 0;
    let deletions = 0;
    const directories = new Set<string>();

    let maxChangeSize = 0;
    let largestChangeFile = "None";

    for (const file of parsedDiff.files) {
      const filePath = file.newPath || file.oldPath || "";
      if (filePath) {
        const parts = filePath.split("/");
        if (parts.length > 1) {
          directories.add(parts.slice(0, -1).join("/"));
        }
      }

      let fileAdditions = 0;
      let fileDeletions = 0;

      for (const hunk of file.hunks) {
        for (const line of hunk.lines) {
          if (line.type === "addition") {
            fileAdditions++;
          } else if (line.type === "deletion") {
            fileDeletions++;
          }
        }
      }

      additions += fileAdditions;
      deletions += fileDeletions;

      const fileChangeSize = fileAdditions + fileDeletions;
      if (fileChangeSize > maxChangeSize) {
        maxChangeSize = fileChangeSize;
        largestChangeFile = filePath;
      }
    }

    return {
      filesCount,
      additions,
      deletions,
      directoriesCount: directories.size,
      largestChangeFile,
      status: "Queued for AI",
    };
  }
}
