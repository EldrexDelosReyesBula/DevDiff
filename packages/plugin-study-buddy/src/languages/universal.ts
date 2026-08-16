import { ExplanationLevel } from "../levels";
import { LanguageDetector } from "./detector";

export interface ExplanationSection {
  title: string;
  content: string;
  importance: "essential" | "important" | "optional";
}

export interface CodeExplanation {
  language: string;
  level: ExplanationLevel;
  summary: string;
  sections: ExplanationSection[];
  keyTakeaways: string[];
  suggestedNextLevel?: ExplanationLevel;
  relatedConcepts: string[];
}

export interface CodeStructure {
  totalLines: number;
  codeLines: number;
  commentLines: number;
  hasFunctions: boolean;
  hasClasses: boolean;
  hasImports: boolean;
  hasVariables: boolean;
  hasLoops: boolean;
  hasConditionals: boolean;
  hasComments: boolean;
  hasAsync: boolean;
  hasErrorHandling: boolean;
  patterns: string[];
  complexity: "simple" | "moderate" | "complex";
}

export class UniversalExplainer {
  /**
   * Explain ANY code in ANY language.
   */
  static explain(params: {
    code: string;
    language?: string;
    level: ExplanationLevel;
    filePath: string;
  }): CodeExplanation {
    const language =
      params.language || LanguageDetector.detect(params.code, params.filePath);

    return this.universalExplain({
      code: params.code,
      language,
      level: params.level,
      filePath: params.filePath,
    });
  }

  private static universalExplain(params: {
    code: string;
    language: string;
    level: ExplanationLevel;
    filePath: string;
  }): CodeExplanation {
    const structure = this.analyzeStructure(params.code);
    const sections: ExplanationSection[] = [];

    // ── Section 1: What this file is ──
    sections.push({
      title: "What This File Is",
      content: this.explainFilePurpose(params.filePath, params.language),
      importance: "essential",
    });

    // ── Section 2: Structure breakdown ──
    if (
      structure.hasFunctions ||
      structure.hasClasses ||
      structure.hasImports
    ) {
      sections.push({
        title: "Structure Breakdown",
        content: this.explainStructure(structure, params.level),
        importance: "essential",
      });
    }

    // ── Section 3: Line-by-line ──
    if (params.level === "beginner" || params.level === "student") {
      sections.push({
        title: "Line-by-Line Walkthrough",
        content: this.explainLineByLine(params.code, params.language),
        importance: "essential",
      });
    }

    // ── Section 4: Key concepts ──
    sections.push({
      title: "Key Concepts",
      content: this.extractConcepts(params.code),
      importance: "important",
    });

    // ── Section 5: Patterns used ──
    if (structure.patterns.length > 0) {
      sections.push({
        title: "Patterns Used",
        content: this.explainPatterns(structure.patterns),
        importance: "important",
      });
    }

    return {
      language: params.language,
      level: params.level,
      summary: this.generateSummary(structure, params.language, params.level),
      sections,
      keyTakeaways: this.generateTakeaways(structure),
      suggestedNextLevel: this.suggestNextLevel(params.level),
      relatedConcepts: this.findRelatedConcepts(params.code),
    };
  }

