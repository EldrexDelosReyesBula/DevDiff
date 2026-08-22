import * as vscode from "vscode";

export class ZeroImpactPerformance {
  static readonly MAX_IDLE_CPU = 1;
  static readonly MAX_ACTIVE_CPU = 10;
  static readonly MAX_RAM_MB = 50;

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
