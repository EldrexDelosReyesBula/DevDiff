import * as vscode from "vscode";
import { DevDiffEngine, ConversationalQA } from "@eldrex/core";
import { ExtensionSecurityGuard } from "./security/extension-guard";
import { IDEGuardian } from "./performance/ide-guardian";
import { ChangelogExplorer } from "./ui/changelog-explorer";
import { ChatPanel } from "./ui/chat-panel";
import { SecurityPanel } from "./ui/security-panel";
import { SettingsPanel } from "./ui/settings-panel";
import { ChangelogCodeLensProvider } from "./ui/gutter-annotations";
import { CleanSidebar } from "./panels/clean-sidebar";
import { SidebarView } from "./views/sidebar-view";
import { ZeroImpactPerformance } from "./performance/zero-impact";
import { registerFeedbackCommands } from "./commands/feedback";

import { OnboardingBanner } from "./onboarding/onboarding-banner";
import { OnboardingGuide } from "./onboarding/guide-opener";
import { registerDevToolsCommands } from "./devtools/devtools-commands";

let engine: DevDiffEngine;
let statusBar: vscode.StatusBarItem;
let outputChannel: vscode.OutputChannel;
let isWatching = true;
let lastStagedFiles = "";
let autoGenerateTimeout: NodeJS.Timeout | null = null;

interface DetectedModel {
  name: string;
  provider: string;
  size: string;
  status: string;
}

// ── Optional dependencies: dynamic loading ──
let ollamaClient: any = null;

export async function getOllamaClient() {
  if (ollamaClient) return ollamaClient;

  try {
    const { Ollama } = await import("ollama");
    ollamaClient = new Ollama();
  } catch {
    ollamaClient = {
      generate: async (params: any) => {
        const res = await fetch("http://localhost:11434/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(params),
        });
        return ((await res.json()) as any).response;
      },
    };
  }

  return ollamaClient;
}

export function getEngine(): DevDiffEngine {
  if (!engine) {
    const workspacePath =
      vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || process.cwd();
    engine = new DevDiffEngine({ workspacePath });
  }
  return engine;
}

