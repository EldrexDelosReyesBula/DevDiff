import {
  ParsedDiff,
  ParsedFileDiff,
  ProjectContext,
  ChangelogResult,
  DevDiffPlugin,
  PluginContext,
} from "./index";

export interface MockDiffOptions {
  filesCount?: number;
  additionsPerFile?: number;
  deletionsPerFile?: number;
  filePaths?: string[];
  includeRenames?: boolean;
}

export interface MockContextOptions {
  files?: string[];
  languages?: string[];
  dependencies?: Record<string, string>;
  projectName?: string;
}

export interface PluginValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface BenchmarkResult {
  pluginId: string;
  iterations: number;
  totalDurationMs: number;
  averageDurationMs: number;
  memoryDeltaBytes: number;
}

/**
 * DevDiff Foundations DevTools
 * Utilities for developing, unit-testing, validating, and benchmarking DevDiff plugins and extensions.
 */
export class DevDiffDevTools {
  /**
   * Generates a realistic mock `ParsedDiff` for unit tests and local simulation.
   */
  static mockDiff(options?: MockDiffOptions): ParsedDiff {
    const count = options?.filesCount || 2;
    const additionsCount = options?.additionsPerFile || 5;
    const deletionsCount = options?.deletionsPerFile || 2;
    const customPaths = options?.filePaths || [];

    const files: ParsedFileDiff[] = [];
    const changes: Array<{
      type: "addition" | "deletion";
      line: number;
      content: string;
    }> = [];

    for (let i = 0; i < count; i++) {
      const filePath = customPaths[i] || `src/module_${i + 1}.ts`;
      const isNew = i === 0 && count > 1;
      const isRename = Boolean(options?.includeRenames && i === 1);

      const hunks = [
        {
          header: `@@ -1,${deletionsCount} +1,${additionsCount} @@`,
          oldStart: 1,
          oldLines: deletionsCount,
          newStart: 1,
          newLines: additionsCount,
          lines: [
            ...Array.from({ length: deletionsCount }, (_, idx) => ({
              type: "deletion" as const,
              content: `- const oldVar${idx} = ${idx};`,
              ln1: idx + 1,
            })),
            ...Array.from({ length: additionsCount }, (_, idx) => ({
              type: "addition" as const,
              content: `+ const newVar${idx} = ${idx * 2}; // enhanced`,
              ln2: idx + 1,
            })),
          ],
        },
      ];

      for (let d = 0; d < deletionsCount; d++) {
        changes.push({
          type: "deletion",
          line: d + 1,
          content: `const oldVar${d} = ${d};`,
        });
      }
      for (let a = 0; a < additionsCount; a++) {
        changes.push({
          type: "addition",
          line: a + 1,
          content: `const newVar${a} = ${a * 2}; // enhanced`,
        });
      }

      files.push({
        path: filePath,
        oldPath: isRename
          ? `src/old_module_${i + 1}.ts`
          : isNew
            ? null
            : filePath,
        newPath: filePath,
        isNew,
        isDeleted: false,
        isRename,
        additions: additionsCount,
        deletions: deletionsCount,
        hunks,
      });
    }

    return {
      files,
      changes,
      totalAdditions: count * additionsCount,
      totalDeletions: count * deletionsCount,
      isEmpty: files.length === 0,
      hasConflicts: false,
    };
  }

  /**
   * Generates a mock `ProjectContext` for testing context-aware hooks.
   */
  static mockContext(options?: MockContextOptions): ProjectContext {
    const files = options?.files || [
      "src/index.ts",
      "src/engine.ts",
      "package.json",
      "README.md",
    ];
    const languages = options?.languages || ["TypeScript", "JSON", "Markdown"];
    const dependencies = options?.dependencies || {
      "@eldrex/core": "1.7.0",
      typescript: "^5.5.0",
    };

    return {
      files,
      languages,
      dependencies,
      structure: {
        src: ["index.ts", "engine.ts"],
        root: ["package.json", "README.md"],
      },
      raw: `# ${options?.projectName || "mock-project"}\n- Primary: TypeScript`,
    };
  }

  /**
   * Generates a mock `ChangelogResult` for testing post-analysis hooks.
   */
  static mockChangelog(summary?: string): ChangelogResult {
    return {
      summary:
        summary ||
        "## Added\n- Added modular DevTools suite for DevDiff Foundations.",
      impact: "minor",
      breaking: false,
      files: [
        {
          path: "src/devtools.ts",
          explanation: "Introduced mock generators and testing harness.",
        },
      ],
      relatedIssues: ["#42"],
      formattedOutput:
        summary || "# Changelog\n\n## Added\n- Added modular DevTools suite.",
    };
  }

