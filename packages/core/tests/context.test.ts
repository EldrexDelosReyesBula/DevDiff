import { describe, it, expect, vi, beforeEach } from "vitest";
import * as fs from "fs/promises";
import * as path from "path";
import { ProjectContextScanner, formatContext } from "../src/context/scanner";
import { injectContextIntoPrompt, validateContextFile } from "../src/context/compiler";
import { verifyExplanation } from "../src/verification/accuracy-check";
import type { AIExplanationResult } from "../src/ai/providers/base";
import type { ParseResult } from "../src/diff/parser";

// ─── ProjectContextScanner Tests ─────────────────────────────────────────────

describe("ProjectContextScanner", () => {
  it("extracts project name from package.json", async () => {
    const tmpDir = path.join(process.cwd(), ".test-scanner-tmp");
    await fs.mkdir(tmpDir, { recursive: true });
    await fs.writeFile(
      path.join(tmpDir, "package.json"),
      JSON.stringify({
        name: "my-test-project",
        description: "A test project for unit tests",
        dependencies: { react: "^18.0.0", vite: "^5.0.0" },
        devDependencies: { vitest: "^2.0.0" },
      }),
    );

    try {
      const scanner = new ProjectContextScanner(tmpDir);
      const ctx = await scanner.scan();

      expect(ctx.projectName).toBe("my-test-project");
      expect(ctx.purpose).toContain("test project");
      expect(ctx.techStack.some((t) => t.includes("React"))).toBe(true);
      expect(ctx.techStack.some((t) => t.includes("Vite"))).toBe(true);
      expect(ctx.techStack.some((t) => t.includes("Vitest"))).toBe(true);
    } finally {
      await fs.rm(tmpDir, { recursive: true, force: true });
    }
  });

  it("detects framework from dependencies", async () => {
    const tmpDir = path.join(process.cwd(), ".test-framework-tmp");
    await fs.mkdir(tmpDir, { recursive: true });
    await fs.writeFile(
      path.join(tmpDir, "package.json"),
      JSON.stringify({
        name: "express-api",
        dependencies: { express: "^4.18.0", prisma: "^5.0.0" },
      }),
    );

    try {
      const scanner = new ProjectContextScanner(tmpDir);
      const ctx = await scanner.scan();

      expect(ctx.techStack.some((t) => t.toLowerCase().includes("express"))).toBe(true);
      expect(ctx.techStack.some((t) => t.toLowerCase().includes("prisma"))).toBe(true);
    } finally {
      await fs.rm(tmpDir, { recursive: true, force: true });
    }
  });

  it("maps known directories to descriptions", async () => {
    const tmpDir = path.join(process.cwd(), ".test-dirs-tmp");
    await fs.mkdir(path.join(tmpDir, "src"), { recursive: true });
    await fs.mkdir(path.join(tmpDir, "services"), { recursive: true });
    await fs.mkdir(path.join(tmpDir, "api"), { recursive: true });
    await fs.writeFile(path.join(tmpDir, "package.json"), JSON.stringify({ name: "test" }));

    try {
      const scanner = new ProjectContextScanner(tmpDir);
      const ctx = await scanner.scan();

      const archPaths = ctx.architecture.map((a) => a.path);
      expect(archPaths).toContain("src/");
      expect(archPaths).toContain("services/");
    } finally {
      await fs.rm(tmpDir, { recursive: true, force: true });
    }
  });

  it("detects entry points", async () => {
    const tmpDir = path.join(process.cwd(), ".test-entry-tmp");
    const srcDir = path.join(tmpDir, "src");
    await fs.mkdir(srcDir, { recursive: true });
    await fs.writeFile(path.join(tmpDir, "package.json"), JSON.stringify({ name: "test" }));
    await fs.writeFile(path.join(srcDir, "index.ts"), "export {}");

    try {
      const scanner = new ProjectContextScanner(tmpDir);
      const ctx = await scanner.scan();

      expect(ctx.entryPoints.some((ep) => ep.includes("index.ts"))).toBe(true);
    } finally {
      await fs.rm(tmpDir, { recursive: true, force: true });
    }
  });
});

// ─── formatContext Tests ──────────────────────────────────────────────────────

describe("formatContext", () => {
  it("produces valid markdown with all sections", () => {
    const ctx = {
      projectName: "PapyrusJS",
      purpose: "A lightweight reactive UI framework",
      techStack: ["TypeScript/JavaScript", "Vitest (testing)", "Turborepo (monorepo)"],
      architecture: [
        { path: "packages/", description: "monorepo packages" },
        { path: "src/", description: "main source code" },
      ],
      entryPoints: ["src/index.ts"],
      keyConcepts: [],
    };

    const markdown = formatContext(ctx);

    expect(markdown).toContain("# Project: PapyrusJS");
    expect(markdown).toContain("## Purpose");
    expect(markdown).toContain("lightweight reactive UI framework");
    expect(markdown).toContain("## Tech Stack");
    expect(markdown).toContain("TypeScript/JavaScript");
    expect(markdown).toContain("## Architecture");
    expect(markdown).toContain("`packages/`");
    expect(markdown).toContain("## Entry Points");
    expect(markdown).toContain("src/index.ts");
    expect(markdown).toContain("## Custom Notes");
  });
});