  private static analyzeStructure(code: string): CodeStructure {
    const lines = code.split("\n");
    const patterns: string[] = [];

    const hasFunctions =
      /function\s+\w+|def\s+\w+|fn\s+\w+|func\s+\w+|fun\s+\w+/.test(code);
    const hasClasses = /class\s+\w+|struct\s+\w+/.test(code);
    const hasImports =
      /import\s+|require\s*\(|from\s+['"]|include\s+|#include/.test(code);
    const hasVariables = /const\s+\w+|let\s+\w+|var\s+\w+|:=|=\s/.test(code);
    const hasLoops = /for\s*\(|while\s*\(|for\s+\w+\s+in|\.forEach|\.map/.test(
      code,
    );
    const hasConditionals =
      /if\s*\(|if\s+\w+|else|elif|switch\s*\(|match\s+/.test(code);
    const hasComments = /\/\/|#|--|<!--|\/\*/.test(code);
    const hasAsync = /async|await|\.then\(|Promise|goroutine|channel/.test(
      code,
    );
    const hasErrorHandling = /try\s*\{|catch\s*\(|except|rescue|\.catch\(/.test(
      code,
    );

    if (hasAsync) patterns.push("Asynchronous/Concurrent Programming");
    if (hasErrorHandling) patterns.push("Error Handling");
    if (hasLoops) patterns.push("Iteration/Loops");
    if (hasConditionals) patterns.push("Conditional Logic");
    if (hasClasses && hasFunctions)
      patterns.push("Object-Oriented Programming");
    if (hasFunctions && !hasClasses)
      patterns.push("Functional/Procedural Programming");

    const codeLines = lines.filter(
      (l) =>
        l.trim() && !l.trim().startsWith("//") && !l.trim().startsWith("#"),
    ).length;
    const commentLines = lines.filter(
      (l) => l.trim().startsWith("//") || l.trim().startsWith("#"),
    ).length;

    return {
      totalLines: lines.length,
      codeLines,
      commentLines,
      hasFunctions,
      hasClasses,
      hasImports,
      hasVariables,
      hasLoops,
      hasConditionals,
      hasComments,
      hasAsync,
      hasErrorHandling,
      patterns,
      complexity:
        codeLines < 30 ? "simple" : codeLines < 100 ? "moderate" : "complex",
    };
  }

  private static explainFilePurpose(
    filePath: string,
    language: string,
  ): string {
    const fileName = filePath.split("/").pop() || filePath;
    const dirName = filePath.split("/").slice(-2, -1)[0] || "root";

    return `This is a **${language}** file (\`${fileName}\`) located in the **${dirName}** module.`;
  }

  private static explainStructure(
    structure: CodeStructure,
    _level: ExplanationLevel,
  ): string {
    const parts: string[] = [];
    parts.push(
      `This file has **${structure.totalLines} lines** (${structure.codeLines} code, ${structure.commentLines} comments).`,
    );

    if (structure.hasImports)
      parts.push("It **imports** dependencies from other modules.");
    if (structure.hasFunctions)
      parts.push("It **defines functions** to organize execution logic.");
    if (structure.hasClasses)
      parts.push("It **defines classes or structures** to encapsulate state.");
    if (structure.hasAsync)
      parts.push("It handles **asynchronous operations**.");
    if (structure.hasErrorHandling)
      parts.push("It incorporates **error handling**.");

    return parts.join("\n\n");
  }

  private static explainLineByLine(code: string, _language: string): string {
    const lines = code.split("\n");
    const explanations: string[] = [];

    for (let i = 0; i < Math.min(lines.length, 15); i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const lineNum = i + 1;

      if (line.startsWith("import ") || line.startsWith("require(")) {
        explanations.push(
          `**Line ${lineNum}:** Imports code from an external module.`,
        );
      } else if (line.startsWith("//") || line.startsWith("#")) {
        explanations.push(
          `**Line ${lineNum}:** A developer comment describing logic.`,
        );
      } else if (
        line.includes("function ") ||
        line.includes("def ") ||
        line.includes("fn ")
      ) {
        explanations.push(`**Line ${lineNum}:** Function declaration.`);
      } else if (line.includes("if ") || line.includes("if(")) {
        explanations.push(`**Line ${lineNum}:** Conditional decision point.`);
      } else if (line.includes("return ")) {
        explanations.push(`**Line ${lineNum}:** Returns result to caller.`);
      }
    }

    return explanations.join("\n\n");
  }

  private static extractConcepts(code: string): string {
    const concepts: string[] = [];

    if (/function\s+\w+|def\s+\w+|fn\s+\w+/.test(code)) {
      concepts.push(
        "**Functions** — Reusable blocks of code that execute specific logic.",
      );
    }
    if (/class\s+\w+|struct\s+\w+/.test(code)) {
      concepts.push(
        "**Data Modeling** — Structured state and behavior encapsulation.",
      );
    }
    if (/async|await|Promise/.test(code)) {
      concepts.push(
        "**Asynchronous Execution** — Non-blocking operation handling.",
      );
    }

    return concepts.length > 0
      ? concepts.join("\n\n")
      : "Standard procedural execution.";
  }

  private static explainPatterns(patterns: string[]): string {
    return patterns
      .map((p) => `- **${p}**: Pattern utilized in this snippet.`)
      .join("\n");
  }

  private static generateSummary(
    structure: CodeStructure,
    language: string,
    level: ExplanationLevel,
  ): string {
    return `${language.toUpperCase()} file (${structure.totalLines} lines, ${structure.complexity} complexity) explained at ${level} level.`;
  }

  private static generateTakeaways(structure: CodeStructure): string[] {
    const takeaways: string[] = [];
    if (structure.hasFunctions)
      takeaways.push("Functions encapsulate modular logic.");
    if (structure.hasClasses) takeaways.push("Classes define domain models.");
    if (takeaways.length === 0) takeaways.push("Structured execution file.");
    return takeaways;
  }

  private static suggestNextLevel(
    current: ExplanationLevel,
  ): ExplanationLevel | undefined {
    const levels: ExplanationLevel[] = [
      "beginner",
      "student",
      "developer",
      "senior",
      "architect",
    ];
    const idx = levels.indexOf(current);
    return idx < levels.length - 1 ? levels[idx + 1] : undefined;
  }

  private static findRelatedConcepts(code: string): string[] {
    const related: string[] = [];
    if (/function|def|fn/.test(code))
      related.push("Function Scoping", "Return Types");
    if (/async|await/.test(code))
      related.push("Concurrency Models", "Event Loops");
    return related;
  }
}
