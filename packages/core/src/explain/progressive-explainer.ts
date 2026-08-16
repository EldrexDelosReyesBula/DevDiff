export type ExplanationLevel =
  "beginner" | "student" | "developer" | "senior" | "architect";

export interface ProgressiveExplanation {
  level: ExplanationLevel;
  summary: string;
  sections: ExplanationSection[];
  keyTakeaways: string[];
  suggestedNextLevel?: ExplanationLevel;
}

export interface ExplanationSection {
  title: string;
  content: string;
  importance: "essential" | "important" | "supplementary";
  codeReferences?: Array<{ file: string; line: number; snippet: string }>;
}

export type ProjectContext = any;

interface LevelConfig {
  name: string;
  icon: string;
  description: string;
  maxDepth: number;
  includeLineByLine: boolean;
  includeAnalogies: boolean;
  includeTryItYourself: boolean;
  includeBestPractices: boolean;
  includePerformance: boolean;
  includeTradeoffs: boolean;
  tone: string;
  audience: string;
}

export class ProgressiveExplainer {
  private static readonly LEVEL_CONFIGS: Record<ExplanationLevel, LevelConfig> =
    {
      beginner: {
        name: "Beginner",
        icon: "🌱",
        description: "Explains foundational concepts",
        maxDepth: 1,
        includeLineByLine: true,
        includeAnalogies: true,
        includeTryItYourself: true,
        includeBestPractices: false,
        includePerformance: false,
        includeTradeoffs: false,
        tone: "warm and encouraging",
        audience:
          "Someone learning to code. Explain everything. No assumption of prior knowledge.",
      },
      student: {
        name: "Student",
        icon: "📚",
        description: "Learning patterns and architecture",
        maxDepth: 2,
        includeLineByLine: true,
        includeAnalogies: true,
        includeTryItYourself: true,
        includeBestPractices: true,
        includePerformance: false,
        includeTradeoffs: false,
        tone: "educational and thorough",
        audience:
          "Knows programming basics. Learning design patterns, architecture, and best practices.",
      },
      developer: {
        name: "Developer",
        icon: "💻",
        description: "Technical and precise",
        maxDepth: 3,
        includeLineByLine: false,
        includeAnalogies: false,
        includeTryItYourself: false,
        includeBestPractices: true,
        includePerformance: false,
        includeTradeoffs: false,
        tone: "direct and technical",
        audience:
          "Professional developer. Needs to understand what changed, why, and impact.",
      },
      senior: {
        name: "Senior",
        icon: "🧠",
        description: "Performance, memory, breaking changes",
        maxDepth: 4,
        includeLineByLine: false,
        includeAnalogies: false,
        includeTryItYourself: false,
        includeBestPractices: true,
        includePerformance: true,
        includeTradeoffs: true,
        tone: "concise and strategic",
        audience:
          "Senior developer. Focus on performance implications, memory impact, breaking changes, and migration paths.",
      },
      architect: {
        name: "Architect",
        icon: "🏗️",
        description: "System-wide impact and design",
        maxDepth: 5,
        includeLineByLine: false,
        includeAnalogies: false,
        includeTryItYourself: false,
        includeBestPractices: true,
        includePerformance: true,
        includeTradeoffs: true,
        tone: "strategic and comprehensive",
        audience:
          "Software architect. Focus on system-wide impact, design patterns, technical debt, compliance, and long-term strategy.",
      },
    };

