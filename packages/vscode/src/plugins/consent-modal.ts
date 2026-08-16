import * as vscode from "vscode";
import {
  DependencyScanner,
  DependencyScanResult,
  ObfuscationDetector,
  ObfuscationAnalysis,
  PermissionReviewer,
  PermissionReview,
} from "@eldrex/core";

export interface PluginToInstall {
  name: string;
  version: string;
  publisher: string;
  verified: boolean;
  path: string;
  sourceCode: string;
  permissions: string[];
  allowOverride?: boolean;
}

export interface ConsentResult {
  action: "install" | "cancel";
  reviewed: boolean;
  trustPublisher?: boolean;
}

export class PluginConsentModal {
  /**
   * Show a comprehensive consent modal before plugin installation.
   * Includes: dependency scan, obfuscation check, permission review, network targets.
   */
  static async show(plugin: PluginToInstall): Promise<ConsentResult> {
    const panel = vscode.window.createWebviewPanel(
      "devdiff-plugin-consent",
      `Install Plugin: ${plugin.name}`,
      vscode.ViewColumn.One,
      { enableScripts: true },
    );

    const [dependencyScan, obfuscationAnalysis, permissionReview] =
      await Promise.all([
        DependencyScanner.scan(plugin.path),
        Promise.resolve(ObfuscationDetector.analyze(plugin.sourceCode)),
        Promise.resolve(
          PermissionReviewer.review(plugin.permissions, plugin.sourceCode),
        ),
      ]);

    panel.webview.html = this.renderModal(plugin, {
      dependencyScan,
      obfuscationAnalysis,
      permissionReview,
    });

    return new Promise<ConsentResult>((resolve) => {
      panel.webview.onDidReceiveMessage((message) => {
        panel.dispose();

        switch (message.command) {
          case "approve":
            resolve({ action: "install", reviewed: true });
            break;
          case "approve-always":
            resolve({
              action: "install",
              reviewed: true,
              trustPublisher: true,
            });
            break;
          case "cancel":
          default:
            resolve({ action: "cancel", reviewed: false });
            break;
          case "learn-more":
            vscode.env.openExternal(
              vscode.Uri.parse(
                `https://devdiff.vercel.app/docs/plugins/security#${message.topic || "overview"}`,
              ),
            );
            break;
        }
      });
    });
  }

