import { describe, it, expect } from "vitest";
import {
  ProgressiveExplainer,
  DependencyMapper,
  OnboardingGenerator,
} from "../src/index";

describe("DevDiff v1.7.0 — Progressive Explainer", () => {
  it("auto-detects code complexity levels accurately", () => {
    const simpleCode = "const a = 1; const b = 2;";
    expect(ProgressiveExplainer.autoDetectLevel(simpleCode)).toBe("beginner");

    const complexSecurityCode = `
      import { encrypt, hash } from 'crypto';
      export class AuthManager {
        async performanceOptimize() {
          const cache = new Map();
        }
      }
    `;
    expect(ProgressiveExplainer.autoDetectLevel(complexSecurityCode)).toBe(
      "architect",
    );
  });

  it("generates progressive explanations with correct level sections", async () => {
    const code = "function login(user, pass) { return auth(user, pass); }";

    const beginnerResult = await ProgressiveExplainer.explain({
      code,
      filePath: "src/auth.ts",
      level: "beginner",
      projectContext: {},
    });

    expect(beginnerResult.level).toBe("beginner");
    expect(
      beginnerResult.sections.some((s) => s.title === "Line-by-Line Breakdown"),
    ).toBe(true);
    expect(beginnerResult.suggestedNextLevel).toBe("student");

    const architectResult = await ProgressiveExplainer.explain({
      code,
      filePath: "src/auth.ts",
      level: "architect",
      projectContext: {},
    });

    expect(architectResult.level).toBe("architect");
    expect(
      architectResult.sections.some(
        (s) => s.title === "Strategic Recommendations",
      ),
    ).toBe(true);
    expect(
      architectResult.sections.some(
        (s) => s.title === "Performance & Memory Analysis",
      ),
    ).toBe(true);
  });
});

describe("DevDiff v1.7.0 — Visual Dependency Mapping", () => {
  it("generates Mermaid dependency graphs with color-coded node styles", () => {
    const result = DependencyMapper.generateDiagram({
      filePath: "packages/core/src/index.ts",
      projectContext: {},
      depth: 2,
    });

    expect(result.mermaid).toContain("graph TD");
    expect(result.mermaid).toContain("stroke:#6366f1");
    expect(result.summary).toContain("entry-point");
    expect(Array.isArray(result.keyFiles)).toBe(true);
  });
});

describe("DevDiff v1.7.0 — Automated Onboarding Summaries", () => {
  it("generates comprehensive 11-section onboarding guides", async () => {
    const guide = await OnboardingGenerator.generate(process.cwd());

    expect(guide.overview.title).toContain("Project Overview");
    expect(guide.architecture.title).toContain("Architecture");
    expect(guide.keyModules.title).toContain("Key Modules");
    expect(guide.entryPoints.title).toContain("Entry Points");
    expect(guide.dataFlow.title).toContain("Data Flow");
    expect(guide.conventions.title).toContain("Conventions");
    expect(guide.recentChanges.title).toContain("Recent Activity");
    expect(guide.gettingStarted.title).toContain("Getting Started");
    expect(guide.commonTasks.title).toContain("Common Tasks");
    expect(guide.testingGuide.title).toContain("Testing");
    expect(guide.faq.title).toContain("Frequently Asked Questions");
  });
});
