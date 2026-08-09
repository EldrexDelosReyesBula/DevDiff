# VS Code Extension (`@eldrex/vscode` v1.6.0)

The DevDiff VS Code extension ([`@eldrex/vscode`](https://github.com/EldrexDelosReyesBula/DevDiff/tree/main/packages/vscode)) brings 100% IDE-native codebase intelligence directly inside Visual Studio Code. All features execute locally on developer workstations without switching tabs or opening web browser dashboards.

---

## 🎯 Extension Architecture

```mermaid
flowchart TD
    VSCode[VS Code Workspace] --> Extension[@eldrex/vscode Extension Host]

    subgraph Panels [4 Dedicated Sidebar Views]
      P1[1. Changelog Explorer]
      P2[2. Q&A Chat Panel]
      P3[3. Security & Compliance]
      P4[4. Settings & Personas]
    end

    subgraph Safeguard [IDEGuardian Performance Enforcer]
      Worker[Worker Thread Execution]
      RAMCap[256MB Memory Ceiling]
      IdleDetect[5s Typing Idle Detection]
    end

    Extension --> Panels
    Extension --> Safeguard
    Extension --> ChatParticipant[@devdiff Chat Participant]

    style Extension fill:#bbf,stroke:#333,stroke-width:2px
    style Safeguard fill:#9f9,stroke:#333,stroke-width:2px
```

---

## 🖥️ The 4 Sidebar Views

1. **Changelog Explorer**: Inspect staged changes, preview changelogs, select active personas, and render inline Mermaid architecture diagrams.
2. **Q&A Chat Panel**: Interactive sidebar chat to ask codebase questions against `.devdiff/memory/codebase-index.json`.
3. **Security & Compliance Panel**: Run one-click vulnerability scans and check code against 10 regulatory compliance frameworks (GDPR, HIPAA, SOC 2, etc.).
4. **Settings Panel**: Configure active AI models, rate limits, secret redaction parameters, and inline annotations.

---

## 💬 `@devdiff` Native Chat Participant (`vscode.lm`)

Type `@devdiff` directly in VS Code Chat:

```
@devdiff what changed in the auth module today?
@devdiff run security scan for staged changes
@devdiff explain the architecture of persistent memory
```

---

## ⚡ CodeLens & Gutter Annotations

- **Inline CodeLens Triggers**: `⚡ DevDiff: Explain Changes` CodeLens links appear above modified functions in active text editors.
- **Status Bar Integration**: Real-time indicator showing active AI model, memory status, and provider status.

---

## 🛡️ `IDEGuardian` Protection

- **Worker Thread Isolation**: Heavy processing tasks run in dedicated worker threads so VS Code never freezes.
- **256MB RAM Cap**: Automatic heap monitoring prevents extension memory bloat.
- **5s Typing Idle Tracking**: Scans automatically pause when active keyboard typing is detected.
- **120s Timeout Protection**: Tasks time out safely after 120 seconds.
