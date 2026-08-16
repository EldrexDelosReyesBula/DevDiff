export interface ObfuscationIndicator {
  type: string;
  severity: "critical" | "high" | "medium" | "low";
  detail: string;
}

export interface ObfuscationAnalysis {
  status: "clean" | "suspicious" | "obfuscated" | "dangerous";
  score: number;
  indicators: ObfuscationIndicator[];
  recommendation: string;
}

export class ObfuscationDetector {
  /**
   * Detect obfuscated, minified, or suspicious code patterns
   */
  static analyze(code: string): ObfuscationAnalysis {
    const indicators: ObfuscationIndicator[] = [];
    let obfuscationScore = 0;

    // Indicator 1: Single-character variable names
    const singleCharVars = this.countSingleCharVariables(code);
    if (singleCharVars > 10) {
      obfuscationScore += 20;
      indicators.push({
        type: "single-char-variables",
        severity: "medium",
        detail: `${singleCharVars} single-character variable names detected — typical of minified code`,
      });
    }

    // Indicator 2: Hex/unicode escape sequences
    const hexEscapes = (code.match(/\\x[0-9a-f]{2}/gi) || []).length;
    const unicodeEscapes = (code.match(/\\u[0-9a-f]{4}/gi) || []).length;

    if (hexEscapes > 5 || unicodeEscapes > 5) {
      obfuscationScore += 30;
      indicators.push({
        type: "escape-sequences",
        severity: "high",
        detail: `${hexEscapes + unicodeEscapes} hex/unicode escape sequences — often used to hide strings`,
      });
    }

    // Indicator 3: Base64-encoded strings
    const base64Patterns = (
      code.match(/['"`][A-Za-z0-9+/]{40,}={0,2}['"`]/g) || []
    ).length;
    if (base64Patterns > 3) {
      obfuscationScore += 35;
      indicators.push({
        type: "base64-strings",
        severity: "high",
        detail: `${base64Patterns} potential Base64-encoded strings detected`,
      });
    }

    // Indicator 4: eval() or Function() usage
    if (/\beval\s*\(/.test(code) || /\bFunction\s*\(/.test(code)) {
      obfuscationScore += 40;
      indicators.push({
        type: "dynamic-code-execution",
        severity: "critical",
        detail:
          "Code uses eval() or Function() — can execute arbitrary strings as code",
      });
    }

    // Indicator 5: Encoded string concatenation
    if (/String\.fromCharCode/.test(code) || /atob\s*\(/.test(code)) {
      obfuscationScore += 30;
      indicators.push({
        type: "string-decoding",
        severity: "high",
        detail:
          "Code uses String.fromCharCode or atob() — decodes strings at runtime",
      });
    }

    // Indicator 6: Extremely long lines (minified)
    const lines = code.split("\n");
    const avgLineLength =
      lines.length > 0
        ? lines.reduce((sum, l) => sum + l.length, 0) / lines.length
        : 0;

    if (avgLineLength > 500) {
      obfuscationScore += 25;
      indicators.push({
        type: "minified-code",
        severity: "medium",
        detail: `Average line length of ${Math.round(avgLineLength)} characters — typical of minified code`,
      });
    }

    // Indicator 7: No meaningful variable names
    const meaningfulNames = this.countMeaningfulNames(code);
    if (meaningfulNames < 3 && lines.length > 20) {
      obfuscationScore += 20;
      indicators.push({
        type: "no-meaningful-names",
        severity: "medium",
        detail: "Few meaningful variable names — code intent is obscured",
      });
    }

    // Indicator 8: Excessive nesting or complexity
    const nestingDepth = this.calculateNestingDepth(code);
    if (nestingDepth > 8) {
      obfuscationScore += 10;
      indicators.push({
        type: "deep-nesting",
        severity: "low",
        detail: `Code has nesting depth of ${nestingDepth} — hard to follow`,
      });
    }

    // Determine overall status
    let status: "clean" | "suspicious" | "obfuscated" | "dangerous";
    if (obfuscationScore >= 70) status = "dangerous";
    else if (obfuscationScore >= 40) status = "obfuscated";
    else if (obfuscationScore >= 20) status = "suspicious";
    else status = "clean";

    return {
      status,
      score: obfuscationScore,
      indicators,
      recommendation: this.generateRecommendation(status, indicators),
    };
  }

  private static countSingleCharVariables(code: string): number {
    const matches = code.match(/\b(?:var|let|const)\s+([a-z])\b/gi) || [];
    return matches.filter((m) => !["i", "j", "k"].includes(m.toLowerCase()))
      .length;
  }

  private static countMeaningfulNames(code: string): number {
    const matches =
      code.match(/\b(?:var|let|const|function)\s+([a-zA-Z_]\w{3,})\b/g) || [];
    return matches.length;
  }

  private static calculateNestingDepth(code: string): number {
    let maxDepth = 0;
    let currentDepth = 0;

    for (const char of code) {
      if (char === "{") currentDepth++;
      if (char === "}") currentDepth--;
      maxDepth = Math.max(maxDepth, currentDepth);
    }

    return maxDepth;
  }

  private static generateRecommendation(
    status: string,
    indicators: ObfuscationIndicator[],
  ): string {
    switch (status) {
      case "dangerous":
        return (
          "This code appears heavily obfuscated and potentially dangerous. " +
          "It should NOT be installed without thorough manual review. " +
          "Critical indicators: " +
          indicators
            .filter((i) => i.severity === "critical")
            .map((i) => i.detail)
            .join("; ")
        );

      case "obfuscated":
        return (
          "This code shows significant signs of obfuscation. " +
          "Its behavior cannot be fully verified. Manual review is strongly recommended."
        );

      case "suspicious":
        return (
          "This code has some characteristics of obfuscation. " +
          "Review the indicators above before proceeding."
        );

      default:
        return "No significant obfuscation detected. Code appears readable.";
    }
  }
}
