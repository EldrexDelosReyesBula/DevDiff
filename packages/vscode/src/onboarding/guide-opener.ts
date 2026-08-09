import * as vscode from "vscode";
import { AIDetector, AIDetectionResult } from "@eldrex/core";

export class OnboardingGuide {
  private static readonly GUIDE_FILENAME = "DEVDIFF_GETTING_STARTED.md";
  private static readonly HAS_SEEN_GUIDE_KEY = "devdiff.onboarding.guideSeen";

  /**
   * Register the virtual document provider and commands
   */
  static register(context: vscode.ExtensionContext): void {
    const provider = new (class implements vscode.TextDocumentContentProvider {
      provideTextDocumentContent(): string {
        const detection = AIDetector.detectAll();
        return OnboardingGuide.generateGuide(detection);
      }
    })();

    context.subscriptions.push(
      vscode.workspace.registerTextDocumentContentProvider("devdiff", provider),
    );

    context.subscriptions.push(
      vscode.commands.registerCommand(
        "devdiff.showGettingStarted",
        async () => {
          await OnboardingGuide.openGuide();
        },
      ),
    );
  }

  /**
   * Open the onboarding guide in the editor on first install
   */
  static async showIfFirstTime(
    context: vscode.ExtensionContext,
  ): Promise<void> {
    const hasSeen = context.globalState.get<boolean>(this.HAS_SEEN_GUIDE_KEY);

    if (hasSeen) {
      return; // Already seen — don't show again automatically
    }

    // Mark as seen immediately
    await context.globalState.update(this.HAS_SEEN_GUIDE_KEY, true);

    await this.openGuide();

    // Show toast with quick actions
    const action = await vscode.window.showInformationMessage(
      "👋 Welcome to DevDiff! Your Getting Started guide is open in the editor.",
      "Generate First Changelog",
      "Read Full Docs",
      "Dismiss",
    );

    if (action === "Generate First Changelog") {
      vscode.commands.executeCommand("devdiff.generateChangelog");
    }

    if (action === "Read Full Docs") {
      vscode.env.openExternal(vscode.Uri.parse("https://devdiff.vercel.app"));
    }
  }

  /**
   * Open the virtual markdown guide document in an editor tab
   */
  static async openGuide(): Promise<void> {
    const uri = vscode.Uri.parse(`devdiff://onboarding/${this.GUIDE_FILENAME}`);
    const doc = await vscode.workspace.openTextDocument(uri);
    await vscode.window.showTextDocument(doc, {
      preview: true,
      viewColumn: vscode.ViewColumn.Active,
    });
  }

  /**
   * Generate personalized guide based on detected AI paths
   */
  private static generateGuide(detection: AIDetectionResult): string {
    const aiStatusSection = this.generateAIStatusSection(detection);
    const quickStartSection = this.generateQuickStartSection(detection);

    return `# Welcome to DevDiff! 🎉

DevDiff generates AI-powered changelogs and maintains persistent codebase memory from your git changes.
This guide shows you how to start in under 2 minutes.

${aiStatusSection}

---

## Quick Start

${quickStartSection}

---

## Your Toolbox

### Keyboard Shortcuts
| Shortcut | Action |
|----------|--------|
| \`Ctrl+Shift+G\` / \`Cmd+Shift+G\` | Generate changelog |
| \`Ctrl+Shift+D\` / \`Cmd+Shift+D\` | Open Architecture Diagram |
| \`Ctrl+Shift+X\` / \`Cmd+Shift+X\` | Security & Compliance Scan |
| \`Ctrl+Shift+E\` / \`Cmd+Shift+E\` | Explain Selected Code |
| \`Ctrl+Shift+A\` / \`Cmd+Shift+A\` | Ask DevDiff (natural language) |
| \`@devdiff\` in chat | Natural language assistant |

### Right-Click Actions
- **File in Explorer** → \`DevDiff: Explain This File\`
- **Selected Code** → \`DevDiff: Explain Selected Code\`

### Chat Commands (type in VS Code chat)
- \`@devdiff generate changelog\`
- \`@devdiff what changed today?\`
- \`@devdiff security scan\`
- \`@devdiff show architecture diagram\`
- \`@devdiff explain [file path]\`
- \`@devdiff is this GDPR compliant?\`

---

## Try These Next

1. **Different Personas:** Change active persona in the DevDiff Settings sidebar (Developer, CEO, Educator, PM, Compliance, Robot, Data Analyst, Journalist)
2. **Security Audit:** Run \`DevDiff: Security Scan\` from the Command Palette
3. **Architecture View:** Run \`DevDiff: Generate Diagram\` to view Mermaid class/flow charts
4. **Code Questions:** Type \`@devdiff ask <question>\` or use the Q&A Chat Panel

---

## Need Help?

- 📖 **Full Documentation:** https://devdiff.vercel.app
- 🐛 **Report Issues:** https://github.com/EldrexDelosReyesBula/devdiff/issues
- 💬 **Community:** https://github.com/EldrexDelosReyesBula/devdiff/discussions

---

*This guide won't auto-open again. Access it anytime from Command Palette: \`DevDiff: Show Getting Started Guide\`*
`;
  }

