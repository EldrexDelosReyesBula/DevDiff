import { ExplanationLevel } from "./levels";
import { CodeExplanation, UniversalExplainer } from "./languages/universal";
import { LanguageDetector } from "./languages/detector";
import { CSSExplainer } from "./languages/css";
import { JavaScriptExplainer } from "./languages/javascript";
import { PythonExplainer } from "./languages/python";
import { HTMLExplainer } from "./languages/html";
import { RustExplainer } from "./languages/rust";
import { GoExplainer } from "./languages/go";

export class StudyBuddyEngine {
  /**
   * Explain code in ANY language at target level.
   */
  static explain(params: {
    code: string;
    level: ExplanationLevel;
    filePath: string;
    language?: string;
  }): CodeExplanation {
    const lang = (
      params.language || LanguageDetector.detect(params.code, params.filePath)
    ).toLowerCase();

    switch (lang) {
      case "css":
      case "scss":
      case "sass":
        return new CSSExplainer().explain({
          code: params.code,
          level: params.level,
          filePath: params.filePath,
        });

      case "javascript":
      case "typescript":
        return new JavaScriptExplainer().explain({
          code: params.code,
          level: params.level,
          filePath: params.filePath,
        });

      case "python":
        return new PythonExplainer().explain({
          code: params.code,
          level: params.level,
          filePath: params.filePath,
        });

      case "html":
        return new HTMLExplainer().explain({
          code: params.code,
          level: params.level,
          filePath: params.filePath,
        });

      case "rust":
        return new RustExplainer().explain({
          code: params.code,
          level: params.level,
          filePath: params.filePath,
        });

      case "go":
        return new GoExplainer().explain({
          code: params.code,
          level: params.level,
          filePath: params.filePath,
        });

      default:
        return UniversalExplainer.explain({
          code: params.code,
          level: params.level,
          filePath: params.filePath,
          language: lang,
        });
    }
  }

  /**
   * Ask a learning question about code
   */
  static ask(question: string, code: string, filePath: string): string {
    const explanation = this.explain({
      code,
      level: "developer",
      filePath,
    });

    return [
      `### Study Buddy Answer`,
      `**Question:** ${question}`,
      `**Language:** ${explanation.language}`,
      `**Summary:** ${explanation.summary}`,
      `\n**Key Takeaways:**`,
      ...explanation.keyTakeaways.map((t) => `- ${t}`),
    ].join("\n");
  }
}
