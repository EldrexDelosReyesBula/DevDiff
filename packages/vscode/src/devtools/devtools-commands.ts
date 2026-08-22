import * as vscode from "vscode";
import { DevDiffEngine } from "@eldrex/core";
import { DevDiffDevTools } from "@eldrex/plugin-sdk";

/**
 * Registers DevDiff Foundations DevTools commands for developers and extension creators.
 */
export function registerDevToolsCommands(
  context: vscode.ExtensionContext,
  engine: DevDiffEngine,
) {
  // ── 1. Inspect Context ──
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "devdiff.devtools.inspectContext",
      async () => {
        vscode.window.withProgress(
          {
            location: vscode.ProgressLocation.Notification,
            title: "DevTools: Inspecting repository context...",
            cancellable: false,
          },
          async () => {
            try {
              const rawContext = await engine.getProjectContext();
              const workspacePath =
                vscode.workspace.workspaceFolders?.[0]?.uri.fsPath ||
                process.cwd();

              const content = [
                `# 🛠️ DevDiff Foundations — Context Inspector`,
                `> **Workspace:** \`${workspacePath}\``,
                `> **Timestamp:** ${new Date().toISOString()}`,
                ``,
                `## 📦 Scanned Project Context`,
                `\`\`\`json`,
                rawContext,
                `\`\`\``,
                ``,
                `## 💡 Developer Usage`,
                `- Use this context to debug prompt injections in custom plugins.`,
                `- To reload memory context, run \`devdiff memory index\`.`,
              ].join("\n");

              const doc = await vscode.workspace.openTextDocument({
                content,
                language: "markdown",
              });
              await vscode.window.showTextDocument(doc, {
                preview: false,
                viewColumn: vscode.ViewColumn.Active,
              });
            } catch (err: any) {
              vscode.window.showErrorMessage(
                `DevTools: Failed to inspect context: ${err.message}`,
              );
            }
          },
        );
      },
    ),
  );

  // ── 2. Export AI Prompt ──
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "devdiff.devtools.exportPrompt",
      async () => {
        vscode.window.withProgress(
          {
            location: vscode.ProgressLocation.Notification,
            title: "DevTools: Generating prompt export...",
            cancellable: false,
          },
          async () => {
            try {
              const staged = await engine.getStagedDiff();
              const contextData = await engine.getProjectContext();

              const promptDebugDoc = [
                `# 🔬 DevDiff Foundations — AI Prompt Debugger`,
                ``,
                `### 1. Staged Files (${staged.files.length})`,
                ...staged.files.map((f) => `- \`${f.path}\``),
                ``,
                `### 2. Context Injected`,
                `\`\`\`markdown`,
                contextData,
                `\`\`\``,
                ``,
                `### 3. Prompt Template Preview`,
                `\`\`\``,
                `You are a senior release engineer. Analyze the git diff and generate an accurate changelog adhering to the repository conventions.`,
                `\`\`\``,
              ].join("\n");

              const doc = await vscode.workspace.openTextDocument({
                content: promptDebugDoc,
                language: "markdown",
              });
              await vscode.window.showTextDocument(doc, {
                preview: false,
                viewColumn: vscode.ViewColumn.Active,
              });
              await vscode.env.clipboard.writeText(promptDebugDoc);
              vscode.window.showInformationMessage(
                "DevTools: Prompt exported and copied to clipboard!",
              );
            } catch (err: any) {
              vscode.window.showErrorMessage(
                `DevTools: Failed to export prompt: ${err.message}`,
              );
            }
          },
        );
      },
    ),
  );

  // ── 3. AI Latency & Connectivity Diagnostic ──
  context.subscriptions.push(
    vscode.commands.registerCommand("devdiff.devtools.testAI", async () => {
      vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: "DevTools: Benchmarking AI providers...",
          cancellable: false,
        },
        async () => {
          try {
            const start = performance.now();
            const providers = await engine.detectAIProviders();
            const latency = (performance.now() - start).toFixed(1);

            const panel = vscode.window.createWebviewPanel(
              "devdiff-ai-diagnostic",
              "DevTools: AI Benchmark",
              vscode.ViewColumn.Beside,
              { enableScripts: true },
            );

            const activeModel =
              providers.recommendedPath?.name ||
              providers.availablePaths[0]?.name ||
              "Template Mode (Local)";
            const isLocal = providers.availablePaths.some((p) =>
              p.name.toLowerCase().includes("ollama") || p.id.toLowerCase().includes("ollama"),
            );
            const isConnected = providers.onboardingStage === "ready" || providers.availablePaths.length > 0;

            panel.webview.html = `<!DOCTYPE html>
            <html>
            <head>
              <meta charset="UTF-8">
              <style>
                body {
                  background: #0f172a;
                  color: #f8fafc;
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                  padding: 24px;
                }
                .card {
                  background: #1e293b;
                  border: 1px solid #334155;
                  border-radius: 8px;
                  padding: 16px;
                  margin-bottom: 16px;
                }
                .status-badge {
                  display: inline-block;
                  padding: 4px 8px;
                  border-radius: 4px;
                  font-size: 12px;
                  font-weight: 600;
                  background: ${isConnected ? "#10b981" : "#f59e0b"};
                  color: #0f172a;
                }
                h2 { color: #38bdf8; margin-top: 0; }
                h3 { margin-top: 0; }
                pre { background: #0b1120; padding: 12px; border-radius: 6px; overflow-x: auto; }
              </style>
            </head>
            <body>
              <h2>⚡ DevDiff Foundations — AI Diagnostic & Benchmark</h2>
              <div class="card">
                <h3>Connection Status: <span class="status-badge">${isConnected ? "CONNECTED" : "FALLBACK"}</span></h3>
                <p><strong>Active Model / Path:</strong> ${activeModel}</p>
                <p><strong>Detection Latency:</strong> ${latency} ms</p>
                <p><strong>Local Inference (Ollama):</strong> ${isLocal ? "✅ Available" : "❌ Disconnected"}</p>
              </div>
              <div class="card">
                <h3>Available AI Paths (${providers.availablePaths.length})</h3>
                <pre>${JSON.stringify(providers, null, 2)}</pre>
              </div>
            </body>
            </html>`;
          } catch (err: any) {
            vscode.window.showErrorMessage(
              `DevTools: Benchmark failed: ${err.message}`,
            );
          }
        },
      );
    }),
  );

  // ── 4. Mock Diff Simulator ──
  context.subscriptions.push(
    vscode.commands.registerCommand("devdiff.devtools.mockDiff", async () => {
      const mock = DevDiffDevTools.mockDiff({
        filesCount: 3,
        additionsPerFile: 8,
        deletionsPerFile: 3,
      });

      const content = [
        `# 🎭 DevDiff Foundations — Synthetic Diff Simulator`,
        `> Generated **${mock.files.length}** mock files with **+${mock.totalAdditions} / -${mock.totalDeletions}** changes.`,
        ``,
        ...mock.files.map(
          (f) =>
            `### 📄 ${f.path}\n\`\`\`diff\n${f.hunks.map((h) => h.header + "\n" + h.lines.map((l) => l.content).join("\n")).join("\n")}\n\`\`\``,
        ),
      ].join("\n");

      const doc = await vscode.workspace.openTextDocument({
        content,
        language: "markdown",
      });
      await vscode.window.showTextDocument(doc, {
        preview: false,
        viewColumn: vscode.ViewColumn.Active,
      });
    }),
  );
}
