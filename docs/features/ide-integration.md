# IDE-Native Workflows & Integration (v1.6.0)

DevDiff is **100% IDE-Native**. Rather than forcing developers into external web browsers or separate playground websites, all DevDiff workflows (diff explanation, persistent codebase memory, Q&A, automated versioning, SKILL.md management, and commit guards) run directly inside your IDE environment.

---

## 🎯 IDE-Native Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                 DEVDIFF v1.6.0 IDE-NATIVE WORKFLOWS         │
│                                                             │
│  SURFACE 1: VS Code Extension (Primary Interface)           │
│  • Sidebar: Changelog Explorer                              │
│  • Sidebar: Q&A Chat Panel                                  │
│  • Sidebar: Security & Compliance                           │
│  • Sidebar: Settings & Configuration                        │
│  • Chat: @devdiff natural language chat participant         │
│  • Inline: CodeLens & Gutter annotations                    │
│  • Status Bar: AI model indicator & quick pick              │
│                                                             │
│  SURFACE 2: MCP Server (@eldrex/mcp v1.6.0)                 │
│  • 8 sub-50ms codebase query tools for Copilot/Claude/Gemini │
│  • DevDiff provides KNOWLEDGE. IDE agent provides INTELLIGENCE│
│                                                             │
│  SURFACE 3: Integrated Terminal & CLI                       │
│  • Fast CLI memory queries: devdiff ask "..."               │
│  • Scriptable CI/CD automation                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 💻 1. VS Code Extension — 4 Sidebar Views

The VS Code extension provides a comprehensive IDE experience:

1. **Changelog Explorer**: Inspect staged changes, generate changelogs, and view Mermaid architecture diagrams.
2. **Q&A Chat Panel**: Interactive sidebar chat powered by `ConversationalQA` and persistent memory.
3. **Security & Compliance**: One-click vulnerability and compliance framework scan.
4. **Settings Panel**: Configure active personas, inline annotations, and MCP rate limits.

### 🛡️ IDEGuardian Performance Guard
- **Worker Isolation**: Operations execute safely in worker threads without freezing the editor.
- **256MB Memory Ceiling**: Automatic memory monitoring.
- **5s Typing Idle Detection**: Background scans pause automatically when you are actively typing.
- **120s Timeout Guard**: Heavy tasks time out safely instead of locking up VS Code.

---

## 💬 2. `@devdiff` Chat Participant (`vscode.lm`)

Type `@devdiff` directly in VS Code Chat:

```
@devdiff what changed in the auth module today?
@devdiff run security scan for staged changes
@devdiff explain the architecture of persistent memory
```

---

## 🔌 3. MCP Server Protocol (`@eldrex/mcp`)

DevDiff v1.6.0 exposes **8 sub-50ms query tools** via MCP:
- `devdiff_query_entity`: Entity history & dependencies
- `devdiff_query_changes`: Time-range change scans
- `devdiff_query_dependencies`: Upstream & downstream graph
- `devdiff_query_architecture`: Module relationships & Mermaid graph
- `devdiff_query_search`: Codebase entity search
- `devdiff_query_compliance`: GDPR/HIPAA/SOC2 scan
- `devdiff_query_stats`: Codebase statistics & trends
- `devdiff_query_timeline`: Chronological change timeline

---

## 🚀 4. Integrated Terminal Workflows

```bash
# Ask your codebase memory directly in the terminal
devdiff ask "What changed recently?"

# Memory management
devdiff memory init
devdiff memory status

# Generate natural developer changelogs
devdiff generate
```
