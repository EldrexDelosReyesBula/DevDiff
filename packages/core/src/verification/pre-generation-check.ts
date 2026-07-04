import { ParseResult } from "../diff/parser";
import { DeepContext } from "../context/deep-indexer";

export interface PreCheckResult {
  shouldProceed: boolean;
  confidence: number; // 0-1
  issues: string[];
  warnings: string[];
  recommendation: string;
}

export interface PostCheckResult {
  passed: boolean;
  confidence: number;
  flags: string[];
  recommendation: string;
}

export class AccuracyGuard {
  /**
   * Pre-check: Assess input scope and set initial confidence
   */
  static preCheck(diff: ParseResult, context: DeepContext): PreCheckResult {
    const issues: string[] = [];
    const warnings: string[] = [];

    // 1. Diff size check
    if (diff.files.length > 500) {
      warnings.push(
        `Large diff (${diff.files.length} files). AI explanation may be high-level.`,
      );
      warnings.push(
        "Consider: git add specific files instead of entire changeset.",
      );
    }

    const additions = diff.totalAdditions || 0;
    const deletions = diff.totalDeletions || 0;
    if (additions + deletions > 50000) {
      warnings.push(
        `Very large change (${(additions + deletions).toLocaleString()} lines).`,
      );
      warnings.push(
        "AI will summarize at architecture level, not file-by-file.",
      );
    }

    // 2. Binary files check
    const binaryFiles = diff.files.filter((f) => f.isBinary);
    if (binaryFiles.length > 0) {
      issues.push(
        `${binaryFiles.length} binary file(s) will be excluded from analysis.`,
      );
    }

    // 3. New repository check
    if (context.git.totalCommits < 5) {
      warnings.push(
        "Repository has few commits. AI has limited history for context.",
      );
      warnings.push("Explanations will improve as the project grows.");
    }

    // 4. Missing context check
    if (
      !context.patterns.namingConventions ||
      context.patterns.namingConventions.length === 0
    ) {
      warnings.push("Limited project context. Run: devdiff context generate");
      warnings.push("This helps the AI understand your codebase structure.");
    }

    // 5. File type warning
    const generatedFiles = diff.files.filter(
      (f) =>
        (f.newPath &&
          (f.newPath.includes("generated") ||
            f.newPath.includes(".gen.") ||
            f.newPath.includes("auto-generated"))) ||
        (f.oldPath &&
          (f.oldPath.includes("generated") ||
            f.oldPath.includes(".gen.") ||
            f.oldPath.includes("auto-generated"))),
    );
    if (generatedFiles.length > 0) {
      issues.push(
        `${generatedFiles.length} auto-generated file(s) detected. These will be noted but not deeply analyzed.`,
      );
    }

    const confidence = this.calculatePreConfidence(diff, context);

    return {
      shouldProceed: true,
      confidence,
      issues,
      warnings,
      recommendation:
        warnings.length > 3
          ? "Consider running with --depth minimal for faster, more reliable results."
          : "Ready for AI analysis.",
    };
  }

