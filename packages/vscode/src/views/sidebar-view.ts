import * as vscode from "vscode";

/**
 * DevDiff Sidebar — Redesigned for clarity
 * Single clean view with collapsible sections
 */
export class SidebarView implements vscode.WebviewViewProvider {
  public static readonly viewType = "devdiff.sidebarView";

  resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    token: vscode.CancellationToken,
  ): void {
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [],
    };

    webviewView.webview.html = this.renderHTML();

    webviewView.webview.onDidReceiveMessage(async (data) => {
      switch (data.command) {
        case "generate":
          vscode.commands.executeCommand("devdiff.generateChangelog");
          break;
        case "security-scan":
          vscode.commands.executeCommand("devdiff.securityScan");
          break;
        case "explain-code":
          vscode.commands.executeCommand("devdiff.explainCode");
          break;
        case "show-diagram":
          vscode.commands.executeCommand("devdiff.showDiagram");
          break;
        case "open-changelog":
          vscode.commands.executeCommand("devdiff.openChangelog", data.date);
          break;
      }
    });
  }

  private renderHTML(): string {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    :root {
      --bg: var(--vscode-sideBar-background);
      --fg: var(--vscode-editor-foreground);
      --fg-secondary: var(--vscode-descriptionForeground);
      --border: var(--vscode-sideBar-border);
      --hover: var(--vscode-list-hoverBackground);
      --accent: var(--vscode-button-background);
      --accent-fg: var(--vscode-button-foreground);
      --radius: 4px;
      --spacing-sm: 4px;
      --spacing-md: 8px;
      --spacing-lg: 12px;
      --spacing-xl: 16px;
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: var(--vscode-font-family);
      font-size: 13px;
      color: var(--fg);
      background: var(--bg);
      padding: var(--spacing-md);
      line-height: 1.6;
    }

    .primary-action {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      width: 100%;
      padding: 8px 12px;
      background: var(--accent);
      color: var(--accent-fg);
      border: none;
      border-radius: var(--radius);
      font-family: inherit;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      margin-bottom: var(--spacing-xl);
      transition: opacity 0.15s ease;
    }

    .primary-action:hover {
      opacity: 0.9;
    }

    .primary-action:focus-visible {
      outline: 1px solid var(--vscode-focusBorder);
      outline-offset: 1px;
    }

    .section {
      margin-bottom: var(--spacing-xl);
    }

    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--spacing-sm) 0;
      margin-bottom: var(--spacing-sm);
      cursor: pointer;
      user-select: none;
      color: var(--fg-secondary);
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .section-header:hover {
      color: var(--fg);
    }

    .section-header:focus-visible {
      outline: 1px solid var(--vscode-focusBorder);
    }

    .section-content {
      display: none;
    }

    .section-content.open {
      display: block;
    }

    .status-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 8px;
      border-radius: var(--radius);
      cursor: pointer;
      transition: background 0.1s ease;
    }

    .status-item:hover {
      background: var(--hover);
    }

    .status-item:focus-visible {
      outline: 1px solid var(--vscode-focusBorder);
      outline-offset: -1px;
    }

    .status-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .status-dot.connected { background: var(--vscode-testing-iconPassed, #4ec9b0); }
    .status-dot.disconnected { background: var(--vscode-errorForeground, #f14c4c); }
    .status-dot.idle { background: var(--vscode-descriptionForeground, #858585); }

    .status-label {
      font-size: 12px;
      color: var(--fg-secondary);
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .history-item {
      padding: 8px;
      border-radius: var(--radius);
      cursor: pointer;
      transition: background 0.1s ease;
      margin-bottom: 4px;
    }

    .history-item:hover {
      background: var(--hover);
    }

    .history-item:focus-visible {
      outline: 1px solid var(--vscode-focusBorder);
      outline-offset: -1px;
    }

    .history-date {
      font-size: 11px;
      color: var(--fg-secondary);
    }

    .history-summary {
      font-size: 12px;
      color: var(--fg);
      margin-top: 2px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    @media (prefers-contrast: high) {
      .status-item, .history-item {
        border: 1px solid var(--vscode-focusBorder);
      }
      .primary-action {
        border: 2px solid var(--vscode-button-border, var(--vscode-button-background));
      }
    }

    @media (prefers-reduced-motion: reduce) {
      * {
        transition: none !important;
        animation: none !important;
      }
    }
  </style>
</head>
<body>
  <div role="status" aria-live="polite" aria-atomic="true" style="position: absolute; width: 1px; height: 1px; overflow: hidden; opacity: 0;"></div>

  <!-- Primary Action Button -->
  <button class="primary-action" tabindex="0" onclick="generate()">
    ⚡ Generate Changelog
  </button>

  <!-- AI Status Section -->
  <div class="section" data-collapsible>
    <div class="section-header" tabindex="0" onclick="toggleSection(this)">
      <span>AI Status</span>
      <span class="chevron">▼</span>
    </div>
    <div class="section-content open">
      <div class="status-item" tabindex="0">
        <span class="status-dot connected"></span>
        <span class="status-label">llama3.2:3b — Ready</span>
      </div>
    </div>
  </div>

  <!-- Recent Changelogs Section -->
  <div class="section" data-collapsible>
    <div class="section-header" tabindex="0" onclick="toggleSection(this)">
      <span>Recent Changelogs</span>
      <span class="chevron">▼</span>
    </div>
    <div class="section-content open">
      <div class="history-item" tabindex="0" onclick="openChangelog('2026-08-16')">
        <div class="history-date">Aug 16, 2026</div>
        <div class="history-summary">v1.7.0 Agent Orchestration & Dynamic Security Engine</div>
      </div>
      <div class="history-item" tabindex="0" onclick="openChangelog('2026-08-10')">
        <div class="history-date">Aug 10, 2026</div>
        <div class="history-summary">Added rate limiting middleware and session refresh</div>
      </div>
    </div>
  </div>

  <!-- Quick Actions Section -->
  <div class="section" data-collapsible>
    <div class="section-header" tabindex="0" onclick="toggleSection(this)">
      <span>Quick Actions</span>
      <span class="chevron">▶</span>
    </div>
    <div class="section-content">
      <div class="status-item" tabindex="0" onclick="securityScan()">
        <span class="status-dot idle"></span>
        <span class="status-label">Run Security Scan</span>
      </div>
      <div class="status-item" tabindex="0" onclick="explainCode()">
        <span class="status-dot idle"></span>
        <span class="status-label">Explain Selected Code</span>
      </div>
      <div class="status-item" tabindex="0" onclick="showDiagram()">
        <span class="status-dot idle"></span>
        <span class="status-label">Show Architecture Diagram</span>
      </div>
    </div>
  </div>

  <script>
    const vscode = acquireVsCodeApi();

    function generate() { vscode.postMessage({ command: 'generate' }); }
    function securityScan() { vscode.postMessage({ command: 'security-scan' }); }
    function explainCode() { vscode.postMessage({ command: 'explain-code' }); }
    function showDiagram() { vscode.postMessage({ command: 'show-diagram' }); }
    function openChangelog(date) { vscode.postMessage({ command: 'open-changelog', date }); }

    function toggleSection(header) {
      const section = header.closest('[data-collapsible]');
      const content = section.querySelector('.section-content');
      const chevron = header.querySelector('.chevron');
      content.classList.toggle('open');
      chevron.textContent = content.classList.contains('open') ? '▼' : '▶';
    }
  </script>
</body>
</html>`;
  }
}