export async function activate(context: vscode.ExtensionContext) {
  outputChannel = vscode.window.createOutputChannel("DevDiff");
  outputChannel.appendLine("DevDiff VS Code Extension v1.9.0 active");

  // Track editor typing/activity for health checks
  vscode.workspace.onDidChangeTextDocument(() => IDEGuardian.trackActivity());

  // ── 1. REGISTER ALL VS CODE COMMANDS SYNCHRONOUSLY FIRST ──
  context.subscriptions.push(
    vscode.commands.registerCommand("devdiff.showChangelog", async () => {
      await showChangelogView();
    }),

    vscode.commands.registerCommand("devdiff.generateChangelog", async () => {
      await generateChangelogWithProgress();
    }),

    vscode.commands.registerCommand("devdiff.generateDiagram", async () => {
      await generateDiagram();
    }),

    vscode.commands.registerCommand("devdiff.showProjectSummary", async () => {
      await showProjectSummary();
    }),

    vscode.commands.registerCommand("devdiff.securityScan", async () => {
      await runSecurityScan();
    }),

    vscode.commands.registerCommand("devdiff.explainSelection", async () => {
      await explainSelection();
    }),

    vscode.commands.registerCommand("devdiff.askAI", async () => {
      await askDevDiff();
    }),

    vscode.commands.registerCommand("devdiff.study.start", async () => {
      vscode.window.showInformationMessage(
        "📖 DevDiff Study Buddy Mode Activated! Type @devdiff in chat or select code to explain.",
      );
    }),

    vscode.commands.registerCommand("devdiff.study.explain", async () => {
      await explainSelection();
    }),

    vscode.commands.registerCommand("devdiff.explainChanges", async () => {
      await explainChangesWithAlert();
    }),

    vscode.commands.registerCommand("devdiff.toggleWatch", () => {
      isWatching = !isWatching;
      if (statusBar) {
        statusBar.text = isWatching ? "$(eye) DevDiff" : "$(pulse) DevDiff";
      }
      vscode.window.showInformationMessage(
        isWatching ? "DevDiff: Auto-watch ON" : "DevDiff: Auto-watch OFF",
      );
    }),

    vscode.commands.registerCommand("devdiff.showOutput", () => {
      outputChannel.show();
    }),

    vscode.commands.registerCommand("devdiff.openFullChat", async () => {
      const { FullChatWindow } = await import("./chat/full-chat-window");
      await FullChatWindow.open(context);
    }),

    vscode.commands.registerCommand("devdiff.showMenu", () => {
      vscode.window
        .showQuickPick([
          "Show Changelog Panel",
          "Generate Changelog (Progress)",
          "Generate Architecture Diagram",
          "Show Project Summary",
          "Run Security Scan",
          "Ask AI",
          "Toggle Watch Mode",
          "Show Output Logs",
          "Open Full Chat Tab",
          "DevTools: Inspect Context",
          "DevTools: AI Benchmark",
          "DevTools: Export Prompt",
        ])
        .then((selection) => {
          if (selection === "Show Changelog Panel")
            vscode.commands.executeCommand("devdiff.showChangelog");
          else if (selection === "Generate Changelog (Progress)")
            vscode.commands.executeCommand("devdiff.generateChangelog");
          else if (selection === "Generate Architecture Diagram")
            vscode.commands.executeCommand("devdiff.generateDiagram");
          else if (selection === "Show Project Summary")
            vscode.commands.executeCommand("devdiff.showProjectSummary");
          else if (selection === "Run Security Scan")
            vscode.commands.executeCommand("devdiff.securityScan");
          else if (selection === "Ask AI")
            vscode.commands.executeCommand("devdiff.askAI");
          else if (selection === "Toggle Watch Mode")
            vscode.commands.executeCommand("devdiff.toggleWatch");
          else if (selection === "Show Output Logs")
            vscode.commands.executeCommand("devdiff.showOutput");
          else if (selection === "Open Full Chat Tab")
            vscode.commands.executeCommand("devdiff.openFullChat");
          else if (selection === "DevTools: Inspect Context")
            vscode.commands.executeCommand("devdiff.devtools.inspectContext");
          else if (selection === "DevTools: AI Benchmark")
            vscode.commands.executeCommand("devdiff.devtools.testAI");
          else if (selection === "DevTools: Export Prompt")
            vscode.commands.executeCommand("devdiff.devtools.exportPrompt");
        });
    }),
  );

  // ── 2. REGISTER FEEDBACK & ONBOARDING COMMANDS ──
  registerFeedbackCommands(context);
  OnboardingGuide.register(context);

  // ── 3. INITIALIZE ENGINE & DEVTOOLS COMMANDS ──
  const currentEngine = getEngine();
  registerDevToolsCommands(context, currentEngine);

  // ── 4. REGISTER SIDEBAR PANELS ──
  try {
    const changelogExplorer = new ChangelogExplorer(context, currentEngine);
    context.subscriptions.push(
      vscode.window.registerTreeDataProvider(
        "devdiff-changelog",
        changelogExplorer,
      ),
    );

    const chatPanel = new ChatPanel(context.extensionUri, currentEngine);
    context.subscriptions.push(
      vscode.window.registerWebviewViewProvider(ChatPanel.viewType, chatPanel),
    );

    const securityPanel = new SecurityPanel(context.extensionUri, currentEngine);
    context.subscriptions.push(
      vscode.window.registerWebviewViewProvider(
        SecurityPanel.viewType,
        securityPanel,
      ),
    );

    const settingsPanel = new SettingsPanel(context.extensionUri);
    context.subscriptions.push(
      vscode.window.registerWebviewViewProvider(
        SettingsPanel.viewType,
        settingsPanel,
      ),
    );
  } catch (err) {
    outputChannel.appendLine(`Sidebar panel registration notice: ${err}`);
  }

  // ── 5. REGISTER CODELENS / GUTTER ANNOTATIONS ──
  try {
    context.subscriptions.push(
      vscode.languages.registerCodeLensProvider(
        { scheme: "file" },
        new ChangelogCodeLensProvider(),
      ),
    );
  } catch (err) {
    outputChannel.appendLine(`CodeLens registration notice: ${err}`);
  }

  // ── 6. REGISTER @devdiff CHAT PARTICIPANT ──
  const vscodeLm = (vscode as any).lm;
  if (vscodeLm && vscodeLm.registerChatParticipant) {
    try {
      const workspacePath =
        vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || process.cwd();
      const qa = new ConversationalQA(workspacePath);
      const participant = vscodeLm.registerChatParticipant(
        "devdiff.chat",
        async (request: any, chatContext: any, stream: any) => {
          const prompt = (request.prompt || "").toLowerCase();
          if (prompt.includes("changelog") || prompt.includes("what changed")) {
            const changelog = await IDEGuardian.runTask(
              "generateChangelog",
              () => currentEngine.analyze({ since: "24h" }),
            );
            stream.markdown(
              typeof changelog === "string"
                ? changelog
                : changelog.summary || JSON.stringify(changelog),
            );
          } else if (prompt.includes("security") || prompt.includes("scan")) {
            const report = await IDEGuardian.runTask("securityScan", () =>
              currentEngine.securityScan({ since: "1 week" }),
            );
            stream.markdown(JSON.stringify(report, null, 2));
          } else {
            const answer = await IDEGuardian.runTask("askQA", () =>
              qa.ask(request.prompt),
            );
            stream.markdown(answer.answer);
          }
        },
      );
      context.subscriptions.push(participant);
    } catch (err) {
      outputChannel.appendLine(`Chat participant notice: ${err}`);
    }
  }

  // ── 7. STATUS BAR SETUP ──
  statusBar = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100,
  );
  statusBar.text = "$(symbol-misc) DevDiff";
  statusBar.tooltip = "DevDiff Active — Click for options";
  statusBar.command = "devdiff.showMenu";
  statusBar.show();
  context.subscriptions.push(statusBar);

  // ── 8. NON-BLOCKING BACKGROUND TASKS ──
  const config = vscode.workspace.getConfiguration("devdiff");
  const autoStart = config.get("autoStart", true);

  OnboardingGuide.showIfFirstTime(context).catch((err) => {
    outputChannel.appendLine(`Onboarding guide notice: ${err}`);
  });

  OnboardingBanner.show(context).catch((err) => {
    outputChannel.appendLine(`Onboarding banner notice: ${err}`);
  });

  detectLocalModels()
    .then((models) => {
      if (models.length > 0) {
        statusBar.text = `$(pulse) ${models[0].name}`;
        statusBar.tooltip = `DevDiff Active\nModel: ${models[0].name}\nClick for options`;
      }
    })
    .catch(() => {});

  if (autoStart) {
    startBackgroundWatcher(context);
  }

  outputChannel.appendLine("✅ DevDiff extension v1.9.0 fully ready");
}

