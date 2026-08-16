import { ExplanationLevel } from "../levels";
import { CodeExplanation, UniversalExplainer } from "./universal";

export class PythonExplainer {
  explain(params: {
    code: string;
    level: ExplanationLevel;
    filePath: string;
  }): CodeExplanation {
    const base = UniversalExplainer.explain({
      code: params.code,
      language: "Python",
      level: params.level,
      filePath: params.filePath,
    });

    if (/def\s+\w+\s*\(.*?\)\s*->/i.test(params.code)) {
      base.sections.push({
        title: "Type Annotations",
        content:
          "Uses Python type hints (`->`, `: int`, `: str`) to document input and return types.",
        importance: "important",
      });
      base.relatedConcepts.push("Python Type Hinting (PEP 484)");
    }

    if (/\[\s*x\s+for\s+x\s+in/i.test(params.code)) {
      base.sections.push({
        title: "List Comprehension",
        content:
          "Uses pythonic list comprehension syntax for concise collection transformation.",
        importance: "important",
      });
    }

    return base;
  }
}
