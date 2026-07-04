import { AIExplanationResult } from "../ai/providers/base";
import { ParseResult } from "../diff/parser";

export interface VerificationIssue {
  type: "file-not-in-diff" | "identifier-not-in-diff" | "low-confidence";
  message: string;
  severity: "warning" | "info";
}

export interface VerificationResult {
  valid: boolean;
  issues: VerificationIssue[];
  confidence: number; // 0–1, 1 = fully confident
  checkedFiles: string[];
  checkedIdentifiers: string[];
}

/**
 * Common words to exclude from identifier checks — avoids false positives
 * for regular English words that appear in technical explanations.
 */
const COMMON_ENGLISH = new Set([
  "the",
  "a",
  "an",
  "is",
  "are",
  "was",
  "were",
  "be",
  "been",
  "being",
  "have",
  "has",
  "had",
  "do",
  "does",
  "did",
  "will",
  "would",
  "could",
  "should",
  "may",
  "might",
  "shall",
  "can",
  "need",
  "must",
  "ought",
  "to",
  "of",
  "in",
  "on",
  "at",
  "by",
  "for",
  "with",
  "about",
  "from",
  "into",
  "through",
  "during",
  "before",
  "after",
  "above",
  "below",
  "this",
  "that",
  "these",
  "those",
  "it",
  "its",
  "which",
  "who",
  "whom",
  "what",
  "where",
  "when",
  "why",
  "how",
  "all",
  "each",
  "every",
  "both",
  "few",
  "more",
  "most",
  "other",
  "some",
  "such",
  "no",
  "nor",
  "not",
  "only",
  "same",
  "so",
  "than",
  "too",
  "very",
  "just",
  "but",
  "and",
  "or",
  "if",
  "else",
  "then",
  "new",
  "old",
  "type",
  "value",
  "data",
  "code",
  "function",
  "method",
  "class",
  "module",
  "object",
  "array",
  "string",
  "number",
  "boolean",
  "return",
  "export",
  "import",
  "default",
  "const",
  "let",
  "var",
  "async",
  "await",
  "true",
  "false",
  "null",
  "undefined",
  "File",
  "Files",
  "Added",
  "Removed",
  "Changed",
  "Updated",
  "Created",
  "Deleted",
  "Modified",
  "Renamed",
  "Moved",
  "Refactored",
  "Fixed",
  "API",
  "URL",
  "HTTP",
  "JSON",
  "HTML",
  "CSS",
  "SQL",
  "UUID",
  "ID",
  "UI",
  "DevDiff",
  "Git",
  "GitHub",
  "Node",
  "TypeScript",
  "JavaScript",
  "React",
  "Vue",
  "Express",
  "Next",
  "Vite",
  "Vitest",
]);

/**
 * Extract relative file paths from an explanation string.
 * Matches patterns like: `src/foo.ts`, src/foo/bar.js, etc.
 */
