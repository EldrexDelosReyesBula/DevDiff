import { describe, it, expect } from "vitest";
import { AgentRegistry, OpenClawSupervisorV2 } from "../src/index";
import * as path from "path";

describe("DevDiff v1.7.0 — Agent Orchestration Platform & OpenClaw Supervisor v2", () => {
  const rootDir =
    process.cwd().endsWith("packages\\core") ||
    process.cwd().endsWith("packages/core")
      ? path.resolve(process.cwd(), "../..")
      : process.cwd();

  describe("AgentRegistry", () => {
    it("lists registered agent squad and initial status metrics", () => {
      const directory = AgentRegistry.list();

      expect(directory.total).toBeGreaterThanOrEqual(5);
      expect(directory.active).toBeGreaterThanOrEqual(5);
      const ids = directory.agents.map((a) => a.id);
      expect(ids).toContain("architect");
      expect(ids).toContain("security");
      expect(ids).toContain("performance");
      expect(ids).toContain("docs");
      expect(ids).toContain("qa");
    });

    it("finds best agent and delegates task with automatic capability matching", async () => {
      const result = await AgentRegistry.delegate({
        id: "task-101",
        type: "security_audit",
        requiredCapabilities: ["secret_detection"],
        priority: "high",
        data: { target: "auth module" },
      });

      expect(result.success).toBe(true);
      expect(result.agent).toBe("Security Agent");
      expect(result.confidence).toBeGreaterThanOrEqual(80);
    });

    it("runs multi-agent swarm and builds consensus agreement", async () => {
      const swarmResult = await AgentRegistry.swarm(
        {
          id: "task-102",
          type: "changelog_generation",
          requiredCapabilities: [],
          priority: "high",
          data: { since: "HEAD~3..HEAD" },
        },
        3,
      );

      expect(swarmResult.success).toBe(true);
      expect(swarmResult.swarmSize).toBe(3);
      expect(swarmResult.consensus).toBeDefined();
      expect(swarmResult.consensus?.agreements.length).toBeGreaterThan(0);
      expect(swarmResult.consensus?.confidence).toBeGreaterThanOrEqual(75);
    });

    it("coordinates inter-agent conversation bus messaging", async () => {
      const conversation = await AgentRegistry.converse(
        ["architect", "security"],
        "Token Rate Limiter Strategy",
      );

      expect(conversation.messages.length).toBe(2);
      expect(conversation.consensus).toContain("Consensus reached");
    });
  });

  describe("OpenClawSupervisorV2", () => {
    it("decomposes objectives into subtask execution graphs", () => {
      const supervisor = new OpenClawSupervisorV2(rootDir);

      const securityGraph = supervisor.decomposeTask(
        "Run security vulnerability audit",
      );
      expect(securityGraph.taskId).toBe("security_audit");
      expect(securityGraph.parallelSubtasks.length).toBeGreaterThan(0);

      const changelogGraph = supervisor.decomposeTask(
        "Generate changelog for release",
      );
      expect(changelogGraph.taskId).toBe("changelog_generation");
    });

    it("orchestrates full task execution and applies validation thresholds", async () => {
      const supervisor = new OpenClawSupervisorV2(rootDir);

      const orchestration = await supervisor.orchestrate(
        "Analyze security impact of new OAuth endpoints",
      );

      expect(orchestration.success).toBe(true);
      expect(orchestration.taskId).toBe("security_audit");
      expect(orchestration.validation.approved).toBe(true);
      expect(["auto_approved", "human_review_requested"]).toContain(
        orchestration.validation.action,
      );
    });
  });
});
