import { describe, it, expect, vi } from "vitest";
import { DependencyManager, HumanReviewSystem, ReviewRequest } from "../src";

describe("DependencyManager & HumanReviewSystem", () => {
  it("DependencyManager should detect package manager and check dependency status", async () => {
    const manager = new DependencyManager();
    const pm = manager.detectPackageManager();
    expect(pm).toBeDefined();
    expect(["npm", "pnpm", "yarn", "bun"]).toContain(pm);

    const installResult = await manager.installDependencies({
      skipOptional: true,
    });
    expect(installResult).toBeDefined();
    expect(typeof installResult.success).toBe("boolean");
  }, 30000);

  it("HumanReviewSystem should handle auto-review and keep statistics", async () => {
    const system = new HumanReviewSystem();

    const lowConfidenceRequest: ReviewRequest = {
      id: "req-1",
      type: "changelog",
      priority: "low",
      aiConfidence: 75,
      aiOutput: "Low confidence AI summary of changes",
      aiReasoning: "Some files are unfamiliar",
      evidence: ["README.md"],
      createdAt: new Date().toISOString(),
      timeout: 30,
    };

    const decision = await system.requestReview(lowConfidenceRequest);
    expect(decision.action).toBe("approve");
    expect(decision.reviewer).toBe("auto");

    const criticalRequest: ReviewRequest = {
      id: "req-2",
      type: "security_finding",
      priority: "critical",
      aiConfidence: 45,
      aiOutput: "Found critical CVE vulnerability in database driver",
      aiReasoning: "Pattern matching",
      evidence: ["package.json"],
      createdAt: new Date().toISOString(),
      timeout: 30,
    };

    const criticalDecision = await system.requestReview(criticalRequest);
    expect(criticalDecision.action).toBe("reject");

    const stats = system.getReviewStats();
    expect(stats.total).toBe(2);
    expect(stats.approved).toBe(1);
    expect(stats.rejected).toBe(1);
  });
});
