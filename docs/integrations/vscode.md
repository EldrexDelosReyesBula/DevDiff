# VS Code Extension (`@eldrex/vscode` v1.7.0)

The DevDiff VS Code extension brings 100% IDE-native codebase intelligence directly inside Visual Studio Code and all compatible open-source code editors. All features execute locally on developer workstations without switching tabs or opening browser windows.

---

## Installation & Registries

DevDiff is published as a single, universal `.vsix` package providing identical functionality, offline privacy, and local AI capabilities across both official and open-source editor ecosystems:

| Platform | Registry | Installation Command |
|---|---|---|
| **Visual Studio Code, Cursor, Windsurf, Trae** | [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=ebula.devdiff) | `code --install-extension ebula.devdiff` |
| **VSCodium, Gitpod, Eclipse Theia, Code-OSS** | [Open VSX Registry](https://open-vsx.org/extension/ebula/devdiff) | `codium --install-extension ebula.devdiff` |

> [!NOTE]
> **Universal Binary**: The same `.vsix` release package is uploaded to both the VS Code Marketplace and Open VSX Registry, guaranteeing 100% feature parity across proprietary and open-source editor forks.

---

## Extension Architecture

```mermaid
flowchart TD
    VSCode[VS Code / VSCodium Workspace] --> Extension[@eldrex/vscode Extension Host]

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
```

---

## The 4 Sidebar Views

1. **Changelog Explorer**: Inspect staged changes, preview changelogs, select active personas, and render inline Mermaid architecture diagrams.
2. **Q&A Chat Panel**: Interactive sidebar chat to ask codebase questions against `.devdiff/memory/codebase-index.json`.
3. **Security & Compliance Panel**: Run one-click vulnerability scans and check code against 10 regulatory compliance frameworks (GDPR, HIPAA, SOC 2, etc.).
4. **Settings Panel**: Configure active AI models, rate limits, secret redaction parameters, and inline annotations.

---

## `@devdiff` Native Chat Participant (`vscode.lm`)

Type `@devdiff` directly in VS Code Chat:

```
@devdiff what changed in the auth module today?
@devdiff run security scan for staged changes
@devdiff explain the architecture of persistent memory
```

---

## CodeLens & Gutter Annotations

- **Inline CodeLens Triggers**: `⚡ DevDiff: Explain Changes` CodeLens links appear above modified functions in active text editors.
- **Status Bar Integration**: Real-time indicator showing active AI model, memory status, and provider status.
