import * as vscode from "vscode";

export class SettingsPanel implements vscode.WebviewViewProvider {
  public static readonly viewType = "devdiff-settings";
  private _view?: vscode.WebviewView;

  constructor(private readonly extensionUri: vscode.Uri) {}

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView;
    webviewView.webview.options = { enableScripts: true, localResourceRoots: [this.extensionUri] };
    webviewView.webview.html = this._getHtmlForWebview();

    webviewView.webview.onDidReceiveMessage(async (data) => {
      if (data.type === "openConfig") {
        vscode.commands.executeCommand("workbench.action.openSettings", "devdiff");
      }
    });
  }

  private _getHtmlForWebview() {
    return /* html */ `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: var(--vscode-font-family); color: var(--vscode-editor-foreground); padding: 12px; background: var(--vscode-sideBar-background); }
    .setting-item { background: var(--vscode-editorWidget-background); padding: 10px; border-radius: 6px; margin-bottom: 8px; border: 1px solid var(--vscode-widget-border, rgba(255,255,255,0.1)); }
    button { background: var(--vscode-button-background); color: var(--vscode-button-foreground); border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; width: 100%; }
    button:hover { background: var(--vscode-button-hoverBackground); }
  </style>
</head>
<body>
  <h3>⚙️ DevDiff IDE Settings</h3>
  <div class="setting-item">
    <strong>Persona</strong>: Developer / PM / CEO / Compliance
  </div>
  <div class="setting-item">
    <strong>Inline Annotations</strong>: Enabled (Gutter + CodeLens)
  </div>
  <div class="setting-item">
    <strong>Agentic Q&A</strong>: MCP Sub-50ms Index Active
  </div>
  <button onclick="vscode.postMessage({type:'openConfig'})">Open Full Settings</button>

  <script>const vscode = acquireVsCodeApi();</script>
</body>
</html>
`;
  }
}
