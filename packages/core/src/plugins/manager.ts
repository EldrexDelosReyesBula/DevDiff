import * as fs from "fs/promises";
import * as path from "path";
import { loadConfig } from "../config/loader";
import { DevDiffPlugin, PluginContext } from "@eldrex/plugin-sdk";
import { DevDiffEngine } from "../engine";

class FileStorage {
  private filePath: string;
  private data: Record<string, any> = {};

  constructor(filePath: string) {
    this.filePath = filePath;
  }

  async load() {
    try {
      const raw = await fs.readFile(this.filePath, "utf-8");
      this.data = JSON.parse(raw);
    } catch {
      this.data = {};
    }
  }

  async save() {
    try {
      await fs.mkdir(path.dirname(this.filePath), { recursive: true });
      await fs.writeFile(this.filePath, JSON.stringify(this.data, null, 2), "utf-8");
    } catch (e) {
      // Fail silently or print error
    }
  }

  async get(key: string) {
    await this.load();
    return this.data[key];
  }

  async set(key: string, value: any) {
    await this.load();
    this.data[key] = value;
    await this.save();
  }

  async delete(key: string) {
    await this.load();
    delete this.data[key];
    await this.save();
  }

  async clear() {
    this.data = {};
    await this.save();
  }
}

export class PluginManager {
  private plugins: DevDiffPlugin[] = [];
  private workspacePath: string;

  constructor(workspacePath: string) {
    this.workspacePath = workspacePath || process.cwd();
  }

  async loadPlugins() {
    const config = await loadConfig(this.workspacePath);
    // plugins can be paths or packages
    const pluginConfigs = (config as any).plugins || [];

    for (const pluginConf of pluginConfigs) {
      try {
        let plugin: DevDiffPlugin;
        if (typeof pluginConf === "string") {
          const importPath =
            pluginConf.startsWith(".") ||
            pluginConf.startsWith("/") ||
            pluginConf.includes(":")
              ? path.resolve(this.workspacePath, pluginConf)
              : pluginConf;
          const mod = await import(importPath);
          plugin = mod.default || mod.plugin || mod;
        } else {
          plugin = pluginConf;
        }

        if (plugin && plugin.id) {
          const context = this.createContext(plugin);
          if (plugin.activate) {
            await plugin.activate(context);
          }
          this.plugins.push(plugin);
        }
      } catch (err) {
        console.error(`[PluginManager] Failed to load plugin ${pluginConf}:`, err);
      }
    }
  }

  private createContext(plugin: DevDiffPlugin): PluginContext {
    const storagePath = path.resolve(
      this.workspacePath,
      `.devdiff/plugins/${plugin.id}-storage.json`
    );
    const storage = new FileStorage(storagePath);

    const logger = {
      debug: (msg: string, data?: any) =>
        console.debug(`[Plugin: ${plugin.id}] [DEBUG] ${msg}`, data || ""),
      info: (msg: string, data?: any) =>
        console.info(`[Plugin: ${plugin.id}] [INFO] ${msg}`, data || ""),
      warn: (msg: string, data?: any) =>
        console.warn(`[Plugin: ${plugin.id}] [WARN] ${msg}`, data || ""),
      error: (msg: string, error?: Error) =>
        console.error(`[Plugin: ${plugin.id}] [ERROR] ${msg}`, error || ""),
    };

    const configAccessor = {
      get: (key: string) => {
        // Retrieve settings for this specific plugin from the main config
        return (plugin as any).configSchema?.[key]?.default;
      },
      set: async (key: string, value: any) => {
        // Local plugin set config Mock
      },
    };

    const notifications = {
      send: async (message: string, options?: any) => {
        console.log(
          `📣 [Plugin: ${plugin.id}] ${options?.title ? `[${options.title}] ` : ""}${message}`
        );
      },
      sendToChannel: async (channel: string, message: string) => {
        console.log(`📣 [Plugin: ${plugin.id}] [Channel: ${channel}] ${message}`);
      },
    };

    const engineInstance = new DevDiffEngine({ workspacePath: this.workspacePath });

    const engine = {
      getStatus: async () => {
        return await engineInstance.getStatus();
      },
      getProjectContext: async () => {
        const loaded = await engineInstance.getProjectContext();
        return {
          files: [],
          languages: [],
          dependencies: {},
          structure: {},
          raw: loaded,
        };
      },
      getRecentChanges: async (since: string) => {
        const staged = await engineInstance.getStagedFiles();
        return staged.map((f) => ({
          path: f.path,
          status: "modified" as const,
        }));
      },
    };

    return {
      devdiffVersion: "1.0.5",
      workspacePath: this.workspacePath,
      logger,
      config: configAccessor,
      storage,
      notifications,
      engine,
    };
  }

  async deactivateAll() {
    for (const plugin of this.plugins) {
      if (plugin.deactivate) {
        try {
          await plugin.deactivate();
        } catch (err) {
          console.error(`Failed to deactivate plugin ${plugin.id}:`, err);
        }
      }
    }
    this.plugins = [];
  }

  async runBeforeAnalysis(diff: any, projectContext: any): Promise<any> {
    let currentDiff = diff;
    for (const plugin of this.plugins) {
      if (plugin.hooks?.beforeAnalysis) {
        try {
          const result = await plugin.hooks.beforeAnalysis(currentDiff, projectContext);
          if (result) {
            currentDiff = result;
          }
        } catch (err: any) {
          await this.runOnError(err);
        }
      }
    }
    return currentDiff;
  }

  async runAfterAnalysis(changelog: any): Promise<any> {
    let currentChangelog = changelog;
    for (const plugin of this.plugins) {
      if (plugin.hooks?.afterAnalysis) {
        try {
          const result = await plugin.hooks.afterAnalysis(currentChangelog);
          if (result) {
            currentChangelog = result;
          }
        } catch (err: any) {
          await this.runOnError(err);
        }
      }
    }
    return currentChangelog;
  }

  async runOnError(error: any) {
    const devDiffError = {
      name: error.name || "Error",
      message: error.message || String(error),
      stack: error.stack,
    };
    for (const plugin of this.plugins) {
      if (plugin.hooks?.onError) {
        try {
          await plugin.hooks.onError(devDiffError);
        } catch (err) {
          console.error(`Plugin ${plugin.id} onError hook failed:`, err);
        }
      }
    }
  }

  async runOnFileChange(files: any[]) {
    for (const plugin of this.plugins) {
      if (plugin.hooks?.onFileChange) {
        try {
          await plugin.hooks.onFileChange(files);
        } catch (err: any) {
          await this.runOnError(err);
        }
      }
    }
  }

  async runOnCommit(commit: any) {
    for (const plugin of this.plugins) {
      if (plugin.hooks?.onCommit) {
        try {
          await plugin.hooks.onCommit(commit);
        } catch (err: any) {
          await this.runOnError(err);
        }
      }
    }
  }

  async runOnAIComplete(result: any) {
    for (const plugin of this.plugins) {
      if (plugin.hooks?.onAIComplete) {
        try {
          await plugin.hooks.onAIComplete(result);
        } catch (err: any) {
          await this.runOnError(err);
        }
      }
    }
  }
}