async function detectLocalModels(): Promise<DetectedModel[]> {
  const models: DetectedModel[] = [];

  // Check Ollama
  try {
    const res = await fetch("http://localhost:11434/api/tags");
    if (res.ok) {
      const data = (await res.json()) as any;
      for (const m of data.models || []) {
        models.push({
          name: m.name,
          provider: "ollama",
          size: m.size
            ? `${(m.size / (1024 * 1024 * 1024)).toFixed(2)} GB`
            : "Unknown",
          status: "ready",
        });
      }
    }
  } catch {
    // Ollama not running
  }

  return models;
}

function startBackgroundWatcher(context: vscode.ExtensionContext) {
  const watcher = vscode.workspace.createFileSystemWatcher("**/*");

  const onChange = async () => {
    if (!isWatching) return;
    try {
      const files = await engine.getStagedFiles();
      if (files.length > 5) {
        statusBar.text = `$(pulse) ${files.length} changes`;
        statusBar.backgroundColor = new vscode.ThemeColor(
          "statusBarItem.warningBackground",
        );

        if (autoGenerateTimeout) clearTimeout(autoGenerateTimeout);
        autoGenerateTimeout = setTimeout(async () => {
          await generateChangelogWithProgress();
          statusBar.backgroundColor = undefined;
          statusBar.text = `$(pulse) DevDiff`;
        }, 5000);
      }
    } catch (err) {
      outputChannel.appendLine(`Watcher error: ${err}`);
    }
  };

  watcher.onDidChange(onChange);
  watcher.onDidCreate(onChange);
  watcher.onDidDelete(onChange);
  context.subscriptions.push(watcher);
}

