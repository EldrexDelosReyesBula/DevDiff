export interface ParsedDiff {
  projectName?: string;
  primaryLanguage?: string;
  files: Array<{
    path: string;
    status: "added" | "modified" | "deleted" | "renamed";
    additions?: number;
    deletions?: number;
    diffSnippet?: string;
  }>;
  totalAdditions?: number;
  totalDeletions?: number;
}

export class OptimizedPrompts {
  /**
   * Generate changelog prompt — minimal tokens, maximum accuracy
   */
  static changelog(diff: ParsedDiff, persona: string): string {
    const parts: string[] = [];

    // Project context — 1 line max
    if (diff.projectName) {
      parts.push(
        `Project: ${diff.projectName} (${diff.primaryLanguage || "TypeScript"})`,
      );
    }

    const additions =
      diff.totalAdditions ??
      diff.files.reduce((acc, f) => acc + (f.additions || 0), 0);
    const deletions =
      diff.totalDeletions ??
      diff.files.reduce((acc, f) => acc + (f.deletions || 0), 0);

    // Changes summary — 1 line
    parts.push(
      `Files: ${diff.files.length} changed (+${additions} -${deletions})`,
    );

    // ── The diff — the important part ──
    parts.push("");
    parts.push("```diff");
    parts.push(this.compactDiff(diff));
    parts.push("```");

    // ── Minimal instruction (not verbose system prompt) ──
    parts.push("");
    parts.push(this.getPersonaInstruction(persona));

    return parts.join("\n");
  }

  /**
   * Compress diff to essential information only
   */
  private static compactDiff(diff: ParsedDiff): string {
    const lines: string[] = [];

    for (const file of (diff.files || []).slice(0, 20)) {
      const statusMap: Record<string, string> = {
        added: "A",
        modified: "M",
        deleted: "D",
        renamed: "R",
      };
      const status = statusMap[file.status] || "?";

      lines.push(
        `${status} ${file.path} (+${file.additions || 0} -${file.deletions || 0})`,
      );

      if (file.diffSnippet) {
        const snippet = file.diffSnippet
          .split("\n")
          .filter((line) => line.startsWith("+") || line.startsWith("-"))
          .slice(0, 15)
          .join("\n");

        if (snippet) {
          lines.push(snippet);
          lines.push("");
        }
      }
    }

    if (diff.files.length > 20) {
      lines.push(`... ${diff.files.length - 20} more files`);
    }

    return lines.join("\n");
  }

  /**
   * Persona instruction — 2 lines max
   */
  private static getPersonaInstruction(persona: string): string {
    const instructions: Record<string, string> = {
      developer:
        "Generate changelog in standard format (Added/Changed/Fixed/Removed). Be specific with file paths and function names. Use past tense.",
      ceo: "Generate 3 bullet points summarizing business impact. No technical details.",
      educator: "Explain changes clearly with context. Define technical terms.",
      pm: "Focus on user-facing changes and feature impact. Group by feature.",
      compliance:
        "Focus on security implications, data handling, and regulatory impact.",
      robot:
        "Output structured JSON with files, functions, impact scores. No prose.",
      journalist:
        "Write a narrative summary suitable for a blog post or release announcement.",
      "data-analyst":
        "Focus on metrics: lines changed, files affected, complexity impact.",
    };

    return instructions[persona] || instructions["developer"];
  }
}

/**
 * Token budget — strict limits per operation
 */
export const TOKEN_BUDGETS = {
  changelog: {
    maxPromptTokens: 3000, // Never exceed this
    maxResponseTokens: 1500, // Response must fit in this
    targetPromptTokens: 1500, // Optimal size
  },
  explanation: {
    maxPromptTokens: 2000,
    maxResponseTokens: 1000,
    targetPromptTokens: 1000,
  },
  qa: {
    maxPromptTokens: 2500,
    maxResponseTokens: 800,
    targetPromptTokens: 1200,
  },
  security: {
    maxPromptTokens: 4000,
    maxResponseTokens: 2000,
    targetPromptTokens: 2000,
  },
};
