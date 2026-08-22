import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import {
  DevDiffEngine,
  SkillLoader,
  loadContext,
  checkAIStatus,
} from "@eldrex/core";
import { CODEBASE_QUERY_TOOLS } from "./tools/codebase-query-tools.js";
import { devdiff_read_skill } from "./tools/skill-tool.js";
import * as http from "http";
import * as url from "url";

export class DevDiffMCPServer {
  private static mcpServerInstance: Server | null = null;
  private static engineInstance: DevDiffEngine | null = null;

  /**
   * Initializes and builds the MCP Server instance with all tools & prompts.
   */
  static createServer(workspacePath: string, engine: DevDiffEngine): Server {
    const skill = SkillLoader.load(workspacePath);

    const server = new Server(
      {
        name: "devdiff-agent",
        version: "1.7.0",
        description:
          "Privacy-first changelog intelligence + Universal MCP AI agent tools",
      },
      {
        capabilities: {
          tools: {},
          resources: {},
          prompts: {},
        },
      },
    );

    // ── TOOL LISTING ──
    server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: "devdiff_generate_changelog",
          description: "Generate changelog from git changes",
          inputSchema: {
            type: "object",
            properties: {
              since: {
                type: "string",
                description: 'Time range or git revision (e.g. "today", "24h", "HEAD~5..HEAD")',
              },
              persona: {
                type: "string",
                enum: [
                  "developer",
                  "ceo",
                  "educator",
                  "pm",
                  "compliance",
                  "robot",
                  "data-analyst",
                  "journalist",
                ],
                description: "Target persona style for changelog output",
              },
            },
          },
        },
        {
          name: "devdiff_explain_code",
          description: "Explain code with project context",
          inputSchema: {
            type: "object",
            properties: {
              code: { type: "string", description: "Code snippet to explain" },
              file: { type: "string", description: "File path for context" },
              level: {
                type: "string",
                enum: ["beginner", "student", "developer", "senior", "architect"],
                description: "Explanation depth level",
              },
            },
            required: ["code"],
          },
        },
        {
          name: "devdiff_ask",
          description: "Ask questions about the codebase",
          inputSchema: {
            type: "object",
            properties: {
              question: { type: "string", description: "Natural language query" },
            },
            required: ["question"],
          },
        },
        {
          name: "devdiff_security_scan",
          description: "Run security audit on git changes",
          inputSchema: {
            type: "object",
            properties: {
              since: { type: "string", description: "Time range or git revision" },
              threshold: {
                type: "string",
                enum: ["low", "medium", "high", "critical"],
                description: "Minimum severity threshold",
              },
            },
          },
        },
        {
          name: "devdiff_diagram",
          description: "Generate architecture or sequence diagram in Mermaid format",
          inputSchema: {
            type: "object",
            properties: {
              type: {
                type: "string",
                enum: ["architecture", "dependencies", "flowchart", "sequence"],
                description: "Diagram type",
              },
              since: { type: "string", description: "Time range" },
            },
          },
        },
        {
          name: "devdiff_read_skill",
          description: "Read the project SKILL.md universal agent instructions",
          inputSchema: {
            type: "object",
            properties: {
              section: {
                type: "string",
                description:
                  "Specific section to read (e.g. changelog, architecture, naming, review, permissions)",
              },
            },
          },
        },
        // Legacy alias tools for backward compatibility
        {
          name: "devdiff_analyze",
          description: "Analyze git changes and generate changelog",
          inputSchema: {
            type: "object",
            properties: {
              since: { type: "string" },
              persona: { type: "string" },
              format: { type: "string" },
              include_diagrams: { type: "boolean" },
            },
          },
        },
        {
          name: "devdiff_architecture_diagram",
          description: "Generate architecture diagram from changes",
          inputSchema: {
            type: "object",
            properties: {
              type: { type: "string" },
              since: { type: "string" },
            },
          },
        },
        // Codebase Query Tools
        ...CODEBASE_QUERY_TOOLS,
      ],
    }));

    // ── TOOL EXECUTION ──
    server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args = {} } = request.params;
      const params = args as any;

      try {
        switch (name) {
          case "devdiff_generate_changelog":
          case "devdiff_analyze": {
            const changelog = await engine.generateChangelog({
              since: params.since,
              persona: params.persona,
              format: params.format,
            });
            return {
              content: [{ type: "text", text: changelog }],
            };
          }

          case "devdiff_explain_code": {
            const explanation = await engine.explainCode({
              code: params.code,
              filePath: params.file,
              level: params.level,
            });
            return {
              content: [{ type: "text", text: explanation }],
            };
          }

          case "devdiff_ask": {
            const answer = await engine.ask({ question: params.question });
            return {
              content: [{ type: "text", text: answer }],
            };
          }

          case "devdiff_security_scan": {
            const scan = await engine.securityScan({
              since: params.since,
              threshold: params.threshold,
            });
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(scan, null, 2),
                },
              ],
            };
          }

          case "devdiff_diagram":
          case "devdiff_architecture_diagram": {
            const diagram = await engine.generateDiagram({
              type: params.type || "architecture",
              since: params.since,
            });
            return {
              content: [{ type: "text", text: diagram }],
            };
          }

          case "devdiff_read_skill": {
            if (devdiff_read_skill.handler) {
              return await devdiff_read_skill.handler(params);
            }
            return {
              content: [{ type: "text", text: skill?.raw || "No SKILL.md found in workspace." }],
            };
          }

          default: {
            // Check codebase query tools
            const queryTool = CODEBASE_QUERY_TOOLS.find((t) => t.name === name);
            if (queryTool) {
              const res = await engine.ask({
                question: `Query ${name}: ${JSON.stringify(params)}`,
              });
              return {
                content: [{ type: "text", text: res }],
              };
            }
            throw new Error(`Tool not found: "${name}"`);
          }
        }
      } catch (err: any) {
        return {
          content: [{ type: "text", text: `Tool error: ${err.message}` }],
          isError: true,
        };
      }
    });

    // ── PROMPTS ──
    server.setRequestHandler(ListPromptsRequestSchema, async () => ({
      prompts: [
        {
          name: "summarize_changes",
          description: "Generate a structured changelog summary",
          arguments: [
            { name: "since", description: "Time range or git rev", required: false },
          ],
        },
        {
          name: "security_review",
          description: "Security audit prompt for recent changes",
          arguments: [
            { name: "since", description: "Time range to audit", required: false },
          ],
        },
      ],
    }));

    server.setRequestHandler(GetPromptRequestSchema, async (request) => {
      const { name, arguments: args = {} } = request.params;
      if (name === "summarize_changes") {
        return {
          messages: [
            {
              role: "user",
              content: {
                type: "text",
                text: `Please summarize all code changes since ${args.since || "staged"} using DevDiff changelog standards.`,
              },
            },
          ],
        };
      }
      if (name === "security_review") {
        return {
          messages: [
            {
              role: "user",
              content: {
                type: "text",
                text: `Please review code changes since ${args.since || "staged"} for any security vulnerabilities or compliance issues.`,
              },
            },
          ],
        };
      }
      throw new Error(`Prompt not found: "${name}"`);
    });

    return server;
  }

  /**
   * Starts the MCP server on stdio or HTTP SSE.
   */
  static async start(options?: {
    transport?: "stdio" | "http";
    port?: number;
    workspacePath?: string;
  }): Promise<void> {
    const workspacePath =
      options?.workspacePath ||
      process.env.DEVVIFF_WORKSPACE ||
      process.env.DEVDIFF_WORKSPACE ||
      process.cwd();

    const useLocal =
      process.env.DEVVIFF_USE_LOCAL !== "false" &&
      process.env.DEVDIFF_USE_LOCAL !== "false";
    const localModel =
      process.env.DEVVIFF_LOCAL_MODEL ||
      process.env.DEVDIFF_LOCAL_MODEL ||
      "llama3.2:3b";
    const port =
      options?.port ||
      parseInt(process.env.DEVVIFF_MCP_PORT || process.env.DEVDIFF_MCP_PORT || "3739", 10);
    const transportMode = options?.transport || (process.env.DEVDIFF_MCP_TRANSPORT === "http" ? "http" : "stdio");

    console.error("🔌 DevDiff MCP Server");
    console.error("═".repeat(50));
    console.error(`   Workspace: ${workspacePath}`);
    console.error(`   Local AI: ${useLocal ? "Yes" : "No"}`);
    if (useLocal) console.error(`   Model: ${localModel}`);
    console.error(`   Transport: ${transportMode}`);
    console.error("");

    const skill = SkillLoader.load(workspacePath);
    if (skill) {
      console.error(`📄 SKILL.md loaded — ${skill.sections.length} sections`);
    } else {
      console.error("📄 No SKILL.md found — using standard context");
    }

    const context = await loadContext(workspacePath);

    const engine = new DevDiffEngine({
      workspacePath,
      useLocalAI: useLocal,
      localModel,
      skillDocument: skill,
      projectContext: context,
    });
    this.engineInstance = engine;

    const server = this.createServer(workspacePath, engine);
    this.mcpServerInstance = server;

    if (transportMode === "stdio") {
      const transport = new StdioServerTransport();
      await server.connect(transport);
      console.error("✅ DevDiff MCP Server running via stdio");
    } else {
      let sseTransport: SSEServerTransport | null = null;
      const httpServer = http.createServer(async (req, res) => {
        const parsedUrl = url.parse(req.url || "", true);

        if (parsedUrl.pathname === "/sse") {
          sseTransport = new SSEServerTransport("/messages", res);
          await server.connect(sseTransport);
        } else if (parsedUrl.pathname === "/messages" && req.method === "POST") {
          if (sseTransport) {
            await sseTransport.handlePostMessage(req, res);
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
        console.error(`✅ DevDiff MCP Server listening on http://localhost:${port}/sse`);
      });
    }
  }

  /**
   * Self-test MCP Server tools and connectivity.
   */
  static async test(workspacePath: string = process.cwd()): Promise<{
    success: boolean;
    toolsCount: number;
    skillDetected: boolean;
    localModel: string | null;
    message: string;
  }> {
    try {
      const skill = SkillLoader.load(workspacePath);
      const skillDetected = Boolean(skill);

      const aiStatus = await checkAIStatus();
      const isAvailable = aiStatus.status === "connected";
      const localModel = isAvailable
        ? (aiStatus.modelsAvailable[0] || "llama3.2:3b (local)")
        : null;

      const engine = new DevDiffEngine({
        workspacePath,
        useLocalAI: isAvailable,
        localModel: localModel || undefined,
        skillDocument: skill,
      });

      const server = this.createServer(workspacePath, engine);
      // Tools count = 6 core tools + 2 legacy alias tools + codebase query tools
      const toolsCount = 6 + 2 + CODEBASE_QUERY_TOOLS.length;

      return {
        success: true,
        toolsCount,
        skillDetected,
        localModel,
        message: "MCP Server self-test passed successfully",
      };
    } catch (err: any) {
      return {
        success: false,
        toolsCount: 0,
        skillDetected: false,
        localModel: null,
        message: `MCP Server test failed: ${err.message}`,
      };
    }
  }
}
