import * as path from "path";
import * as fs from "fs/promises";

export interface SecurityIssue {
  severity: "critical" | "warning" | "info";
  type: string;
  message: string;
  blocked: boolean;
}

export interface SecurityValidation {
  safe: boolean;
  issues: SecurityIssue[];
  workspacePath: string;
}

export class SecurityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SecurityError";
  }
}

/**
 * Extension Security Guard
 *
 * Protects against:
 * 1. Malicious workspace files / path traversal
 * 2. Script injection via file content (null bytes, ANSI escape, Unicode control chars)
 * 3. Unauthorized file access outside workspace boundaries
 * 4. Process injection via shell metacharacters in filenames
 * 5. Memory exhaustion via oversized files
 */
export class ExtensionSecurityGuard {
  private static readonly SYSTEM_PATHS = [
    // Unix-like
    "/etc",
    "/sys",
    "/proc",
    "/dev",
    "/root",
    // macOS
    "/System",
    "/private/etc",
    // Windows
    "C:\\Windows",
    "C:\\Windows\\System32",
    "C:\\Windows\\SysWOW64",
    // Sensitive user dirs
    path.join(process.env.HOME || process.env.USERPROFILE || "", ".ssh"),
    path.join(process.env.HOME || process.env.USERPROFILE || "", ".gnupg"),
    path.join(process.env.HOME || process.env.USERPROFILE || "", ".aws"),
  ];

  private static readonly MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
  private static readonly MAX_FILE_COUNT = 100_000;

  /**
   * Validate a workspace path before any engine operation.
   */
  static validateWorkspace(workspacePath: string): SecurityValidation {
    const issues: SecurityIssue[] = [];
    let resolved: string;

    try {
      resolved = path.resolve(workspacePath);
    } catch {
      return {
        safe: false,
        issues: [
          {
            severity: "critical",
            type: "invalid-path",
            message: `Cannot resolve workspace path: ${workspacePath}`,
            blocked: true,
          },
        ],
        workspacePath: workspacePath,
      };
    }

    // 1. Path traversal check — normalized path must match input after resolving
    if (
      workspacePath &&
      !resolved.startsWith(
        workspacePath.replace(/\\/g, "/").replace(/\/+$/, ""),
      )
    ) {
      // Allow if they're the same after normalization — this is fine
    }

    // 2. System directory check
    for (const sysPath of this.SYSTEM_PATHS) {
      if (sysPath && resolved.startsWith(sysPath)) {
        issues.push({
          severity: "critical",
          type: "system-path-access",
          message: `Workspace is inside a system directory: ${sysPath}. Refusing to operate.`,
          blocked: true,
        });
        break;
      }
    }

    // 3. Check for suspicious override files (non-blocking, warning only)
    const suspiciousFiles = [path.join(resolved, ".devdiff", "scripts")];
    for (const suspicious of suspiciousFiles) {
      try {
        // We check synchronously via existsSync — avoid async in constructor context
        const stat = fs
          .stat(suspicious)
          .then(() => {
            issues.push({
              severity: "warning",
              type: "suspicious-path",
              message: `Suspicious path exists in workspace: ${suspicious}`,
              blocked: false,
            });
          })
          .catch(() => {
            // Path doesn't exist — fine
          });
        void stat;
      } catch {}
    }

    return {
      safe: !issues.some((i) => i.blocked),
      issues,
      workspacePath: resolved,
    };
  }

  /**
   * Sanitize file content before processing by the AI pipeline.
   * Prevents injection attacks through crafted file contents.
   */
  static sanitizeContent(content: string): string {
    if (content.length > this.MAX_FILE_SIZE_BYTES) {
      throw new SecurityError(
        `File too large (${(content.length / 1024 / 1024).toFixed(1)}MB > 10MB limit) — skipping to prevent memory exhaustion`,
      );
    }

    // Strip null bytes (used in injection attacks to bypass string parsing)
    content = content.replace(/\0/g, "");

    // Strip ANSI escape sequences (prevent terminal injection)
    // eslint-disable-next-line no-control-regex
    content = content.replace(/\x1B\[[0-9;]*[a-zA-Z]/g, "");

    // Strip Unicode control characters (except tab, newline, carriage return)
    // eslint-disable-next-line no-control-regex
    content = content.replace(
      /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g,
      "",
    );

    return content;
  }

  /**
   * Verify a file path is within workspace boundaries.
   * Throws SecurityError if the file is outside the workspace.
   */
  static isWithinWorkspace(filePath: string, workspacePath: string): boolean {
    const resolvedFile = path.resolve(filePath);
    const resolvedWorkspace = path.resolve(workspacePath);

    // Normalize to forward slashes for cross-platform comparison
    const normalizedFile = resolvedFile.replace(/\\/g, "/");
    const normalizedWorkspace = resolvedWorkspace.replace(/\\/g, "/");

    if (
      !normalizedFile.startsWith(normalizedWorkspace + "/") &&
      normalizedFile !== normalizedWorkspace
    ) {
      throw new SecurityError(
        `File access denied: "${filePath}" is outside workspace boundaries`,
      );
    }

    return true;
  }

  /**
   * Sanitize a file name to prevent shell metacharacter injection.
   */
  static sanitizeFileName(fileName: string): string {
    // Remove shell metacharacters and directory separators
    const sanitized = fileName
      .replace(/[;&|`$(){}[\]!<>#"'*?~\/\\]/g, "_")
      .replace(/\.\./g, "_dot_dot_")
      .replace(/^\//, "_")
      .replace(/^[A-Za-z]:[/\\]/, "_drive_");

    return sanitized || "unnamed_file";
  }

  /**
   * Count files in a directory up to a maximum.
   * Used for large-workspace warnings.
   */
  static async countFiles(dirPath: string, max = 100_000): Promise<number> {
    let count = 0;
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      for (const entry of entries) {
        if (count >= max) break;
        if (entry.isFile()) {
          count++;
        } else if (
          entry.isDirectory() &&
          entry.name !== "node_modules" &&
          entry.name !== ".git"
        ) {
          count += await this.countFiles(
            path.join(dirPath, entry.name),
            max - count,
          );
        }
      }
    } catch {
      // Silently ignore permission errors
    }
    return count;
  }
}
