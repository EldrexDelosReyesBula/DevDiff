import { describe, it, expect } from "vitest";
import { SupervisorErrorHandler, AgentFailure } from "../src";

describe("SupervisorErrorHandler", () => {
  const handler = new SupervisorErrorHandler();

  const mockFailure = (msg: string): AgentFailure => ({
    agentId: "test-agent",
    taskId: "task-1",
    error: new Error(msg),
    attempt: 1,
    maxAttempts: 3,
    timestamp: Date.now(),
    context: {
      model: "ollama://qwen2.5-coder:14b",
      prompt: "Explain architecture changes",
      diffSize: 1024,
      tokenEstimate: 5000,
    },
  });

  it("should diagnose context overflow and suggest smaller scope", () => {
    const failure = mockFailure("maximum context length exceeded");
    const strategy = handler.diagnose(failure);

    expect(strategy.type).toBe("smaller_scope");
    expect(strategy.reason).toContain("Context window exceeded");
  });

  it("should diagnose connection refused and suggest fallback model", () => {
    const failure = mockFailure("connect ECONNREFUSED 127.0.0.1:11434");
    const strategy = handler.diagnose(failure);

    expect(strategy.type).toBe("different_model");
    expect(strategy.newModel).toBeDefined();
    expect(strategy.newModel).not.toBe(failure.context.model);
  });

  it("should diagnose output validation failure and retry with stricter prompt", () => {
    const failure = mockFailure(
      "hallucination detected: file not found in diff",
    );
    const strategy = handler.diagnose(failure);

    expect(strategy.type).toBe("same_model_different_prompt");
    expect(strategy.newPrompt).toContain("CRITICAL INSTRUCTIONS");
  });

  it("should execute retries successfully", async () => {
    const failure = mockFailure("timeout");
    const strategy = handler.diagnose(failure);

    const result = await handler.retry(failure, strategy);
    expect(result.success).toBe(true);
    expect(result.confidence).toBeGreaterThan(0);
  });
});