  /**
   * Post-check: Verify AI output quality and detect hallucinations
   */
  static postCheck(
    explanation: string,
    diff: ParseResult,
    context: DeepContext,
  ): PostCheckResult {
    const flags: string[] = [];

    // 1. Hallucinated file check
    const mentionedFiles = this.extractFilePaths(explanation);
    const actualFiles = new Set<string>();
    for (const f of diff.files) {
      if (f.newPath) actualFiles.add(f.newPath);
      if (f.oldPath) actualFiles.add(f.oldPath);
    }

    for (const mentioned of mentionedFiles) {
      if (!actualFiles.has(mentioned)) {
        // Check if it's a known module/dir name from conventions
        const matchesConvention = context.patterns.namingConventions?.some(
          (c) => mentioned.includes(c),
        );
        if (!matchesConvention) {
          flags.push(
            `Mentions "${mentioned}" which is not in this diff. May be a hallucination.`,
          );
        }
      }
    }

    // 2. Hallucinated function/class check
    const mentionedSymbols = this.extractCodeSymbols(explanation);
    const diffContent = diff.files
      .flatMap((f) => f.hunks.flatMap((h) => h.lines.map((l) => l.content)))
      .join("\n");

    for (const symbol of mentionedSymbols) {
      if (!diffContent.includes(symbol)) {
        // Only flag if it looks like a camelCase or PascalCase identifier
        if (
          /^[A-Z][a-zA-Z0-9]+$/.test(symbol) ||
          /^[a-z][a-zA-Z0-9]+$/.test(symbol)
        ) {
          flags.push(
            `Mentions "${symbol}" which is not found in the diff. May be incorrect.`,
          );
        }
      }
    }

    // 3. Vague statement detection
    const vagueStatements = [
      "improved performance",
      "refactored code",
      "fixed bugs",
      "made changes",
      "updated dependencies",
      "general improvements",
    ];

    for (const vague of vagueStatements) {
      const regex = new RegExp(`\\b${vague}\\b`, "gi");
      const count = (explanation.match(regex) || []).length;
      if (count > 2) {
        flags.push(
          `Multiple vague statements ("${vague}"). Explanation may lack specificity.`,
        );
        break;
      }
    }

    // 4. Contradiction with context
    const detectedDeps = context.dependencies.detectedFrameworks || [];
    if (detectedDeps.includes("React") || detectedDeps.includes("Next.js")) {
      if (
        explanation.match(/\b(vue|angular|svelte)\b/i) &&
        !diffContent.match(/\b(vue|angular|svelte)\b/i)
      ) {
        flags.push(
          "Mentions framework not used in this project. Possible hallucination.",
        );
      }
    }

    // 5. Confidence estimation
    const confidence = this.estimateConfidence(explanation, flags);

    return {
      passed: flags.length < 3, // Up to 2 flags is acceptable
      confidence,
      flags,
      recommendation:
        flags.length > 0
          ? "⚠️ This explanation may contain inaccuracies. Please review carefully.\n" +
            "   Report issues: https://github.com/EldrexDelosReyesBula/devdiff/issues/new\n" +
            "   Or email: eldrexdelosreyesbula@gmail.com"
          : "✅ Explanation appears accurate based on automated checks.",
    };
  }

  private static extractFilePaths(text: string): string[] {
    const matches =
      text.match(
        /[\w\/\-\.]+\.(ts|js|tsx|jsx|py|go|rs|java|rb|php|cs|cpp|h|css|html)/gi,
      ) || [];
    return [...new Set(matches)];
  }

  private static extractCodeSymbols(text: string): string[] {
    const matches =
      text.match(/\b([A-Z][a-zA-Z0-9]+|[a-z]+[A-Z][a-zA-Z0-9]*)\b/g) || [];
    // Filter common English words
    const commonWords = new Set([
      "This",
      "That",
      "These",
      "Those",
      "There",
      "Their",
      "They",
      "With",
      "Without",
      "About",
      "Above",
      "After",
      "Before",
      "Between",
      "Change",
      "Changes",
      "Changed",
      "Added",
      "Removed",
      "Updated",
      "File",
      "Files",
      "Code",
      "Function",
      "Functions",
      "Class",
      "Classes",
    ]);
    return matches.filter((m) => !commonWords.has(m));
  }

  private static estimateConfidence(
    explanation: string,
    flags: string[],
  ): number {
    let confidence = 0.85; // Start optimistic

    if (flags.length >= 3) confidence -= 0.3;
    else if (flags.length >= 1) confidence -= 0.1 * flags.length;

    if (explanation.length < 50) confidence -= 0.2; // Too short to be useful
    if (explanation.length > 10000) confidence -= 0.1; // Too long, may ramble

    return Math.max(0, Math.min(1, confidence));
  }

  private static calculatePreConfidence(
    diff: ParseResult,
    context: DeepContext,
  ): number {
    let confidence = 0.9;

    if (diff.files.length > 100) confidence -= 0.2;
    if (context.git.totalCommits < 10) confidence -= 0.1;
    if (!context.patterns.monorepo && diff.files.length > 50) confidence -= 0.1;

    return Math.max(0.3, confidence);
  }
}
