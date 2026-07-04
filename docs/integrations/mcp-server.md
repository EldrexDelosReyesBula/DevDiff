# MCP Server

DevDiff includes a built-in MCP (Model Context Protocol) server, allowing AI agents like Claude, Cursor, and Copilot to use DevDiff's changelog tools directly.

---

## What is MCP?

MCP (Model Context Protocol) is an open standard that lets AI assistants call external tools. By running DevDiff as an MCP server, your AI assistant can:

- Analyze staged changes on your behalf
- Generate changelogs without leaving your chat interface
- Check compliance on demand
- Access diff history

---

## Starting the MCP Server

```bash
# Start DevDiff as an MCP server
devdiff mcp serve

# Default: stdio transport (for Claude Desktop, Cursor)
# HTTP transport: devdiff mcp serve --http --port 7655
```

---

## Claude Desktop Integration

Add DevDiff to your Claude Desktop config:

```json
// ~/Library/Application Support/Claude/claude_desktop_config.json (macOS)
// %APPDATA%\Claude\claude_desktop_config.json (Windows)
{
  "mcpServers": {
    "devdiff": {
      "command": "devdiff",
      "args": ["mcp", "serve"],
      "cwd": "/path/to/your/project"
    }
  }
}
```

Restart Claude Desktop. You'll see DevDiff tools available.

---

## Cursor Integration

In Cursor settings, add DevDiff as an MCP tool:

```json
{
  "mcp": {
    "servers": {
      "devdiff": {
        "command": "devdiff mcp serve",
        "cwd": "${workspaceFolder}"
      }
    }
  }
}
```

---

## Available MCP Tools

Once the server is running, your AI agent can call:

| Tool | Description |
|------|-------------|
| `devdiff_generate` | Generate changelog for staged changes |
| `devdiff_diff` | Get raw diff of staged changes |
| `devdiff_compliance_check` | Check changes against a framework |
| `devdiff_history` | List past changelog entries |
| `devdiff_personas` | List available personas |

---

## Example: Using DevDiff via Claude

Once configured, you can ask Claude:

> "Analyze my staged changes and write a CEO-level summary"

Claude will call `devdiff_generate` with persona `ceo` and return the result inline.

---

## HTTP Transport

For remote or team setups:

```bash
# Start HTTP MCP server
devdiff mcp serve --http --port 7655

# Other team members connect via:
# http://your-machine:7655/mcp
```

---

## Security

The MCP server only exposes DevDiff commands — it does not grant arbitrary file system or shell access. All AI analysis still goes through your configured providers (Ollama, OpenAI, etc.) with the same privacy guarantees.

For team setups, secure the HTTP endpoint behind a VPN or use API key auth:

```bash
devdiff mcp serve --http --auth-key $MCP_SECRET_KEY
```
