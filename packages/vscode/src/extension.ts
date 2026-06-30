import * as vscode from "vscode";
import { DevDiffEngine } from "@eldrex/core";

let engine: DevDiffEngine;
let statusBar: vscode.StatusBarItem;
let outputChannel: vscode.OutputChannel;
let isWatching = true;
let lastStagedFiles = "";

export async function activate(context: vscode.ExtensionContext) {
  outputChannel = vscode.window.createOutputChannel("DevDiff");
  outputChannel.appendLine("DevDiff VS Code Extension activated");

  try {
    engine = new DevDiffEngine({
      workspacePath:
        vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || process.cwd(),
    });
    outputChannel.appendLine("✅ DevDiff engine initialized");
  } catch (error) {
    outputChannel.appendLine(`❌ Engine init failed: ${error}`);
    vscode.window.showErrorMessage(
      "DevDiff: Failed to initialize. Check output panel for details.",
    );
    return;
  }

  // Status bar setup
  statusBar = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100,
  );
  statusBar.text = "$(pulse) DevDiff";
  statusBar.tooltip = "DevDiff — Click to view changelog";
  statusBar.command = "devdiff.showChangelog";
  statusBar.show();
  context.subscriptions.push(statusBar);

  // Watch for workspace filesystem changes
  const gitWatcher = vscode.workspace.createFileSystemWatcher("**/*");

  gitWatcher.onDidChange(async (uri) => {
    outputChannel.appendLine(`File changed: ${uri.fsPath}`);
    await checkForChanges();
  });

  gitWatcher.onDidCreate(async (uri) => {
    outputChannel.appendLine(`File created: ${uri.fsPath}`);
    await checkForChanges();
  });

  gitWatcher.onDidDelete(async (uri) => {
    outputChannel.appendLine(`File deleted: ${uri.fsPath}`);
    await checkForChanges();
  });

  context.subscriptions.push(gitWatcher);

  // Integrate with VSCode's built-in Git extension
  const gitExtension = vscode.extensions.getExtension("vscode.git")?.exports;
  if (gitExtension) {
    const git = gitExtension.getAPI(1);

    git.repositories.forEach((repo: any) => {
      repo.state.onDidChange(async () => {
        outputChannel.appendLine("Git state changed");
        await checkForChanges();
      });
    });

    outputChannel.appendLine("✅ Git extension integration active");
  } else {
    outputChannel.appendLine(
      "⚠️ Git extension not found — polling mode active",
    );

    // Fallback: Poll for changes every 5 seconds
    const interval = setInterval(async () => {
      await checkForChanges();
    }, 5000);

    context.subscriptions.push({
      dispose: () => clearInterval(interval),
    });
  }

  // Register VS Code Commands
  context.subscriptions.push(
    vscode.commands.registerCommand("devdiff.showChangelog", async () => {
      const panel = vscode.window.createWebviewPanel(
        "devdiff-changelog",
        "DevDiff Changelog",
        vscode.ViewColumn.Beside,
        { enableScripts: true },
      );

      try {
        const changelog = await engine.generateChangelog({
          format: "markdown",
        });
        panel.webview.html = renderChangelogHtml(changelog);
      } catch (error) {
        panel.webview.html = renderErrorHtml(error);
      }
    }),

    vscode.commands.registerCommand("devdiff.explainChanges", async () => {
      await vscode.commands.executeCommand("workbench.view.scm");

      vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: "DevDiff: Analyzing changes...",
          cancellable: true,
        },
        async (progress) => {
          try {
            progress.report({ message: "Parsing diff..." });
            const result = await engine.analyze({ staged: true });

            progress.report({ message: "Generating explanation..." });
            const explanation = result.summary;

            vscode.window
              .showInformationMessage(
                `DevDiff: ${explanation.slice(0, 100)}...`,
                "View Full",
                "Dismiss",
              )
              .then((selection) => {
                if (selection === "View Full") {
                  showFullExplanation(explanation);
                }
              });
          } catch (error: any) {
            vscode.window.showErrorMessage(`DevDiff: ${error.message}`);
          }
        },
      );
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
  );

  // Initial check
  await checkForChanges();

  outputChannel.appendLine("✅ DevDiff extension ready");
  vscode.window.showInformationMessage(
    "DevDiff: Ready. Make changes and stage them to see explanations.",
  );
}

async function checkForChanges() {
  if (!isWatching) return;

  try {
    const stagedFiles = await engine.getStagedFiles();

    if (stagedFiles.length === 0) {
      statusBar.text = "$(pulse) DevDiff";
      return;
    }

    const currentHash = JSON.stringify(stagedFiles.map((f) => f.path).sort());
    if (currentHash === lastStagedFiles) return;

    lastStagedFiles = currentHash;

    statusBar.text = `$(pulse) DevDiff (${stagedFiles.length} staged)`;
    statusBar.backgroundColor = new vscode.ThemeColor(
      "statusBarItem.warningBackground",
    );

    outputChannel.appendLine(
      `\n⚡ [${new Date().toLocaleTimeString()}] ${stagedFiles.length} staged file(s)`,
    );

    // If auto-generate is enabled
    const config = vscode.workspace.getConfiguration("devdiff");
    if (config.get("autoGenerate", false)) {
      outputChannel.appendLine("Auto-generating explanation...");
      await vscode.commands.executeCommand("devdiff.explainChanges");
    }
  } catch (error) {
    outputChannel.appendLine(`⚠️ Check error: ${error}`);
  }
}

function renderChangelogHtml(changelog: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DevDiff Changelog</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 20px; color: var(--vscode-foreground); background-color: var(--vscode-editor-background); line-height: 1.6; }
        h1, h2, h3 { color: var(--vscode-textLink-foreground); }
        pre { background: rgba(0,0,0,0.1); padding: 10px; border-radius: 4px; overflow-x: auto; }
        code { font-family: Consolas, Monaco, monospace; }
    </style>
</head>
<body>
    <h1>📋 DevDiff Changelog Explanation</h1>
    <hr/>
    <div>${changelog.replace(/\n/g, "<br>")}</div>
</body>
</html>`;
}

function renderErrorHtml(error: any): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Error</title>
    <style>
        body { font-family: sans-serif; padding: 20px; color: var(--vscode-errorForeground); }
    </style>
</head>
<body>
    <h1>❌ Failed to Generate Changelog</h1>
    <pre>${error.message || error}</pre>
</body>
</html>`;
}

function showFullExplanation(explanation: string) {
  const panel = vscode.window.createWebviewPanel(
    "devdiff-explanation",
    "DevDiff Staged Changes Explanation",
    vscode.ViewColumn.Active,
    { enableScripts: true },
  );
  panel.webview.html = renderChangelogHtml(explanation);
}

// Deactivate extension
export function deactivate() {
  outputChannel?.appendLine("DevDiff extension deactivated");
  outputChannel?.dispose();
}
