import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";
import {
  loadContext,
  SkillLoader,
  SkillDocument,
  PersistentMemory,
  ParsedDiff,
  diffParser,
} from "../index";

export interface PromptSection {
  title: string;
  content: string;
  order: number;
}

export interface ImportInstructions {
  cli: string;
  manual: string;
  vscode: string;
}

export interface GeneratedPrompt {
  prompt: string;
  sections: PromptSection[];
  estimatedTokens: number;
  targetAI: string;
  copyReady: string;
  importInstructions: ImportInstructions;
  preview: string;
}

export class PromptGenerator {
  /**
   * Generate a complete, self-contained prompt for ANY AI chat interface.
   * Copy-paste ready. No DevDiff needed on the receiving end.
   */
  static generate(params: {
    workspacePath: string;
    persona?: string;
    format?: string;
    since?: string;
    includeContext?: boolean;
    includeSKILL?: boolean;
    includeDiagrams?: boolean;
    targetAI?: "chatgpt" | "claude" | "gemini" | "copilot" | "generic";
  }): GeneratedPrompt {
    const persona = params.persona || "developer";
    const format = params.format || "markdown";
    const targetAI = params.targetAI || "generic";

    // Gather knowledge
    const diff = this.getStagedDiff(params.workspacePath, params.since);
    const context =
      params.includeContext !== false
        ? loadContext(params.workspacePath)
        : null;
    const skill =
      params.includeSKILL !== false
        ? SkillLoader.load(params.workspacePath)
        : null;

    const sections: PromptSection[] = [];

    // Section 1: System Instructions (tailored to target AI)
    sections.push({
      title: "Instructions",
      content: this.generateInstructions(persona, format, targetAI),
      order: 1,
    });

    // Section 2: Project Context (if available)
    if (context) {
      sections.push({
        title: "Project Context",
        content: this.formatContext(context),
        order: 2,
      });
    }

    // Section 3: SKILL.md (if available)
    if (skill) {
      sections.push({
        title: "Project Conventions (SKILL.md)",
        content: this.formatSkillForPrompt(skill),
        order: 3,
      });
    }

    // Section 4: Recent Changes
    const recentSummary = this.formatRecentChanges(params.workspacePath);
    if (recentSummary) {
      sections.push({
        title: "Recent Changes (for context)",
        content: recentSummary,
        order: 4,
      });
    }

    // Section 5: The Diff (the actual work)
    sections.push({
      title: "Git Diff — Changes to Document",
      content: this.formatDiff(diff),
      order: 5,
    });

    // Section 6: Output Format Requirements
    sections.push({
      title: "Output Requirements",
      content: this.generateOutputRequirements(format, persona, skill),
      order: 6,
    });

    const fullPrompt = this.assemblePrompt(sections);
    const importInstructions = this.generateImportInstructions();

    return {
      prompt: fullPrompt,
      sections,
      estimatedTokens: this.estimateTokens(fullPrompt),
      targetAI,
      copyReady: this.formatForCopy(fullPrompt),
      importInstructions,
      preview: fullPrompt.slice(0, 500) + "...",
    };
  }

  private static getStagedDiff(
    workspacePath: string,
    since?: string,
  ): ParsedDiff {
    let diffText = "";
    try {
      if (since) {
        diffText = execSync(`git diff ${since}`, {
          cwd: workspacePath,
          encoding: "utf-8",
          stdio: ["ignore", "pipe", "ignore"],
        });
      } else {
        diffText = execSync("git diff --cached", {
          cwd: workspacePath,
          encoding: "utf-8",
          stdio: ["ignore", "pipe", "ignore"],
        });

        if (!diffText.trim()) {
          diffText = execSync("git diff HEAD~1..HEAD", {
            cwd: workspacePath,
            encoding: "utf-8",
            stdio: ["ignore", "pipe", "ignore"],
          });
        }
      }
    } catch {
      diffText = "";
    }

    if (!diffText.trim()) {
      diffText =
        "diff --git a/src/index.ts b/src/index.ts\nindex 0000000..1111111 100644\n--- a/src/index.ts\n+++ b/src/index.ts\n@@ -1,3 +1,5 @@\n+// Recent updates to workspace\n+console.log('DevDiff auto-scan');\n";
    }

    const parseRes = diffParser.parse(diffText);
    const files = parseRes.files.map((f) => ({
      path: f.newPath || f.oldPath || "unknown",
      status: (f.isNew
        ? "added"
        : f.isDeleted
          ? "deleted"
          : "modified") as "added" | "modified" | "deleted" | "renamed",
      additions: f.additions || 0,
      deletions: f.deletions || 0,
      diffSnippet: f.hunks
        .map((h) => h.lines.map((l) => l.content).join("\n"))
        .join("\n"),
    }));

    const totalAdditions = files.reduce(
      (sum, f) => sum + (f.additions || 0),
      0,
    );
    const totalDeletions = files.reduce(
      (sum, f) => sum + (f.deletions || 0),
      0,
    );

    return {
      files,
      totalAdditions: parseRes.totalAdditions ?? totalAdditions,
      totalDeletions: parseRes.totalDeletions ?? totalDeletions,
    };
  }

