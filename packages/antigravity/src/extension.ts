import { DevDiffEngine } from "@eldrex/core";

// Define runtime globals for Antigravity environment
declare const antigravity: {
  tools: {
    register(tool: {
      name: string;
      description: string;
      commands: Array<{
        name: string;
        description: string;
        parameters?: Record<string, { type: string; description?: string }>;
      }>;
      handler: (command: string, params: any) => Promise<any>;
    }): void;
  };
};

let devdiffEngine: DevDiffEngine;

export function activate() {
  devdiffEngine = new DevDiffEngine({
    workspacePath: process.cwd(),
  });

  // Register DevDiff as an Antigravity tool
  antigravity.tools.register({
    name: "devdiff",
    description: "Privacy-first AI changelog intelligence",

    // These become natural language commands
    commands: [
      {
        name: "analyze",
        description: "Analyze git changes and generate changelog",
        parameters: {
          since: { type: "string", description: 'Time range (e.g., "today", "24h", "HEAD~5..HEAD")' },
          persona: { type: "string", description: "Output style (developer, ceo, educator, etc.)" },
          format: { type: "string", description: "Output format (markdown, json, mermaid)" },
        },
      },
      {
        name: "security",
        description: "Security scan of recent changes",
        parameters: {
          since: { type: "string" },
          threshold: { type: "string", description: "Severity threshold (low, medium, high, critical)" },
        },
      },
      {
        name: "explain",
        description: "Explain a specific file or code change",
        parameters: {
          file: { type: "string", description: "File path" },
          context: { type: "string", description: "Additional context (optional)" },
        },
      },
    ],

    // Handler
    handler: async (command, params) => {
      switch (command) {
        case "analyze":
          return await devdiffEngine.analyze(params);
        case "security":
          return await devdiffEngine.securityScan(params);
        case "explain":
          return await devdiffEngine.explainChange(params);
        default:
          throw new Error(`Unknown command: ${command}`);
      }
    },
  });
}