  private static generateAIStatusSection(detection: AIDetectionResult): string {
    const lines: string[] = ["## Your AI Status"];

    for (const path of detection.paths) {
      if (path.available) {
        lines.push(`✅ **${path.icon} ${path.name}** — ${path.details}`);
      } else if (path.setupRequired && path.action) {
        lines.push(`⚠️ **${path.icon} ${path.name}** — ${path.details}`);
        if (path.action.type === "install") {
          lines.push(
            `   → [Install ${path.name}](${path.action.url}) — ${path.action.platformInstructions || "Free, private, 2-minute setup"}`,
          );
        }
        if (path.action.type === "setup") {
          lines.push(`   → Setup command: \`${path.action.command}\``);
        }
      }
    }

    if (detection.availablePaths.length === 0) {
      lines.push("");
      lines.push("**No AI provider detected yet.** Choose one to get started:");
      lines.push("");
      lines.push("🦙 **Install Ollama** — Free, private, runs on your machine");
      lines.push(`   → ${this.getOllamaInstallLink()}`);
      lines.push("");
      lines.push("☁️ **Use Cloud AI** — Your own API key");
      lines.push("   → Run: `devdiff auth add openai`");
      lines.push("");
      lines.push("💬 **Use IDE Agent** — Built into your IDE");
      lines.push("   → Type `@devdiff` in your VS Code chat panel");
    }

    return lines.join("\n");
  }

  private static generateQuickStartSection(
    detection: AIDetectionResult,
  ): string {
    const recommended = detection.recommendedPath;

    if (recommended) {
      return `Your AI is ready (${recommended.icon} ${recommended.name}). Here's the fastest path:

### Step 1: Make a Change
Edit any file in your project.

### Step 2: Stage Your Changes
In the Source Control panel (\`Ctrl+Shift+G\` / \`Cmd+Shift+G\`), stage the files.

### Step 3: Generate Your Changelog
${
  recommended.id === "ide-agent"
    ? "Type `@devdiff generate changelog` in your VS Code chat panel."
    : "Press `Ctrl+Shift+G` or run `DevDiff: Explain Staged Changes` from Command Palette."
}

Your first changelog will appear in seconds.`;
    }

    return `Choose an AI provider above, then:

### Step 1: Make a Change
Edit any file in your project.

### Step 2: Stage Your Changes
In the Source Control panel (\`Ctrl+Shift+G\` / \`Cmd+Shift+G\`), stage the files.

### Step 3: Generate Your Changelog
Press \`Ctrl+Shift+G\` or type \`@devdiff generate changelog\`.`;
  }

  private static getOllamaInstallLink(): string {
    switch (process.platform) {
      case "win32":
        return "https://ollama.com/download/windows";
      case "darwin":
        return "https://ollama.com/download/mac";
      default:
        return "https://ollama.com/download/linux";
    }
  }
}
