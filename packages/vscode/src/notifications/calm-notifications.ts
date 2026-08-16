import * as vscode from "vscode";

/**
 * Calm Notifications — Non-intrusive notification manager
 * Follows 5 core UX principles:
 * 1. Never interrupt the developer's flow
 * 2. Never use modal dialogs for non-critical info
 * 3. Never show red for non-emergencies
 * 4. Always provide a clear action
 * 5. Auto-dismiss after reasonable time
 */
export class CalmNotifications {
  static showSuccess(
    message: string,
    action?: { title: string; command: string },
  ): void {
    if (action) {
      vscode.window.showInformationMessage(message, action.title).then((choice) => {
        if (choice === action.title) {
          vscode.commands.executeCommand(action.command);
        }
      });
    } else {
      const statusBar = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Right,
        100,
      );
      statusBar.text = `$(check) ${message}`;
      statusBar.tooltip = message;
      statusBar.show();

      setTimeout(() => statusBar.dispose(), 5000);
    }
  }

  static showInfo(message: string): void {
    const statusBar = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Right,
      100,
    );
    statusBar.text = `$(info) ${message}`;
    statusBar.tooltip = message;
    statusBar.show();

    setTimeout(() => statusBar.dispose(), 5000);
  }

  static showProgress(message: string): vscode.StatusBarItem {
    const statusBar = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Right,
      100,
    );
    statusBar.text = `$(loading~spin) ${message}`;
    statusBar.show();
    return statusBar;
  }

  static showError(message: string): void {
    vscode.window.showErrorMessage(message);
  }
}
