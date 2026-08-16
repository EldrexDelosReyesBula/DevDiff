import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

describe("DevDiff v1.7.0 — Community Growth & Feedback Engine", () => {
  const rootDir =
    process.cwd().endsWith("packages\\core") ||
    process.cwd().endsWith("packages/core")
      ? path.resolve(process.cwd(), "../..")
      : process.cwd();

  it("verifies README trust banners and feedback callouts exist in core README", () => {
    const readmePath = path.join(rootDir, "packages/core/README.md");
    expect(fs.existsSync(readmePath)).toBe(true);

    const content = fs.readFileSync(readmePath, "utf-8");
    expect(content).toContain("Built for Privacy");
    expect(content).toContain("Love DevDiff?");
    expect(content).toContain("Feedback & Community");
    expect(content).toContain("marketplace.visualstudio.com");
  });

  it("verifies privacy sections and review callouts exist in VS Code extension README", () => {
    const vscodeReadmePath = path.join(rootDir, "packages/vscode/README.md");
    expect(fs.existsSync(vscodeReadmePath)).toBe(true);

    const content = fs.readFileSync(vscodeReadmePath, "utf-8");
    expect(content).toContain("Privacy First");
    expect(content).toContain("Enjoying DevDiff?");
    expect(content).toContain("Questions, Ideas, or Issues?");
  });

  it("verifies GitHub issue templates exist and contain required headers", () => {
    const templatesDir = path.join(rootDir, ".github/ISSUE_TEMPLATE");
    expect(fs.existsSync(templatesDir)).toBe(true);

    const featureReq = fs.readFileSync(
      path.join(templatesDir, "feature_request.md"),
      "utf-8",
    );
    expect(featureReq).toContain("What Would You Like DevDiff to Do?");

    const genFeedback = fs.readFileSync(
      path.join(templatesDir, "general_feedback.md"),
      "utf-8",
    );
    expect(genFeedback).toContain("What's on Your Mind?");

    const bugReport = fs.readFileSync(
      path.join(templatesDir, "bug_report.md"),
      "utf-8",
    );
    expect(bugReport).toContain("What Happened?");
  });
});
