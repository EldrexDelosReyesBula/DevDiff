# @eldrex/mcp

## 1.9.0

### Major Changes

- **Universal MCP Server Architecture (`DevDiffMCPServer`)**:
  - Implemented standalone multi-client MCP server engine supporting stdio transport, automated `SKILL.md` loading, and built-in self-testing diagnostics (`test()`).
  - Registered 16 MCP tools covering changelog generation, diff parsing, architecture diagrams, security auditing, memory queries, and study buddy explanations.
- **Universal Multi-IDE Config Generator (`UniversalMCPConfig`)**:
  - Auto-detects and installs MCP configuration files across **VS Code** (`.vscode/mcp.json`), **Cursor** (`.cursor/mcp.json`), **Windsurf** (`~/.codeium/windsurf/mcp_config.json`), **Antigravity** (`.gemini/antigravity-ide/mcp/devdiff/mcp.json`), **Claude Desktop** (`claude_desktop_config.json`), and **JetBrains** (`.idea/mcp.json`).
  - Exported status inspection, config generation, and batch installation utilities.

---

## 1.8.0

### Minor Changes

- **External Tool Registration Protocol**: Streamlined MCP tool manifest schemas and parameter validation for external agent orchestration.
- **Performance Optimization**: Sub-10ms tool routing response latency for local AI workflows.

---

## 1.7.0

### Minor Changes

- **`devdiff_read_skill` Tool**: MCP tool reading and validating 10-section `SKILL.md` files for universal agent context.
- **Dynamic Security Integration**: Added MCP endpoints for security scan audit trails and anomaly queries.

---

## 1.6.0

### Major Changes

- **MCP Server v2.0**: Complete rewrite of the Model Context Protocol server implementation (`server-v2.ts`).
- **Codebase Query Tools**: Added `codebase-query-tools.ts` exposing MCP tool handlers for `query_codebase`, `get_diff_summary`, `get_compliance_status`, `get_changelog`, and `ask_devdiff`.
- **Persistent Memory Integration**: MCP server now reads from and writes to the codebase memory index (`.devdiff/memory/codebase-index.json`) — enables AI agents to query DevDiff state over the MCP protocol.
- **Conversational Q&A Tool**: `devdiff_ask` MCP tool supports multi-turn conversational context across sequential AI agent calls.
- **Security**: All MCP tool inputs are validated through Zod schemas before processing. Malformed inputs return structured error responses rather than crashing the server.
- Added `publishConfig.access: "public"` for npm scoped package publishing.

### Minor Changes

- MCP server startup timeout increased from 5s to 30s to accommodate cold-start memory index initialization on large codebases.
- Added `devdiff_version` MCP tool — returns current DevDiff version and build metadata.
- Server now emits structured JSON health status on stderr for process monitoring.

### Patch Changes

- Fixed MCP server crash when `.devdiff/memory/` directory does not exist on first run.
- Fixed tool response serialization for binary diff content.

### Updated Dependencies

- `@eldrex/core@1.6.0`
- `@modelcontextprotocol/sdk@^1.0.1`
