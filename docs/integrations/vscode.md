# VS Code Extension

The official DevDiff VS Code Extension brings privacy-first, BYOAI changelog intelligence directly into your editor environment.

<p align="center">
  <a href="https://marketplace.visualstudio.com/items?itemName=ebula.devdiff" target="_blank" rel="noopener noreferrer">
    <img src="https://img.shields.io/badge/VS_Code_Marketplace-Download-blue?style=for-the-badge&logo=visual-studio-code" alt="Download on VS Code Marketplace">
  </a>
  <a href="https://open-vsx.org/extension/ebula/devdiff" target="_blank" rel="noopener noreferrer">
    <img src="https://img.shields.io/badge/Open_VSX_Registry-Download-orange?style=for-the-badge&logo=eclipse" alt="Download on Open VSX">
  </a>
</p>

---

## ⚡ Key Features

- **Status Bar Integration:** One-click staged changes explanation.
- **Sidebar Webview:** Interactive dashboard showing active files, change stats, and explanations.
- **Inline Diffs:** Explanations integrated directly into file views.
- **Quick Explain:** Explain staged changes without leaving VS Code.

---

## 📦 Installation & Setup

You can install DevDiff in VS Code in two different ways depending on your security policy:

### Option A: VS Code & Open VSX Marketplace (Recommended)

1. Open VS Code or VSCodium on your workstation.
2. Open the Extensions View (`Ctrl+Shift+X` or `Cmd+Shift+X`).
3. Search for **`ebula.devdiff`** or click one of the direct registry links:
   - 👉 [DevDiff on the Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=ebula.devdiff)
   - 👉 [DevDiff on the Open VSX Registry](https://open-vsx.org/extension/ebula/devdiff)
4. Click **Install**.

### Option B: Local VSIX Bundle (Offline / Air-gapped Environments)

For secure enterprise workstations that lack external internet access:

1. Download the latest packaged `.vsix` file from the [GitHub Releases](https://github.com/EldrexDelosReyesBula/devdiff/releases) page.
2. In VS Code, open the Extensions View.
3. Click the `...` menu in the top-right corner of the Extensions panel.
4. Select **Install from VSIX...** and select the downloaded package.

---

## ⚡ Main Capabilities

| Feature                         | Description                                                                            | Benefit                                   |
| :------------------------------ | :------------------------------------------------------------------------------------- | :---------------------------------------- |
| **Active Changes Sidebar**      | Integrated view summarizing modified files, lines changed, and complexity markers.     | High-level context before commits.        |
| **Status Bar Actions**          | Trigger staged changes explanations with a single status bar click.                    | Frictionless workflow.                    |
| **Inline Explanation Previews** | Displays the generated changelog text inline or inside a separate side-by-side editor. | Fast commit message generation.           |
| **Local Swarm Consensuses**     | Orchestrates a local agent swarm and shows consensus analysis for staged files.        | Deep architectural and security insights. |

---

## ⚙️ Configuration & Trust Settings

The extension automatically inherits settings from your repository-level `.devdiff.config.js` (or `.devdiff.config.json`) configuration file.

### Overriding Settings in VS Code

You can customize the extension via your `settings.json`:

```json
{
  "devdiff.provider": "ollama",
  "devdiff.model": "llama3.2:3b",
  "devdiff.enableSwarm": true,
  "devdiff.localOnly": true
}
```

### 🔒 Enterprise Trust Profile

- **Zero Remote Connections**: When `localOnly` is enabled, all execution loops happen on localhost via your local inference provider (WebGPU/Ollama).
- **Auto-Redaction**: Before compiling any prompt context, credentials and API keys are automatically scanned and redacted locally.
