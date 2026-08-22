import * as vscode from "vscode";
import { DevDiffEngine } from "@eldrex/core";

export class ChangelogItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly description: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly command?: vscode.Command,
    public readonly iconName?: string,
  ) {
    super(label, collapsibleState);
    this.tooltip = `${this.label} — ${this.description}`;
    this.description = description;
    if (iconName) {
      this.iconPath = new vscode.ThemeIcon(iconName);
    }
  }
}

export class ChangelogExplorer implements vscode.TreeDataProvider<ChangelogItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<
    ChangelogItem | undefined | null | void
  > = new vscode.EventEmitter<ChangelogItem | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<
    ChangelogItem | undefined | null | void
  > = this._onDidChangeTreeData.event;

  constructor(
    private context: vscode.ExtensionContext,
    private engine: DevDiffEngine,
  ) {}

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: ChangelogItem): vscode.TreeItem {
    return element;
  }

  async getChildren(element?: ChangelogItem): Promise<ChangelogItem[]> {
    if (!element) {
      return [
        new ChangelogItem(
          "Generate Recent Changelog",
          "Analyze uncommitted & staged git changes",
          vscode.TreeItemCollapsibleState.None,
          {
            command: "devdiff.generateChangelog",
            title: "Generate Changelog",
          },
          "play",
        ),
        new ChangelogItem(
          "Staged Changes",
          "Inspect staged files",
          vscode.TreeItemCollapsibleState.Collapsed,
          undefined,
          "git-commit",
        ),
        new ChangelogItem(
          "Architecture Diagram",
          "Generate Mermaid diagram of changes",
          vscode.TreeItemCollapsibleState.None,
          {
            command: "devdiff.generateDiagram",
            title: "Generate Diagram",
          },
          "graph",
        ),
      ];
    }

    if (element.label === "Staged Changes") {
      try {
        const workspacePath =
          vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || process.cwd();
        const contextData = await this.engine.getProjectContext();
        return [
          new ChangelogItem(
            "Project Summary",
            "View project summary & architecture",
            vscode.TreeItemCollapsibleState.None,
            {
              command: "devdiff.showProjectSummary",
              title: "Show Project Summary",
            },
            "info",
          ),
        ];
      } catch {
        return [
          new ChangelogItem(
            "No Staged Files",
            "Stage files with git to analyze",
            vscode.TreeItemCollapsibleState.None,
            undefined,
            "info",
          ),
        ];
      }
    }

    return [];
  }
}
