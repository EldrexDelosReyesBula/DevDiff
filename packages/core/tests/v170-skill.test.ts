import { describe, it, expect } from "vitest";
import { SkillLoader } from "../src/index";
import * as path from "path";
import * as fs from "fs";

describe("DevDiff v1.7.0 — SKILL.md Universal Agent Standard", () => {
  const rootDir = process.cwd().endsWith("packages\\core") || process.cwd().endsWith("packages/core")
    ? path.resolve(process.cwd(), "../..")
    : process.cwd();

  it("parses SKILL.md into structured sections and preference objects", () => {
    const sampleMarkdown = [
      "# SKILL.md — Project Knowledge Base",
      "## 1. Project Identity",
      "### What This Project Does",
      "Task management app.",
      "## 4. Changelog Preferences",
      "Group changes by: **Added**, **Changed**, **Fixed**",
      "- MUST include file paths in backticks",
      "## 6. Anti-Patterns — What Agents MUST NOT Suggest",
      "1. ❌ Never suggest storing API keys in source code",
      "## 7. Agent Permissions",
      "- ✅ Read any file in the project",
      "- ⚠️ Modifying configuration files",
    ].join("\n");

    const parsed = SkillLoader.parse(sampleMarkdown);
    expect(parsed.sections.length).toBeGreaterThan(0);
    expect(parsed.antiPatterns).toContain("1. ❌ Never suggest storing API keys in source code");
    expect(parsed.permissions?.allowed).toContain("- ✅ Read any file in the project");
    expect(parsed.permissions?.requiresPermission).toContain("- ⚠️ Modifying configuration files");
  });

  it("auto-generates standard 8-section SKILL.md for a workspace", () => {
    const generated = SkillLoader.generate(rootDir);

    expect(generated).toContain("# SKILL.md — Project Knowledge Base");
    expect(generated).toContain("## 1. Project Identity");
    expect(generated).toContain("## 2. Architecture");
    expect(generated).toContain("## 3. Naming Conventions");
    expect(generated).toContain("## 4. Changelog Preferences");
    expect(generated).toContain("## 6. Anti-Patterns");
    expect(generated).toContain("## 7. Agent Permissions");
  });

  it("validates SKILL.md document structure and required headers", () => {
    const validMarkdown = [
      "# SKILL.md — Project Knowledge Base",
      "## 1. Project Identity",
      "## 2. Architecture",
      "## 3. Naming Conventions",
      "## 4. Changelog Preferences",
    ].join("\n");

    const validation = SkillLoader.validate(validMarkdown);
    expect(validation.valid).toBe(true);

    const invalidMarkdown = "Just some text without headers";
    const invalidResult = SkillLoader.validate(invalidMarkdown);
    expect(invalidResult.valid).toBe(false);
    expect(invalidResult.errors.length).toBeGreaterThan(0);
  });
});