function extractFilePaths(text: string): string[] {
  // Match paths like: src/foo.ts, packages/core/src/bar.ts, ./utils.js
  const pathPattern =
    /(?:^|[\s`"'(])(\.[./]|[a-zA-Z][a-zA-Z0-9_-]*(?:\/[a-zA-Z0-9_.-]+)+(?:\.[a-zA-Z]{1,6})?)/gm;
  const found = new Set<string>();
  let match: RegExpExecArray | null;
  while ((match = pathPattern.exec(text)) !== null) {
    const candidate = match[1].replace(/^\.\//, "");
    // Filter: must look like a file path (has extension or multiple segments)
    if (candidate.includes("/") || /\.[a-z]{1,6}$/.test(candidate)) {
      found.add(candidate);
    }
  }
  return Array.from(found);
}

/**
 * Extract likely code identifiers (camelCase, PascalCase, snake_case)
 * from explanation text. Excludes common English words and short tokens.
 */
function extractCodeIdentifiers(text: string): string[] {
  // Match camelCase, PascalCase, snake_case, SCREAMING_SNAKE
  const identPattern =
    /\b([a-zA-Z][a-zA-Z0-9]*(?:[_][a-zA-Z0-9]+|[A-Z][a-z]+)[a-zA-Z0-9_]*)\b/g;
  const found = new Set<string>();
  let match: RegExpExecArray | null;
  while ((match = identPattern.exec(text)) !== null) {
    const id = match[1];
    // Skip: all-lowercase short words, pure uppercase acronyms < 4 chars, common words
    if (id.length < 4) continue;
    if (COMMON_ENGLISH.has(id)) continue;
    if (/^[A-Z]{1,3}$/.test(id)) continue; // skip short acronyms
    found.add(id);
  }
  return Array.from(found).slice(0, 20); // cap at 20 to avoid noise
}

/**
 * Get the full diff content as a flat string for identifier grepping.
 */
function flattenDiff(parsedDiff: ParseResult): string {
  return parsedDiff.files
    .flatMap((f) => f.hunks.flatMap((h) => h.lines.map((l) => l.content)))
    .join("\n");
}

/**
 * Get the file paths from a parsed diff.
 */
function getDiffFilePaths(parsedDiff: ParseResult): string[] {
  const paths: string[] = [];
  for (const file of parsedDiff.files) {
    if (file.newPath) paths.push(file.newPath);
    if (file.oldPath && file.oldPath !== file.newPath) paths.push(file.oldPath);
  }
  return paths;
}

/**
 * Check if a file path mentioned in the explanation is "close enough" to
 * a file path in the diff (handles basename matching, prefix stripping, etc.)
 */
function filePathMatchesDiff(
  mentionedPath: string,
  diffPaths: string[],
): boolean {
  const normalize = (p: string) => p.replace(/\\/g, "/").replace(/^\.\//, "");
  const norm = normalize(mentionedPath);
  const basename = norm.split("/").pop() || norm;

  return diffPaths.some((dp) => {
    const normDp = normalize(dp);
    return (
      normDp === norm ||
      normDp.endsWith("/" + norm) ||
      norm.endsWith("/" + normDp) ||
      normDp.endsWith("/" + basename) ||
      basename === normDp.split("/").pop()
    );
  });
}

/**
 * Verifies an AI-generated explanation against the actual diff content.
 *
 * Runs three checks:
 * 1. File references — all mentioned file paths should appear in the diff
 * 2. Identifier check — CamelCase/snake_case identifiers should appear in diff content
 * 3. Confidence — always returns 1.0 unless AI embeds confidence signal
 *
 * @param explanation - The AIExplanationResult from the AI provider
 * @param parsedDiff - The parsed diff to verify against
 * @returns VerificationResult with issues list
 */
export function verifyExplanation(
  explanation: AIExplanationResult,
  parsedDiff: ParseResult,
): VerificationResult {
  const issues: VerificationIssue[] = [];
  const diffPaths = getDiffFilePaths(parsedDiff);
  const diffContent = flattenDiff(parsedDiff);

  // --- 1. File reference check ---
  const allExplanationText = [
    explanation.summary,
    ...explanation.files.map((f) => `${f.path} ${f.explanation}`),
  ].join("\n");

  // Check explicit file paths in the `files` array
  const mentionedFiles: string[] = [];
  for (const fileEntry of explanation.files) {
    if (fileEntry.path && fileEntry.path !== "unknown") {
      mentionedFiles.push(fileEntry.path);
      if (!filePathMatchesDiff(fileEntry.path, diffPaths)) {
        issues.push({
          type: "file-not-in-diff",
          message: `Explanation references \`${fileEntry.path}\` but this file is not in the diff`,
          severity: "warning",
        });
      }
    }
  }

  // Also check paths extracted from the summary text
  const summaryPaths = extractFilePaths(explanation.summary);
  for (const sp of summaryPaths) {
    if (!filePathMatchesDiff(sp, diffPaths) && diffPaths.length > 0) {
      // Only flag if we have actual diff files to compare against
      // and the mentioned path doesn't look like a generic path example
      const looksSpecific =
        /\.(ts|js|tsx|jsx|py|go|rs|java|rb|php|css|html|json)$/.test(sp);
      if (looksSpecific && !mentionedFiles.includes(sp)) {
        issues.push({
          type: "file-not-in-diff",
          message: `Summary mentions \`${sp}\` which is not in the diff`,
          severity: "warning",
        });
      }
    }
  }

  // --- 2. Identifier check ---
  const checkedIdentifiers: string[] = [];
  if (diffContent.length > 0) {
    const identifiers = extractCodeIdentifiers(allExplanationText);
    for (const id of identifiers) {
      checkedIdentifiers.push(id);
      if (!diffContent.includes(id)) {
        issues.push({
          type: "identifier-not-in-diff",
          message: `Explanation mentions \`${id}\` but this identifier is not in the diff`,
          severity: "info", // Info only — identifiers may be contextually valid
        });
      }
    }
  }

  // --- 3. Confidence (default 1.0, degraded by issues) ---
  // Warnings are more significant than info
  const warningCount = issues.filter((i) => i.severity === "warning").length;
  const infoCount = issues.filter((i) => i.severity === "info").length;
  const confidence = Math.max(0, 1.0 - warningCount * 0.2 - infoCount * 0.05);

  return {
    valid: warningCount === 0,
    issues,
    confidence,
    checkedFiles: mentionedFiles,
    checkedIdentifiers,
  };
}
