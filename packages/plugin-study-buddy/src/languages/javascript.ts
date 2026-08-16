import { ExplanationLevel } from "../levels";
import { CodeExplanation, UniversalExplainer } from "./universal";

export class JavaScriptExplainer {
  explain(params: {
    code: string;
    level: ExplanationLevel;
    filePath: string;
  }): CodeExplanation {
    const base = UniversalExplainer.explain({
      code: params.code,
      language: params.filePath.endsWith(".ts") || params.filePath.endsWith(".tsx") ? "TypeScript" : "JavaScript",
      level: params.level,
      filePath: params.filePath,
    });

    if (/async|await|Promise/i.test(params.code)) {
      base.sections.push({
        title: "Async & Promises",
        content: "Uses asynchronous patterns (`async`/`await` or `Promise`) to execute non-blocking asynchronous operations.",
        importance: "important",
      });
      base.relatedConcepts.push("Event Loop", "Promises & Microtasks");
    }

    return base;
  }
}
