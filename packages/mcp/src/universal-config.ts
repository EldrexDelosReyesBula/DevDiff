import * as fs from "fs";
import * as path from "path";
import * as os from "os";

export interface MCPConfigOutput {
  standard: any;
  vscode: any;
  cursor: any;
  windsurf: any;
  antigravity: any;
  claudeDesktop: any;
  jetbrains: any;
}

export interface IDEConfigStatus {
  ide: string;
  name: string;
  path: string;
  configured: boolean;
}

export class UniversalMCPConfig {
  /**
   * Generate MCP configuration for ANY IDE that supports MCP.
   * Works with: VS Code, Cursor, Windsurf, Antigravity, Claude Desktop, JetBrains, etc.
   */
  static generate(
    workspacePath: string,
    options?: {
      port?: number;
      useLocalModel?: boolean;
      localModelName?: string;
    },
  ): MCPConfigOutput {
    const port = options?.port || 3739;
    const useLocal = options?.useLocalModel !== false;
    const localModel = options?.localModelName || "llama3.2:3b";

    return {
      // ── Standard MCP format (works everywhere) ──
      standard: {
        mcpServers: {
          devdiff: {
            command: "npx",
            args: ["@eldrex/mcp-server"],
            env: {
              DEVVIFF_WORKSPACE: workspacePath,
              DEVVIFF_USE_LOCAL: useLocal ? "true" : "false",
              DEVVIFF_LOCAL_MODEL: localModel,
              DEVVIFF_MCP_PORT: String(port),
            },
          },
        },
      },

      // ── VS Code format ──
      vscode: {
        mcpServers: {
          devdiff: {
            command: "npx",
            args: ["@eldrex/mcp-server"],
            env: {
              DEVVIFF_WORKSPACE: workspacePath,
              DEVVIFF_USE_LOCAL: "true",
            },
          },
        },
      },

      // ── Cursor format ──
      cursor: {
        mcpServers: {
          devdiff: {
            command: "npx",
            args: ["@eldrex/mcp-server"],
            env: {
              DEVVIFF_WORKSPACE: workspacePath,
            },
          },
        },
      },

      // ── Windsurf format ──
      windsurf: {
        mcpServers: {
          devdiff: {
            command: "npx",
            args: ["@eldrex/mcp-server"],
          },
        },
      },

      // ── Antigravity (Google) format ──
      antigravity: {
        mcpServers: {
          devdiff: {
            command: "npx",
            args: ["@eldrex/mcp-server"],
            env: {
              DEVVIFF_WORKSPACE: workspacePath,
              DEVVIFF_USE_LOCAL: "true",
              DEVVIFF_LOCAL_MODEL: localModel,
            },
          },
        },
      },

      // ── Claude Desktop format ──
      claudeDesktop: {
        mcpServers: {
          devdiff: {
            command: "npx",
            args: ["@eldrex/mcp-server"],
            env: {
              DEVVIFF_WORKSPACE: workspacePath,
            },
          },
        },
      },

      // ── JetBrains format ──
      jetbrains: {
        mcpServers: {
          devdiff: {
            command: "npx",
            args: ["@eldrex/mcp-server"],
            env: {
              DEVVIFF_WORKSPACE: workspacePath,
            },
          },
        },
      },
    };
  }

  /**
   * Get config path for a given IDE
   */
  static getConfigPath(ide: string): string {
    const home = os.homedir();
    switch (ide.toLowerCase()) {
      case "vscode":
        return path.join(home, ".vscode", "mcp.json");
      case "cursor":
        return path.join(home, ".cursor", "mcp.json");
      case "windsurf":
        return path.join(home, ".windsurf", "mcp.json");
      case "antigravity":
        return path.join(home, ".antigravity", "mcp.json");
      case "claude-desktop":
      case "claudedesktop":
      case "claude":
        return path.join(home, ".claude", "mcp.json");
      case "jetbrains":
        return path.join(home, ".jetbrains", "mcp.json");
      default:
        return path.join(home, `.${ide}`, "mcp.json");
    }
  }