async function showChangelogView() {
  const panel = vscode.window.createWebviewPanel(
    "devdiff-changelog",
    "DevDiff Changelog",
    vscode.ViewColumn.Beside,
    { enableScripts: true },
  );

  try {
    const changelog = await engine.generateChangelog({ format: "markdown" });
    panel.webview.html = renderChangelogHtml(changelog);
  } catch (error: any) {
    panel.webview.html = renderErrorHtml(error);
  }
}

async function generateChangelogWithProgress() {
  vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: "DevDiff: Synthesizing changelog...",
      cancellable: false,
    },
    async () => {
      try {
        const changelog = await engine.generateChangelog({ format: "markdown" });
        const doc = await vscode.workspace.openTextDocument({
          content: changelog,
          language: "markdown",
        });
        await vscode.window.showTextDocument(doc, {
          preview: false,
          viewColumn: vscode.ViewColumn.Active,
        });
        try {
          await vscode.commands.executeCommand("markdown.showPreviewToSide", doc.uri);
        } catch {}
      } catch (err: any) {
        vscode.window.showErrorMessage(`DevDiff: Failed to generate changelog: ${err.message}`);
      }
    },
  );
}

async function showProjectSummary() {
  vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: "DevDiff: Loading project summary...",
      cancellable: false,
    },
    async () => {
      try {
        let summary = await engine.getProjectContext();
        if (!summary || !summary.trim()) {
          summary = "# 📋 Project Summary\n\nNo project context found yet. Stage changes and initialize DevDiff to build repository context.";
        } else if (!summary.startsWith("#")) {
          summary = `# 📋 Project Summary\n\n${summary}`;
        }
        const doc = await vscode.workspace.openTextDocument({
          content: summary,
          language: "markdown",
        });
        await vscode.window.showTextDocument(doc, {
          preview: false,
          viewColumn: vscode.ViewColumn.Active,
        });
        try {
          await vscode.commands.executeCommand("markdown.showPreviewToSide", doc.uri);
        } catch {}
      } catch (err: any) {
        vscode.window.showErrorMessage(`DevDiff: Failed to load project summary: ${err.message}`);
      }
    },
  );
}

async function generateDiagram() {
  vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: "DevDiff: Extracting architecture flow...",
      cancellable: false,
    },
    async () => {
      try {
        const diagram = await engine.generateDiagram({
          type: "architecture",
          since: "24h",
        });
        const panel = vscode.window.createWebviewPanel(
          "devdiff-diagram",
          "DevDiff: Architecture Diagram",
          vscode.ViewColumn.Beside,
          { enableScripts: true },
        );
        panel.webview.html = `<!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
            <script>mermaid.initialize({ startOnLoad: true, theme: 'dark' });</script>
            <style>
              body {
                background: #0f172a;
                color: #f8fafc;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                padding: 24px;
                line-height: 1.5;
              }
              h2 { margin-top: 0; color: #38bdf8; }
              .mermaid { background: #1e293b; padding: 20px; border-radius: 8px; overflow-x: auto; }
            </style>
          </head>
          <body>
            <h2>📊 Architecture Diagram (Recent Changes)</h2>
            <div class="mermaid">${diagram}</div>
          </body>
          </html>`;
      } catch (err: any) {
        vscode.window.showErrorMessage(`DevDiff: Failed to generate diagram: ${err.message}`);
      }
    },
  );
}

