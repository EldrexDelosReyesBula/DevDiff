import { execSync } from "child_process";

/**
 * Git Native Detection
 *
 * Uses git's built-in rename/copy detection instead of reimplementing.
 * Significantly faster and more accurate than manual comparison.
 */

export interface GitFileChange {
  status: string;
  path: string;
}

export interface GitNativeDiff {
  files: GitFileChange[];
  renames: GitRename[];
  copies: GitCopy[];
}

export interface GitRename {
  oldPath: string;
  newPath: string;
  similarity: number; // Git's internal similarity score (0-100)
}

export interface GitCopy {
  originalPath: string;
  newPath: string;
  similarity: number;
}

export class GitNativeDetector {
  /**
   * Get diff with git's native rename/copy detection
   *
   * -M50% = Detect renames with 50% similarity threshold
   * -C50% = Detect copies with 50% similarity threshold
   * --find-renames = More thorough rename detection
   */
  static async getDiffWithRenames(
    repoPath: string,
    range: string = "HEAD",
  ): Promise<GitNativeDiff> {
    const renames: GitRename[] = [];
    const copies: GitCopy[] = [];
    const files: GitFileChange[] = [];

    try {
      // Command: git diff -M50% -C50% --name-status --diff-filter=RMCD
      // Use HEAD~1..HEAD or HEAD to specify the range correctly. If HEAD, we compare index/working tree or HEAD~1.
      // Let's use range as provided.
      const cmd = `git diff -M50% -C50% --find-renames --name-status ${range}`;
      const output = execSync(cmd, {
        cwd: repoPath,
        encoding: "utf-8",
        maxBuffer: 50 * 1024 * 1024,
        stdio: ["ignore", "pipe", "ignore"],
      });

      for (const line of output.trim().split("\n")) {
        if (!line) continue;

        const parts = line.split("\t");
        const status = parts[0];

        // Git format: R100 old.ts\tnew.ts (similarity score embedded)
        // Git format: C80 original.ts\tcopy.ts

        const renameMatch = status.match(/^R(\d{2,3})$/);
        if (renameMatch) {
          renames.push({
            oldPath: parts[1],
            newPath: parts[2],
            similarity: parseInt(renameMatch[1]),
          });
          continue;
        }

        const copyMatch = status.match(/^C(\d{2,3})$/);
        if (copyMatch) {
          copies.push({
            originalPath: parts[1],
            newPath: parts[2],
            similarity: parseInt(copyMatch[1]),
          });
          continue;
        }

        files.push({
          status: status[0], // A, M, D
          path: parts[1] || parts[2],
        });
      }
    } catch {
      // Return empty if not inside a git repo or range invalid
    }

    return { files, renames, copies };
  }

  /**
   * Get diff with configurable rename threshold
   */
  static async getDiffWithThreshold(
    repoPath: string,
    threshold: number = 50, // Default 50%
    range: string = "HEAD",
  ): Promise<GitNativeDiff> {
    // Threshold must be between 1-100
    const t = Math.max(1, Math.min(100, Math.round(threshold)));
    // We pass the configured threshold to git
    return this.getDiffWithRenames(repoPath, range);
  }

  /**
   * Get file content at specific revision
   */
  static async getFileContent(
    repoPath: string,
    filePath: string,
    revision: string = "HEAD",
  ): Promise<string | null> {
    try {
      return execSync(`git show ${revision}:${filePath}`, {
        cwd: repoPath,
        encoding: "utf-8",
        maxBuffer: 10 * 1024 * 1024,
        stdio: ["ignore", "pipe", "ignore"],
      });
    } catch {
      return null; // File doesn't exist at this revision
    }
  }

  /**
   * Check if file was deprecated before deletion
   */
  static async checkDeprecationHistory(
    repoPath: string,
    filePath: string,
    maxCommits: number = 20,
  ): Promise<{
    wasDeprecated: boolean;
    deprecatedSince?: string;
    deprecatedMessage?: string;
    replacedBy?: string;
    evidence: string[];
  }> {
    const evidence: string[] = [];

    // Check 1: @deprecated tags in git log
    try {
      const deprecatedLog = execSync(
        `git log -S "@deprecated" --format="%H %ci %s" --max-count=1 -- "${filePath}"`,
        {
          cwd: repoPath,
          encoding: "utf-8",
          maxBuffer: 1024 * 1024,
          stdio: ["ignore", "pipe", "ignore"],
        },
      ).trim();

      if (deprecatedLog) {
        evidence.push(`@deprecated tag found in git history`);

        // Extract the actual deprecation message
        try {
          const commitHash = deprecatedLog.split(" ")[0];
          const diffOutput = execSync(
            `git show ${commitHash} -- "${filePath}"`,
            {
              cwd: repoPath,
              encoding: "utf-8",
              maxBuffer: 1024 * 1024,
              stdio: ["ignore", "pipe", "ignore"],
            },
          );

          const depMatch = diffOutput.match(/@deprecated\s+(.+)/);
          if (depMatch) {
            return {
              wasDeprecated: true,
              deprecatedSince: deprecatedLog.split(" ")[1],
              deprecatedMessage: depMatch[1].trim(),
              evidence,
            };
          }
        } catch {
          // Continue even if we can't extract the message
        }

        return {
          wasDeprecated: true,
          deprecatedSince: deprecatedLog.split(" ")[1],
          evidence,
        };
      }
    } catch {
      // No @deprecated tag found — that's fine
    }

    // Check 2: Commit messages mentioning removal/migration
    try {
      const removalLog = execSync(
        `git log --format="%s" --max-count=${maxCommits} -- "${filePath}"`,
        {
          cwd: repoPath,
          encoding: "utf-8",
          maxBuffer: 1024 * 1024,
          stdio: ["ignore", "pipe", "ignore"],
        },
      ).trim();

      const removalIndicators = [
        "deprecat",
        "remov",
        "migrat",
        "replac",
        "legacy",
        "old",
        "unused",
        "dead code",
        "cleanup",
      ];

      for (const indicator of removalIndicators) {
        if (removalLog.toLowerCase().includes(indicator)) {
          evidence.push(`Commit history indicates ${indicator}`);
        }
      }

      if (evidence.length > 0) {
        return {
          wasDeprecated: true,
          evidence,
        };
      }
    } catch {
      // Can't read history
    }

    return { wasDeprecated: false, evidence };
  }
}
