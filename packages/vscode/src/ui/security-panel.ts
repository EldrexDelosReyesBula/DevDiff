import * as vscode from "vscode";
import { DevDiffEngine } from "@eldrex/core";

export class SecurityPanel implements vscode.WebviewViewProvider {
  public static readonly viewType = "devdiff-security";
  private _view?: vscode.WebviewView;

  constructor(
    private readonly extensionUri: vscode.Uri,
    private readonly engine: DevDiffEngine
  ) {}

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this.extensionUri],
    };

    webviewView.webview.html = this._getHtmlForWebview();

    webviewView.webview.onDidReceiveMessage(async (data) => {
      if (data.type === "scan") {
        this._view?.webview.postMessage({ type: "setLoading", loading: true });
        try {
          const report = await this.engine.securityScan({
            since: "24h",
            threshold: "medium",
          });
          this._view?.webview.postMessage({ type: "showReport", report });
        } catch (err: any) {
          this._view?.webview.postMessage({
            type: "showReport",
            report: { error: err?.message || String(err) },
          });
        } finally {
          this._view?.webview.postMessage({ type: "setLoading", loading: false });
        }
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
    body {
      font-family: var(--vscode-font-family);
      font-size: var(--vscode-editor-font-size, 13px);
      color: var(--vscode-editor-foreground);
      background-color: var(--vscode-sideBar-background);
      padding: 12px;
    }
    .card {
      background: var(--vscode-editorWidget-background);
      border: 1px solid var(--vscode-widget-border, rgba(255,255,255,0.1));
      padding: 12px;
      border-radius: 6px;
      margin-bottom: 12px;
    }
    button {
      background: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
      border: none;
      padding: 8px 14px;
      border-radius: 4px;
      cursor: pointer;
      width: 100%;
      font-weight: 600;
    }
    button:hover { background: var(--vscode-button-hoverBackground); }
    #results { margin-top: 12px; white-space: pre-wrap; font-family: var(--vscode-editor-font-family); }
  </style>
</head>
<body>
  <div class="card">
    <h3>🛡️ Security & Compliance Guard</h3>
    <p>Scan uncommitted changes for secret exposure, PII handling, GDPR/HIPAA compliance, and OWASP anti-patterns.</p>
    <button onclick="scan()">Run Security Scan</button>
  </div>
  <div id="results">Click "Run Security Scan" to check workspace.</div>

  <script>
    const vscode = acquireVsCodeApi();
    function scan() {
      document.getElementById('results').innerText = 'Scanning workspace changes...';
      vscode.postMessage({ type: 'scan' });
    }
    window.addEventListener('message', event => {
      const msg = event.data;
      if (msg.type === 'showReport') {
        document.getElementById('results').innerText = typeof msg.report === 'string' ? msg.report : JSON.stringify(msg.report, null, 2);
      }
    });
  </script>
</body>
</html>
`;
  }
}
