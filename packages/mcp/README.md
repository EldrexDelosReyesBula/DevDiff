# @eldrex/mcp

## Model Context Protocol (MCP) Server for DevDiff

> Connect DevDiff to Cursor, Claude, Gemini, Copilot, and any MCP-compliant AI client.

[![npm version](https://img.shields.io/npm/v/@eldrex/mcp)](https://npmjs.com/package/@eldrex/mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## Available MCP Tools

- `devdiff_read_skill` — Reads workspace `SKILL.md` project rules and architecture declarations.
- `devdiff_generate_changelog` — Generates persona-driven git diff changelogs.
- `devdiff_get_memory_status` — Queries codebase persistent memory status.
- `devdiff_explain_code` — Explains code snippets using DevDiff explanation engine.

## Usage with Cursor / Claude Desktop

Add to your MCP server configuration:

```json
{
  "mcpServers": {
    "devdiff": {
      "command": "npx",
      "args": ["-y", "@eldrex/mcp"]
    }
  }
}
```

---

## License

MIT © DevDiff Contributors