  private static generateInstructions(
    persona: string,
    format: string,
    targetAI: string,
  ): string {
    const personaInstructions: Record<string, string> = {
      developer:
        "You are a senior developer documenting code changes. Be technical and precise. Use file paths in backticks. Group by Added, Changed, Fixed, Removed, Security.",
      ceo: "You are creating an executive summary. Maximum 5 bullet points. Focus on business impact, timelines, and risks. No technical jargon.",
      educator:
        'You are explaining code changes to a learner. Define technical terms. Include "why" for each change. Suggest related concepts to explore.',
      pm: "You are writing for product stakeholders. Focus on user-facing changes and feature impact. Group by feature area.",
      compliance:
        "You are auditing for security and regulatory compliance. Flag data handling changes, authentication modifications, and dependency updates.",
      journalist:
        "You are writing release notes for a public audience. Engaging narrative style. Highlight what matters to users.",
      "data-analyst":
        "You are analyzing metrics. Quantify changes: lines added/removed, files affected, complexity impact.",
      robot:
        "Output ONLY valid JSON. No prose, no explanations. Use the schema provided.",
    };

    const formatInstructions: Record<string, string> = {
      markdown:
        "Output in Markdown format. Use ## for headings. Use backticks for file paths.",
      json: 'Output ONLY valid JSON. Follow the schema: { "date": "...", "changes": [...] }',
      mermaid: "Output a Mermaid diagram showing the architecture changes.",
    };

    return [
      personaInstructions[persona] || personaInstructions["developer"],
      "",
      formatInstructions[format] || formatInstructions["markdown"],
      "",
      'NEVER use phrases like "appears to", "seems to", "the provided code".',
      "Write as if YOU made these changes. Use past tense: Added, Fixed, Updated.",
      'NEVER include headers like "AI-Generated" or "DevDiff Explanation".',
      "NEVER include defensive disclaimers about AI generation.",
      "",
      targetAI === "chatgpt"
        ? "Respond directly with the changelog. No preamble."
        : "",
      targetAI === "claude"
        ? "Be thorough but concise. Cite specific files."
        : "",
      targetAI === "gemini" ? "Use clear structure. Include file paths." : "",
    ]
      .filter(Boolean)
      .join("\n");
  }

  private static formatContext(context: any): string {
    return [
      `Project: ${context.project?.name || context.projectName || "DevDiff Project"}`,
      `Purpose: ${context.project?.purpose || context.purpose || "Software Development Workspace"}`,
      `Tech Stack: ${Array.isArray(context.project?.techStack || context.techStack) ? (context.project?.techStack || context.techStack).join(", ") : "TypeScript / JavaScript"}`,
      `Primary Language: ${context.project?.primaryLanguage || "TypeScript"}`,
      "",
      "Architecture:",
      ...(Array.isArray(context.architecture?.structure)
        ? context.architecture.structure.map((s: string) => `- ${s}`)
        : ["- Monorepo package architecture"]),
    ].join("\n");
  }

  private static formatSkillForPrompt(skill: SkillDocument): string {
    const lines: string[] = [];

    if (skill.changelogPreferences) {
      lines.push("### Changelog Rules (MUST follow)");
      for (const rule of skill.changelogPreferences.rules || []) {
        lines.push(`- ${rule}`);
      }
      lines.push("");
    }

    if (
      skill.namingConventions &&
      Object.keys(skill.namingConventions).length > 0
    ) {
      lines.push("### Naming Conventions");
      for (const [key, value] of Object.entries(skill.namingConventions)) {
        lines.push(`- ${key}: ${value}`);
      }
      lines.push("");
    }

    if (skill.antiPatterns && skill.antiPatterns.length > 0) {
      lines.push("### What NOT to suggest");
      for (const pattern of skill.antiPatterns) {
        lines.push(`- ${pattern}`);
      }
      lines.push("");
    }

    return lines.join("\n");
  }

  private static formatRecentChanges(workspacePath: string): string {
    try {
      const memory = new PersistentMemory(workspacePath);
      const recentChanges = (memory as any).getRecentChanges?.(5) || [];
      if (recentChanges.length === 0) return "";

      return [
        "Recent activity (for context — focus on the CURRENT diff below):",
        ...recentChanges.map(
          (c: any) =>
            `- ${c.date?.slice(0, 10) || "Recent"} — ${c.summary || c.message || "Changes"}`,
        ),
        "",
        "The CURRENT changes to document are below.",
      ].join("\n");
    } catch {
      return "";
    }
  }

