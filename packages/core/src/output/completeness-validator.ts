export interface ValidationResult {
  complete: boolean;
  issues: string[];
  quality: "good" | "acceptable" | "poor" | "unusable";
}

export class CompletenessValidator {
  /**
   * Validate that output is COMPLETE before accepting it.
   * Rejects partial, cut-off, or obviously unfinished output.
   */
  static validate(output: string): ValidationResult {
    const issues: string[] = [];

    if (!output || typeof output !== "string") {
      return {
        complete: false,
        issues: ["Output is empty or not a string"],
        quality: "unusable",
      };
    }

    // ── Check 1: Cut off mid-sentence ──
    if (this.isCutOff(output)) {
      issues.push("Output appears cut off mid-sentence");
    }

    // ── Check 2: Minimum length ──
    if (output.trim().length < 50) {
      issues.push("Output too short to be meaningful");
    }

    // ── Check 3: Has actual content, not just intro ──
    if (this.isOnlyIntroduction(output)) {
      issues.push("Output contains only introduction, no substantive content");
    }

    // ── Check 4: Ends with proper termination ──
    if (!this.hasProperEnding(output)) {
      issues.push("Output does not have a proper ending");
    }

    // ── Check 5: Not just an error/empty template ──
    if (this.isEmptyTemplate(output)) {
      issues.push("Output appears to be an empty template");
    }

    // ── Check 6: Balanced markdown ──
    if (!this.hasBalancedMarkdown(output)) {
      issues.push("Output has unbalanced markdown (unclosed code blocks, etc.)");
    }

    return {
      complete: issues.length === 0,
      issues,
      quality: this.assessQuality(issues),
    };
  }

  /**
   * Detect cut-off text — ends mid-word or mid-sentence
   */
  private static isCutOff(text: string): boolean {
    const trimmed = text.trim();
    if (trimmed.length === 0) return true;

    const lastChar = trimmed[trimmed.length - 1];

    // Proper endings
    const properEndings = [".", "!", "?", "`", '"', ")", "]", "}", ">", "\n", ":"];

    if (!properEndings.includes(lastChar)) {
      if (trimmed.endsWith("---") || trimmed.endsWith("```")) {
        return false;
      }
      return true;
    }

    return false;
  }

  /**
   * Check if output is only an introduction with no real content
   */
  private static isOnlyIntroduction(text: string): boolean {
    const trimmed = text.trim();

    // Common AI introduction patterns that indicate no real content yet
    const introPatterns = [
      /^The (provided|following) (code|snippet|file|changes?)/i,
      /^This (code|snippet|file|change|PR|commit) (appears|contains|is|shows)/i,
      /^Here('s| is) (a |an |the )?(breakdown|summary|overview|description)/i,
      /^The code (you |I |we )?(provided|shared|see|have)/i,
    ];

    const hasIntro = introPatterns.some((p) => p.test(trimmed));

    // Check if there's substantive content after the intro (list items, headings, code blocks)
    const hasSubstance = /^#{1,6}\s|^\s*[-*]\s|\n```/m.test(trimmed);
    const sentences = trimmed.split(/[.!?]+/).filter((s) => s.trim().length > 0);

    if (hasIntro && sentences.length <= 2 && !hasSubstance) {
      return true; // Only intro sentences, no real content
    }

    return false;
  }

  /**
   * Check if output ends properly
   */
  private static hasProperEnding(text: string): boolean {
    const trimmed = text.trim();
    if (trimmed.length === 0) return false;

    const lastLine = trimmed.split("\n").pop()?.trim() || "";

    // Proper endings
    const properEndings = [".", "!", "?", "`", "---", "```"];

    for (const ending of properEndings) {
      if (lastLine.endsWith(ending)) return true;
    }

    // Code block ending
    if (trimmed.endsWith("```\n") || trimmed.endsWith("```")) return true;

    // List ending
    if (lastLine.match(/^[-*]\s+.+$/)) return true;

    return false;
  }

  /**
   * Check if output is just an empty template
   */
  private static isEmptyTemplate(text: string): boolean {
    const trimmed = text.trim();

    const templateIndicators = [
      /^#+\s*$/m, // Empty heading
      /^\s*\[\s*\]\s*$/m, // Empty checkbox
      /^\s*-\s*$/m, // Empty list item
      /^\s*```\s*```\s*$/m, // Empty code block
    ];

    const indicatorCount = templateIndicators.filter((p) => p.test(trimmed)).length;

    // If more than 30% of lines are template indicators
    const lines = trimmed.split("\n");
    return indicatorCount > lines.length * 0.3;
  }

  /**
   * Check for balanced markdown
   */
  private static hasBalancedMarkdown(text: string): boolean {
    // Check code blocks
    const codeBlockCount = (text.match(/```/g) || []).length;
    if (codeBlockCount % 2 !== 0) return false;

    // Check inline code
    const inlineCodeCount = (text.match(/(?<!`)`(?!`)/g) || []).length;
    if (inlineCodeCount % 2 !== 0) return false;

    return true;
  }

  private static assessQuality(issues: string[]): "good" | "acceptable" | "poor" | "unusable" {
    if (issues.length === 0) return "good";

    const criticalIssues = issues.filter(
      (i) =>
        i.includes("cut off") ||
        i.includes("empty template") ||
        i.includes("too short")
    );

    if (criticalIssues.length > 0) return "unusable";
    if (issues.length >= 3) return "poor";
    return "acceptable";
  }
}
