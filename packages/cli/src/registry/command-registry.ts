import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";

export interface CommandDefinition {
  name: string;
  aliases?: string[];
  description: string;
  longDescription?: string;
  examples?: string[];
  subcommands?: CommandDefinition[];
  args?: CommandArg[];
  options?: CommandOption[];
  since?: string;
  experimental?: boolean;
  deprecated?: boolean;
  replacedBy?: string;
  validate?: (args: Record<string, any>) => ValidationResult;
  category:
    | "core"
    | "ai"
    | "security"
    | "compliance"
    | "integration"
    | "session"
    | "utility"
    | "experimental";
}

export interface CommandArg {
  name: string;
  description: string;
  required: boolean;
  choices?: string[];
  validate?: (value: string) => boolean | string;
}

export interface CommandOption {
  flags: string;
  description: string;
  defaultValue?: any;
  choices?: string[];
  required?: boolean;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

function isGitRepo(dir: string): boolean {
  try {
    return fs.existsSync(path.join(dir, ".git"));
  } catch {
    return false;
  }
}

function getStagedFiles(): string[] {
  try {
    const output = execSync("git diff --cached --name-only", {
      encoding: "utf-8",
      stdio: ["ignore", "pipe", "ignore"],
    });
    return output
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

function checkAIStatus(): { available: boolean } {
  try {
    // Fast ping to Ollama's default local port
    execSync(
      "node -e \"const http = require('http'); const req = http.request({ host: '127.0.0.1', port: 11434, path: '/api/tags', timeout: 300 }, (res) => { process.exit(res.statusCode === 200 ? 0 : 1); }); req.on('error', () => process.exit(1)); req.on('timeout', () => { req.destroy(); process.exit(1); }); req.end();\"",
      { stdio: "ignore", timeout: 500 },
    );
    return { available: true };
  } catch {
    return { available: false };
  }
}

export const COMMAND_REGISTRY: CommandDefinition[] = [
  // ── CORE COMMANDS ──
  {
    name: "init",
    aliases: ["initialize", "setup"],
    description: "Initialize DevDiff in the current project",
    longDescription:
      "Creates .devdiff/ directory, configuration file, git hooks, and ignore patterns. Detects existing AI providers and models.",
    examples: [
      "devdiff init",
      "devdiff init --yes",
      "devdiff init --ai ollama",
      "devdiff init --no-hooks",
    ],
    options: [
      { flags: "-y, --yes", description: "Skip prompts, use defaults" },
      {
        flags: "--ai <provider>",
        description: "Default AI provider (ollama, openai, anthropic, auto)",
      },
      { flags: "--no-hooks", description: "Skip git hook installation" },
      { flags: "--force", description: "Overwrite existing configuration" },
      { flags: "--template <name>", description: "Use configuration template" },
    ],
    category: "core",
    validate: (args) => {
      const errors: string[] = [];
      if (!isGitRepo(process.cwd())) {
        errors.push("Not a git repository. Run: git init");
      }
      return {
        valid: errors.length === 0,
        errors,
        warnings: [],
        suggestions: [],
      };
    },
  },
  {
    name: "generate",
    aliases: ["gen", "changelog", "log"],
    description: "Generate changelog from staged changes",
    longDescription:
      "Analyzes staged git changes and generates an AI-powered or template-based changelog. Supports multiple personas, formats, and depth levels.",
    examples: [
      "devdiff generate",
      "devdiff generate --persona developer",
      "devdiff generate --persona ceo --format markdown",
      'devdiff generate --since "HEAD~5..HEAD"',
      'devdiff generate --since "24h" --depth deep',
      "devdiff generate --dry-run",
      "devdiff generate --output CHANGELOG.md",
      "devdiff generate --format mermaid",
      "devdiff generate --depth minimal",
    ],
    options: [
      {
        flags: "-p, --persona <type>",
        description:
          "AI persona: developer, ceo, educator, robot, data-analyst, journalist, pm, compliance",
        defaultValue: "developer",
        choices: [
          "developer",
          "ceo",
          "educator",
          "robot",
          "data-analyst",
          "journalist",
          "pm",
          "compliance",
        ],
      },
      {
        flags: "-f, --format <type>",
        description: "Output format: markdown, json, mermaid",
        defaultValue: "markdown",
        choices: ["markdown", "json", "mermaid"],
      },
      {
        flags: "-d, --dry-run",
        description: "Preview without AI processing (template mode)",
      },
      {
        flags: "--since <range>",
        description: 'Git range: "24h", "1 week", "HEAD~5..HEAD"',
      },
      { flags: "-o, --output <path>", description: "Save changelog to file" },
      {
        flags: "--depth <level>",
        description: "Analysis depth: minimal, standard, deep, exhaustive",
        defaultValue: "standard",
        choices: ["minimal", "standard", "deep", "exhaustive"],
      },
      { flags: "--no-cache", description: "Bypass explanation cache" },
      {
        flags: "--include <pattern>",
        description: "Only include files matching pattern",
      },
      {
        flags: "--exclude <pattern>",
        description: "Exclude files matching pattern",
      },
      {
        flags: "--diagrams",
        description: "Include Mermaid diagrams in output",
      },
      {
        flags: "--local-only",
        description: "Force local AI only (no cloud fallback)",
      },
      {
        flags: "-m, --commit-msg-file <file>",
        description: "Commit message template path for git hook",
      },
      { flags: "-r, --range <range>", description: "Git revision range" },
    ],
    category: "core",
    validate: (args) => {
      const errors: string[] = [];
      const warnings: string[] = [];

      if (!isGitRepo(process.cwd())) {
        errors.push(
          'Not a git repository. Run: git init && git add . && git commit -m "init"',
        );
      }

      if (
        args.persona &&
        ![
          "developer",
          "ceo",
          "educator",
          "robot",
          "data-analyst",
          "journalist",
          "pm",
          "compliance",
        ].includes(args.persona)
      ) {
        errors.push(
          `Invalid persona: "${args.persona}". Valid options: developer, ceo, educator, robot, data-analyst, journalist, pm, compliance`,
        );
      }

      if (
        args.format &&
        !["markdown", "json", "mermaid"].includes(args.format)
      ) {
        errors.push(
          `Invalid format: "${args.format}". Valid options: markdown, json, mermaid`,
        );
      }

      if (
        args.depth &&
        !["minimal", "standard", "deep", "exhaustive"].includes(args.depth)
      ) {
        errors.push(
          `Invalid depth: "${args.depth}". Valid options: minimal, standard, deep, exhaustive`,
        );
      }

      const stagedFiles = getStagedFiles();
      if (stagedFiles.length === 0 && !args.since && !args.range) {
        warnings.push(
          "No staged changes detected. Stage files with: git add .",
        );
        warnings.push("Or use --since flag to analyze past commits");
      }

      if (!args.dryRun) {
        const aiStatus = checkAIStatus();
        if (!aiStatus.available && !args.localOnly) {
          warnings.push(
            "No local AI provider (Ollama) detected. Changelog will be template-based.",
          );
          warnings.push("Install Ollama: https://ollama.com/download");
          warnings.push("Or configure cloud AI: devdiff auth add openai");
        }
      }

      return { valid: errors.length === 0, errors, warnings, suggestions: [] };
    },
  },
  {
    name: "watch",
    aliases: ["observe"],
    description: "Watch repository for changes and auto-generate changelogs",
    examples: [
      "devdiff watch",
      "devdiff watch --auto-generate",
      "devdiff watch --persona pm",
      "devdiff watch --debounce 5000",
    ],
    options: [
      {
        flags: "--auto-generate",
        description: "Auto-generate changelog on each change",
      },
      {
        flags: "-p, --persona <type>",
        description: "Persona for auto-generated changelogs",
      },
      {
        flags: "--debounce <ms>",
        description: "Debounce time in milliseconds",
        defaultValue: "2000",
      },
      { flags: "--once", description: "Run once and exit" },
      {
        flags: "--notify <channels>",
        description: "Notify channels on change (slack, discord, etc.)",
      },
    ],
    category: "core",
  },
  {
    name: "report",
    description: "Serve the web dashboard locally and view changelogs",
    examples: ["devdiff report", "devdiff report --port 4200"],
    options: [
      {
        flags: "-p, --port <port>",
        description: "Port to host the dashboard server",
        defaultValue: "4200",
      },
    ],
    category: "core",
  },
  // ── AI COMMANDS ──
  {
    name: "auth",
    description: "Manage cloud AI provider API keys",
    examples: [
      "devdiff auth add openai",
      "devdiff auth add anthropic",
      "devdiff auth list",
      "devdiff auth remove openai",
      "devdiff auth test openai",
      "devdiff auth rotate anthropic",
    ],
    subcommands: [
      {
        name: "add",
        description: "Add a cloud AI provider API key",
        examples: ["devdiff auth add openai", "devdiff auth add anthropic"],
        args: [
          {
            name: "provider",
            description: "Provider name",
            required: true,
            choices: [
              "openai",
              "anthropic",
              "groq",
              "gemini",
              "deepseek",
              "together",
            ],
          },
        ],
        options: [
          {
            flags: "--key <key>",
            description: "API key (if not provided, prompts securely)",
          },
        ],
        category: "ai",
      },
      {
        name: "list",
        description: "List configured cloud AI providers",
        examples: ["devdiff auth list"],
        category: "ai",
      },
      {
        name: "remove",
        description: "Remove a cloud AI provider",
        examples: ["devdiff auth remove openai"],
        args: [
          {
            name: "provider",
            description: "Provider name",
            required: true,
            choices: [
              "openai",
              "anthropic",
              "groq",
              "gemini",
              "deepseek",
              "together",
            ],
          },
        ],
        category: "ai",
      },
      {
        name: "test",
        description: "Test a provider API key is valid",
        examples: ["devdiff auth test openai"],
        args: [
          { name: "provider", description: "Provider name", required: true },
        ],
        category: "ai",
      },
      {
        name: "rotate",
        description: "Replace an existing API key",
        examples: ["devdiff auth rotate openai"],
        args: [
          { name: "provider", description: "Provider name", required: true },
        ],
        category: "ai",
      },
    ],
    category: "ai",
  },
  // ── SECURITY COMMANDS ──
  {
    name: "security",
    aliases: ["dynamic-security"],
    description: "Behavioral learning profile and adaptive threat rules engine",
    examples: [
      "devdiff security profile",
      "devdiff security check",
      "devdiff security rules",
      "devdiff security feedback rule-123 --true-positive",
      "devdiff security feed --enable",
    ],
    subcommands: [
      {
        name: "profile",
        description: "View 7-day behavioral learning profile",
        category: "security",
      },
      {
        name: "check",
        description: "Run real-time anomaly check against baseline",
        category: "security",
      },
      {
        name: "rules",
        description: "View active adaptive security rules & accuracy",
        category: "security",
      },
      {
        name: "feedback",
        description: "Report true/false positive feedback on a rule",
        category: "security",
      },
      {
        name: "feed",
        description: "Manage threat intelligence feed integration",
        category: "security",
      },
    ],
    category: "security",
  },
  {
    name: "audit",
    description: "View security and privacy audit logs",
    examples: [
      "devdiff audit ai-calls",
      "devdiff audit network",
      "devdiff audit shell",
      "devdiff audit all",
      "devdiff audit export --format json",
    ],
    options: [
      {
        flags: "--package <package>",
        description: "Show audit disclosure for a specific package",
      },
    ],
    subcommands: [
      {
        name: "ai-calls",
        description: "AI call history with token counts",
        category: "security",
      },
      {
        name: "network",
        description: "Network access log",
        category: "security",
      },
      { name: "shell", description: "Shell command log", category: "security" },
      {
        name: "all",
        description: "Complete audit trail",
        category: "security",
      },
      {
        name: "export",
        description: "Export audit logs",
        options: [
          {
            flags: "--format <type>",
            description: "Export format",
            defaultValue: "json",
            choices: ["json", "csv", "markdown"],
          },
        ],
        category: "security",
      },
      {
        name: "clear",
        description: "Clear audit logs",
        options: [{ flags: "--force", description: "Skip confirmation" }],
        category: "security",
      },
    ],
    category: "security",
  },
  {
    name: "disclose",
    aliases: ["transparency", "privacy-report"],
    description: "Full transparency report — see everything DevDiff accesses",
    examples: [
      "devdiff disclose",
      "devdiff disclose --network",
      "devdiff disclose --files",
      "devdiff disclose --ai",
      "devdiff disclose --format json",
    ],
    options: [
      { flags: "--network", description: "Network activity only" },
      { flags: "--files", description: "File access only" },
      { flags: "--ai", description: "AI processing only" },
      {
        flags: "--format <type>",
        description: "Output format",
        defaultValue: "text",
        choices: ["text", "json", "markdown"],
      },
    ],
    category: "security",
  },
  {
    name: "monitor",
    aliases: ["network-monitor", "netwatch"],
    description: "Real-time network activity monitor",
    examples: [
      "devdiff monitor",
      "devdiff monitor --alerts",
      "devdiff monitor --log /tmp/network.log",
    ],
    options: [
      { flags: "--alerts", description: "Alert on any external network call" },
      { flags: "--log <path>", description: "Save log to file" },
    ],
    category: "security",
  },
  // ── COMPLIANCE COMMANDS ──
  {
    name: "compliance",
    description: "Manage compliance frameworks",
    examples: [
      "devdiff compliance list",
      "devdiff compliance apply --framework gdpr",
      "devdiff compliance status",
      "devdiff compliance report --format pdf",
      "devdiff compliance validate --frameworks all",
    ],
    options: [
      { flags: "-f, --framework <id>", description: "Compliance framework ID" },
    ],
    subcommands: [
      {
        name: "list",
        description: "List all supported compliance frameworks",
        examples: ["devdiff compliance list"],
        category: "compliance",
      },
      {
        name: "apply",
        description: "Apply a compliance framework configuration",
        examples: [
          "devdiff compliance apply --framework gdpr",
          "devdiff compliance apply --framework hipaa",
        ],
        options: [
          {
            flags: "--framework <id>",
            description: "Framework ID",
            required: true,
          },
          {
            flags: "--dry-run",
            description: "Preview changes without applying",
          },
        ],
        category: "compliance",
        validate: (args) => {
          const validFrameworks = [
            "gdpr",
            "ccpa",
            "hipaa",
            "soc2",
            "fedramp",
            "iso27001",
            "pipeda",
            "lgpd",
            "pdpa",
            "australia_privacy",
          ];
          if (
            args.framework &&
            !validFrameworks.includes(args.framework.toLowerCase())
          ) {
            return {
              valid: false,
              errors: [
                `Unknown framework: "${args.framework}". Valid: ${validFrameworks.join(", ")}`,
              ],
              warnings: [],
              suggestions: [
                "Run: devdiff compliance list  (to see all frameworks)",
              ],
            };
          }
          return { valid: true, errors: [], warnings: [], suggestions: [] };
        },
      },
      {
        name: "status",
        description: "Show current compliance status",
        examples: ["devdiff compliance status"],
        category: "compliance",
      },
      {
        name: "report",
        description: "Generate compliance audit report",
        examples: [
          "devdiff compliance report",
          "devdiff compliance report --format pdf --output audit.pdf",
        ],
        options: [
          {
            flags: "--format <type>",
            description: "Report format",
            defaultValue: "markdown",
            choices: ["markdown", "pdf", "json"],
          },
          { flags: "--output, -o <path>", description: "Output file path" },
          {
            flags: "--framework <id>",
            description: "Specific framework (default: all active)",
          },
        ],
        category: "compliance",
      },
      {
        name: "validate",
        description: "Validate compliance against frameworks",
        examples: ["devdiff compliance validate --frameworks gdpr,soc2"],
        options: [
          {
            flags: "--frameworks <ids>",
            description: 'Comma-separated framework IDs or "all"',
          },
        ],
        category: "compliance",
      },
    ],
    category: "compliance",
  },
  // ── SESSION COMMANDS ──
  {
    name: "vibe",
    description: "Vibe coding session with auto-checkpoints and zero data loss",
    examples: [
      "devdiff vibe start",
      "devdiff vibe status",
      "devdiff vibe stop",
      "devdiff vibe history",
    ],
    subcommands: [
      {
        name: "start",
        description: "Start a protected vibe coding session",
        examples: [
          "devdiff vibe start",
          "devdiff vibe start --persona developer",
        ],
        options: [
          {
            flags: "--persona, -p <type>",
            description: "Default persona for session",
          },
          {
            flags: "--auto-generate",
            description: "Auto-generate on each commit",
          },
        ],
        category: "session",
      },
      {
        name: "status",
        description: "Show current session statistics",
        examples: ["devdiff vibe status", "devdiff vibe status --json"],
        options: [{ flags: "--json", description: "Machine-readable output" }],
        category: "session",
      },
      {
        name: "stop",
        description: "End session and save summary",
        examples: ["devdiff vibe stop"],
        category: "session",
      },
      {
        name: "history",
        description: "View past session history",
        examples: ["devdiff vibe history", "devdiff vibe history --limit 10"],
        options: [
          {
            flags: "--limit <n>",
            description: "Number of sessions to show",
            defaultValue: "10",
          },
        ],
        category: "session",
      },
    ],
    category: "session",
  },
  {
    name: "recover",
    description: "Recover from checkpoint (zero data loss guarantee)",
    examples: [
      "devdiff recover",
      "devdiff recover --list",
      "devdiff recover --checkpoint ckpt-123",
      "devdiff recover --last",
    ],
    options: [
      { flags: "--list", description: "List all available checkpoints" },
      {
        flags: "--checkpoint <id>",
        description: "Restore specific checkpoint",
      },
      { flags: "--last", description: "Restore most recent checkpoint" },
      { flags: "--force", description: "Skip confirmation" },
    ],
    category: "session",
  },
  {
    name: "mvp",
    description: "Manage MVP storage queue (deferred AI processing)",
    examples: [
      "devdiff mvp status",
      "devdiff mvp process",
      "devdiff mvp process --id mvp-123",
      "devdiff mvp process-all",
      "devdiff mvp clear",
    ],
    subcommands: [
      {
        name: "status",
        description: "Show MVP queue status",
        examples: ["devdiff mvp status"],
        category: "session",
      },
      {
        name: "process",
        description: "Process one queued item",
        examples: ["devdiff mvp process", "devdiff mvp process --id mvp-123"],
        options: [{ flags: "--id <id>", description: "Specific item ID" }],
        category: "session",
      },
      {
        name: "process-all",
        description: "Process entire queue",
        examples: ["devdiff mvp process-all"],
        category: "session",
      },
      {
        name: "clear",
        description: "Clear MVP storage",
        examples: [
          "devdiff mvp clear",
          "devdiff mvp clear --all",
          "devdiff mvp clear --id mvp-123",
        ],
        options: [
          { flags: "--all", description: "Clear all items" },
          { flags: "--id <id>", description: "Clear specific item" },
          { flags: "--force", description: "Skip confirmation" },
        ],
        category: "session",
      },
    ],
    category: "session",
  },
  // ── UTILITY COMMANDS ──
  {
    name: "doctor",
    aliases: ["health", "diagnose", "check"],
    description: "Run full system diagnostic",
    examples: [
      "devdiff doctor",
      "devdiff doctor --fix",
      "devdiff doctor --json",
    ],
    options: [
      { flags: "--fix", description: "Auto-fix common issues" },
      { flags: "--json", description: "Machine-readable output" },
      { flags: "--verbose", description: "Show detailed diagnostics" },
    ],
    category: "utility",
  },
  {
    name: "agent",
    aliases: ["agents", "swarm"],
    description: "DevDiff Agent Orchestration & OpenClaw Supervisor Platform",
    examples: [
      'devdiff agent swarm "Review auth module changes"',
      "devdiff agent deploy --agents architect,security",
      "devdiff agent ask architect --prompt 'Explain rate limiter architecture'",
      "devdiff agent status",
      "devdiff agent dashboard",
    ],
    subcommands: [
      {
        name: "swarm",
        description: "Deploy full multi-agent swarm",
        category: "core",
      },
      {
        name: "deploy",
        description: "Deploy specific agents",
        category: "core",
      },
      { name: "ask", description: "Ask specific agent role", category: "core" },
      {
        name: "parallel",
        description: "Run parallel agent subtasks",
        category: "core",
      },
      {
        name: "status",
        description: "Display agent squad status",
        category: "core",
      },
      {
        name: "dashboard",
        description: "Render Agent Swarm Dashboard",
        category: "core",
      },
      {
        name: "converse",
        description: "Trigger inter-agent bus conversation",
        category: "core",
      },
    ],
    category: "core",
  },
  {
    name: "prompt",
    aliases: ["export-prompt"],
    description:
      "Universal AI prompt exporter for ChatGPT, Claude, Gemini, Copilot",
    examples: [
      "devdiff prompt export --target chatgpt --copy",
      "devdiff prompt export --target claude --output prompt.md",
      "devdiff prompt export --persona ceo --format markdown",
    ],
    subcommands: [
      {
        name: "export",
        description:
          "Export self-contained, copy-paste ready prompt for any AI",
        category: "utility",
      },
    ],
    category: "utility",
  },
  {
    name: "import",
    aliases: ["import-changelog"],
    description:
      "Import AI response back into CHANGELOG.md with quality validation",
    examples: [
      "devdiff import changelog response.md",
      "devdiff import changelog --paste --prepend",
      "devdiff import changelog response.md --output docs/release-notes.md",
    ],
    subcommands: [
      {
        name: "changelog",
        description: "Import AI generated changelog from file or clipboard",
        category: "utility",
      },
    ],
    category: "utility",
  },
  {
    name: "config",
    aliases: ["settings", "cfg"],
    description: "View and manage configuration",
    examples: [
      "devdiff config",
      "devdiff config --path",
      "devdiff config --validate",
      "devdiff config --reset",
      "devdiff config set ai.provider ollama://llama3.2:3b",
    ],
    options: [
      { flags: "--path", description: "Show config file path" },
      { flags: "--validate", description: "Validate current configuration" },
      { flags: "--reset", description: "Reset to defaults" },
      { flags: "--json", description: "JSON output" },
    ],
    category: "utility",
  },
  {
    name: "version",
    aliases: ["-v", "--version"],
    description: "Automated Semantic Versioning & Package Bump Engine",
    examples: [
      "devdiff version",
      "devdiff version bump --type auto",
      "devdiff version bump --type minor --dry-run",
    ],
    subcommands: [
      {
        name: "bump",
        description: "Analyze code changes and bump semver automatically",
        options: [
          {
            flags: "-t, --type <type>",
            description: "Bump type (auto, patch, minor, major)",
            defaultValue: "auto",
          },
          {
            flags: "-d, --dry-run",
            description: "Preview version bump without modifying files",
          },
          {
            flags: "--no-changelog",
            description: "Skip CHANGELOG.md generation",
          },
          { flags: "--no-tag", description: "Skip creating git tag" },
        ],
        category: "core",
      },
      {
        name: "status",
        description: "Display current CLI package version",
        category: "core",
      },
    ],
    options: [
      {
        flags: "--check",
        description: "Check for updates (never auto-updates)",
      },
      { flags: "--info", description: "Detailed version information" },
      { flags: "--changelog", description: "Show version changelog" },
      { flags: "--json", description: "JSON output" },
    ],
    category: "utility",
  },
  {
    name: "context",
    description: "Manage project context for accurate AI explanations",
    examples: [
      "devdiff context generate",
      "devdiff context show",
      "devdiff context edit",
      "devdiff context validate",
    ],
    subcommands: [
      {
        name: "generate",
        description: "Auto-generate project context from codebase",
        examples: [
          "devdiff context generate",
          "devdiff context generate --force",
        ],
        options: [
          { flags: "--force", description: "Overwrite existing context" },
        ],
        category: "utility",
      },
      {
        name: "show",
        description: "Display current project context",
        examples: ["devdiff context show", "devdiff context show --json"],
        options: [{ flags: "--json", description: "JSON output" }],
        category: "utility",
      },
      {
        name: "edit",
        description: "Open context in default editor",
        examples: ["devdiff context edit"],
        category: "utility",
      },
      {
        name: "validate",
        description: "Check context for issues",
        examples: ["devdiff context validate"],
        category: "utility",
      },
    ],
    category: "utility",
  },
  {
    name: "playground",
    aliases: ["ui", "web", "dashboard"],
    description: "Start local web playground",
    examples: [
      "devdiff playground",
      "devdiff playground --port 8080",
      "devdiff playground --open",
    ],
    options: [
      { flags: "--port <n>", description: "Port number", defaultValue: "3737" },
      { flags: "--open", description: "Auto-open in browser" },
      { flags: "--no-open", description: "Do not open browser" },
      {
        flags: "--host <host>",
        description: "Bind host",
        defaultValue: "127.0.0.1",
      },
      { flags: "-w, --workspace <path>", description: "Workspace path" },
    ],
    category: "integration",
  },
  // ── AGENTIC COMMANDS ──
  {
    name: "agentic",
    description: "Manage agentic workspace integration",
    examples: [
      "devdiff agentic status",
      "devdiff agentic enable",
      "devdiff agentic disable",
      "devdiff agentic disable --agent copilot",
    ],
    subcommands: [
      {
        name: "status",
        description: "Show agentic mode status",
        examples: ["devdiff agentic status"],
        category: "integration",
      },
      {
        name: "enable",
        description: "Enable agentic mode",
        examples: [
          "devdiff agentic enable",
          "devdiff agentic enable --auto-start",
        ],
        options: [
          { flags: "--auto-start", description: "Auto-start on IDE open" },
        ],
        category: "integration",
      },
      {
        name: "disable",
        description: "Disable agentic mode",
        examples: [
          "devdiff agentic disable",
          "devdiff agentic disable --agent copilot",
        ],
        options: [
          {
            flags: "--agent <name>",
            description: "Disable for specific agent",
          },
          { flags: "--auto-start", description: "Disable auto-start only" },
        ],
        category: "integration",
      },
    ],
    category: "integration",
  },
  {
    name: "mcp",
    description: "Start the DevDiff MCP Server",
    examples: ["devdiff mcp serve"],
    options: [
      {
        flags: "--http",
        description: "Use HTTP SSE transport instead of stdio",
      },
      {
        flags: "--port <port>",
        description: "Port for HTTP SSE transport",
        defaultValue: "3739",
      },
    ],
    category: "integration",
  },
  {
    name: "plugin",
    description: "Manage DevDiff plugins",
    examples: [
      "devdiff plugin list",
      "devdiff plugin install @eldrex/plugin-slack",
      "devdiff plugin remove my-plugin",
      "devdiff plugin create my-plugin",
    ],
    subcommands: [
      {
        name: "list",
        description: "List installed plugins",
        examples: ["devdiff plugin list"],
        category: "integration",
      },
      {
        name: "install",
        description: "Install a plugin",
        examples: [
          "devdiff plugin install @eldrex/plugin-slack",
          "devdiff plugin install ./my-plugin",
        ],
        args: [
          {
            name: "plugin",
            description: "Plugin name or path",
            required: true,
          },
        ],
        category: "integration",
      },
      {
        name: "remove",
        description: "Remove a plugin",
        examples: ["devdiff plugin remove my-plugin"],
        args: [{ name: "plugin", description: "Plugin name", required: true }],
        category: "integration",
      },
      {
        name: "create",
        description: "Create a new plugin from template",
        examples: ["devdiff plugin create my-plugin"],
        args: [{ name: "name", description: "Plugin name", required: true }],
        options: [
          {
            flags: "--template <name>",
            description: "Template: basic, notifier, custom-persona",
            defaultValue: "basic",
          },
        ],
        category: "integration",
      },
    ],
    category: "integration",
    experimental: false,
    since: "1.0.6",
  },
  // ── PERSISTENT MEMORY COMMANDS ──
  {
    name: "memory",
    description:
      "Manage persistent codebase memory engine and snapshot history",
    examples: [
      "devdiff memory init",
      "devdiff memory status",
      "devdiff memory rescan",
      "devdiff memory clear-conversation",
      "devdiff memory clear-all",
    ],
    subcommands: [
      {
        name: "init",
        description: "Perform one-time full codebase scan and build index",
        examples: ["devdiff memory init"],
        category: "core",
      },
      {
        name: "status",
        description: "Display codebase index stats and snapshot history",
        examples: ["devdiff memory status"],
        category: "core",
      },
      {
        name: "rescan",
        description: "Force a full re-scan of the codebase",
        examples: ["devdiff memory rescan"],
        category: "core",
      },
      {
        name: "clear-conversation",
        description: "Clear continuous chat conversation history",
        examples: ["devdiff memory clear-conversation"],
        category: "core",
      },
      {
        name: "clear-all",
        description: "Clear all codebase memory indices and snapshots",
        examples: ["devdiff memory clear-all"],
        category: "core",
      },
    ],
    category: "core",
    since: "1.5.0",
  },
  {
    name: "ask",
    description:
      "Query persistent codebase memory with instant response and continuous context",
    examples: [
      'devdiff ask "What changed since yesterday?"',
      'devdiff ask "Show me the history of UserService"',
      'devdiff ask "When was the auth module added?"',
      'devdiff ask "What does it depend on?"',
    ],
    args: [
      {
        name: "question",
        description: "Question about codebase or history",
        required: true,
      },
    ],
    category: "core",
    since: "1.5.0",
  },
  {
    name: "skill",
    description: "Manage SKILL.md project knowledge base for AI precision",
    subcommands: [
      {
        name: "generate",
        description: "Auto-generate SKILL.md by scanning project topology",
        category: "core",
      },
      {
        name: "validate",
        description:
          "Validate SKILL.md coverage across 10 required knowledge sections",
        category: "core",
      },
    ],
    category: "core",
    since: "1.5.0",
  },
  {
    name: "schedule",
    description: "Manage 24/7 background operation schedules",
    subcommands: [
      {
        name: "list",
        description: "List all active background operation schedules",
        category: "core",
      },
      {
        name: "enable",
        description: "Enable a specific background schedule",
        category: "core",
      },
      {
        name: "disable",
        description: "Disable a specific background schedule",
        category: "core",
      },
    ],
    category: "core",
    since: "1.5.0",
  },
  {
    name: "release",
    description:
      "Automated SemVer bump + CHANGELOG.md generation + Git tag + Push",
    options: [
      {
        flags: "-t, --type <type>",
        description: "Bump type (auto, patch, minor, major)",
        defaultValue: "auto",
      },
      {
        flags: "-d, --dry-run",
        description: "Preview release actions without mutating workspace",
      },
    ],
    category: "core",
    since: "1.5.0",
  },
  {
    name: "storage",
    description: "Inspect package sizes and manage .devdiff storage footprint",
    longDescription:
      "Display sizes of all installed @eldrex packages and the workspace .devdiff directory. Supports storage cleanup for old cache and checkpoints.",
    examples: ["devdiff storage", "devdiff storage clean"],
    subcommands: [
      {
        name: "clean",
        description: "Remove expired cache (>7 days) and prune older checkpoints",
        category: "utility",
      },
    ],
    category: "utility",
    since: "1.7.0",
  },
];
