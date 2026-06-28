import { AIExplanationResult } from "../ai/providers/base";

export function formatMarkdown(result: AIExplanationResult): string {
  const dateStr = new Date().toISOString().split("T")[0];
  let md = `## [DevDiff] Changelog - ${dateStr}\n\n`;

  md += `### Summary\n${result.summary}\n\n`;

  if (result.breaking) {
    md += `> [!CAUTION]\n> **BREAKING CHANGE**\n> This release contains breaking changes. Please verify migration guides.\n\n`;
  }

  md += `### Impact Level: \`${result.impact.toUpperCase()}\`\n\n`;

  if (result.files && result.files.length > 0) {
    md += `### File Changes\n\n`;
    for (const f of result.files) {
      md += `- **\`${f.path}\`**: ${f.explanation}\n`;
    }
    md += "\n";
  }

  if (result.relatedIssues && result.relatedIssues.length > 0) {
    md += `### Related Issues\n\n`;
    for (const issue of result.relatedIssues) {
      md += `- ${issue}\n`;
    }
    md += "\n";
  }

  return md;
}
