import * as vscode from "vscode";

export class ReviewPrompt {
  private static readonly MILESTONES = [5, 10, 25, 50, 100];
  private static readonly COOLDOWN_DAYS = 30;

  /**
   * Check if we should gently ask for a review
   */
  static async maybeAsk(context: vscode.ExtensionContext): Promise<void> {
    const count = (context.globalState.get<number>("devdiff.generationCount") || 0) + 1;
    await context.globalState.update("devdiff.generationCount", count);

    const lastAsked = context.globalState.get<number>("devdiff.lastReviewAsk");
    const neverAsk = context.globalState.get<boolean>("devdiff.neverAskReview");

    if (neverAsk) return;

    // Cooldown check
    if (lastAsked && Date.now() - lastAsked < this.COOLDOWN_DAYS * 86400000) return;

    // Milestone check
    if (!this.MILESTONES.includes(count)) return;

    // Wait for idle — don't interrupt
    await this.waitForIdle();

    const result = await vscode.window.showInformationMessage(
      `🎉 ${count} changelogs generated with DevDiff!`,
      { modal: false },
      { title: "⭐ Leave a Review" },
      { title: "💬 Send Feedback" },
      { title: "✖ Dismiss" }
    );

    await context.globalState.update("devdiff.lastReviewAsk", Date.now());

    if (result?.title === "⭐ Leave a Review") {
      await vscode.env.openExternal(
        vscode.Uri.parse(
          "https://marketplace.visualstudio.com/items?itemName=eldrex.devdiff&ssr=false#review-details"
        )
      );
    }

    if (result?.title === "💬 Send Feedback") {
      await vscode.commands.executeCommand("devdiff.sendFeedback");
    }
  }

  private static async waitForIdle(): Promise<void> {
    return new Promise((resolve) => {
      // Wait 10 seconds of no typing before showing
      let idleTimer: NodeJS.Timeout;

      const resetTimer = () => {
        clearTimeout(idleTimer);
        idleTimer = setTimeout(() => {
          disposable.dispose();
          resolve();
        }, 10000);
      };

      const disposable = vscode.window.onDidChangeTextEditorSelection(resetTimer);
      resetTimer();
    });
  }
}
