# VS Code Extension (`devdiff` v1.9.0)

The DevDiff VS Code extension brings 100% IDE-native codebase intelligence directly inside Visual Studio Code and all compatible open-source code editors. All features execute locally on developer workstations without switching tabs or opening browser windows.

---

## Installation & Registries

DevDiff is published as a single, universal `.vsix` package providing identical functionality, offline privacy, and local AI capabilities across both official and open-source editor ecosystems:

| Platform | Registry | Installation Command |
| :--- | :--- | :--- |
| **Visual Studio Code, Cursor, Windsurf, Trae** | [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=ebula.devdiff) | `code --install-extension ebula.devdiff` |
| **VSCodium, Gitpod, Eclipse Theia, Code-OSS** | [Open VSX Registry](https://open-vsx.org/extension/ebula/devdiff) | `codium --install-extension ebula.devdiff` |

> [!NOTE]
> **Universal Binary**: The same `.vsix` release package (`devdiff-1.9.0.vsix`) is uploaded to both the VS Code Marketplace and Open VSX Registry, guaranteeing 100% feature parity across proprietary and open-source editor forks.

---

## Extension Architecture

```mermaid
flowchart TD
    VSCode[VS Code / VSCodium Workspace] --> Extension[devdiff Extension Host]

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

    subgraph DevTools [DevTools Command Suite]
      D1[Inspect Context]
      D2[AI Latency Diagnostic]
      D3[Export AI Prompt]
      D4[Simulate Synthetic Diff]
    end

    Extension --> Panels
    Extension --> Safeguard
    Extension --> DevTools
    Extension --> ChatParticipant[@devdiff Chat Participant]
```

---

## The 4 Sidebar Views & Interactive Previews

1. **Changelog Explorer**:
   - **▷ Generate Recent Changelog**: Generates a persona-tailored changelog and automatically opens the markdown file side-by-side with live rendered preview.
   - **ⓘ Project Summary**: Displays full AST indexing metadata and architecture in a rendered editor preview.
   - **📊 Architecture Diagram**: Instant inline dark-mode Mermaid rendering of codebase modules via `devdiff.generateDiagram`.
2. **Q&A Chat Panel**: Interactive sidebar chat to ask codebase questions against `.devdiff/memory/codebase-index.json`.
3. **Security & Compliance Panel**: Run one-click vulnerability scans and check code against 10 regulatory compliance frameworks (GDPR, HIPAA, SOC 2, etc.).
4. **Settings Panel**: Configure active AI models, rate limits, secret redaction parameters, and inline annotations.

---

## Built-In DevTools Command Suite (`Ctrl+Shift+P`)

DevDiff includes a built-in DevTools command palette suite for inspecting AST state, debugging AI latency, and profiling diffs:

| Command | Action |
| :--- | :--- |
| `devdiff.devtools.inspectContext` | Opens an interactive JSON inspector showing scanned workspace AST entities and token counts |
| `devdiff.devtools.exportPrompt` | Generates and copies the exact AI system prompt & diff payload to your clipboard |
| `devdiff.devtools.testAI` | 1-click diagnostic testing AI connectivity, model response validity, and ping latency |
| `devdiff.devtools.mockDiff` | Simulates and previews synthetic diffs with mock additions, deletions, and hunks |

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