  private static renderModal(
    plugin: PluginToInstall,
    scans: {
      dependencyScan: DependencyScanResult;
      obfuscationAnalysis: ObfuscationAnalysis;
      permissionReview: PermissionReview;
    },
  ): string {
    const { dependencyScan, obfuscationAnalysis, permissionReview } = scans;

    const criticalCount =
      dependencyScan.findings.filter((f) => f.severity === "critical").length +
      (obfuscationAnalysis.status === "dangerous" ? 1 : 0);

    const canInstall = criticalCount === 0 || Boolean(plugin.allowOverride);

    return `<!DOCTYPE html>
<html>
<head>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: var(--vscode-font-family);
      background: var(--vscode-editor-background);
      color: var(--vscode-editor-foreground);
      padding: 24px;
      font-size: 13px;
      line-height: 1.6;
    }
    
    .header {
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--vscode-sideBar-border);
    }
    
    .header h1 { font-size: 18px; margin-bottom: 8px; }
    .header .version { color: var(--vscode-descriptionForeground); font-size: 12px; }
    .header .publisher { font-size: 12px; margin-top: 4px; }
    .verified { color: #22c55e; }
    .unverified { color: #f59e0b; }
    
    .section {
      background: var(--vscode-sideBar-background);
      border: 1px solid var(--vscode-sideBar-border);
      border-radius: 6px;
      padding: 16px;
      margin-bottom: 16px;
    }
    
    .section h2 {
      font-size: 14px;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .finding {
      padding: 8px 12px;
      border-radius: 4px;
      margin-bottom: 8px;
      font-size: 12px;
    }
    
    .finding.critical {
      background: rgba(239, 68, 68, 0.1);
      border-left: 3px solid #ef4444;
      color: #fca5a5;
    }
    
    .finding.high {
      background: rgba(245, 158, 11, 0.1);
      border-left: 3px solid #f59e0b;
      color: #fcd34d;
    }
    
    .finding.medium {
      background: rgba(59, 130, 246, 0.1);
      border-left: 3px solid #3b82f6;
      color: #93c5fd;
    }
    
    .finding.low {
      background: rgba(107, 114, 128, 0.1);
      border-left: 3px solid #6b7280;
      color: #9ca3af;
    }
    
    .pass {
      color: #22c55e;
      padding: 8px 12px;
    }
    
    .dependency-graph {
      background: var(--vscode-editor-background);
      border-radius: 4px;
      padding: 12px;
      font-family: monospace;
      font-size: 11px;
      max-height: 200px;
      overflow-y: auto;
      margin-top: 8px;
    }
    
    .dependency-node {
      padding: 4px 8px;
      border-radius: 3px;
      margin: 2px 0;
    }
    
    .dependency-node.plugin { background: rgba(99, 102, 241, 0.2); }
    .dependency-node.direct { background: rgba(34, 197, 94, 0.1); }
    .dependency-node.transitive { background: rgba(107, 114, 128, 0.1); }
    .dependency-node.flagged { background: rgba(239, 68, 68, 0.1); }
    
    .actions {
      display: flex;
      gap: 12px;
      margin-top: 24px;
      justify-content: flex-end;
    }
    
    .btn {
      padding: 8px 20px;
      border-radius: 4px;
      border: none;
      font-size: 13px;
      cursor: pointer;
      font-family: inherit;
    }
    
    .btn-primary {
      background: #6366f1;
      color: white;
    }
    
    .btn-primary:hover { background: #4f46e5; }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
    
    .btn-secondary {
      background: var(--vscode-button-secondaryBackground);
      color: var(--vscode-button-secondaryForeground);
    }
    
    .btn-ghost {
      background: transparent;
      color: var(--vscode-descriptionForeground);
    }
    
    .warning-banner {
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid rgba(239, 68, 68, 0.3);
      border-radius: 6px;
      padding: 12px 16px;
      margin-bottom: 16px;
    }
    
    .warning-banner h3 { color: #fca5a5; margin-bottom: 4px; }
    .warning-banner p { color: #fca5a5; font-size: 12px; }
    
    .summary-stats {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
    }
    
    .stat {
      background: var(--vscode-sideBar-background);
      border: 1px solid var(--vscode-sideBar-border);
      border-radius: 6px;
      padding: 12px;
      flex: 1;
      text-align: center;
    }
    
    .stat .number { font-size: 24px; font-weight: 700; }
    .stat .label { font-size: 11px; color: var(--vscode-descriptionForeground); margin-top: 4px; }
    
    .stat.critical .number { color: #ef4444; }
    .stat.high .number { color: #f59e0b; }
    .stat.safe .number { color: #22c55e; }
  </style>
</head>
<body>
  <div class="header">
    <h1>📦 ${plugin.name}</h1>
    <div class="version">Version ${plugin.version}</div>
    <div class="publisher">
      Publisher: ${plugin.publisher} 
      ${plugin.verified ? '<span class="verified">✅ Verified</span>' : '<span class="unverified">⚠️ Unverified</span>'}
    </div>
  </div>

  ${
    criticalCount > 0
      ? `
    <div class="warning-banner">
      <h3>⚠️ Security Concerns Detected</h3>
      <p>${criticalCount} critical finding(s) found. Installation is ${canInstall ? "allowed with override" : "blocked"}.</p>
    </div>
  `
      : ""
  }

  <div class="summary-stats">
    <div class="stat ${dependencyScan.findings.filter((f) => f.severity === "critical").length > 0 ? "critical" : "safe"}">
      <div class="number">${dependencyScan.totalDependencies}</div>
      <div class="label">Total Dependencies</div>
    </div>
    <div class="stat ${dependencyScan.findings.length > 0 ? "high" : "safe"}">
      <div class="number">${dependencyScan.findings.length}</div>
      <div class="label">Security Findings</div>
    </div>
    <div class="stat ${obfuscationAnalysis.status === "clean" ? "safe" : "high"}">
      <div class="number">${obfuscationAnalysis.score}</div>
      <div class="label">Obfuscation Score</div>
    </div>
  </div>

  <!-- Dependency Tree -->
  <div class="section">
    <h2>🔗 Dependency Tree (${dependencyScan.totalDependencies} packages)</h2>
    <div class="dependency-graph">
      ${dependencyScan.dependencyGraph.nodes
        .map(
          (node) => `
        <div class="dependency-node ${node.type === "plugin" ? "plugin" : node.type === "direct-dependency" ? "direct" : "transitive"} ${node.hasNetworkAccess || node.hasDangerousPatterns ? "flagged" : ""}">
          ${"&nbsp;&nbsp;".repeat(node.depth)}${node.depth > 0 ? "↳ " : ""}${node.name}@${node.version || ""}
          ${node.hasNetworkAccess ? " 🌐" : ""}
          ${node.hasDangerousPatterns ? " ⚡" : ""}
          ${node.hasNativeBinaries ? " 📦" : ""}
        </div>
      `,
        )
        .join("")}
    </div>
    <p style="font-size: 11px; color: var(--vscode-descriptionForeground); margin-top: 8px;">
      🌐 = Network access &nbsp; ⚡ = Dynamic code &nbsp; 📦 = Native binaries
    </p>
  </div>

  <!-- Security Findings -->
  ${
    dependencyScan.findings.length > 0
      ? `
    <div class="section">
      <h2>🔍 Dependency Findings (${dependencyScan.findings.length})</h2>
      ${dependencyScan.findings
        .map(
          (f) => `
        <div class="finding ${f.severity}">
          <strong>${f.package}@${f.version || "unknown"}</strong> — ${f.detail}
          ${f.networkTargets ? `<br><small>Network targets: ${f.networkTargets.join(", ")}</small>` : ""}
        </div>
      `,
        )
        .join("")}
    </div>
  `
      : `
    <div class="section">
      <h2>🔍 Dependency Findings</h2>
      <div class="pass">✅ No security issues found in dependency tree</div>
    </div>
  `
  }

  <!-- Obfuscation Analysis -->
  <div class="section">
    <h2>🔎 Code Analysis</h2>
    ${
      obfuscationAnalysis.status === "clean"
        ? `
      <div class="pass">✅ Code appears readable and unobfuscated</div>
    `
        : `
      <p style="margin-bottom: 8px;">Obfuscation Score: <strong>${obfuscationAnalysis.score}/100</strong> — ${obfuscationAnalysis.status.toUpperCase()}</p>
      ${obfuscationAnalysis.indicators
        .map(
          (i) => `
        <div class="finding ${i.severity}">
          <strong>${i.type}</strong> — ${i.detail}
        </div>
      `,
        )
        .join("")}
    `
    }
  </div>

  <!-- Permissions -->
  <div class="section">
    <h2>🔐 Requested Permissions</h2>
    ${permissionReview.permissions
      .map(
        (p) => `
      <div style="margin-bottom: 8px;">
        <strong>${p.icon} ${p.name}</strong> — ${p.detail}
        ${p.warning ? `<br><small style="color: #f59e0b;">⚠️ ${p.warning}</small>` : ""}
      </div>
    `,
      )
      .join("")}
    ${
      permissionReview.undeclared.length > 0
        ? `
      <div class="finding critical" style="margin-top: 8px;">
        <strong>⚠️ Undeclared permissions detected:</strong>
        ${permissionReview.undeclared.map((u) => `<br>• ${u}`).join("")}
      </div>
    `
        : ""
    }
  </div>

  <!-- Actions -->
  <div class="actions">
    <button class="btn btn-ghost" onclick="send('learn-more', 'security')">
      📖 Learn More
    </button>
    <button class="btn btn-secondary" onclick="send('cancel')">
      Cancel
    </button>
    ${
      canInstall
        ? `
      <button class="btn btn-primary" onclick="send('approve')">
        ✅ Install
      </button>
      ${
        plugin.verified
          ? `
        <button class="btn btn-primary" onclick="send('approve-always')">
          ✅ Install & Trust Publisher
        </button>
      `
          : ""
      }
    `
        : `
      <button class="btn btn-primary" disabled title="Critical security concerns must be resolved first">
        🔒 Blocked
      </button>
    `
    }
  </div>

  <script>
    const vscode = acquireVsCodeApi()
    function send(command, topic) {
      vscode.postMessage({ command, topic })
    }
  </script>
</body>
</html>`;
  }
}
