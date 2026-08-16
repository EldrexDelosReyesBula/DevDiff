import { ParsedDiff } from "../ai/prompts/optimized-prompts";
import { UnifiedKnowledge } from "../context/unified-context";

export interface VerificationIssue {
  severity: "critical" | "high" | "medium" | "low";
  type: string;
  detail: string;
  suggestion: string;
}

export interface VerificationResult {
  passed: boolean;
  issues: VerificationIssue[];
  quality: "excellent" | "good" | "acceptable" | "poor";
  recommendation: string;
}

export class HallucinationGuard {
  /**
   * Verify AI output against unified knowledge before accepting.
   * Catches hallucinations that SKILL.md + Memory should have prevented.
   */
  static verify(
    output: string,
    diff: ParsedDiff,
    knowledge: UnifiedKnowledge
  ): VerificationResult {
    const issues: VerificationIssue[] = [];

    // ── Check 1: Referenced files exist in diff ──
    const referencedFiles = this.extractReferencedFiles(output);
    const actualFiles = new Set((diff.files || []).map((f) => f.path));

    for (const file of referencedFiles) {
      if (!this.fileExistsInDiff(file, actualFiles)) {
        issues.push({
          severity: "high",
          type: "hallucinated-file",
          detail: `References "${file}" which is not in the diff`,
          suggestion: "Remove reference or verify file path",
        });
      }
    }

    // ── Check 2: Referenced entities exist in knowledge ──
    const referencedEntities = this.extractReferencedEntities(output);
    if (knowledge.conventions && Object.keys(knowledge.conventions).length > 0) {
      for (const entity of referencedEntities) {
        if (!this.entityMatchesConventions(entity, knowledge.conventions)) {
          issues.push({
            severity: "medium",
            type: "naming-violation",
            detail: `"${entity}" does not match project naming conventions`,
            suggestion: `Expected pattern: ${Object.values(knowledge.conventions).join(", ")}`,
          });
        }
      }
    }

    // ── Check 3: Anti-patterns not suggested ──
    if (knowledge.preferences?.antiPatterns) {
      for (const pattern of knowledge.preferences.antiPatterns) {
        const cleanPattern = pattern
          .replace(/[❌*\-\d.]/g, "")
          .replace(/^(never suggest|never|do not|avoid)\s+/i, "")
          .trim();

        if (cleanPattern && output.toLowerCase().includes(cleanPattern.toLowerCase())) {
          issues.push({
            severity: "critical",
            type: "anti-pattern-violation",
            detail: `Output suggests or references an anti-pattern: "${cleanPattern}"`,
            suggestion: "Remove this suggestion — it violates project standards",
          });
        }
      }
    }

    // ── Check 4: Changelog format matches preferences ──
    if (knowledge.preferences?.changelog?.groups) {
      const expectedGroups = knowledge.preferences.changelog.groups;
      const actualGroups = this.extractChangelogGroups(output);

      const unexpectedGroups = actualGroups.filter(
        (g) => !expectedGroups.some((eg) => eg.toLowerCase() === g.toLowerCase())
      );

      if (unexpectedGroups.length > 0) {
        issues.push({
          severity: "low",
          type: "format-violation",
          detail: `Uses non-standard changelog groups: ${unexpectedGroups.join(", ")}`,
          suggestion: `Expected groups: ${expectedGroups.join(", ")}`,
        });
      }
    }

    // ── Check 5: AI-sounding language ──
    const aiPhrases = [
      "appears to",
      "seems to",
      "could potentially",
      "the provided code",
      "this change appears",
      "it is possible that",
      "one could argue",
    ];

    for (const phrase of aiPhrases) {
      if (output.toLowerCase().includes(phrase)) {
        issues.push({
          severity: "medium",
          type: "ai-sounding-language",
          detail: `Uses AI-sounding phrase: "${phrase}"`,
          suggestion: "Rewrite in direct, developer-owned language",
        });
      }
    }

    return {
      passed: issues.filter((i) => i.severity === "critical").length === 0,
      issues,
      quality: this.assessQuality(issues),
      recommendation: this.generateRecommendation(issues),
    };
  }

  private static extractReferencedFiles(output: string): string[] {
    const matches =
      output.match(/`([^`]+\.(ts|js|tsx|jsx|py|go|rs|java|rb|php|cs|swift|kt|dart))`[gi]/g) || [];
    return matches.map((m) => m.replace(/`/g, ""));
  }

  private static fileExistsInDiff(file: string, actualFiles: Set<string>): boolean {
    for (const actual of actualFiles) {
      if (actual.endsWith(file) || actual.includes(file)) return true;
    }
    return false;
  }

  private static extractReferencedEntities(output: string): string[] {
    const matches = output.match(/\b([A-Z][a-zA-Z]+|[a-z]+[A-Z][a-zA-Z]*)\b/g) || [];
    return [...new Set(matches)].filter((m) => m.length > 3);
  }

  private static entityMatchesConventions(
    entity: string,
    conventions: Record<string, string>
  ): boolean {
    for (const [key, rule] of Object.entries(conventions)) {
      const lowerRule = rule.toLowerCase();
      if (lowerRule.includes("pascalcase") && key.includes("class")) {
        if (!/^[A-Z][a-zA-Z0-9]*$/.test(entity)) return false;
      }
      if (lowerRule.includes("camelcase") && key.includes("function")) {
        if (!/^[a-z][a-zA-Z0-9]*$/.test(entity)) return false;
      }
      if (lowerRule.includes("upper_snake_case") && key.includes("constant")) {
        if (!/^[A-Z0-9_]+$/.test(entity)) return false;
      }
    }
    return true;
  }

  private static extractChangelogGroups(output: string): string[] {
    const matches = output.match(/###\s+(.+)/g) || [];
    return matches.map((m) => m.replace("### ", "").trim());
  }

  private static assessQuality(
    issues: VerificationIssue[]
  ): "excellent" | "good" | "acceptable" | "poor" {
    const critical = issues.filter((i) => i.severity === "critical").length;
    const high = issues.filter((i) => i.severity === "high").length;

    if (critical > 0) return "poor";
    if (high > 2) return "acceptable";
    if (issues.length === 0) return "excellent";
    return "good";
  }

  private static generateRecommendation(issues: VerificationIssue[]): string {
    if (issues.length === 0) return "✅ Output passes all verification checks";

    const critical = issues.filter((i) => i.severity === "critical");
    if (critical.length > 0) {
      return `⚠️ ${critical.length} critical issue(s) — review required before accepting`;
    }

    return `⚠️ ${issues.length} minor issue(s) — output is usable but could be improved`;
  }
}
