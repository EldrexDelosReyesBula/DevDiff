import * as vscode from "vscode";
import { DevDiffEngine, ConversationalQA } from "@eldrex/core";

export class ChatPanel implements vscode.WebviewViewProvider {
  public static readonly viewType = "devdiff-chat";
  private _view?: vscode.WebviewView;
  private qa: ConversationalQA;

  constructor(
    private readonly extensionUri: vscode.Uri,
    private readonly engine: DevDiffEngine,
  ) {
    const workspacePath =
      vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || process.cwd();
    this.qa = new ConversationalQA(workspacePath);
  }

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken,
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this.extensionUri],
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    webviewView.webview.onDidReceiveMessage(async (data) => {
      switch (data.type) {
        case "ask": {
          const userQuestion = data.text;
          if (!userQuestion || !userQuestion.trim()) return;

          this._view?.webview.postMessage({
            type: "addMessage",
            role: "user",
            text: userQuestion,
          });
          this._view?.webview.postMessage({
            type: "setLoading",
            loading: true,
          });

          try {
            const result = await this.qa.ask(userQuestion);
            this._view?.webview.postMessage({
              type: "addMessage",
              role: "assistant",
              text: result.answer,
              sources: result.sources,
              followUps: result.followUps,
            });
          } catch (err: any) {
            this._view?.webview.postMessage({
              type: "addMessage",
              role: "assistant",
              text: `⚠️ Could not query DevDiff memory: ${err?.message || err}`,
            });
          } finally {
            this._view?.webview.postMessage({
              type: "setLoading",
              loading: false,
            });
          }
          break;
        }
      }
    });
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    return /* html */ `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DevDiff Q&A Chat</title>
  <style>
    body {
      font-family: var(--vscode-font-family);
      font-size: var(--vscode-editor-font-size, 13px);
      color: var(--vscode-editor-foreground);
      background-color: var(--vscode-sideBar-background);
      padding: 10px;
      margin: 0;
      display: flex;
      flex-direction: column;
      height: 100vh;
      box-sizing: border-box;
    }
    #messages {
      flex: 1;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-bottom: 10px;
    }
    .msg {
      padding: 8px 12px;
      border-radius: 6px;
      line-height: 1.4;
      white-space: pre-wrap;
    }
    .msg.user {
      background: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
      align-self: flex-end;
      max-width: 85%;
    }
    .msg.assistant {
      background: var(--vscode-editorWidget-background);
      border: 1px solid var(--vscode-widget-border, rgba(255,255,255,0.1));
      align-self: flex-start;
      max-width: 95%;
    }
    .input-container {
      display: flex;
      gap: 6px;
    }
    input {
      flex: 1;
      background: var(--vscode-input-background);
      color: var(--vscode-input-foreground);
      border: 1px solid var(--vscode-input-border);
      padding: 6px 10px;
      border-radius: 4px;
      outline: none;
    }
    button {
      background: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
      border: none;
      padding: 6px 12px;
      border-radius: 4px;
      cursor: pointer;
    }
    button:hover {
      background: var(--vscode-button-hoverBackground);
    }
    .sources {
      font-size: 11px;
      margin-top: 4px;
      opacity: 0.8;
      color: var(--vscode-textLink-foreground);
    }
  </style>
</head>
<body>
  <div id="messages">
    <div class="msg assistant">💬 <strong>DevDiff IDE Q&A Assistant</strong>\nAsk any question about code changes, dependencies, compliance, or architecture.</div>
  </div>
  <div class="input-container">
    <input type="text" id="prompt" placeholder="Ask @devdiff something..." onkeydown="if(event.key==='Enter') send()" />
    <button onclick="send()">Send</button>
  </div>

  <script>
    const vscode = acquireVsCodeApi();
    const messages = document.getElementById('messages');
    const input = document.getElementById('prompt');

    function send() {
      const text = input.value.trim();
      if (!text) return;
      vscode.postMessage({ type: 'ask', text });
      input.value = '';
    }

    window.addEventListener('message', event => {
      const msg = event.data;
      if (msg.type === 'addMessage') {
        const div = document.createElement('div');
        div.className = 'msg ' + msg.role;
        div.innerText = msg.text;
        if (msg.sources && msg.sources.length) {
          const srcDiv = document.createElement('div');
          srcDiv.className = 'sources';
          srcDiv.innerText = 'Sources: ' + msg.sources.join(', ');
          div.appendChild(srcDiv);
        }
        messages.appendChild(div);
        messages.scrollTop = messages.scrollHeight;
      }
    });
  </script>
</body>
</html>
`;
  }
}
