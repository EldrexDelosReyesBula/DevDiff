import * as vscode from "vscode";

export function registerFeedbackCommands(context: vscode.ExtensionContext): void {
  // ── Send Feedback / Report Issue ──
  context.subscriptions.push(
    vscode.commands.registerCommand("devdiff.sendFeedback", async () => {
      const choice = await vscode.window.showQuickPick(
        [
          {
            label: "$(star) Leave a Review",
            description: "Takes 30 seconds — helps other developers find DevDiff",
            action: "review",
          },
          {
            label: "$(lightbulb) Suggest a Feature",
            description: "Open a feature request on GitHub",
            action: "feature",
          },
          {
            label: "$(bug) Report a Bug",
            description: "Open a bug report on GitHub",
            action: "bug",
          },
          {
            label: "$(comment-discussion) Ask a Question",
            description: "Start a discussion on GitHub",
            action: "discussion",
          },
          {
            label: "$(heart) Just Say Thanks",
            description: "Send a quick thank you to the team",
            action: "thanks",
          },
        ],
        {
          placeHolder: "What would you like to do?",
          title: "DevDiff Feedback",
        }
      );

      if (!choice) return;

      switch (choice.action) {
        case "review":
          await vscode.env.openExternal(
            vscode.Uri.parse(
              "https://marketplace.visualstudio.com/items?itemName=eldrex.devdiff&ssr=false#review-details"
            )
          );
          break;

        case "feature":
          await vscode.env.openExternal(
            vscode.Uri.parse(
              "https://github.com/EldrexDelosReyesBula/devdiff/issues/new?template=feature_request.md"
            )
          );
          break;

        case "bug":
          await vscode.env.openExternal(
            vscode.Uri.parse(
              "https://github.com/EldrexDelosReyesBula/devdiff/issues/new?template=bug_report.md"
            )
          );
          break;

        case "discussion":
          await vscode.env.openExternal(
            vscode.Uri.parse(
              "https://github.com/EldrexDelosReyesBula/devdiff/discussions/new/choose"
            )
          );
          break;

        case "thanks":
          await vscode.env.openExternal(
            vscode.Uri.parse(
              "https://github.com/EldrexDelosReyesBula/devdiff/discussions/new?category=general"
            )
          );
          break;
      }
    })
  );

  // ── Periodic gentle review reminder (non-intrusive) ──
  context.subscriptions.push(
    vscode.commands.registerCommand("devdiff.maybeAskForReview", async () => {
      // Only ask after 10+ successful changelog generations
      const generationCount = context.globalState.get<number>("devdiff.generationCount") || 0;
      const hasAskedRecently = context.globalState.get<boolean>("devdiff.askedReviewRecently");

      if (generationCount >= 10 && !hasAskedRecently) {
        // Wait 5 seconds after last generation (don't interrupt workflow)
        setTimeout(async () => {
          const result = await vscode.window.showInformationMessage(
            "🎉 You've generated 10 changelogs with DevDiff! Would you like to leave a review?",
            { modal: false },
            "Leave Review",
            "Maybe Later",
            "Don't Ask Again"
          );

          if (result === "Leave Review") {
            await vscode.env.openExternal(
              vscode.Uri.parse(
                "https://marketplace.visualstudio.com/items?itemName=eldrex.devdiff&ssr=false#review-details"
              )
            );
            await context.globalState.update("devdiff.askedReviewRecently", true);
          }

          if (result === "Don't Ask Again") {
            await context.globalState.update("devdiff.askedReviewRecently", true);
          }
        }, 5000);
      }
    })
  );
}
