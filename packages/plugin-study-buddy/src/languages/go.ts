import { ExplanationLevel } from "../levels";
import { CodeExplanation, UniversalExplainer } from "./universal";

export class GoExplainer {
  explain(params: {
    code: string;
    level: ExplanationLevel;
    filePath: string;
  }): CodeExplanation {
    const base = UniversalExplainer.explain({
      code: params.code,
      language: "Go",
      level: params.level,
      filePath: params.filePath,
    });

    if (/go\s+\w+\(|chan\s+/i.test(params.code)) {
      base.sections.push({
        title: "Goroutines & Channels",
        content:
          "Uses Go lightweight goroutines (`go fn()`) and channels (`chan`) for CSP concurrency.",
        importance: "essential",
      });
      base.relatedConcepts.push(
        "Goroutines",
        "Channels & Select",
        "CSP Concurrency",
      );
    }

    return base;
  }
}
