import { ExplanationLevel } from "../levels";
import { CodeExplanation, UniversalExplainer } from "./universal";

export class HTMLExplainer {
  explain(params: {
    code: string;
    level: ExplanationLevel;
    filePath: string;
  }): CodeExplanation {
    const base = UniversalExplainer.explain({
      code: params.code,
      language: "HTML",
      level: params.level,
      filePath: params.filePath,
    });

    base.sections.push({
      title: "DOM Structure",
      content: "Defines semantic HTML element tags forming the Document Object Model (DOM).",
      importance: "essential",
    });

    base.relatedConcepts.push("Semantic HTML5", "DOM Tree", "Accessibility (ARIA)");
    return base;
  }
}
