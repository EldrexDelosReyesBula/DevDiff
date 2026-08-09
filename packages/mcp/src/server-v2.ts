/**
 * DevDiff MCP Server v2.0 — Agent-First Q&A Edition (v1.5.0)
 *
 * Exposes DevDiff as a first-class AI agent tool.
 * Any MCP-compatible agent (Claude, Gemini, Copilot, Cursor, Continue.dev)
 * can call these tools with natural language.
 *
 * v1.5.0 adds Agent-First Q&A:
 * — DevDiff indexes the codebase ONCE (persistent memory)
 * — IDE agents query the index via MCP (devdiff_query_*)
 * — IDE agents use their OWN tokens to synthesize answers
 * — DevDiff provides KNOWLEDGE (10-50ms). IDE agent provides INTELLIGENCE.
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { DevDiffEngine, PersistentMemory } from "@eldrex/core";
import { CODEBASE_QUERY_TOOLS } from "./tools/codebase-query-tools.js";
import * as http from "http";
import * as url from "url";

// Shared persistent memory instance — initialized once on server start
let _memory: PersistentMemory | null = null;
async function getMemory(): Promise<PersistentMemory> {
  if (!_memory) {
    _memory = new PersistentMemory(process.cwd());
    await _memory.initialize();
  }
  return _memory;
}

const server = new Server(
  {
    name: "devdiff-agent",
    version: "1.5.0",
    description:
      "Privacy-first changelog intelligence + Agent-First codebase Q&A — accessible via natural language",
  },
  {
    capabilities: {
      tools: {},
      resources: {},
      prompts: {},
    },
  },
);

// ═══════════════════════════════════════════════════════════
// TOOLS — What AI agents can call
// ═══════════════════════════════════════════════════════════

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "devdiff_analyze",
      description:
        "Analyze git changes and generate an intelligent changelog. Use when the user asks about recent changes, what changed today, or wants a changelog.",
      inputSchema: {
        type: "object",
        properties: {
          since: {
            type: "string",
            description:
              'Time range or git revision. Examples: "today", "24h", "1 week", "HEAD~10..HEAD", "last commit"',
          },
          persona: {
            type: "string",
            enum: [
              "developer",
              "ceo",
              "educator",
              "pm",
              "compliance",
              "journalist",
              "data-analyst",
              "robot",
            ],
            description:
              'Output style. Use "ceo" for executives, "developer" for code reviews, "pm" for product updates.',
          },
          format: {
            type: "string",
            enum: ["markdown", "json", "mermaid"],
            description: 'Output format. Use "mermaid" for diagrams.',
          },
          include_diagrams: {
            type: "boolean",
            description: "Include Mermaid architecture diagrams",
          },
        },
        required: ["since"],
      },
    },
    {
      name: "devdiff_security_scan",
      description:
        "Perform security-focused code review. Use when user asks about security implications, vulnerabilities, or compliance.",
      inputSchema: {
        type: "object",
        properties: {
          since: { type: "string", description: "Time range to scan" },
          severity_threshold: {
            type: "string",
            enum: ["low", "medium", "high", "critical"],
            description: "Minimum severity to report",
          },
        },
        required: ["since"],
      },
    },
    {
      name: "devdiff_explain_change",
      description:
        'Explain a specific file change or commit in detail. Use when user asks "why was this file changed?" or "explain this commit".',
      inputSchema: {
        type: "object",
        properties: {
          file_path: { type: "string", description: "Path to the file" },
          commit_sha: {
            type: "string",
            description: "Specific commit hash (optional)",
          },
        },
        required: ["file_path"],
      },
    },
    {
      name: "devdiff_compliance_check",
      description:
        "Check changes against a compliance framework. Use when user asks about GDPR, HIPAA, SOC2 compliance.",
      inputSchema: {
        type: "object",
        properties: {
          framework: {
            type: "string",
            enum: [
              "gdpr",
              "hipaa",
              "soc2",
              "fedramp",
              "iso27001",
              "pipeda",
              "lgpd",
              "pdpa",
            ],
          },
          since: { type: "string" },
        },
        required: ["framework", "since"],
      },
    },
    {
      name: "devdiff_architecture_diagram",
      description:
        "Generate architecture or dependency diagram from recent changes. Use when user asks to visualize changes.",
      inputSchema: {
        type: "object",
        properties: {
          type: {
            type: "string",
            enum: ["architecture", "dependencies", "flowchart", "timeline"],
          },
          since: { type: "string" },
        },
        required: ["type", "since"],
      },
    },
    {
      name: "devdiff_project_context",
      description:
        'Get project overview — what this codebase does, its architecture, key modules. Use when user asks "what is this project?" or needs context.',
      inputSchema: {
        type: "object",
        properties: {},
      },
    },
    {
      name: "devdiff_find_related_changes",
      description:
        'Find changes related to a specific function, class, or module. Use when user asks "what else changed with X?"',
      inputSchema: {
        type: "object",
        properties: {
          identifier: {
            type: "string",
            description: "Function name, class name, or file path",
          },
          since: { type: "string", description: "How far back to search" },
        },
        required: ["identifier"],
      },
    },
    {
      name: "devdiff_status",
      description:
        'Get current DevDiff status — active session, AI provider, recent changes count. Use when user asks "is DevDiff running?"',
      inputSchema: {
        type: "object",
        properties: {},
      },
    },
    // ── Agent-First Q&A Tools (v1.5.0) ──
    ...CODEBASE_QUERY_TOOLS,
  ],
}));

// ═══════════════════════════════════════════════════════════
// PROMPTS — Pre-built templates for agents
// ═══════════════════════════════════════════════════════════

server.setRequestHandler(ListPromptsRequestSchema, async () => ({
  prompts: [
    {
      name: "daily-standup",
      description: "Generate a daily standup summary of all changes",
      arguments: [
        { name: "since", description: "Time range", required: false },
      ],
    },
    {
      name: "pr-review",
      description:
        "Generate a pull request review with security and architecture analysis",
      arguments: [
        { name: "base_branch", description: "Base branch", required: true },
        { name: "head_branch", description: "Head branch", required: true },
      ],
    },
    {
      name: "release-notes",
      description: "Generate public-facing release notes",
      arguments: [
        { name: "since", description: "Since last release", required: false },
      ],
    },
    {
      name: "security-audit",
      description: "Full security audit of recent changes",
      arguments: [
        { name: "since", description: "Time range", required: false },
      ],
    },
    {
      name: "onboarding-summary",
      description:
        "Generate a new developer onboarding summary of the codebase",
      arguments: [],
    },
  ],
}));

// Handle prompt execution
server.setRequestHandler(GetPromptRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case "daily-standup":
      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `Generate a daily standup summary of all code changes since ${args?.since || "24 hours ago"}. Use the devdiff_analyze tool with persona "pm". Format as: 1) What was done, 2) What's in progress, 3) Any blockers.`,
            },
          },
        ],
      };

    case "pr-review":
      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `Review the pull request from ${args?.base_branch} to ${args?.head_branch}. Use devdiff_analyze for the changelog, devdiff_security_scan for vulnerabilities, and devdiff_compliance_check for any compliance issues. Provide a structured review with: Summary, Security Issues, Architecture Impact, Testing Recommendations.`,
            },
          },
        ],
      };

    case "release-notes":
      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `Generate public-facing release notes for changes since ${args?.since || "last release"}. Use devdiff_analyze with persona "journalist". Include: New Features, Improvements, Bug Fixes, Breaking Changes (if any), and Upgrade Guide.`,
            },
          },
        ],
      };

    case "security-audit":
      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `Perform a full security audit of changes since ${args?.since || "1 week"}. Use devdiff_security_scan, devdiff_compliance_check for all applicable frameworks, and devdiff_analyze for context. Report: Critical Issues, High Priority, Medium Priority, Recommendations.`,
            },
          },
        ],
      };

    case "onboarding-summary":
      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `Generate a new developer onboarding summary. Use devdiff_project_context to understand the codebase, then explain: 1) What this project does, 2) Architecture overview, 3) Key modules and their purposes, 4) Development setup, 5) Recent major changes.`,
            },
          },
        ],
      };

    default:
      throw new Error(`Unknown prompt: ${name}`);
  }
});

// ═══════════════════════════════════════════════════════════
// TOOL HANDLERS
// ═══════════════════════════════════════════════════════════

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const engine = new DevDiffEngine({ workspacePath: process.cwd() });

  switch (name) {
    case "devdiff_analyze": {
      const since = (args as any).since || "24h";
      const persona = (args as any).persona || "developer";
      const format = (args as any).format || "markdown";

      const result = await engine.analyze({
        since: parseTimeRange(since),
        persona,
        format,
        includeDiagrams: (args as any).include_diagrams || false,
      });

      return {
        content: [
          {
            type: "text",
            text:
              typeof result === "string"
                ? result
                : result.summary || JSON.stringify(result, null, 2),
          },
        ],
      };
    }

    case "devdiff_security_scan": {
      const result = await engine.securityScan({
        since: parseTimeRange((args as any).since || "24h"),
        threshold: (args as any).severity_threshold || "medium",
      });

      return {
        content: [
          {
            type: "text",
            text: formatSecurityResults(result),
          },
        ],
      };
    }

    case "devdiff_explain_change": {
      const result = await engine.explainFile({
        filePath: (args as any).file_path,
        commitSha: (args as any).commit_sha,
      });

      return {
        content: [{ type: "text", text: result }],
      };
    }

    case "devdiff_compliance_check": {
      const result = await engine.complianceCheck({
        framework: (args as any).framework,
        since: parseTimeRange((args as any).since || "1 week"),
      });

      return {
        content: [{ type: "text", text: formatComplianceResults(result) }],
      };
    }

    case "devdiff_architecture_diagram": {
      const diagram = await engine.generateDiagram({
        type: (args as any).type,
        since: parseTimeRange((args as any).since || "1 week"),
      });

      return {
        content: [{ type: "text", text: diagram }],
      };
    }

    case "devdiff_project_context": {
      const context = await engine.getProjectContext();

      return {
        content: [{ type: "text", text: context }],
      };
    }

    case "devdiff_find_related_changes": {
      const changes = await engine.findRelatedChanges({
        identifier: (args as any).identifier,
        since: parseTimeRange((args as any).since || "1 month"),
      });

      return {
        content: [{ type: "text", text: formatRelatedChanges(changes) }],
      };
    }

    case "devdiff_status": {
      const status = await engine.getStatus();

      return {
        content: [{ type: "text", text: formatStatus(status) }],
      };
    }

    // ════════════════════════════════════════════════════════════
    // AGENT-FIRST Q&A HANDLERS (v1.5.0)
    // These query the persistent codebase index — sub-50ms each.
    // The IDE agent synthesizes the final answer from this data.
    // ════════════════════════════════════════════════════════════

    case "devdiff_query_entity": {
      const mem = await getMemory();
      const result = mem.queryEntity((args as any).name, {
        includeHistory: (args as any).include_history !== false,
        includeDependencies: (args as any).include_dependencies !== false,
      });
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    }

    case "devdiff_query_changes": {
      const mem = await getMemory();
      const result = mem.queryChanges(
        (args as any).since || "7d",
        (args as any).filter || "all",
        (args as any).module,
      );
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    }

    case "devdiff_query_dependencies": {
      const mem = await getMemory();
      const result = mem.queryDependencies(
        (args as any).name,
        (args as any).direction || "both",
        (args as any).max_depth || 2,
      );
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    }

    case "devdiff_query_architecture": {
      const mem = await getMemory();
      const result = mem.queryArchitecture(
        (args as any).module,
        (args as any).include_diagram || false,
      );
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    }

    case "devdiff_query_search": {
      const mem = await getMemory();
      const result = mem.querySearch(
        (args as any).query,
        (args as any).type || "all",
        (args as any).limit || 10,
      );
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    }

    case "devdiff_query_compliance": {
      const mem = await getMemory();
      const result = mem.queryCompliance(
        (args as any).framework || "all",
        (args as any).severity || "medium",
      );
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    }

    case "devdiff_query_stats": {
      const mem = await getMemory();
      const result = mem.queryStats((args as any).include_trends || false);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    }

    case "devdiff_query_timeline": {
      const mem = await getMemory();
      const result = mem.queryTimeline(
        (args as any).name,
        (args as any).since || "30d",
      );
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

// ── Formatting Helpers ──

function formatSecurityResults(result: any): string {
  if (
    !result ||
    !result.vulnerabilities ||
    result.vulnerabilities.length === 0
  ) {
    return "✅ No security vulnerabilities detected in the specified changes.";
  }

  let output = `## 🛡️ DevDiff Security Scan Report\n\n`;
  output += `Detected ${result.vulnerabilities.length} issue(s):\n\n`;
  for (const v of result.vulnerabilities) {
    const sev = v.severity ? v.severity.toUpperCase() : "MEDIUM";
    output += `### ⚠️ [${sev}] ${v.title || "Security Finding"}\n`;
    output += `- **File:** \`${v.file || "N/A"}\`\n`;
    if (v.line) output += `- **Line:** ${v.line}\n`;
    output += `- **Description:** ${v.description || "No description provided."}\n`;
    if (v.remediation) output += `- **Remediation:** ${v.remediation}\n`;
    output += `\n`;
  }
  return output;
}

function formatComplianceResults(result: any): string {
  let output = `## 🔒 DevDiff Compliance Report\n\n`;
  output += `- **Framework:** ${result.framework?.toUpperCase() || "Unknown"}\n`;
  output += `- **Status:** ${result.compliant ? "✅ COMPLIANT" : "❌ NON-COMPLIANT"}\n\n`;

  if (result.findings && result.findings.length > 0) {
    output += `### Findings:\n`;
    for (const f of result.findings) {
      const statusIcon =
        f.status === "passed" ? "✅" : f.status === "failed" ? "❌" : "⚠️";
      output += `- ${statusIcon} **${f.rule}**: ${f.description}\n`;
    }
  } else {
    output += `No specific compliance findings reported.\n`;
  }
  return output;
}

function formatRelatedChanges(changes: any[]): string {
  if (!changes || changes.length === 0) {
    return "ℹ️ No related changes found for the specified identifier.";
  }

  let output = `### Related Changes\n\n`;
  for (const c of changes) {
    output += `- \`${c.sha}\` - ${c.author}, ${c.date} : ${c.message}\n`;
  }
  return output;
}

function formatStatus(status: any): string {
  let output = `## 📊 DevDiff Status Report\n\n`;
  output += `- **Workspace:** \`${status.workspacePath}\`\n`;
  output += `- **Vibe Session Active:** ${status.sessionActive ? "🟢 Yes" : "⚪ No"}\n`;
  output += `- **Preferred AI Provider:** \`${status.providerInfo}\`\n`;
  output += `- **Staged Files Count:** ${status.stagedCount}\n`;
  output += `- **Unstaged Files Count:** ${status.unstagedCount}\n`;
  return output;
}

// ── Utility: Parse natural language time ranges ──

function parseTimeRange(input: string): string {
  const patterns: Record<string, string> = {
    today: "24h",
    yesterday: "48h",
    "this week": "7d",
    "last week": "14d",
    "this month": "30d",
    "last commit": "HEAD~1..HEAD",
    "last 5 commits": "HEAD~5..HEAD",
    "last 10 commits": "HEAD~10..HEAD",
  };

  // Exact match
  if (patterns[input.toLowerCase()]) {
    return patterns[input.toLowerCase()];
  }

  // Already a git range
  if (input.includes("..")) return input;

  // Already a time range
  if (/^\d+[hdw]$/.test(input)) return input;

  // Default
  return "24h";
}

// ═══════════════════════════════════════════════════════════
// SERVER RUNNER
// ═══════════════════════════════════════════════════════════

export async function startMcpServer(options: {
  transport: "stdio" | "http";
  port?: number;
}) {
  if (options.transport === "stdio") {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("DevDiff MCP Server running via stdio transport.");
  } else {
    const port = options.port || 3739;
    let transport: SSEServerTransport | null = null;

    const httpServer = http.createServer(async (req, res) => {
      const parsedUrl = url.parse(req.url || "", true);

      if (parsedUrl.pathname === "/sse") {
        transport = new SSEServerTransport("/messages", res);
        await server.connect(transport);
      } else if (parsedUrl.pathname === "/messages" && req.method === "POST") {
        if (transport) {
          await transport.handlePostMessage(req, res);
        } else {
          res.statusCode = 400;
          res.end("No active SSE session");
        }
      } else {
        res.statusCode = 404;
        res.end("Not Found");
      }
    });

    httpServer.listen(port, () => {
      console.log(`DevDiff MCP Server running via HTTP SSE on port ${port}`);
    });
  }
}