  /**
   * Validates a plugin against DevDiff specification and version constraints.
   */
  static validatePlugin(plugin: any): PluginValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!plugin || typeof plugin !== "object") {
      return {
        valid: false,
        errors: ["Plugin must be an object."],
        warnings: [],
      };
    }

    if (!plugin.id || typeof plugin.id !== "string") {
      errors.push("Plugin 'id' is required and must be a non-empty string.");
    } else if (!/^[a-z0-9-_@/]+$/.test(plugin.id)) {
      warnings.push(
        "Plugin 'id' should be alphanumeric with hyphens or underscores (e.g. '@org/my-plugin').",
      );
    }

    if (!plugin.name || typeof plugin.name !== "string") {
      errors.push("Plugin 'name' is required.");
    }

    if (!plugin.version || typeof plugin.version !== "string") {
      errors.push("Plugin 'version' is required (SemVer format).");
    } else if (!/^\d+\.\d+\.\d+/.test(plugin.version)) {
      warnings.push(
        "Plugin 'version' should follow standard SemVer (e.g. '1.0.0').",
      );
    }

    if (plugin.activate && typeof plugin.activate !== "function") {
      errors.push("Plugin 'activate' must be a function if provided.");
    }

    if (plugin.deactivate && typeof plugin.deactivate !== "function") {
      errors.push("Plugin 'deactivate' must be a function if provided.");
    }

    if (plugin.hooks) {
      if (typeof plugin.hooks !== "object") {
        errors.push("Plugin 'hooks' must be an object.");
      } else {
        const allowedHooks = [
          "beforeAnalysis",
          "afterAnalysis",
          "onError",
          "onChangelogGenerated",
          "onFileParsed",
          "onSessionStart",
          "onSessionEnd",
        ];
        for (const hookName of Object.keys(plugin.hooks)) {
          if (!allowedHooks.includes(hookName)) {
            warnings.push(
              `Unknown hook '${hookName}' may not be called by the engine.`,
            );
          } else if (typeof plugin.hooks[hookName] !== "function") {
            errors.push(`Hook '${hookName}' must be a function.`);
          }
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Creates an in-memory test harness to test plugin execution end-to-end.
   */
  static createTestHarness(plugin: DevDiffPlugin) {
    const logs: string[] = [];
    const errorsCaught: any[] = [];

    const store: Record<string, any> = {};
    const mockContext: PluginContext = {
      devdiffVersion: "1.7.0",
      workspacePath: process.cwd(),
      config: {
        get: (key: string) => store[key],
        set: async (key: string, value: any) => {
          store[key] = value;
        },
      },
      storage: {
        get: async (key: string) => store[key],
        set: async (key: string, value: any) => {
          store[key] = value;
        },
        delete: async (key: string) => {
          delete store[key];
        },
        clear: async () => {
          for (const k of Object.keys(store)) delete store[k];
        },
      },
      notifications: {
        send: async (msg) => {
          logs.push(`[NOTIFY] ${msg}`);
        },
        sendToChannel: async (chan, msg) => {
          logs.push(`[NOTIFY:${chan}] ${msg}`);
        },
      },
      logger: {
        info: (msg) => logs.push(`[INFO] ${msg}`),
        warn: (msg) => logs.push(`[WARN] ${msg}`),
        error: (msg) => logs.push(`[ERROR] ${msg}`),
        debug: (msg) => logs.push(`[DEBUG] ${msg}`),
      },
      engine: {
        getStatus: async () => ({
          sessionActive: true,
          providerInfo: "mock-ollama (llama3.2:3b)",
          stagedCount: 1,
          unstagedCount: 0,
          workspacePath: process.cwd(),
        }),
        getProjectContext: async () => DevDiffDevTools.mockContext(),
        getRecentChanges: async () => [
          { path: "src/index.ts", status: "modified" },
        ],
      },
    };

    return {
      getLogs: () => [...logs],
      getErrors: () => [...errorsCaught],

      async activate() {
        if (plugin.activate) {
          await plugin.activate(mockContext);
        }
      },

      async deactivate() {
        if (plugin.deactivate) {
          await plugin.deactivate();
        }
      },

      async runBeforeAnalysis(
        diff?: ParsedDiff,
        context?: ProjectContext,
      ): Promise<ParsedDiff> {
        const inputDiff = diff || DevDiffDevTools.mockDiff();
        const inputContext = context || DevDiffDevTools.mockContext();
        if (plugin.hooks?.beforeAnalysis) {
          try {
            const res = await plugin.hooks.beforeAnalysis(
              inputDiff,
              inputContext,
            );
            return res || inputDiff;
          } catch (err: any) {
            errorsCaught.push(err);
            if (plugin.hooks?.onError) {
              await plugin.hooks.onError({
                name: err.name || "Error",
                message: err.message,
                stack: err.stack,
              });
            }
            throw err;
          }
        }
        return inputDiff;
      },

      async runAfterAnalysis(
        changelog?: ChangelogResult,
      ): Promise<ChangelogResult> {
        const inputChangelog = changelog || DevDiffDevTools.mockChangelog();
        if (plugin.hooks?.afterAnalysis) {
          try {
            const res = await plugin.hooks.afterAnalysis(inputChangelog);
            return res || inputChangelog;
          } catch (err: any) {
            errorsCaught.push(err);
            if (plugin.hooks?.onError) {
              await plugin.hooks.onError({
                name: err.name || "Error",
                message: err.message,
                stack: err.stack,
              });
            }
            throw err;
          }
        }
        return inputChangelog;
      },
    };
  }

  /**
   * Benchmarks the execution speed and overhead of a plugin's hooks.
   */
  static async benchmarkPlugin(
    plugin: DevDiffPlugin,
    options?: { iterations?: number; sampleDiff?: ParsedDiff },
  ): Promise<BenchmarkResult> {
    const iterations = options?.iterations || 50;
    const diff =
      options?.sampleDiff ||
      this.mockDiff({ filesCount: 5, additionsPerFile: 10 });
    const context = this.mockContext();
    const changelog = this.mockChangelog();

    const harness = this.createTestHarness(plugin);
    await harness.activate();

    const memBefore = process.memoryUsage().heapUsed;
    const start = performance.now();

    for (let i = 0; i < iterations; i++) {
      await harness.runBeforeAnalysis(diff, context);
      await harness.runAfterAnalysis(changelog);
    }

    const duration = performance.now() - start;
    const memAfter = process.memoryUsage().heapUsed;

    await harness.deactivate();

    return {
      pluginId: plugin.id,
      iterations,
      totalDurationMs: parseFloat(duration.toFixed(2)),
      averageDurationMs: parseFloat((duration / iterations).toFixed(3)),
      memoryDeltaBytes: Math.max(0, memAfter - memBefore),
    };
  }
}
