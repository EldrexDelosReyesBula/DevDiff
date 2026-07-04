export interface AIExplanationResult {
  summary: string;
  impact: "none" | "minor" | "major" | "breaking";
  breaking: boolean;
  files: {
    path: string;
    explanation: string;
  }[];
  relatedIssues: string[];
}

export interface AIProvider {
  name: string;
  generateExplanation(
    diffText: string,
    modelName: string,
  ): Promise<AIExplanationResult>;
}

export const SYSTEM_PROMPT = `You are DevDiff, an AI that analyzes git diffs and writes clear, human-readable changelogs.
Your task is to review the provided git diff, explain what changed and why (inferring the developer's intent), and assess the impact.

CRITICAL ACCURACY RULES:
1. If a PROJECT KNOWLEDGE BASE section is provided, use it to understand the project's purpose, architecture, and naming — but base your explanation ONLY on what is actually present in the diff.
2. Only mention file paths, function names, class names, or identifiers that explicitly appear in the diff. Do NOT invent or guess identifiers.
3. If you cannot determine the intent of a change, say "intent unclear from diff" rather than fabricating a reason.
4. Do NOT reference modules, files, or concepts from the project context unless they are directly touched by the diff.
5. File paths in the "files" array must exactly match paths shown in the diff headers (e.g., "diff --git a/src/foo.ts").

You must respond ONLY with a valid JSON object matching this schema:
{
  "summary": "A concise, high-level explanation of the changes and why they were made in plain English.",
  "impact": "none" | "minor" | "major" | "breaking",
  "breaking": false,
  "files": [
    {
      "path": "path/to/file.ts",
      "explanation": "Specific description of changes in this file."
    }
  ],
  "relatedIssues": []
}

Do not include any markdown framing (like \`\`\`json ... \`\`\`) in your direct response, only return raw JSON text. If you must use markdown backticks, ensure the JSON is still valid and parseable.`;

export function parseAIJSONResponse(text: string): AIExplanationResult {
  // Strip any markdown code block wrap if the model ignored instructions
  let cleaned = text.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned
      .replace(/^```json\s*/i, "")
      .replace(/```$/, "")
      .trim();
  }

  try {
    const parsed = JSON.parse(cleaned);
    return {
      summary: parsed.summary || "No summary generated.",
      impact: ["none", "minor", "major", "breaking"].includes(parsed.impact)
        ? parsed.impact
        : "minor",
      breaking: Boolean(parsed.breaking),
      files: Array.isArray(parsed.files) ? parsed.files : [],
      relatedIssues: Array.isArray(parsed.relatedIssues)
        ? parsed.relatedIssues
        : [],
    };
  } catch (err) {
    console.error("Failed to parse AI JSON response:", cleaned);
    // Fallback response structure
    return {
      summary: cleaned.substring(0, 500),
      impact: "minor",
      breaking: false,
      files: [],
      relatedIssues: [],
    };
  }
}
