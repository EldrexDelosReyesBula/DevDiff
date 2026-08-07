# IDE-Native Workflows & Integration (v1.5.0)

DevDiff is **100% IDE-Native**. Rather than forcing developers into external web browsers or separate playground websites, all DevDiff workflows (diff explanation, persistent codebase memory, Q&A, automated versioning, SKILL.md management, and commit guards) run directly inside your IDE environment.

---

## 🎯 IDE-Native Principles

```
┌─────────────────────────────────────────────────────────────┐
│                 DEVDIFF IDE-NATIVE WORKFLOWS                │
│                                                             │
│  VS CODE EXTENSION (@eldrex/vscode)                         │
│  • Inline diff explanations in source editor                │
│  • Dedicated DevDiff side panel & chat view                 │
│  • One-click release & version bump triggers                │
│                                                             │
│  MCP SERVER PROTOCOL (@eldrex/mcp)                          │
│  • Native Model Context Protocol (MCP) server integration   │
│  • Seamless connection with Cursor, Windsurf, & VS Code AI  │
│                                                             │
│  INTEGRATED TERMINAL & CLI                                  │
│  • Fast sub-50ms CLI memory queries: devdiff ask "..."      │
│  • Zero browser context switches                            │
└─────────────────────────────────────────────────────────────┘
```

---

## 💻 1. VS Code Extension (`@eldrex/vscode`)

The VS Code extension provides zero-friction IDE integration:

- **Inline Diff Lens**: Hover over modified files in the Source Control view to view natural developer explanations.
- **Side Panel Chat**: Ask questions about your codebase memory directly from the VS Code sidebar.
- **Command Palette Integration**: Run `DevDiff: Explain Diff`, `DevDiff: Ask Memory`, `DevDiff: Bump Version`, and `DevDiff: Release`.

---

## 🔌 2. MCP Server Protocol (`@eldrex/mcp`)

DevDiff includes a built-in **MCP Server** (`@eldrex/mcp`) that exposes DevDiff memory, AST indexes, compliance rules, and changelog generators to AI assistants like Cursor, Windsurf, and Claude Desktop.

```bash
# Start the MCP server inside your IDE workspace
devdiff mcp start
```

---

## 🚀 3. Integrated Terminal Workflows

All DevDiff commands execute directly in your IDE's integrated terminal:

```bash
# Ask your codebase memory directly in the terminal
devdiff ask "What does CountifyStorage do?"

# Auto-bump version based on AST diffs
devdiff version bump --type auto

# Generate natural developer changelogs
devdiff generate
```