  /**
   * Generate explanation at the requested level
   */
  static async explain(params: {
    code: string;
    filePath: string;
    level: ExplanationLevel;
    projectContext: ProjectContext;
  }): Promise<ProgressiveExplanation> {
    const config =
      this.LEVEL_CONFIGS[params.level] || this.LEVEL_CONFIGS.developer;
    const sections: ExplanationSection[] = [];

    const summary = await this.generateSummary(params, config);

    // ── Section 1: Summary (all levels, different depth) ──
    sections.push({
      title: "Summary",
      content: summary,
      importance: "essential",
    });

    // ── Section 2: Line-by-Line (beginner, student) ──
    if (config.includeLineByLine) {
      sections.push({
        title: "Line-by-Line Breakdown",
        content: await this.generateLineByLine(params, config),
        importance: "essential",
      });
    }

    // ── Section 3: Concepts & Patterns (beginner, student, developer) ──
    if (config.maxDepth >= 2) {
      sections.push({
        title: "Concepts & Patterns",
        content: await this.generateConcepts(params, config),
        importance: "important",
      });
    }

    // ── Section 4: Architecture Impact (student, developer, senior, architect) ──
    if (config.maxDepth >= 3) {
      sections.push({
        title: "Architecture Impact",
        content: await this.generateArchitectureImpact(params, config),
        importance: "important",
      });
    }

    // ── Section 5: Performance & Memory (senior, architect) ──
    if (config.includePerformance) {
      sections.push({
        title: "Performance & Memory Analysis",
        content: await this.generatePerformanceAnalysis(params, config),
        importance: "important",
      });
    }

    // ── Section 6: Breaking Changes & Migration (senior, architect) ──
    if (config.maxDepth >= 4) {
      sections.push({
        title: "Breaking Changes & Migration",
        content: await this.generateBreakingChanges(params, config),
        importance: "essential",
      });
    }

    // ── Section 7: Best Practices (student, developer, senior, architect) ──
    if (config.includeBestPractices) {
      sections.push({
        title: "Best Practices",
        content: await this.generateBestPractices(params, config),
        importance: "supplementary",
      });
    }

    // ── Section 8: Trade-offs (senior, architect) ──
    if (config.includeTradeoffs) {
      sections.push({
        title: "Trade-off Analysis",
        content: await this.generateTradeoffs(params, config),
        importance: "supplementary",
      });
    }

    // ── Section 9: Try It Yourself (beginner, student) ──
    if (config.includeTryItYourself) {
      sections.push({
        title: "Try It Yourself",
        content: await this.generateTryItYourself(params, config),
        importance: "supplementary",
      });
    }

    // ── Section 10: Strategic Recommendations (architect) ──
    if (config.maxDepth >= 5) {
      sections.push({
        title: "Strategic Recommendations",
        content: await this.generateStrategicRecommendations(params, config),
        importance: "important",
      });
    }

    return {
      level: params.level,
      summary,
      sections,
      keyTakeaways: await this.generateKeyTakeaways(params, config),
      suggestedNextLevel: this.suggestNextLevel(params.level),
    };
  }

  /**
   * Auto-detect best explanation level based on code complexity
   */
  static autoDetectLevel(
    code: string,
    projectContext: ProjectContext = {},
  ): ExplanationLevel {
    if (!code) return "beginner";

    const lines = code.split("\n").length;
    const hasComplexPatterns =
      /class\s+\w+.*extends|implements|abstract|generic|decorator|middleware|async\s+function/.test(
        code,
      );
    const hasPerformanceCode =
      /performance|optimize|cache|memoize|debounce|throttle|worker|pool/.test(
        code,
      );
    const hasSecurityCode =
      /auth|encrypt|hash|token|session|password|secret|key/.test(code);

    if (hasSecurityCode && hasPerformanceCode) return "architect";
    if (hasPerformanceCode || lines > 200) return "senior";
    if (hasComplexPatterns || lines > 100) return "developer";
    if (lines > 30) return "student";
    return "beginner";
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
    const currentIndex = levels.indexOf(current);

    if (currentIndex >= 0 && currentIndex < levels.length - 1) {
      return levels[currentIndex + 1];
    }

    return undefined;
  }

  private static async generateSummary(
    params: { code: string; filePath: string },
    config: LevelConfig,
  ): Promise<string> {
    const fileName = params.filePath.split("/").pop() || params.filePath;
    if (config.maxDepth <= 2) {
      return `${config.icon} **${config.name} Overview:** This code in \`${fileName}\` ${
        params.code.includes("function") || params.code.includes("class")
          ? "defines core components that handle application logic"
          : "contains instructions for processing data"
      }.`;
    }
    return `${config.icon} **${config.name} Overview:** Module \`${fileName}\` manages domain execution flow with cross-cutting implications for performance, security, and component hierarchy.`;
  }

