import { describe, it, expect } from "vitest";
import { DevDiffDevTools, DevDiffPlugin } from "../src/index";

describe("DevDiff Foundations DevTools", () => {
  it("generates realistic mock diffs", () => {
    const diff = DevDiffDevTools.mockDiff({
      filesCount: 3,
      additionsPerFile: 4,
      deletionsPerFile: 2,
    });

    expect(diff.files.length).toBe(3);
    expect(diff.totalAdditions).toBe(12);
    expect(diff.totalDeletions).toBe(6);
    expect(diff.files[0].hunks.length).toBeGreaterThan(0);
    expect(diff.changes.length).toBe(18);
  });

  it("generates mock project context", () => {
    const context = DevDiffDevTools.mockContext({
      projectName: "my-test-app",
      languages: ["TypeScript", "Rust"],
    });

    expect(context.files.length).toBeGreaterThan(0);
    expect(context.languages).toContain("Rust");
    expect(context.raw).toContain("my-test-app");
  });

  it("validates valid and invalid plugins", () => {
    const validPlugin: DevDiffPlugin = {
      id: "test-plugin",
      name: "Test Plugin",
      version: "1.0.0",
      description: "A test plugin",
      author: { name: "Dev" },
      devdiffVersion: "^1.7.0",
      hooks: {
        beforeAnalysis: async (d) => d,
      },
    };

    const resValid = DevDiffDevTools.validatePlugin(validPlugin);
    expect(resValid.valid).toBe(true);
    expect(resValid.errors.length).toBe(0);

    const invalidPlugin: any = {
      name: "Missing ID",
    };
    const resInvalid = DevDiffDevTools.validatePlugin(invalidPlugin);
    expect(resInvalid.valid).toBe(false);
    expect(resInvalid.errors.length).toBeGreaterThan(0);
  });

  it("runs plugin in test harness and captures transformations", async () => {
    const plugin: DevDiffPlugin = {
      id: "filter-plugin",
      name: "Filter Plugin",
      version: "1.0.0",
      description: "Filters test files",
      author: { name: "Dev" },
      devdiffVersion: "^1.7.0",
      hooks: {
        beforeAnalysis: async (diff) => {
          return {
            ...diff,
            files: diff.files.filter((f) => !f.path?.includes("test")),
          };
        },
      },
    };

    const harness = DevDiffDevTools.createTestHarness(plugin);
    await harness.activate();

    const sampleDiff = DevDiffDevTools.mockDiff({
      filePaths: ["src/app.ts", "tests/app.test.ts"],
    });

    const transformed = await harness.runBeforeAnalysis(sampleDiff);
    expect(transformed.files.length).toBe(1);
    expect(transformed.files[0].path).toBe("src/app.ts");

    await harness.deactivate();
  });

  it("benchmarks plugin execution performance", async () => {
    const plugin: DevDiffPlugin = {
      id: "bench-plugin",
      name: "Benchmark Plugin",
      version: "1.0.0",
      description: "Fast transformer",
      author: { name: "Dev" },
      devdiffVersion: "^1.7.0",
      hooks: {
        afterAnalysis: async (changelog) => {
          return {
            ...changelog,
            summary: changelog.summary + "\n\n[Verified by plugin]",
          };
        },
      },
    };

    const result = await DevDiffDevTools.benchmarkPlugin(plugin, {
      iterations: 10,
    });
    expect(result.iterations).toBe(10);
    expect(result.averageDurationMs).toBeGreaterThanOrEqual(0);
    expect(result.pluginId).toBe("bench-plugin");
  });
});
