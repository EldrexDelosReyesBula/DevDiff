import { describe, it, expect } from "vitest";
import {
  StudyBuddyEngine,
  LanguageDetector,
  CSSExplainer,
  UniversalExplainer,
  StudyBuddyPlugin,
} from "../src/index";

describe("@eldrex/plugin-study-buddy — Universal Study Buddy", () => {
  it("detects languages correctly", () => {
    expect(LanguageDetector.detect("const x = 10;", "app.ts")).toBe("typescript");
    expect(LanguageDetector.detect("def foo(): pass", "script.py")).toBe("python");
    expect(LanguageDetector.detect("body { margin: 0; }", "styles.css")).toBe("css");
    expect(LanguageDetector.detect("fn main() {}", "main.rs")).toBe("rust");
    expect(LanguageDetector.detect("package main", "main.go")).toBe("go");
  });

  it("explains CSS selectors and properties in plain English", () => {
    const cssCode = [
      ".card {",
      "  display: flex;",
      "  margin: 16px;",
      "  padding: 8px;",
      "  background-color: #fff;",
      "}",
    ].join("\n");

    const cssExplainer = new CSSExplainer();
    const explanation = cssExplainer.explain({
      code: cssCode,
      level: "beginner",
      filePath: "components/card.css",
    });

    expect(explanation.language).toBe("CSS");
    expect(explanation.sections.length).toBeGreaterThan(0);
    const layoutSection = explanation.sections.find((s) => s.title === "Layout Strategy");
    expect(layoutSection?.content).toContain("Flexbox");
  });

  it("provides universal fallback explanations for unknown languages", () => {
    const code = [
      "module Sample",
      "  def process_data(input)",
      "    puts input",
      "  end",
      "end",
    ].join("\n");

    const explanation = UniversalExplainer.explain({
      code,
      language: "Ruby",
      level: "student",
      filePath: "sample.rb",
    });

    expect(explanation.language).toBe("Ruby");
    expect(explanation.summary).toBeDefined();
    expect(explanation.sections.length).toBeGreaterThan(0);
  });

  it("dispatches through StudyBuddyEngine cleanly", () => {
    const jsCode = "async function fetchData() { return await fetch('/api'); }";
    const explanation = StudyBuddyEngine.explain({
      code: jsCode,
      level: "senior",
      filePath: "api.ts",
    });

    expect(explanation.language).toBe("TypeScript");
    expect(explanation.level).toBe("senior");
  });

  it("exports a valid DevDiffPlugin manifest", () => {
    expect(StudyBuddyPlugin.id).toBe("@eldrex/plugin-study-buddy");
    expect(StudyBuddyPlugin.commands?.length).toBeGreaterThan(0);
  });
});
