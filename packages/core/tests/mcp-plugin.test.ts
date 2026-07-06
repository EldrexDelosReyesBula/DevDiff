import { describe, it, expect, vi } from "vitest";
import { PluginManager } from "../src/plugins/manager";
import { DevDiffEngine } from "../src/engine";
import { DevDiffPlugin } from "@eldrex/plugin-sdk";

describe("DevDiff Plugin Manager & Engine Extensions", () => {
  it("PluginManager should load and trigger lifecycle hooks", async () => {
    const mockPlugin: DevDiffPlugin = {
      id: "test-mock-plugin",
      name: "Mock Plugin",
      version: "1.0.0",
      description: "A test mock plugin",
      author: { name: "Test" },
      devdiffVersion: ">=1.0.5",
      activate: vi.fn(),
      deactivate: vi.fn(),
      hooks: {
        beforeAnalysis: vi.fn().mockImplementation((diff) => diff),
        afterAnalysis: vi.fn().mockImplementation((changelog) => changelog),
        onError: vi.fn(),
      },
    };

    const manager = new PluginManager(process.cwd());
    // Directly inject mock plugin
    (manager as any).plugins = [mockPlugin];

    const beforeResult = await manager.runBeforeAnalysis({ files: [], changes: [] }, {});
    expect(beforeResult).toBeDefined();
    expect(mockPlugin.hooks?.beforeAnalysis).toHaveBeenCalled();

    const afterResult = await manager.runAfterAnalysis({
      summary: "Test",
      impact: "none",
      breaking: false,
      files: [],
      relatedIssues: [],
      formattedOutput: "Test output",
    });
    expect(afterResult).toBeDefined();
    expect(mockPlugin.hooks?.afterAnalysis).toHaveBeenCalled();

    await manager.runOnError(new Error("Test Error"));
    expect(mockPlugin.hooks?.onError).toHaveBeenCalled();
  });

  it("DevDiffEngine should expose the new status and context methods", async () => {
    const engine = new DevDiffEngine({ workspacePath: process.cwd() });
    
    const status = await engine.getStatus();
    expect(status).toBeDefined();
    expect(status.workspacePath).toBe(process.cwd());
    expect(typeof status.stagedCount).toBe("number");

    const context = await engine.getProjectContext();
    expect(context).toBeDefined();
  });
});
