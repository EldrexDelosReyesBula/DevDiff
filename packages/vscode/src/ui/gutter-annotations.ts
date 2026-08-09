import * as vscode from "vscode";

export class ChangelogCodeLensProvider implements vscode.CodeLensProvider {
  private _onDidChangeCodeLenses: vscode.EventEmitter<void> =
    new vscode.EventEmitter<void>();
  public readonly onDidChangeCodeLenses: vscode.Event<void> =
    this._onDidChangeCodeLenses.event;

  public provideCodeLenses(
    document: vscode.TextDocument,
    _token: vscode.CancellationToken,
  ): vscode.CodeLens[] {
    const config = vscode.workspace.getConfiguration("devdiff");
    if (!config.get("showGutterAnnotations", true)) {
      return [];
    }

    // Only provide CodeLens for open source code files
    if (document.lineCount < 3) return [];

    const topRange = new vscode.Range(0, 0, 0, 0);
    return [
      new vscode.CodeLens(topRange, {
        title: "⚡ DevDiff: Explain Changes in File",
        command: "devdiff.explainSelection",
      }),
      new vscode.CodeLens(topRange, {
        title: "🛡️ Security Scan",
        command: "devdiff.securityScan",
      }),
    ];
  }
}
