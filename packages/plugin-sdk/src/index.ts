/**
 * @eldrex/plugin-sdk
 *
 * Build DevDiff plugins without touching core.
 * Stable API, semantic versioning, TypeScript-first.
 */

export interface DiffLine {
  type: "addition" | "deletion" | "normal";
  content: string;
  ln1?: number;
  ln2?: number;
}

export interface DiffHunk {
  header: string;
  oldStart: number;
  oldLines: number;
  newStart: number;
  newLines: number;
  lines: DiffLine[];
}

export interface ParsedFileDiff {
  oldPath: string | null;
  newPath: string | null;
  isNew: boolean;
  isDeleted: boolean;
  isRename: boolean;
  hunks: DiffHunk[];
  path?: string;
  additions?: number;
  deletions?: number;
  isBinary?: boolean;
  content?: string;
  renamed?: boolean;
}

export interface ParsedDiff {
  files: ParsedFileDiff[];
  changes: {
    type: "addition" | "deletion";
    line: number;
    content: string;
  }[];
  totalAdditions?: number;
  totalDeletions?: number;
  isEmpty?: boolean;
  hasConflicts?: boolean;
}

export interface ProjectContext {
  files: string[];
  languages: string[];
  dependencies: Record<string, string>;
  structure: any;
  raw?: string;
}

export interface ChangelogResult {
  summary: string;
  impact: "none" | "minor" | "major" | "breaking";
  breaking: boolean;
  files: {
    path: string;
    explanation: string;
  }[];
  relatedIssues: string[];
  formattedOutput: string;
}

export interface DevDiffError {
  name: string;
  message: string;
  stack?: string;
}

export interface ChangedFile {
  path: string;
  status: "added" | "modified" | "deleted" | "renamed";
}

export interface GitCommit {
  sha: string;
  message: string;
  author: string;
  date: string;
}

export interface AIResult {
  summary: string;
  provider: string;
  model: string;
  tokensUsed?: number;
  cost?: number;
}

export interface DevDiffStatus {
  sessionActive: boolean;
  providerInfo: string;
  stagedCount: number;
  unstagedCount: number;
  workspacePath: string;
}

export interface DevDiffPlugin {
  /** Unique plugin ID */
  id: string;

  /** Human-readable name */
  name: string;

  /** Semantic version */
  version: string;

  /** Brief description */
  description: string;

  /** Author info */
  author: {
    name: string;
    email?: string;
    url?: string;
  };

  /** Minimum DevDiff version required */
  devdiffVersion: string;

  /** Plugin initialization */
  activate?: (context: PluginContext) => Promise<void>;

  /** Plugin cleanup */
  deactivate?: () => Promise<void>;

  /** Hooks */
  hooks?: {
    /** Called before AI analysis */
    beforeAnalysis?: (
      diff: ParsedDiff,
      context: ProjectContext,
    ) => Promise<ParsedDiff | void>;

    /** Called after AI analysis */
    afterAnalysis?: (
      changelog: ChangelogResult,
    ) => Promise<ChangelogResult | void>;

    /** Called on any error */
    onError?: (error: DevDiffError) => Promise<void>;

    /** Called when files change */
    onFileChange?: (files: ChangedFile[]) => Promise<void>;

    /** Called when a commit is detected */
    onCommit?: (commit: GitCommit) => Promise<void>;

    /** Called when AI call completes */
    onAIComplete?: (result: AIResult) => Promise<void>;
  };

  /** Custom commands to register */
  commands?: PluginCommand[];

  /** Custom configuration schema */
  configSchema?: Record<string, any>;
}

export interface PluginContext {
  /** DevDiff version */
  devdiffVersion: string;

  /** Workspace path */
  workspacePath: string;

  /** Logger instance */
  logger: PluginLogger;

  /** Configuration access */
  config: PluginConfig;

  /** Storage for plugin data */
  storage: PluginStorage;

  /** Notification service */
  notifications: PluginNotifications;

  /** Access to DevDiff engine (read-only) */
  engine: {
    getStatus: () => Promise<DevDiffStatus>;
    getProjectContext: () => Promise<ProjectContext>;
    getRecentChanges: (since: string) => Promise<ChangedFile[]>;
  };
}

export interface PluginLogger {
  debug(message: string, data?: any): void;
  info(message: string, data?: any): void;
  warn(message: string, data?: any): void;
  error(message: string, error?: Error): void;
}

export interface PluginConfig {
  get(key: string): any;
  set(key: string, value: any): Promise<void>;
}

export interface PluginStorage {
  get(key: string): Promise<any>;
  set(key: string, value: any): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
}

export interface PluginNotifications {
  send(message: string, options?: NotificationOptions): Promise<void>;
  sendToChannel(channel: string, message: string): Promise<void>;
}

export interface PluginCommand {
  name: string;
  description: string;
  handler: (args: string[]) => Promise<void>;
}

export interface NotificationOptions {
  level?: "info" | "warning" | "error";
  channels?: string[];
  title?: string;
  url?: string;
}

// ── DEVTOOLS SUITE FOR DEVS & EXTENSION AUTHORS ──
export {
  DevDiffDevTools,
  MockDiffOptions,
  MockContextOptions,
  PluginValidationResult,
  BenchmarkResult,
} from "./devtools";
