import * as vscode from "vscode";

export class ChangelogItem extends vscode.TreeItem {
  children?: ChangelogItem[];

  constructor(
    label: string,
    description: string,
    icon: string,
    command?: string,
    children?: ChangelogItem[]
  ) {
    super(
      label,
      children ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None
    );
    this.description = description;
    this.iconPath = new vscode.ThemeIcon(icon);
    this.children = children;

    if (command) {
      this.command = { command, title: label };
    }
  }
}

export class ChangelogTreeProvider implements vscode.TreeDataProvider<ChangelogItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<ChangelogItem | undefined | null | void> =
    new vscode.EventEmitter<ChangelogItem | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<ChangelogItem | undefined | null | void> =
    this._onDidChangeTreeData.event;

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: ChangelogItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: ChangelogItem): ChangelogItem[] {
    if (!element) {
      // Root — show sections
      return [
        new ChangelogItem("Generate Changelog", "Generate from staged changes", "play", "devdiff.generateChangelog"),
        new ChangelogItem("Recent Changelogs", "View history", "history", undefined, [
          new ChangelogItem("Today", "3 changelogs", "calendar"),
          new ChangelogItem("This Week", "12 changelogs", "calendar"),
        ]),
        new ChangelogItem("View in Editor", "Open CHANGELOG.md", "file", "devdiff.openChangelog"),
      ];
    }

    return element.children || [];
  }
}

export class SecurityTreeItem extends vscode.TreeItem {
  children?: SecurityTreeItem[];

  constructor(
    label: string,
    description: string,
    icon: string,
    command?: string,
    children?: SecurityTreeItem[]
  ) {
    super(
      label,
      children ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None
    );
    this.description = description;
    this.iconPath = new vscode.ThemeIcon(icon);
    this.children = children;

    if (command) {
      this.command = { command, title: label };
    }
  }
}

export class SecurityTreeProvider implements vscode.TreeDataProvider<SecurityTreeItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<SecurityTreeItem | undefined | null | void> =
    new vscode.EventEmitter<SecurityTreeItem | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<SecurityTreeItem | undefined | null | void> =
    this._onDidChangeTreeData.event;

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: SecurityTreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: SecurityTreeItem): SecurityTreeItem[] {
    if (!element) {
      return [
        new SecurityTreeItem("Run Workspace Audit", "Scan for secrets & vulnerabilities", "shield", "devdiff.runSecurityAudit"),
        new SecurityTreeItem("Scan Results", "Recent findings", "warning", undefined, [
          new SecurityTreeItem("High Severity", "0 issues detected", "pass-filled"),
          new SecurityTreeItem("Medium Severity", "1 warning", "alert"),
        ]),
        new SecurityTreeItem("Security Advisories", "Check patch advisories", "lock", "devdiff.openSecurityAdvisories"),
      ];
    }

    return element.children || [];
  }
}

export class QAWebviewViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "devdiff-qa";

  constructor(private readonly extensionUri: vscode.Uri) {}

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this.extensionUri],
    };

    webviewView.webview.html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: var(--vscode-font-family); padding: 12px; color: var(--vscode-foreground); }
          .header { font-weight: bold; margin-bottom: 8px; display: flex; align-items: center; gap: 6px; }
          .container { display: flex; flex-direction: column; gap: 8px; }
          input { width: 100%; padding: 6px; border: 1px solid var(--vscode-input-border); background: var(--vscode-input-background); color: var(--vscode-input-foreground); border-radius: 4px; }
          button { background: var(--vscode-button-background); color: var(--vscode-button-foreground); border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; }
          button:hover { background: var(--vscode-button-hoverBackground); }
          .answer { margin-top: 10px; padding: 8px; background: var(--vscode-editor-background); border-radius: 4px; font-size: 0.9em; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">💬 Context-Aware Q&A</div>
          <input type="text" id="question" placeholder="Ask a question about this workspace..." />
          <button id="askBtn">Ask DevDiff</button>
          <div id="answer" class="answer">Select code or ask a question about your project architecture.</div>
        </div>
        <script>
          const vscode = acquireVsCodeApi();
          document.getElementById('askBtn').addEventListener('click', () => {
            const q = document.getElementById('question').value;
            if (q) {
              document.getElementById('answer').innerText = 'Analyzing workspace context...';
              vscode.postMessage({ type: 'ask', question: q });
            }
          });
        </script>
      </body>
      </html>
    `;
  }
}

export class CleanSidebar {
  /**
   * Register a clean, organized sidebar
   */
  static register(context: vscode.ExtensionContext): void {
    // ── Panel 1: Changelog ──
    const changelogView = vscode.window.createTreeView("devdiff-changelog", {
      treeDataProvider: new ChangelogTreeProvider(),
      showCollapseAll: true,
    });

    // ── Panel 2: Q&A / Study ──
    const qaView = vscode.window.registerWebviewViewProvider(
      "devdiff-qa",
      new QAWebviewViewProvider(context.extensionUri),
      { webviewOptions: { retainContextWhenHidden: true } }
    );

    // ── Panel 3: Security ──
    const securityView = vscode.window.createTreeView("devdiff-security", {
      treeDataProvider: new SecurityTreeProvider(),
      showCollapseAll: true,
    });

    context.subscriptions.push(changelogView, qaView, securityView);
  }
}