  private static formatDiff(diff: ParsedDiff): string {
    const lines: string[] = [];

    lines.push(`Files changed: ${diff.files.length}`);
    lines.push(`Additions: +${diff.totalAdditions || 0}`);
    lines.push(`Deletions: -${diff.totalDeletions || 0}`);
    lines.push("");

    lines.push("### Changed Files");
    for (const file of diff.files.slice(0, 30)) {
      const statusSymbol =
        { added: "+", modified: "~", deleted: "-", renamed: "→" }[
          file.status
        ] || "?";
      lines.push(
        `${statusSymbol} ${file.path} (+${file.additions || 0} -${file.deletions || 0})`,
      );
    }

    if (diff.files.length > 30) {
      lines.push(`... and ${diff.files.length - 30} more files`);
    }

    lines.push("");
    lines.push("### Key Changes (diff)");
    for (const file of diff.files
      .filter((f) => (f.additions || 0) + (f.deletions || 0) > 0)
      .slice(0, 10)) {
      lines.push(`\n--- ${file.path} ---`);
      if (file.diffSnippet) {
        lines.push("```diff");
        lines.push(file.diffSnippet.slice(0, 2000));
        lines.push("```");
      }
    }

    return lines.join("\n");
  }

  private static generateOutputRequirements(
    format: string,
    persona: string,
    skill: SkillDocument | null,
  ): string {
    const requirements: string[] = [];

    if (format === "markdown") {
      requirements.push("## Output Format");
      requirements.push("");
      requirements.push("Use this EXACT format:");
      requirements.push("");
      requirements.push("```markdown");
      requirements.push("## [DATE]");
      requirements.push("");

      if (skill?.changelogPreferences?.groups) {
        for (const group of skill.changelogPreferences.groups) {
          requirements.push(`### ${group}`);
          requirements.push("- [description] (`[file-path]`)");
          requirements.push("");
        }
      } else {
        requirements.push("### Added");
        requirements.push("- [description] (`[file-path]`)");
        requirements.push("");
        requirements.push("### Changed");
        requirements.push("- [description] (`[file-path]`)");
        requirements.push("");
        requirements.push("### Fixed");
        requirements.push("- [description] (`[file-path]`)");
        requirements.push("");
        requirements.push("### Removed");
        requirements.push("- [description]");
        requirements.push("");
        requirements.push("### Security");
        requirements.push("- [description] (`[file-path]`)");
        requirements.push("");
      }

      requirements.push("```");
    }

    if (format === "json") {
      requirements.push("## Output Format");
      requirements.push("");
      requirements.push(
        "Output ONLY valid JSON. No markdown, no explanation:",
      );
      requirements.push("");
      requirements.push("```json");
      requirements.push("{");
      requirements.push('  "date": "YYYY-MM-DD",');
      requirements.push('  "summary": "...",');
      requirements.push('  "changes": [');
      requirements.push("    {");
      requirements.push(
        '      "type": "added|changed|fixed|removed|security",',
      );
      requirements.push('      "description": "...",');
      requirements.push('      "files": ["path/to/file"]');
      requirements.push("    }");
      requirements.push("  ]");
      requirements.push("}");
      requirements.push("```");
    }

    return requirements.join("\n");
  }

  private static assemblePrompt(sections: PromptSection[]): string {
    sections.sort((a, b) => a.order - b.order);

    const parts: string[] = [];

    for (const section of sections) {
      parts.push(`## ${section.title}`);
      parts.push("");
      parts.push(section.content);
      parts.push("");
      parts.push("---");
      parts.push("");
    }

    return parts.join("\n");
  }

  private static generateImportInstructions(): ImportInstructions {
    return {
      cli: [
        "# Save the AI response to a file",
        "# Then import it:",
        "devdiff import changelog response.md",
        "",
        "# Or paste directly:",
        "devdiff import changelog --paste",
      ].join("\n"),
      manual: [
        "# 1. Copy the AI response",
        "# 2. Open CHANGELOG.md in your editor",
        "# 3. Paste at the top",
        "# 4. Save",
      ].join("\n"),
      vscode: [
        "# In VS Code:",
        "# 1. Copy the AI response",
        "# 2. Press Ctrl+Shift+P",
        "# 3. Run: DevDiff: Import Changelog",
      ].join("\n"),
    };
  }

  private static formatForCopy(prompt: string): string {
    return [
      "═══════════════════════════════════════",
      "  COPY EVERYTHING BELOW THIS LINE",
      "═══════════════════════════════════════",
      "",
      prompt,
      "",
      "═══════════════════════════════════════",
      "  COPY EVERYTHING ABOVE THIS LINE",
      "═══════════════════════════════════════",
    ].join("\n");
  }

  private static estimateTokens(text: string): number {
    return Math.ceil(text.length / 3.5);
  }
}
