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

export async function activate(context: vscode.ExtensionContext) {
  outputChannel = vscode.window.createOutputChannel("DevDiff");
  outputChannel.appendLine("DevDiff VS Code Extension v1.7.0 starting...");

  // Register clean sidebar panel layout and new SidebarView Provider
  CleanSidebar.register(context);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      SidebarView.viewType,
      new SidebarView(),
    ),
  );

  // Register zero-impact lazy commands
  ZeroImpactPerformance.registerLazyCommands(context);

  // Register full editor tab chat window command
  context.subscriptions.push(
    vscode.commands.registerCommand("devdiff.openFullChat", async () => {
      const { FullChatWindow } = await import("./chat/full-chat-window");
      await FullChatWindow.open(context);
    }),
  );

  // Register feedback and review commands
  registerFeedbackCommands(context);



  // Register virtual document provider and commands for getting started guide
  OnboardingGuide.register(context);

  // Show personalized onboarding guide on first install
  OnboardingGuide.showIfFirstTime(context).catch((err) => {
    outputChannel.appendLine(`Onboarding guide notice: ${err}`);
  });

  // Show zero-friction onboarding banner based on AI detection
  OnboardingBanner.show(context).catch((err) => {
    outputChannel.appendLine(`Onboarding banner notice: ${err}`);
  });

  const config = vscode.workspace.getConfiguration("devdiff");
  const autoStart = config.get("autoStart", true);

  const workspacePath =
    vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || process.cwd();

  // Track editor typing/activity for health checks
  vscode.workspace.onDidChangeTextDocument(() => IDEGuardian.trackActivity());

  // Validate workspace safety
  const validation = ExtensionSecurityGuard.validateWorkspace(workspacePath);
  if (!validation.safe) {
    outputChannel.appendLine(
      `❌ Security block: Workspace failed security validation.`,
    );
    vscode.window.showErrorMessage(
      "DevDiff: Workspace security checks failed. Extension has been disabled for safety.",
    );
    return;
  }

  // Initialize Engine
  try {
    engine = new DevDiffEngine({ workspacePath });
    outputChannel.appendLine("✅ DevDiff engine initialized");
  } catch (error) {
    outputChannel.appendLine(`❌ Engine init failed: ${error}`);
    return;
  }

  // ── REGISTER SIDEBAR PANELS (IDE-NATIVE) ──
  const changelogExplorer = new ChangelogExplorer(context, engine);
  vscode.window.registerTreeDataProvider(
    "devdiff-changelog",
    changelogExplorer,
  );

  const chatPanel = new ChatPanel(context.extensionUri, engine);
  vscode.window.registerWebviewViewProvider(ChatPanel.viewType, chatPanel);

  const securityPanel = new SecurityPanel(context.extensionUri, engine);
  vscode.window.registerWebviewViewProvider(
    SecurityPanel.viewType,
    securityPanel,
  );

  const settingsPanel = new SettingsPanel(context.extensionUri);
  vscode.window.registerWebviewViewProvider(
    SettingsPanel.viewType,
    settingsPanel,
  );

  // ── REGISTER CODELENS / GUTTER ANNOTATIONS ──
  context.subscriptions.push(
    vscode.languages.registerCodeLensProvider(
      { scheme: "file" },
      new ChangelogCodeLensProvider(),
    ),
  );

  // ── REGISTER @devdiff CHAT PARTICIPANT ──
  if ((vscode as any).lm && (vscode as any).lm.registerChatParticipant) {
    try {
      const qa = new ConversationalQA(workspacePath);
      const participant = (vscode as any).lm.registerChatParticipant(
        "devdiff.chat",
        async (request: any, chatContext: any, stream: any) => {
          const prompt = request.prompt.toLowerCase();
          if (prompt.includes("changelog") || prompt.includes("what changed")) {
            const changelog = await IDEGuardian.runTask(
              "generateChangelog",
              () => engine.analyze({ since: "24h" }),
            );
            stream.markdown(
              typeof changelog === "string"
                ? changelog
                : changelog.summary || JSON.stringify(changelog),
            );
          } else if (prompt.includes("security") || prompt.includes("scan")) {
            const report = await IDEGuardian.runTask("securityScan", () =>
              engine.securityScan({ since: "1 week" }),
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
    } catch {
      outputChannel.appendLine(
        "ℹ️ Chat participant registration bypassed (API not supported in host version)",
      );
    }
  }

  // Status Bar setup
  statusBar = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100,
  );
  statusBar.text = "$(symbol-misc) DevDiff";
  statusBar.tooltip = "DevDiff Active — Click for options";
  statusBar.command = "devdiff.showMenu";
  statusBar.show();
  context.subscriptions.push(statusBar);

  // Auto-detect Local Models
  const models = await detectLocalModels();
  if (models.length > 0) {
    statusBar.text = `$(pulse) ${models[0].name}`;
    statusBar.tooltip = `DevDiff Active\nModel: ${models[0].name}\nClick for options`;
    vscode.window.showInformationMessage(
      `DevDiff: ${models.length} local model(s) detected — ${models[0].name} ready`,
    );
  } else if (autoStart) {
    vscode.window
      .showInformationMessage(
        "DevDiff: No local AI models detected. Install one for best experience?",
        "Install Ollama",
        "Use Cloud AI",
        "Later",
      )
      .then((selection) => {
        if (selection === "Install Ollama") {
          vscode.env.openExternal(
            vscode.Uri.parse("https://ollama.com/download"),
          );
        } else if (selection === "Use Cloud AI") {
          vscode.commands.executeCommand("devdiff.showOutput");
        }
      });
  }

  // Auto-start Monitoring
  if (autoStart) {
    outputChannel.appendLine(
      "🚀 Auto-starting background change monitoring...",
    );
    startBackgroundWatcher(context);
  }

  // Register VS Code Commands & Keyboard Shortcuts
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
      statusBar.text = isWatching ? "$(eye) DevDiff" : "$(pulse) DevDiff";
      vscode.window.showInformationMessage(
        isWatching ? "DevDiff: Auto-watch ON" : "DevDiff: Auto-watch OFF",
      );
    }),

    vscode.commands.registerCommand("devdiff.showOutput", () => {
      outputChannel.show();
    }),

    vscode.commands.registerCommand("devdiff.showMenu", () => {
      vscode.window
        .showQuickPick([
          "Show Changelog Panel",
          "Generate Changelog (Progress)",
          "Generate Architecture Diagram",
          "Run Security Scan",
          "Ask AI",
          "Toggle Watch Mode",
          "Show Output Logs",
        ])
        .then((selection) => {
          if (selection === "Show Changelog Panel")
            vscode.commands.executeCommand("devdiff.showChangelog");
          else if (selection === "Generate Changelog (Progress)")
            vscode.commands.executeCommand("devdiff.generateChangelog");
          else if (selection === "Generate Architecture Diagram")
            vscode.commands.executeCommand("devdiff.generateDiagram");
          else if (selection === "Run Security Scan")
            vscode.commands.executeCommand("devdiff.securityScan");
          else if (selection === "Ask AI")
            vscode.commands.executeCommand("devdiff.askAI");
          else if (selection === "Toggle Watch Mode")
            vscode.commands.executeCommand("devdiff.toggleWatch");
          else if (selection === "Show Output Logs")
            vscode.commands.executeCommand("devdiff.showOutput");
        });
    }),
  );

  // Register VS Code Language Model Chat Participant
  const vscodeLm = (vscode as any).lm;
  if (vscodeLm && vscodeLm.registerChatParticipant) {
    context.subscriptions.push(
      vscodeLm.registerChatParticipant("devdiff", {
        async handler(request: any, chatContext: any, stream: any, token: any) {
          const userPrompt = (request.prompt || "").toLowerCase();

          if (
            userPrompt.includes("what changed") ||
            userPrompt.includes("changelog")
          ) {
            const range = extractTimeRange(userPrompt) || "24h";
            const result = await engine.analyze({
              since: range,
              persona: "developer",
            });
            stream.markdown(result.summary);
          } else if (
            userPrompt.includes("security") ||
            userPrompt.includes("vulnerab")
          ) {
            const report = await engine.securityScan({
              since: "1 week",
              threshold: "medium",
            });
            const list = report.vulnerabilities || [];
            if (list.length === 0) {
              stream.markdown(
                "No security concerns found in the recent changes.",
              );
            } else {
              stream.markdown(
                `### Security Audit Report\n\nDetected ${list.length} concerns:\n` +
                  list
                    .map(
                      (v: any) =>
                        `- **[${v.severity.toUpperCase()}]** ${v.file}: ${v.description} (Remediation: ${v.remediation})`,
                    )
                    .join("\n"),
              );
            }
          } else if (
            userPrompt.includes("explain") ||
            userPrompt.includes("why")
          ) {
            const filePath = extractFilePath(userPrompt) || "";
            if (filePath) {
              const explanation = await engine.explainFile({ filePath });
              stream.markdown(explanation);
            } else {
              stream.markdown("Please specify a file path to explain.");
            }
          } else if (
            userPrompt.includes("diagram") ||
            userPrompt.includes("architecture")
          ) {
            const diagram = await engine.generateDiagram({
              type: "architecture",
              since: "24h",
            });
            stream.markdown(`\`\`\`mermaid\n${diagram}\n\`\`\``);
          } else {
            const response = await engine.chat({
              prompt: request.prompt || "",
              context: await engine.getProjectContext(),
            });
            stream.markdown(response);
          }
        },
      }),
    );
  }

  outputChannel.appendLine("✅ DevDiff extension v2.0 ready");
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
      const changelog = await engine.generateChangelog({ format: "markdown" });
      const doc = await vscode.workspace.openTextDocument({
        content: changelog,
        language: "markdown",
      });
      await vscode.window.showTextDocument(doc, vscode.ViewColumn.Active);
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
      const diagram = await engine.generateDiagram({
        type: "architecture",
        since: "24h",
      });
      const panel = vscode.window.createWebviewPanel(
        "devdiff-diagram",
        "Architecture Diagram",
        vscode.ViewColumn.Beside,
        { enableScripts: true },
      );
      panel.webview.html = `<!DOCTYPE html>
        <html>
        <head>
          <script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
          <script>mermaid.initialize({ startOnLoad: true, theme: 'dark' });</script>
        </head>
        <body style="background:#0f172a; color:#f8fafc; padding:20px;">
          <pre class="mermaid">${diagram}</pre>
        </body>
        </html>`;
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