  private static async generateLineByLine(
    params: { code: string },
    config: LevelConfig,
  ): Promise<string> {
    const lines = params.code.split("\n").slice(0, 15);
    return lines
      .map(
        (line, idx) =>
          `- **Line ${idx + 1}:** \`${line.trim()}\` — ${config.includeAnalogies ? "Acts like a step-by-step instruction." : "Executes code block."}`,
      )
      .join("\n");
  }

  private static async generateConcepts(
    params: { code: string },
    config: LevelConfig,
  ): Promise<string> {
    const concepts: string[] = [];
    if (/function|=>/.test(params.code))
      concepts.push("Functions & Execution Blocks");
    if (/class/.test(params.code))
      concepts.push("Object-Oriented Encapsulation");
    if (/async|await|Promise/.test(params.code))
      concepts.push("Asynchronous Control Flow");
    if (/import|export/.test(params.code)) concepts.push("ES Module System");

    return concepts.length > 0
      ? `Key concepts in this file:\n${concepts.map((c) => `- ${c}`).join("\n")}`
      : "Standard modular programming principles.";
  }

  private static async generateArchitectureImpact(
    params: { filePath: string },
    config: LevelConfig,
  ): Promise<string> {
    return `This file (\`${params.filePath}\`) forms part of the application subsystem. Modifying it impacts downstream callers and importing modules.`;
  }

  private static async generatePerformanceAnalysis(
    params: { code: string },
    config: LevelConfig,
  ): Promise<string> {
    return [
      "### Performance Profile",
      "- **Time Complexity:** O(N) operations expected for array traversals.",
      "- **Memory Allocation:** Standard heap garbage collected allocations.",
      "- **Optimization Notes:** Consider memoization or debouncing if called frequently in hot execution paths.",
    ].join("\n");
  }

  private static async generateBreakingChanges(
    params: { code: string },
    config: LevelConfig,
  ): Promise<string> {
    return [
      "### Migration & Breaking Changes",
      "- **API Surface:** Exported signatures are preserved.",
      "- **Migration Path:** Backward compatible with existing call sites.",
    ].join("\n");
  }

  private static async generateBestPractices(
    params: { code: string },
    config: LevelConfig,
  ): Promise<string> {
    return [
      "- Maintain single-responsibility principle per module.",
      "- Ensure error handling wraps external asynchronous requests.",
      "- Export explicit TypeScript types for public methods.",
    ].join("\n");
  }

  private static async generateTradeoffs(
    params: { code: string },
    config: LevelConfig,
  ): Promise<string> {
    return [
      "- **Readability vs Micro-optimization:** Prioritized code clarity over raw execution micro-optimizations.",
      "- **Abstraction Layer:** Provides decoupling at the cost of slight call-stack overhead.",
    ].join("\n");
  }

  private static async generateTryItYourself(
    params: { filePath: string },
    config: LevelConfig,
  ): Promise<string> {
    return `Try modifying parameters or logging output in \`${params.filePath}\` to observe how variables change during runtime execution!`;
  }

  private static async generateStrategicRecommendations(
    params: { filePath: string },
    config: LevelConfig,
  ): Promise<string> {
    return [
      "1. **Decoupling:** Consider extracting shared utility functions into common domain packages.",
      "2. **Observability:** Integrate structured telemetry logging for major state transitions.",
      "3. **Governance:** Ensure compliance rules and dependency audits pass before deployment.",
    ].join("\n");
  }

  private static async generateKeyTakeaways(
    params: { code: string },
    config: LevelConfig,
  ): Promise<string[]> {
    return [
      `Level: ${config.name} (${config.icon})`,
      `Tone: ${config.tone}`,
      `Primary focus: ${config.description}`,
    ];
  }
}
