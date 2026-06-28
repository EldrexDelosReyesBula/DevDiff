import { describe, it, expect } from "vitest";
import { MultiAgentOrchestrator } from "../src/agents/orchestrator";

describe("MultiAgentOrchestrator", () => {
  it("initializes and runs agent swarm analysis", async () => {
    const orchestrator = new MultiAgentOrchestrator();
    await orchestrator.initialize();

    const diff = {
      files: [{ path: "test.ts" }]
    };

    const analysis = await orchestrator.analyze(diff);
    expect(analysis.consensus.findings.length).toBeGreaterThan(0);
    expect(analysis.analyses.length).toBe(4); // architect, security, performance, docs
    expect(analysis.report).toContain("Collaborative Swarm Analysis Report");
  });
});
