/**
 * DevDiff Error Hierarchy
 * Every error has:
 * - Unique error code
 * - Human-readable message
 * - Actionable fix suggestion
 * - HTTP status code (for API)
 * - Exit code (for CLI)
 * - Link to documentation
 */
export class DevDiffError extends Error {
  public readonly code: string;
  public readonly exitCode: number;
  public readonly httpStatus: number;
  public readonly fix: string;
  public readonly docsUrl: string;
  public readonly context: Record<string, unknown>;

  constructor(params: {
    code: string;
    message: string;
    exitCode?: number;
    httpStatus?: number;
    fix?: string;
    docsUrl?: string;
    context?: Record<string, unknown>;
  }) {
    super(params.message);
    this.name = "DevDiffError";
    this.code = params.code;
    this.exitCode = params.exitCode || 1;
    this.httpStatus = params.httpStatus || 500;
    this.fix = params.fix || "Check the documentation for more information.";
    this.docsUrl = params.docsUrl || "https://devdiff.vercel.app/troubleshooting/common-fixes";
    this.context = params.context || {};
  }

  /**
   * Pretty-print for CLI
   */
  toCLIOutput(): string {
    const lines: string[] = [];

    lines.push("");
    lines.push(`❌ ${this.message}`);
    lines.push("");
    lines.push(`   Error Code: ${this.code}`);
    lines.push(`   Fix: ${this.fix}`);
    lines.push(`   Docs: ${this.docsUrl}`);

    if (Object.keys(this.context).length > 0) {
      lines.push("");
      lines.push("   Context:");
      for (const [key, value] of Object.entries(this.context)) {
        lines.push(`   • ${key}: ${value}`);
      }
    }

    lines.push("");
    return lines.join("\n");
  }
}

// ===========================================================
// SPECIFIC ERROR CLASSES
// ===========================================================

export class GitError extends DevDiffError {
  constructor(message: string, context?: Record<string, unknown>) {
    super({
      code: "GIT_001",
      message,
      exitCode: 3,
      fix:
        "Ensure you are in a git repository with at least one commit.\n" +
        'Run: git init && git add . && git commit -m "initial commit"',
      docsUrl: "https://devdiff.vercel.app/troubleshooting/common-fixes",
      context,
    });
    this.name = "GitError";
  }
}

export class AINotAvailableError extends DevDiffError {
  constructor(provider: string, context?: Record<string, unknown>) {
    const fixes: Record<string, string> = {
      ollama:
        "Install Ollama: https://ollama.com/download\n" +
        "Then: ollama pull llama3.2:3b",
      openai:
        "Set your API key: devdiff auth add openai\n" +
        "Or: export OPENAI_API_KEY=your-key",
      anthropic:
        "Set your API key: devdiff auth add anthropic\n" +
        "Or: export ANTHROPIC_API_KEY=your-key",
    };

    super({
      code: "AI_001",
      message: `${provider} is not available`,
      exitCode: 4,
      fix: fixes[provider] || `Check your ${provider} configuration.`,
      docsUrl: `https://devdiff.vercel.app/ai-providers/${provider}-setup`,
      context,
    });
    this.name = "AINotAvailableError";
  }
}

export class ConfigError extends DevDiffError {
  constructor(message: string, context?: Record<string, unknown>) {
    super({
      code: "CFG_001",
      message,
      exitCode: 2,
      fix:
        "Run: devdiff config --validate  (to check your configuration)\n" +
        "Run: devdiff config --reset    (to reset to defaults)",
      docsUrl: "https://devdiff.vercel.app/guide/configuration",
      context,
    });
    this.name = "ConfigError";
  }
}

export class NetworkError extends DevDiffError {
  constructor(message: string, context?: Record<string, unknown>) {
    super({
      code: "NET_001",
      message,
      exitCode: 5,
      fix:
        "Check your internet connection.\n" +
        "If using local AI, no internet is needed — check your AI provider.\n" +
        "Run: devdiff doctor  (for full diagnostics)",
      docsUrl: "https://devdiff.vercel.app/troubleshooting/common-fixes",
      context,
    });
    this.name = "NetworkError";
  }
}

export class PermissionError extends DevDiffError {
  constructor(message: string, context?: Record<string, unknown>) {
    super({
      code: "PERM_001",
      message,
      exitCode: 6,
      fix:
        "Check file permissions for .devdiff/ directory.\n" +
        "On Linux/macOS: chmod -R 755 .devdiff/\n" +
        "On Windows: Run terminal as Administrator",
      docsUrl: "https://devdiff.vercel.app/troubleshooting/common-fixes",
      context,
    });
    this.name = "PermissionError";
  }
}

export class ResourceLimitError extends DevDiffError {
  constructor(resource: string, limit: string, current: string) {
    super({
      code: "RES_001",
      message: `${resource} limit reached (${current} / ${limit})`,
      exitCode: 7,
      fix:
        resource === "memory"
          ? "Try using a smaller AI model: ollama pull llama3.2:1b\n" +
            "Or use a cloud provider: devdiff auth add openai"
          : "Free up disk space or change output directory.",
      docsUrl: "https://devdiff.vercel.app/troubleshooting/common-fixes",
      context: { resource, limit, current },
    });
    this.name = "ResourceLimitError";
  }
}

export class NonInteractiveError extends DevDiffError {
  constructor(message: string) {
    super({
      code: "TTY_001",
      message,
      exitCode: 1,
      fix:
        "This command requires an interactive terminal.\n" +
        "For scripts, use environment variables or config files.",
      docsUrl: "https://devdiff.vercel.app/guide/configuration",
    });
    this.name = "NonInteractiveError";
  }
}

export class MVPStorageError extends DevDiffError {
  constructor(message: string, context?: Record<string, unknown>) {
    super({
      code: "MVP_001",
      message,
      exitCode: 1,
      fix:
        "Run: devdiff mvp status  (to check queue)\n" +
        "Run: devdiff mvp process (to process queued items)",
      docsUrl: "https://devdiff.vercel.app/features/mvp-mode",
      context,
    });
    this.name = "MVPStorageError";
  }
}
