import {
  AIProvider,
  AIExplanationResult,
} from "./base";

/**
 * MockAIProvider — deterministic AI provider for use in tests and dry-run mode.
 * Returns a fixed response without making any network calls.
 */
export class MockAIProvider implements AIProvider {
  name = "mock";

  private _response: Partial<AIExplanationResult>;

  constructor(response?: Partial<AIExplanationResult>) {
    this._response = response || {};
  }

  async generateExplanation(
    diffText: string,
    modelName: string,
  ): Promise<AIExplanationResult> {
    // Count additions/deletions for a realistic-looking response
    const additions = (diffText.match(/^\+[^+]/gm) || []).length;
    const deletions = (diffText.match(/^-[^-]/gm) || []).length;
    const files = [...new Set(
      (diffText.match(/^diff --git a\/(.+) b\/.+$/gm) || []).map((l) =>
        l.replace(/^diff --git a\/(.+) b\/.+$/, "$1")
      )
    )];

    return {
      summary:
        this._response.summary ||
        `[Mock] ${additions} additions and ${deletions} deletions across ${files.length || 1} file(s).`,
      impact: this._response.impact || (additions + deletions > 100 ? "major" : "minor"),
      breaking: this._response.breaking ?? false,
      files: this._response.files ||
        files.map((path) => ({
          path,
          explanation: `[Mock] Changes detected in ${path}`,
        })),
      relatedIssues: this._response.relatedIssues || [],
    };
  }
}
