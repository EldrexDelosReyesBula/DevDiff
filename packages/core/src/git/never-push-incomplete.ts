import { CompletenessValidator } from "../output/completeness-validator";

export class IncompleteOutputError extends Error {
  public readonly issues: string[];

  constructor(message: string, issues: string[]) {
    super(message);
    this.name = "IncompleteOutputError";
    this.issues = issues;
  }
}

export class NeverPushIncomplete {
  /**
   * Before any git operation, verify output is complete.
   * BLOCKS commit/push if output is incomplete.
   */
  static async guard(output: string, operation: "commit" | "push" | "pr"): Promise<void> {
    const validation = CompletenessValidator.validate(output);

    if (!validation.complete) {
      const message = [
        "",
        `🛑 BLOCKED: Cannot ${operation} — generated output is incomplete.`,
        "",
        "Issues found:",
        ...validation.issues.map((i) => `  • ${i}`),
        "",
        "The output has NOT been committed or pushed.",
        "Run generation again to get complete output.",
        "",
        "Tip: If AI is timing out, try:",
        "  • devdiff generate --depth minimal",
        "  • git add <specific files> (fewer files at once)",
        "  • Use a faster AI model",
        "",
      ].join("\n");

      console.log(message);

      throw new IncompleteOutputError(
        `Cannot ${operation}: output is incomplete`,
        validation.issues
      );
    }

    if (validation.quality === "poor") {
      console.log("");
      console.log("⚠️  Output quality is below threshold.");
      console.log("   The output may not be ideal. Review before sharing.");
      console.log("");
    }
  }
}
