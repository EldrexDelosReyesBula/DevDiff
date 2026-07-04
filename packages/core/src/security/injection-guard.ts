/**
 * Prevents prompt injection, shell injection, and script injection
 * in all user-provided content before it reaches AI or shell.
 */
export class InjectionGuard {
  // Patterns that indicate injection attempts
  private static INJECTION_PATTERNS = [
    // Prompt injection / Script tags
    /<script[\s>]/i,
    /<\/script>/i,
    /javascript:/i,
    /onerror\s*=/i,
    /onload\s*=/i,

    // System prompt override attempts
    /ignore\s+(all\s+)?(previous\s+)?(rules|instructions|constraints)/i,
    /system:\s*override/i,
    /you are now/i,
    /new system prompt/i,
    /disregard\s+(all\s+)?(previous\s+)?(rules|instructions|constraints)/i,
    /act as if/i,
    /pretend you are/i,
    /forget (all |your )?(training|instructions|rules)/i,

    // Shell injection
    /\$\(/,
    /`[^`]*`/,
    /\|\|/,
    /&&/,
    /;\s*(rm|sudo|curl|wget)/,
    />\/dev\/null/,

    // SQL injection (in case context contains SQL)
    /DROP\s+TABLE/i,
    /INSERT\s+INTO/i,
    /DELETE\s+FROM/i,
    /UNION\s+SELECT/i,

    // Path traversal
    /\.\.\/\.\./,
    /\/etc\/(passwd|shadow)/,
    /C:\\Windows\\/i,
  ];

  /**
   * Sanitize input before sending to AI
   */
  static sanitizeForAI(input: string): {
    safe: boolean;
    sanitized: string;
    warnings: string[];
  } {
    const warnings: string[] = [];
    let sanitized = input;

    for (const pattern of this.INJECTION_PATTERNS) {
      if (pattern.test(input)) {
        warnings.push(`Potential injection pattern detected: ${pattern}`);
        sanitized = sanitized.replace(pattern, "[FILTERED]");
      }
    }

    return {
      safe: warnings.length === 0,
      sanitized,
      warnings,
    };
  }

  /**
   * Validate git commit messages (common injection vector)
   */
  static validateCommitMessage(message: string): boolean {
    // Commit messages should be plain text
    if (message.length > 200) return false; // Extended cap check
    if (/[\x00-\x08\x0B\x0C\x0E-\x1F]/.test(message)) return false; // Control chars
    if (this.INJECTION_PATTERNS.some((p) => p.test(message))) return false;

    return true;
  }

  /**
   * Validate file paths
   */
  static validateFilePath(filePath: string): boolean {
    // No absolute paths
    if (filePath.startsWith("/") || filePath.match(/^[A-Z]:\\/i)) return false;
    // No traversal
    if (filePath.includes("..")) return false;
    // No null bytes
    if (filePath.includes("\0")) return false;
    // No shell metacharacters
    if (/[;&|`$(){}[\]!<>#]/.test(filePath)) return false;

    return true;
  }
}
