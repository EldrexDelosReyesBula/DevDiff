import { describe, it, expect } from "vitest";
import {
  CompletenessValidator,
  OptimizedPrompts,
  TOKEN_BUDGETS,
  OutputQualityGate,
  NeverPushIncomplete,
  IncompleteOutputError,
} from "../src/index";

describe("DevDiff v1.7.0 — Completeness Validator", () => {
  it("detects output cut-off mid-sentence", () => {
    const cutOffText =
      "The tests cover various aspects of the library, including its initializ";
    const result = CompletenessValidator.validate(cutOffText);

    expect(result.complete).toBe(false);
    expect(result.issues).toContain("Output appears cut off mid-sentence");
    expect(result.quality).toBe("unusable");
  });

  it("detects output containing only intro without substance", () => {
    const introOnlyText =
      "The provided code snippet is a TypeScript configuration file for the tsup build tool. This configuration defines how to bundle and package a JavaScript/TypeScript project.";
    const result = CompletenessValidator.validate(introOnlyText);

    expect(result.issues).toContain(
      "Output contains only introduction, no substantive content",
    );
  });

  it("validates complete, well-formed markdown output", () => {
    const completeOutput = [
      "## Added Features",
      "- Integrated CompletenessValidator to reject cut-off AI output.",
      "- Enforced strict token budgets across all prompt generators.",
      "- Added NeverPushIncomplete guard to block incomplete git commits.",
    ].join("\n");

    const result = CompletenessValidator.validate(completeOutput);
    expect(result.complete).toBe(true);
    expect(result.quality).toBe("good");
  });
});

describe("DevDiff v1.7.0 — Token-Optimized Prompts", () => {
  it("compacts diffs and applies token budget bounds", () => {
    const diff = {
      projectName: "DevDiff",
      primaryLanguage: "TypeScript",
      files: [
        {
          path: "src/auth.ts",
          status: "modified" as const,
          additions: 10,
          deletions: 2,
          diffSnippet: "+ const user = auth();\n- const user = null;",
        },
      ],
      totalAdditions: 10,
      totalDeletions: 2,
    };

    const prompt = OptimizedPrompts.changelog(diff, "developer");
    expect(prompt).toContain("Project: DevDiff (TypeScript)");
    expect(prompt).toContain("M src/auth.ts (+10 -2)");
    expect(TOKEN_BUDGETS.changelog.maxPromptTokens).toBe(3000);
  });
});

describe("DevDiff v1.7.0 — Output Quality Gate", () => {
  it("removes defensive headers and AI hedging language", async () => {
    const raw = [
      "### --- DevDiff AI Changelog Explanation ---",
      "### The section below contains AI-generated details.",
      "## 2026-08-15",
      "- This change appears to refactor authentication logic.",
    ].join("\n");

    const result = await OutputQualityGate.process(raw);
    expect(result.accepted).toBe(true);
    expect(result.output).not.toContain("AI-generated details");
    expect(result.output).not.toContain("appears to");
  });

  it("detects hallucinated file paths in output", () => {
    const text = "Updated `src/nonexistent-file.ts` with new methods.";
    const diff = {
      files: [{ path: "src/auth.ts", status: "modified" as const }],
    };

    const check = OutputQualityGate.checkHallucinations(text, diff);
    expect(check.findings.length).toBeGreaterThan(0);
    expect(check.findings[0]).toContain("nonexistent-file.ts");
  });
});

describe("DevDiff v1.7.0 — Never Push Incomplete Guard", () => {
  it("blocks git operations when output is incomplete", async () => {
    const incompleteOutput = "The code initializ";

    await expect(
      NeverPushIncomplete.guard(incompleteOutput, "push"),
    ).rejects.toThrow(IncompleteOutputError);
  });

  it("allows git operations when output is complete", async () => {
    const completeOutput =
      "## Changelog\n- Added output quality gate.\n- Verified balanced markdown.";
    await expect(
      NeverPushIncomplete.guard(completeOutput, "commit"),
    ).resolves.not.toThrow();
  });
});
