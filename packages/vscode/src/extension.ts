import * as vscode from 'vscode'
import { generateChangelog, loadConfig } from '@eldrex/core'
import { execSync } from 'child_process'
import * as path from 'path'

export function activate(context: vscode.ExtensionContext) {
  console.log('DevDiff extension is now active.')

  // 1. Setup Status Bar Item
  const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100)
  statusBarItem.text = '$(diff) DevDiff'
  statusBarItem.tooltip = 'Explain staged changes using DevDiff AI'
  statusBarItem.command = 'devdiff.explainDiff'
  statusBarItem.show()
  context.subscriptions.push(statusBarItem)

  // Helper to get staged diff
  const getStagedDiff = (workspaceRoot: string): string => {
    try {
      return execSync('git diff --cached', { cwd: workspaceRoot, stdio: ['ignore', 'pipe', 'ignore'] })
        .toString()
        .trim()
    } catch {
      return ''
    }
  }

  // 2. Register Explain command
  const explainDisposable = vscode.commands.registerCommand('devdiff.explainDiff', async () => {
    const workspaceFolders = vscode.workspace.workspaceFolders
    if (!workspaceFolders) {
      vscode.window.showWarningMessage('DevDiff: Open a folder to analyze staged changes.')
      return
    }

    const rootPath = workspaceFolders[0].uri.fsPath

    await vscode.window.withProgress({
      location: vscode.ProgressLocation.Notification,
      title: 'DevDiff',
      cancellable: false
    }, async (progress) => {
      progress.report({ message: 'Analyzing staged changes...' })
      
      try {
        const diffText = getStagedDiff(rootPath)
        if (!diffText) {
          vscode.window.showInformationMessage('DevDiff: No staged changes detected.')
          return
        }

        const result = await generateChangelog({
          diffText,
          repoPath: rootPath,
        })

        const channel = vscode.window.createOutputChannel('DevDiff')
        channel.appendLine(result.formattedOutput)
        channel.show()
        
        // Refresh sidebar if visible
        sidebarProvider.refresh()
      } catch (err: any) {
        vscode.window.showErrorMessage(`DevDiff failed: ${err.message}`)
      }
    })
  })
  context.subscriptions.push(explainDisposable)

  // 3. Register Webview Sidebar view
  const sidebarProvider = new DevDiffSidebarProvider(context.extensionUri, getStagedDiff)
  const sidebarView = vscode.window.registerWebviewViewProvider('devdiff.sidebar', sidebarProvider)
  context.subscriptions.push(sidebarView)

  // Command to refresh sidebar manually
  const refreshSidebarCmd = vscode.commands.registerCommand('devdiff.openSidebar', () => {
    sidebarProvider.refresh()
  })
  context.subscriptions.push(refreshSidebarCmd)
}

class DevDiffSidebarProvider implements vscode.WebviewViewProvider {
  private _view?: vscode.WebviewView

  constructor(
    private readonly _extensionUri: vscode.Uri,
    private readonly _getStagedDiff: (workspaceRoot: string) => string
  ) {}

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri]
    }

    this.updateWebviewContent()

    webviewView.webview.onDidReceiveMessage(async (message) => {
      if (message.command === 'refresh') {
        this.refresh()
      } else if (message.command === 'generate') {
        vscode.commands.executeCommand('devdiff.explainDiff')
      }
    })
  }

  public refresh() {
    this.updateWebviewContent()
  }

  private async updateWebviewContent() {
    if (!this._view) return

    const workspaceFolders = vscode.workspace.workspaceFolders
    if (!workspaceFolders) {
      this._view.webview.html = `<h3>Open a workspace folder to view staged changes.</h3>`
      return
    }

    const rootPath = workspaceFolders[0].uri.fsPath
    const diffText = this._getStagedDiff(rootPath)

    if (!diffText) {
      this._view.webview.html = this.getEmptyHTML()
      return
    }

    try {
      const config = await loadConfig(rootPath)
      const result = await generateChangelog({
        diffText,
        repoPath: rootPath,
        format: 'html'
      })
      this._view.webview.html = result.formattedOutput
    } catch (err: any) {
      this._view.webview.html = `<h3>Failed to generate changelog: ${err.message}</h3>`
    }
  }

  private getEmptyHTML(): string {
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
      <style>
        body {
          font-family: sans-serif;
          padding: 1.5rem;
          color: var(--vscode-foreground);
          text-align: center;
        }
        button {
          background: var(--vscode-button-background);
          color: var(--vscode-button-foreground);
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
          margin-top: 1rem;
        }
        button:hover {
          background: var(--vscode-button-hoverBackground);
        }
      </style>
    </head>
    <body>
      <h3>No staged changes detected.</h3>
      <p>Stage some changes using git to view the AI explanation here.</p>
      <button onclick="vscode.postMessage({ command: 'refresh' })">Refresh View</button>
      <script>
        const vscode = acquireVsCodeApi();
      </script>
    </body>
    </html>`
  }
}

export function deactivate() {}