// ─── injectContextIntoPrompt Tests ───────────────────────────────────────────

describe("injectContextIntoPrompt", () => {
  it("prepends context block to system prompt", () => {
    const system = "You are DevDiff.";
    const context = "Project: TestApp\nPurpose: A test.";

    const result = injectContextIntoPrompt(system, context);

    expect(result).toContain("You are DevDiff.");
    expect(result).toContain("PROJECT KNOWLEDGE BASE");
    expect(result).toContain("Project: TestApp");
    expect(result).toContain("END PROJECT KNOWLEDGE BASE");
    // System prompt comes first
    expect(result.indexOf("You are DevDiff")).toBeLessThan(result.indexOf("PROJECT KNOWLEDGE BASE"));
  });
});

// ─── verifyExplanation Tests ──────────────────────────────────────────────────

function makeExplanation(overrides: Partial<AIExplanationResult> = {}): AIExplanationResult {
  return {
    summary: "Updated the authentication module.",
    impact: "minor",
    breaking: false,
    files: [],
    relatedIssues: [],
    ...overrides,
  };
}

function makeParsedDiff(filePaths: string[], content = ""): ParseResult {
  return {
    files: filePaths.map((p) => ({
      oldPath: p,
      newPath: p,
      isNew: false,
      isDeleted: false,
      isRenamed: false,
      hunks: content
        ? [
            {
              header: "@@ -1,1 +1,2 @@",
              lines: [{ type: "add" as const, content, lineNumber: 1 }],
            },
          ]
        : [],
    })),
    changes: [],
  } as unknown as ParseResult;
}

describe("verifyExplanation", () => {
  it("returns valid=true for a matching explanation", () => {
    const explanation = makeExplanation({
      files: [{ path: "src/auth.ts", explanation: "Updated JWT handling" }],
    });
    const diff = makeParsedDiff(["src/auth.ts"]);
    const result = verifyExplanation(explanation, diff);

    expect(result.valid).toBe(true);
    expect(result.issues.filter((i) => i.severity === "warning")).toHaveLength(0);
  });

  it("flags file references not in diff", () => {
    const explanation = makeExplanation({
      files: [{ path: "src/missing-file.ts", explanation: "Updated something" }],
    });
    const diff = makeParsedDiff(["src/auth.ts"]);
    const result = verifyExplanation(explanation, diff);

    expect(result.valid).toBe(false);
    expect(result.issues.some((i) => i.type === "file-not-in-diff")).toBe(true);
    expect(result.issues.some((i) => i.message.includes("missing-file.ts"))).toBe(true);
  });

  it("allows basename matching for file paths", () => {
    const explanation = makeExplanation({
      files: [{ path: "auth.ts", explanation: "Updated auth" }],
    });
    // Diff has full path — basename should match
    const diff = makeParsedDiff(["src/modules/auth.ts"]);
    const result = verifyExplanation(explanation, diff);

    expect(result.valid).toBe(true);
  });

  it("returns confidence < 1 when warnings are present", () => {
    const explanation = makeExplanation({
      files: [{ path: "nonexistent.ts", explanation: "..." }],
    });
    const diff = makeParsedDiff(["src/real.ts"]);
    const result = verifyExplanation(explanation, diff);

    expect(result.confidence).toBeLessThan(1.0);
  });

  it("returns confidence=1 for a clean explanation with no diff files to check against", () => {
    const explanation = makeExplanation({
      summary: "Minor refactor.",
      files: [],
    });
    const diff = makeParsedDiff([]);
    const result = verifyExplanation(explanation, diff);

    expect(result.confidence).toBe(1.0);
    expect(result.valid).toBe(true);
  });

  it("does not flag identifiers as errors — only as info", () => {
    const explanation = makeExplanation({
      summary: "Updated the handleTokenRefresh function in the auth layer.",
    });
    const diff = makeParsedDiff(["src/auth.ts"], "// some diff content without handleTokenRefresh");
    const result = verifyExplanation(explanation, diff);

    // Identifier mismatches are info-level, not warning-level
    const warningIssues = result.issues.filter((i) => i.severity === "warning");
    expect(warningIssues).toHaveLength(0);
    // valid should still be true (warnings only degrade confidence)
    expect(result.valid).toBe(true);
  });
});

// ─── validateContextFile Tests ────────────────────────────────────────────────

describe("validateContextFile", () => {
  it("reports non-existent file correctly", async () => {
    const report = await validateContextFile("/non/existent/path");
    expect(report.exists).toBe(false);
    expect(report.secrets).toHaveLength(0);
  });

  it("detects secrets in context file", async () => {
    const tmpDir = path.join(process.cwd(), ".test-validate-tmp");
    const devdiffDir = path.join(tmpDir, ".devdiff");
    await fs.mkdir(devdiffDir, { recursive: true });
    await fs.writeFile(
      path.join(devdiffDir, "context.md"),
      "# Project: Test\nAPI key: sk-abc123def456ghi789jkl012mno345p",
    );

    try {
      const report = await validateContextFile(tmpDir);
      expect(report.exists).toBe(true);
      expect(report.secrets.length).toBeGreaterThan(0);
    } finally {
      await fs.rm(tmpDir, { recursive: true, force: true });
    }
  });
});
