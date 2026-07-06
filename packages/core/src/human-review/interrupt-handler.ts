import * as readline from "readline";

/**
 * Human-in-the-Loop System
 *
 * Allows developers to:
 * 1. Interrupt AI processing at any time
 * 2. Review AI outputs before they're finalized
 * 3. Approve, reject, or modify AI-generated content
 * 4. Request human review when AI confidence is low
 */

export interface ReviewRequest {
  id: string;
  type:
    | "changelog"
    | "security_finding"
    | "architecture_decision"
    | "compliance_issue";
  priority: "low" | "medium" | "high" | "critical";
  aiConfidence: number; // 0-100
  aiOutput: string;
  aiReasoning: string;
  alternatives?: string[]; // Other options the AI considered
  evidence: string[]; // What the AI based this on
  createdAt: string;
  timeout: number; // Seconds until auto-approve (if configured)
}

export interface ReviewDecision {
  action: "approve" | "reject" | "modify" | "delegate";
  modifiedOutput?: string;
  reason?: string;
  reviewer: "human" | "auto";
}

export interface ReviewStats {
  total: number;
  approved: number;
  rejected: number;
  modified: number;
  delegated: number;
  humanReviewed: number;
  autoHandled: number;
  approvalRate: string;
}

export class HumanReviewSystem {
  private pendingReviews: Map<string, ReviewRequest> = new Map();
  private reviewHistory: ReviewDecision[] = [];

  /**
   * Request human review when AI confidence is below threshold
   */
  async requestReview(request: ReviewRequest): Promise<ReviewDecision> {
    this.pendingReviews.set(request.id, request);

    // Log the review request
    console.log("");
    console.log("┌─────────────────────────────────────────────┐");
    console.log("│  👤 HUMAN REVIEW REQUESTED                   │");
    console.log("├─────────────────────────────────────────────┤");
    console.log(`│  Type: ${request.type.padEnd(40)}│`);
    console.log(`│  Confidence: ${String(request.aiConfidence).padEnd(35)}│`);
    console.log(`│  Priority: ${request.priority.toUpperCase().padEnd(35)}│`);
    console.log("├─────────────────────────────────────────────┤");
    console.log(`│  AI Output:                                  │`);
    const lines = request.aiOutput.split("\n").slice(0, 5);
    for (const line of lines) {
      console.log(`│  ${line.slice(0, 42).padEnd(42)}│`);
    }
    if (request.aiOutput.split("\n").length > 5) {
      console.log(
        `│  ... ${request.aiOutput.split("\n").length - 5} more lines                 │`,
      );
    }
    console.log("├─────────────────────────────────────────────┤");
    console.log(`│  Evidence:                                   │`);
    for (const evidence of request.evidence.slice(0, 3)) {
      console.log(`│  • ${evidence.slice(0, 40).padEnd(40)}│`);
    }
    console.log("└─────────────────────────────────────────────┘");
    console.log("");
    console.log("  Options:");
    console.log("  [A] Approve — Accept AI output as-is");
    console.log(
      "  [R] Reject  — Discard AI output, retry with different approach",
    );
    console.log("  [M] Modify  — Edit the AI output");
    console.log("  [D] Delegate — Send to another AI agent");
    console.log("");

    // In CLI mode, wait for human input
    if (process.stdin.isTTY) {
      const decision = await this.waitForHumanDecision();
      this.reviewHistory.push(decision);
      this.pendingReviews.delete(request.id);
      return decision;
    }

    // In non-interactive mode (CI, agentic), auto-handle based on rules
    const decision = this.autoHandle(request);
    this.reviewHistory.push(decision);
    this.pendingReviews.delete(request.id);
    return decision;
  }

  /**
   * Wait for human input
   */
  private async waitForHumanDecision(): Promise<ReviewDecision> {
    return new Promise((resolve) => {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      rl.question("  Your decision [A/R/M/D]: ", (answer) => {
        rl.close();

        switch (answer.toUpperCase()) {
          case "A":
            resolve({
              action: "approve",
              reviewer: "human",
              reason: "Human approved",
            });
            break;
          case "R":
            resolve({
              action: "reject",
              reviewer: "human",
              reason: "Human rejected — will retry with different approach",
            });
            break;
          case "M":
            rl.question("  Modified output: ", (modified) => {
              resolve({
                action: "modify",
                modifiedOutput: modified,
                reviewer: "human",
                reason: "Human modified the output",
              });
            });
            break;
          case "D":
            rl.question(
              "  Delegate to which agent? [architect/security/performance/docs]: ",
              (agent) => {
                resolve({
                  action: "delegate",
                  reviewer: "human",
                  reason: `Human delegated to ${agent} agent`,
                });
              },
            );
            break;
          default:
            console.log("  Invalid choice. Defaulting to APPROVE.");
            resolve({
              action: "approve",
              reviewer: "auto",
              reason: "Default — invalid input",
            });
        }
      });
    });
  }

  /**
   * Auto-handle reviews in non-interactive mode
   */
  private autoHandle(request: ReviewRequest): ReviewDecision {
    if (request.priority === "critical") {
      return {
        action: "reject",
        reviewer: "auto",
        reason:
          "Critical priority requires human review — auto-rejected for safety",
      };
    }

    if (request.priority === "high" && request.aiConfidence < 50) {
      return {
        action: "reject",
        reviewer: "auto",
        reason: "High priority with low confidence — auto-rejected for retry",
      };
    }

    if (request.priority === "low" && request.aiConfidence > 60) {
      return {
        action: "approve",
        reviewer: "auto",
        reason: "Low priority with acceptable confidence — auto-approved",
      };
    }

    return {
      action: "delegate",
      reviewer: "auto",
      reason: "Non-interactive mode — auto-delegating to alternative agent",
    };
  }

  /**
   * Get review statistics
   */
  getReviewStats(): ReviewStats {
    const total = this.reviewHistory.length;
    const approved = this.reviewHistory.filter(
      (r) => r.action === "approve",
    ).length;
    const rejected = this.reviewHistory.filter(
      (r) => r.action === "reject",
    ).length;
    const modified = this.reviewHistory.filter(
      (r) => r.action === "modify",
    ).length;
    const delegated = this.reviewHistory.filter(
      (r) => r.action === "delegate",
    ).length;
    const humanReviewed = this.reviewHistory.filter(
      (r) => r.reviewer === "human",
    ).length;

    return {
      total,
      approved,
      rejected,
      modified,
      delegated,
      humanReviewed,
      autoHandled: total - humanReviewed,
      approvalRate:
        total > 0 ? ((approved / total) * 100).toFixed(1) + "%" : "N/A",
    };
  }
}