async function runSecurityScan() {
  vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: "DevDiff: Running security check...",
      cancellable: false,
    },
    async () => {
      const scan = await engine.securityScan({
        since: "1 week",
        threshold: "medium",
      });
      const list = scan.vulnerabilities || [];
      if (list.length === 0) {
        vscode.window.showInformationMessage(
          "DevDiff Security: No vulnerabilities found.",
        );
      } else {
        vscode.window.showWarningMessage(
          `DevDiff Security: Found ${list.length} potential concerns.`,
        );
        outputChannel.appendLine("\n=== Security Scan Findings ===");
        list.forEach((v: any) => {
          outputChannel.appendLine(
            `[${v.severity.toUpperCase()}] ${v.file}: ${v.description}`,
          );
        });
        outputChannel.show();
      }
    },
  );
}

async function explainSelection() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) return;

  const selection = editor.document.getText(editor.selection);
  if (!selection.trim()) {
    vscode.window.showInformationMessage("Select some code first to explain.");
    return;
  }

  vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: "DevDiff: Explaining selected code...",
      cancellable: false,
    },
    async () => {
      const response = await engine.chat({
        prompt: `Please explain this selected code snippet:\n\n${selection}`,
        context: await engine.getProjectContext(),
      });
      const panel = vscode.window.createWebviewPanel(
        "devdiff-explanation",
        "Code Explanation",
        vscode.ViewColumn.Beside,
        { enableScripts: true },
      );
      panel.webview.html = renderChangelogHtml(response);
    },
  );
}

async function askDevDiff() {
  const question = await vscode.window.showInputBox({
    prompt: "Ask DevDiff a natural language question about your workspace...",
    placeHolder: "e.g., What did we refactor in the authentication controller?",
  });

  if (!question) return;

  vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: "DevDiff: Searching codebase...",
      cancellable: false,
    },
    async () => {
      const response = await engine.chat({
        prompt: question,
        context: await engine.getProjectContext(),
      });
      const panel = vscode.window.createWebviewPanel(
        "devdiff-chat",
        "DevDiff Q&A",
        vscode.ViewColumn.Beside,
        { enableScripts: true },
      );
      panel.webview.html = renderChangelogHtml(response);
    },
  );
}

async function explainChangesWithAlert() {
  vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: "DevDiff: Analysing change diff...",
      cancellable: false,
    },
    async () => {
      const result = await engine.analyze({ staged: true });
      vscode.window
        .showInformationMessage(
          `DevDiff: ${result.summary.slice(0, 100)}...`,
          "View Full",
        )
        .then((sel) => {
          if (sel === "View Full") {
            const panel = vscode.window.createWebviewPanel(
              "devdiff-explanation",
              "Staged Changes Explanation",
              vscode.ViewColumn.Active,
              { enableScripts: true },
            );
            panel.webview.html = renderChangelogHtml(result.summary);
          }
        });
    },
  );
}

function extractTimeRange(prompt: string): string | null {
  if (prompt.includes("today") || prompt.includes("24h")) return "24h";
  if (prompt.includes("week") || prompt.includes("7d")) return "7d";
  const match = prompt.match(/since\s+([\w~.]+)/);
  return match ? match[1] : null;
}

function extractFilePath(prompt: string): string | null {
  const match = prompt.match(/(?:file|in|at)\s+([^\s]+)/);
  return match ? match[1] : null;
}

function renderChangelogHtml(changelog: string): string {
  return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>DevDiff Summary</title>
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 20px; color: var(--vscode-foreground); background-color: var(--vscode-editor-background); line-height: 1.6; }
            h1, h2, h3 { color: var(--vscode-textLink-foreground); }
            pre { background: rgba(0,0,0,0.1); padding: 10px; border-radius: 4px; overflow-x: auto; }
            code { font-family: Consolas, Monaco, monospace; }
        </style>
    </head>
    <body>
        <h2>📋 DevDiff Insight</h2>
        <hr/>
        <div style="white-space: pre-wrap;">${changelog}</div>
    </body>
    </html>`;
}

function renderErrorHtml(error: any): string {
  return `<!DOCTYPE html>
    <html>
    <body>
      <h2>❌ Generation Failed</h2>
      <pre>${error.message || error}</pre>
    </body>
    </html>`;
}

export function deactivate() {
  if (autoGenerateTimeout) clearTimeout(autoGenerateTimeout);
  IDEGuardian.dispose();
  outputChannel?.appendLine("DevDiff extension deactivated");
  outputChannel?.dispose();
}
