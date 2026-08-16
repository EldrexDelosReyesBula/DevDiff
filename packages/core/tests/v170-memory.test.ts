import { describe, it, expect } from "vitest";
import { MemoryManager, TimeAwareGenerator, TimeReference } from "../src/index";
import * as path from "path";

describe("DevDiff v1.7.0 — Memory Control & Timeline Management", () => {
  const rootDir =
    process.cwd().endsWith("packages\\core") ||
    process.cwd().endsWith("packages/core")
      ? path.resolve(process.cwd(), "../..")
      : process.cwd();

  it("lists snapshots and categories safely", async () => {
    const snapshots = await MemoryManager.listSnapshots(rootDir);
    expect(Array.isArray(snapshots)).toBe(true);

    const categories = await MemoryManager.listCategories(rootDir);
    expect(Array.isArray(categories)).toBe(true);
  });

  it("preforms dry-run memory range deletion preview", async () => {
    const result = await MemoryManager.deleteRange({
      from: "2026-01-01",
      to: "2026-12-31",
      workspacePath: rootDir,
      dryRun: true,
    });

    expect(result.action).toBe("dry-run");
    expect(typeof result.snapshotsToDelete).toBe("number");
    expect(typeof result.snapshotsToKeep).toBe("number");
  }, 30000);

  it("resolves human time references to git range strings", () => {
    const todayRef: TimeReference = { type: "today" };
    const todayRange = TimeAwareGenerator.resolveTimeReference(
      todayRef,
      rootDir,
    );
    expect(todayRange).toContain("--since=");

    const yesterdayRef: TimeReference = { type: "yesterday" };
    const yesterdayRange = TimeAwareGenerator.resolveTimeReference(
      yesterdayRef,
      rootDir,
    );
    expect(yesterdayRange).toContain("--since=");
    expect(yesterdayRange).toContain("--until=");

    const betweenRef: TimeReference = {
      type: "between-commits",
      fromCommit: "abc1234",
      toCommit: "def5678",
    };
    const betweenRange = TimeAwareGenerator.resolveTimeReference(
      betweenRef,
      rootDir,
    );
    expect(betweenRange).toBe("abc1234..def5678");

    const dateRangeRef: TimeReference = {
      type: "date-range",
      from: "2026-08-01",
      to: "2026-08-10",
    };
    const dateRange = TimeAwareGenerator.resolveTimeReference(
      dateRangeRef,
      rootDir,
    );
    expect(dateRange).toContain("--since=");
    expect(dateRange).toContain("--until=");
  });

  it("performs storage optimization and byte formatting", async () => {
    const result = await MemoryManager.optimize(rootDir);
    expect(result.beforeSize).toBeGreaterThanOrEqual(0);
    expect(result.afterSize).toBeGreaterThanOrEqual(0);
    expect(MemoryManager.formatBytes(2048)).toBe("2.0KB");
  });
});
