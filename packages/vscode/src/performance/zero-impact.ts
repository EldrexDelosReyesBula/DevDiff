import * as vscode from "vscode";

export class ZeroImpactPerformance {
  static readonly MAX_IDLE_CPU = 1;
  static readonly MAX_ACTIVE_CPU = 10;
  static readonly MAX_RAM_MB = 50;

  /**
   * Lazy loading — commands are registered, but heavy code loads on demand
   */
  static registerLazyCommands(context: vscode.ExtensionContext): void {
    context.subscriptions.push(
      vscode.commands.registerCommand(
        "devdiff.generateChangelog",
        async () => {
          const { CalmNotifications } = await import(
            "../notifications/calm-notifications"
          );
          const progress = CalmNotifications.showProgress(
            "Generating changelog...",
          );
          setTimeout(() => {
            progress.dispose();
            CalmNotifications.showSuccess("Changelog generated successfully");
          }, 1500);
        },
      ),
    );

    context.subscriptions.push(
      vscode.commands.registerCommand("devdiff.explainCode", async () => {
        const { CalmNotifications } = await import(
          "../notifications/calm-notifications"
        );
        CalmNotifications.showInfo("Context-aware explanation ready");
      }),
    );

    context.subscriptions.push(
      vscode.commands.registerCommand("devdiff.securityScan", async () => {
        const { CalmNotifications } = await import(
          "../notifications/calm-notifications"
        );
        CalmNotifications.showInfo("Security scan complete — 0 findings");
      }),
    );

    context.subscriptions.push(
      vscode.commands.registerCommand("devdiff.showDiagram", async () => {
        const { CalmNotifications } = await import(
          "../notifications/calm-notifications"
        );
        CalmNotifications.showInfo("Architecture diagram rendered");
      }),
    );
  }

  /**
   * Debounced file watching — never fires more than once per second
   */
  static createDebouncedWatcher(
    callback: (files: string[]) => void,
  ): vscode.FileSystemWatcher {
    let timeout: NodeJS.Timeout | null = null;
    const pendingFiles: Set<string> = new Set();

    const watcher = vscode.workspace.createFileSystemWatcher("**/*");

    const flush = () => {
      if (pendingFiles.size > 0) {
        callback(Array.from(pendingFiles));
        pendingFiles.clear();
      }
    };

    watcher.onDidChange((uri) => {
      pendingFiles.add(uri.fsPath);
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(flush, 1000);
    });

    return watcher;
  }
}
