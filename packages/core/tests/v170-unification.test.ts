import { describe, it, expect } from "vitest";
import {
  UnifiedContext,
  ContextMemorySync,
  HallucinationGuard,
  UnifiedKnowledge,
} from "../src/index";
import * as path from "path";

describe("DevDiff v1.7.0 — Context, SKILL.md & Memory Unification", () => {
  const rootDir = process.cwd().endsWith("packages\\core") || process.cwd().endsWith("packages/core")
    ? path.resolve(process.cwd(), "../..")
    : process.cwd();

  it("loads UnifiedContext using SKILL.md priority", async () => {
    const knowledge = await UnifiedContext.load(rootDir);
    expect(knowledge).toBeDefined();
    expect(knowledge.project.name).toBeDefined();
  });

  it("synchronizes memory with SKILL.md changes", async () => {
    const syncResult = await ContextMemorySync.synchronize(rootDir);
    expect(syncResult).toBeDefined();
    expect(typeof syncResult.synchronized).toBe("boolean");
  });

  it("verifies AI outputs with HallucinationGuard against anti-patterns and file diffs", async () => {
    const knowledge: UnifiedKnowledge = {
      source: "SKILL.md",
      project: {
        name: "DevDiff",
        purpose: "Changelog AI",
        techStack: ["TypeScript"],
        primaryLanguage: "TypeScript",
      },
      preferences: {
        antiPatterns: ["Never suggest storing API keys in source code"],
      },
      lastUpdated: new Date().toISOString(),
    };

    const diff = {
      files: [{ path: "src/index.ts", status: "modified" as const }],
    };

    const outputWithAntiPattern = [
      "## 2026-08-15",
      "- Added feature in `src/index.ts`",
      "- Suggest storing API keys in source code for easy access",
    ].join("\n");

    const result = HallucinationGuard.verify(outputWithAntiPattern, diff, knowledge);
    expect(result.issues.length).toBeGreaterThan(0);
    const antiPatternIssue = result.issues.find((i) => i.type === "anti-pattern-violation");
    expect(antiPatternIssue).toBeDefined();
  });
});