  /**
   * Write MCP config to the IDE's expected location
   */
  static async install(
    ide: string,
    workspacePath: string = process.cwd(),
  ): Promise<string> {
    const config = this.generate(workspacePath);
    const normalizedIde = ide.toLowerCase().trim();

    switch (normalizedIde) {
      case "vscode":
        return await this.writeConfig(
          this.getConfigPath("vscode"),
          config.vscode,
          "VS Code",
        );

      case "cursor":
        return await this.writeConfig(
          this.getConfigPath("cursor"),
          config.cursor,
          "Cursor",
        );

      case "windsurf":
        return await this.writeConfig(
          this.getConfigPath("windsurf"),
          config.windsurf,
          "Windsurf",
        );

      case "antigravity":
        return await this.writeConfig(
          this.getConfigPath("antigravity"),
          config.antigravity,
          "Antigravity",
        );

      case "claude-desktop":
      case "claudedesktop":
      case "claude":
        return await this.writeConfig(
          this.getConfigPath("claude-desktop"),
          config.claudeDesktop,
          "Claude Desktop",
        );

      case "jetbrains":
        return await this.writeConfig(
          this.getConfigPath("jetbrains"),
          config.jetbrains,
          "JetBrains",
        );

      default:
        throw new Error(
          `Unknown IDE: "${ide}". Supported: vscode, cursor, windsurf, antigravity, claude-desktop, jetbrains`,
        );
    }
  }

  /**
   * Install MCP configuration for ALL supported IDEs
   */
  static async installAll(
    workspacePath: string = process.cwd(),
  ): Promise<string[]> {
    const ides = [
      "vscode",
      "cursor",
      "windsurf",
      "antigravity",
      "claude-desktop",
      "jetbrains",
    ];
    const results: string[] = [];

    for (const ide of ides) {
      try {
        const res = await this.install(ide, workspacePath);
        results.push(res);
      } catch (err: any) {
        results.push(`❌ ${ide}: ${err.message}`);
      }
    }

    return results;
  }

  /**
   * Inspect MCP configuration status across all IDEs
   */
  static async getStatus(): Promise<IDEConfigStatus[]> {
    const ides = [
      { id: "vscode", name: "VS Code" },
      { id: "cursor", name: "Cursor" },
      { id: "windsurf", name: "Windsurf" },
      { id: "antigravity", name: "Antigravity" },
      { id: "claude-desktop", name: "Claude Desktop" },
      { id: "jetbrains", name: "JetBrains" },
    ];

    return ides.map((item) => {
      const configPath = this.getConfigPath(item.id);
      let configured = false;
      try {
        if (fs.existsSync(configPath)) {
          const raw = fs.readFileSync(configPath, "utf-8");
          const parsed = JSON.parse(raw);
          configured = Boolean(
            parsed.mcpServers?.devdiff || parsed.mcpServers?.["devdiff-agent"],
          );
        }
      } catch {
        configured = false;
      }

      return {
        ide: item.id,
        name: item.name,
        path: configPath,
        configured,
      };
    });
  }

  private static async writeConfig(
    configPath: string,
    config: any,
    displayName: string,
  ): Promise<string> {
    const dir = path.dirname(configPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    let mergedConfig = config;
    if (fs.existsSync(configPath)) {
      try {
        const existing = JSON.parse(fs.readFileSync(configPath, "utf-8"));
        mergedConfig = {
          ...existing,
          mcpServers: {
            ...(existing.mcpServers || {}),
            ...(config.mcpServers || {}),
          },
        };
      } catch {}
    }

    fs.writeFileSync(
      configPath,
      JSON.stringify(mergedConfig, null, 2),
      "utf-8",
    );
    return `✅ ${displayName} MCP config written to ${configPath}`;
  }
}
