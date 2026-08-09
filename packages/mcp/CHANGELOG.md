# @eldrex/mcp

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
