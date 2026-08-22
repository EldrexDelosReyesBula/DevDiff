# 🔌 VS Code & IDE Extension Troubleshooting & FAQs

This guide provides immediate **self-repair solutions** and **workarounds** for IDE extension behavior, allowing developers to resolve issues instantly without waiting for an upstream patch.

---

## ⚡ Frequently Encountered Issues & Instant Fixes

### 1. 🗂️ Multiple `Untitled-*.md` Editor Tabs Opening in the Background

**Symptom:**
As you edit or stage files, multiple untitled markdown tabs (`Untitled-1`, `Untitled-2`, etc.) continuously open in your editor.

**Cause:**
Background change monitoring (`autoStart` or watch mode) triggered automatic document previews on file system events.

**Instant Self-Fix:**
1. **Close all open untitled tabs at once**:
   - Press <kbd>Ctrl+K Ctrl+W</kbd> (or <kbd>Cmd+K Cmd+W</kbd> on macOS) to run **`View: Close All Editors`**.
   - Or open Command Palette (<kbd>Ctrl+Shift+P</kbd>) and select **`View: Close All Editor Groups`**.
2. **Disable auto-watch in settings**:
   - Open VS Code Settings (<kbd>Ctrl+,</kbd>).
   - Search for `devdiff.autoStart` and set it to **`false`**.
   - Or run **`DevDiff: Toggle Auto-Watch`** from the Command Palette to turn Auto-Watch **OFF**.
3. **Update to v1.9.0+**:
   - In v1.9.0, background monitoring is strictly non-intrusive and only updates the status bar count (`$(pulse) 5 staged`), never opening editor tabs automatically.

---

### 2. ⚠️ `command 'devdiff.*' not found` on Command Execution

**Symptom:**
Clicking sidebar items or running commands from the Command Palette shows an error popup: `command 'devdiff.generateDiagram' not found` or `command 'devdiff.showProjectSummary' not found`.

**Cause:**
An uncaught error in extension startup halted `activate()` before all command handlers could be registered into VS Code.

**Instant Self-Fix:**
1. **Reload VS Code Window**:
   - Press <kbd>Ctrl+Shift+P</kbd> $\rightarrow$ select **`Developer: Reload Window`**.
2. **Inspect the Extension Startup Log**:
   - Open the **Output** tab (`Ctrl+Shift+U`).
   - In the dropdown on the top right, select **DevDiff**.
   - Review any initialization warnings or security validation blocks.
3. **Clean Reinstall the VSIX**:
   ```powershell
   code --uninstall-extension eldrex.devdiff
   code --install-extension ./packages/vscode/devdiff-1.9.0.vsix --force
   ```

---

### 3. ⚡ `devdiff mcp start` Appears Frozen / Hanging in Terminal

**Symptom:**
Running `devdiff mcp start` prints:
```
⚡ Starting DevDiff MCP Server v2.0...
✅ MCP Server listening on stdio (stdin/stdout)
DevDiff MCP Server running via stdio transport.
```
and the terminal cursor remains active without returning to the shell prompt.

**Explanation:**
- **This is expected behavior.** Model Context Protocol (MCP) servers run over `stdio` (JSON-RPC) waiting for AI clients (Cursor, Claude Desktop, Antigravity) to send tool queries.
- It is not meant to be run interactively by humans in a shell prompt.

**Instant Solution:**
- Press <kbd>Ctrl+C</kbd> to exit.
- To use the MCP server with an AI IDE, configure your client config file (`claude_desktop_config.json` or `.cursor/mcp.json`) as follows:

```json
{
  "mcpServers": {
    "devdiff": {
      "command": "devdiff",
      "args": ["mcp", "serve"]
    }
  }
}
```

---

### 4. ⏱️ Local AI Timeout on Large Diffs (>50 Files)

**Symptom:**
When generating changelogs or diagrams on large repositories, Ollama or local LLMs time out or trigger MVP fallback mode: `[MVP Mode Triggered - Saved as mvp-...]`.

**Instant Self-Fix:**
1. **Use Minimal Depth**:
   ```bash
   devdiff generate --depth minimal
   ```
2. **Stage in Atomic Batches**:
   Instead of `git add -A`, stage specific packages or directories:
   ```bash
   git add packages/core/
   devdiff generate
   ```
3. **Increase AI Timeout in Config**:
   Add to `.devdiff.config.js`:
   ```javascript
   export default {
     ai: {
       provider: "ollama",
       model: "llama3.2:3b",
       timeoutMs: 180000 // 3 minutes
     }
   };
   ```

---

### 5. 🛠️ Build and Patch the Extension Locally in 30 Seconds

If you need to customize or fix extension behavior immediately in your local environment:

```bash
# 1. Clone or open repository
cd packages/vscode

# 2. Make your edits in src/extension.ts or src/ui/

# 3. Build extension bundle
pnpm --filter devdiff build

# 4. Package local VSIX
npx @vscode/vsce package --no-dependencies

# 5. Install fresh build
code --install-extension devdiff-1.9.0.vsix --force
```

---

## 📋 VS Code Settings Reference

| Setting | Type | Default | Description |
| :--- | :---: | :---: | :--- |
| `devdiff.autoStart` | `boolean` | `false` | Enables background file monitoring for status bar updates. |
| `devdiff.defaultPersona` | `string` | `"developer"` | Default persona for changelog synthesis (`developer`, `ceo`, `pm`, etc.). |
| `devdiff.aiProvider` | `string` | `"auto"` | Preferred AI engine (`auto`, `ollama`, `webgpu`, `openai`, `anthropic`). |
| `devdiff.showDiagramPreview` | `boolean` | `true` | Automatically renders Mermaid diagrams in beside webview. |
| `devdiff.securityScanOnStage` | `boolean` | `true` | Runs lightweight credential check when files are staged. |
