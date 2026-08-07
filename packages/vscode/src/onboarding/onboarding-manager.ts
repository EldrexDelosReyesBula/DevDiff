import * as vscode from "vscode";

export interface OnboardingAction {
  label: string;
  command: string;
}

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  duration?: string;
  tourItems?: Array<{ icon: string; text: string }>;
  actions: OnboardingAction[];
}

export class OnboardingManager {
  private context: vscode.ExtensionContext;
  private steps: OnboardingStep[] = [];

  constructor(context: vscode.ExtensionContext) {
    this.context = context;

    this.steps = [
      {
        id: "welcome",
        title: "Welcome to DevDiff! 🎉",
        description: "AI-powered changelogs & persistent memory. Your code never leaves your machine.",
        duration: "2 minute setup",
        actions: [
          { label: "Start Setup", command: "devdiff.onboarding.next" },
          { label: "Skip", command: "devdiff.onboarding.skip" },
        ],
      },
      {
        id: "ai-detection",
        title: "Detecting AI Providers...",
        description: "Finding the best AI model for your machine.",
        actions: [
          { label: "Continue", command: "devdiff.onboarding.next" },
          { label: "Configure AI", command: "devdiff.onboarding.configureAI" },
        ],
      },
      {
        id: "quick-tour",
        title: "Quick Tour (30 seconds)",
        description: "Here's how to use DevDiff:",
        tourItems: [
          { icon: "keyboard", text: "Ctrl+Shift+G → Generate changelog" },
          { icon: "chat", text: "Ask DevDiff: 'What changed today?'" },
          { icon: "eye", text: "Status bar shows your AI model" },
          { icon: "history", text: "Sidebar has persistent memory" },
        ],
        actions: [
          { label: "Take Tour", command: "devdiff.onboarding.startTour" },
          { label: "Skip Tour", command: "devdiff.onboarding.next" },
        ],
      },
      {
        id: "done",
        title: "You're All Set! 🎉",
        description: "DevDiff is active in your workspace.",
        actions: [{ label: "Done", command: "devdiff.onboarding.finish" }],
      },
    ];
  }

  async start(): Promise<void> {
    const hasCompleted = this.context.globalState.get("devdiff.onboarding.completed");
    if (hasCompleted) return;

    await this.showStep(0);
  }

  private async showStep(index: number): Promise<void> {
    const step = this.steps[index];
    const panel = vscode.window.createWebviewPanel(
      "devdiff-onboarding",
      `DevDiff Setup — Step ${index + 1}/${this.steps.length}`,
      vscode.ViewColumn.One,
      { enableScripts: true }
    );

    panel.webview.html = this.renderStep(step, index);

    panel.webview.onDidReceiveMessage(async (message) => {
      switch (message.command) {
        case "next":
          panel.dispose();
          if (index < this.steps.length - 1) {
            await this.showStep(index + 1);
          } else {
            await this.finish();
          }
          break;
        case "skip":
        case "finish":
          panel.dispose();
          await this.finish();
          break;
      }
    });
  }

  private async finish(): Promise<void> {
    await this.context.globalState.update("devdiff.onboarding.completed", true);
    vscode.window.showInformationMessage("🎉 DevDiff setup complete! Press Ctrl+Shift+G anytime.");
  }

  private renderStep(step: OnboardingStep, index: number): string {
    return `<!DOCTYPE html>
<html>
<head>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; background: #0f172a; color: #f8fafc; display: flex; align-items: center; justify-content: center; height: 100vh; padding: 40px; }
    .onboarding-card { max-width: 520px; width: 100%; background: #1e293b; border-radius: 16px; padding: 40px; text-align: center; border: 1px solid #334155; }
    .step-indicator { font-size: 12px; color: #64748b; margin-bottom: 24px; }
    h1 { font-size: 24px; margin-bottom: 12px; }
    p { color: #94a3b8; margin-bottom: 24px; line-height: 1.6; }
    .actions { display: flex; gap: 12px; justify-content: center; }
    .btn { padding: 10px 24px; border-radius: 8px; border: none; font-size: 14px; font-weight: 500; cursor: pointer; background: #6366f1; color: white; }
  </style>
</head>
<body>
  <div class="onboarding-card">
    <div class="step-indicator">Step ${index + 1} of ${this.steps.length}</div>
    <h1>${step.title}</h1>
    <p>${step.description}</p>
    <div class="actions">
      <button class="btn" onclick="vscode.postMessage({ command: 'next' })">Continue</button>
    </div>
  </div>
  <script>const vscode = acquireVsCodeApi();</script>
</body>
</html>`;
  }
}
