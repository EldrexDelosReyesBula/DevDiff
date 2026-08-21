# IDE-Native Workflows & Integration (v1.7.0)

DevDiff is **100% IDE-Native**. Rather than forcing developers into external web browsers or separate playground websites, all DevDiff workflows (diff explanation, persistent codebase memory, Q&A, automated versioning, SKILL.md management, commit guards, and full editor chat tabs) run directly inside your IDE environment.

---

## IDE-Native Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                 DEVDIFF v1.7.0 IDE-NATIVE WORKFLOWS         │
│                                                             │
│  SURFACE 1: VS Code Extension & Full Chat Editor Tab        │
│  • Full Chat Window: Workspace editor tab (ViewColumn.Active)│
│  • Multi-Thread History: Persistent globalState storage    │
│  • Clean Sidebar: Single primary CTA & collapsible views    │
│  • Native Theme: 100% --vscode-* CSS variable integration   │
│  • Accessibility: WCAG 2.1 AA, high-contrast, aria-live     │
│  • Performance: Zero-impact lazy loading (<50MB RAM)        │
│                                                             │
│  SURFACE 2: MCP Server Protocol (@eldrex/mcp v1.6.0)        │
│  • 8 sub-50ms codebase query tools for Copilot/Claude/Gemini │
│                                                             │
│  SURFACE 3: Integrated Terminal & CLI                       │
│  • Agent Swarm & Prompt Export tools in CLI                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 1. Full Editor Tab Chat Window & Persistent History (`FullChatWindow`)

Introduced in DevDiff v1.7.0, the chat experience expands beyond a sidebar widget into a full editor tab workspace (`vscode.ViewColumn.Active`):

- **State Retention**: Retains context when switching editor tabs (`retainContextWhenHidden: true`).
- **Multi-Thread Conversations**: Create, switch, search, and delete individual conversation threads stored in VS Code `globalState`.
- **Markdown Export**: Export complete chat history into a formatted Markdown document (`devdiff.openFullChat`).
- **Search & Auto-Titling**: Case-insensitive conversation search with auto-generated thread titles from the first user prompt.

---

## 2. Native VS Code UI/UX Overhaul

DevDiff v1.7.0 implements a complete native design overhaul:

1. **Native CSS Theme Tokens**: All UI elements consume VS Code CSS variables (`--vscode-editor-background`, `--vscode-sideBar-background`, `--vscode-button-background`). No hardcoded colors.
2. **4px Grid Rhythm**: Strictly follows VS Code's spacing grid (`2px`, `4px`, `8px`, `12px`, `16px`, `24px`).
3. **WCAG 2.1 AA Accessibility**: High contrast overrides (`prefers-contrast: high`), screen reader announcements (`aria-live="polite"`), focus outlines (`:focus-visible`), and reduced motion (`prefers-reduced-motion: reduce`).
4. **Calm Notifications**: Replaces intrusive popups with status bar progress indicators and auto-dismissing feedback (5s).
5. **Zero-Impact Performance**: Commands lazy load on demand; file watchers use 1-second debouncing to keep memory $<50\text{MB}$ and idle CPU $<1\%$.

---

## 3. MCP Server Protocol (`@eldrex/mcp`)

DevDiff exposes sub-50ms query tools via MCP:

- `devdiff_query_entity`: Entity history & dependencies
- `devdiff_query_changes`: Time-range change scans
- `devdiff_query_dependencies`: Upstream & downstream graph
- `devdiff_query_architecture`: Module relationships & Mermaid graph
- `devdiff_query_search`: Codebase entity search
- `devdiff_query_compliance`: GDPR/HIPAA/SOC2 scan
- `devdiff_query_stats`: Codebase statistics & trends
- `devdiff_query_timeline`: Chronological change timeline

---

## 4. Command Summary

```bash
# VS Code Command Palette (Ctrl+Shift+P)
DevDiff: Open Chat                  # Open Full Editor Tab Chat
DevDiff: Generate Changelog         # Run changelog generator
DevDiff: Run Security Scan          # Perform security audit
DevDiff: Explain Selected Code      # Analyze highlighted code
```

Learn more on the official website: [https://devdiff.vercel.app/](https://devdiff.vercel.app/)
