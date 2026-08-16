import * as fs from "fs";
import * as path from "path";

export interface SkillSubsection {
  title: string;
  content: string[];
}

export interface SkillSection {
  title: string;
  content: string[];
  subsections: SkillSubsection[];
}

export interface ChangelogPreferences {
  groups: string[];
  rules: string[];
  example: string;
}

export interface ArchitectureInfo {
  structure: string[];
  modules: string[];
}

export interface AgentPermissions {
  allowed: string[];
  requiresPermission: string[];
}

export interface SkillDocument {
  raw: string;
  sections: SkillSection[];
  changelogPreferences: ChangelogPreferences | null;
  codeReviewPreferences: string[];
  antiPatterns: string[];
  namingConventions: Record<string, string>;
  architecture: ArchitectureInfo | null;
  permissions: AgentPermissions | null;
}

export class SkillLoader {
  /**
   * Load SKILL.md from project root, .devdiff/, or .github/
   */
  static load(workspacePath: string): SkillDocument | null {
    const locations = [
      path.join(workspacePath, "SKILL.md"),
      path.join(workspacePath, ".devdiff", "SKILL.md"),
      path.join(workspacePath, ".github", "SKILL.md"),
    ];

    for (const location of locations) {
      if (fs.existsSync(location)) {
        try {
          const content = fs.readFileSync(location, "utf-8");
          return this.parse(content);
        } catch {
          // Continue to next location
        }
      }
    }

    return null;
  }

  /**
   * Parse SKILL.md into structured sections that agents can query
   */
  static parse(content: string): SkillDocument {
    const sections: SkillSection[] = [];
    let currentSection: SkillSection | null = null;

    for (const line of content.split("\n")) {
      // New section
      if (line.startsWith("## ")) {
        if (currentSection) {
          sections.push(currentSection);
        }

        currentSection = {
          title: line.replace("## ", "").trim(),
          content: [],
          subsections: [],
        };
        continue;
      }

      // New subsection
      if (line.startsWith("### ")) {
        if (currentSection) {
          currentSection.subsections.push({
            title: line.replace("### ", "").trim(),
            content: [],
          });
        }
        continue;
      }

      // Content
      if (currentSection) {
        const activeSubsection =
          currentSection.subsections.length > 0
            ? currentSection.subsections[currentSection.subsections.length - 1]
            : null;

        if (activeSubsection) {
          activeSubsection.content.push(line);
        } else {
          currentSection.content.push(line);
        }
      }
    }

    if (currentSection) {
      sections.push(currentSection);
    }

    return {
      raw: content,
      sections,
      changelogPreferences: this.extractChangelogPreferences(sections),
      codeReviewPreferences: this.extractCodeReviewPreferences(sections),
      antiPatterns: this.extractAntiPatterns(sections),
      namingConventions: this.extractNamingConventions(sections),
      architecture: this.extractArchitecture(sections),
      permissions: this.extractPermissions(sections),
    };
  }

  /**
   * Auto-generate a standard SKILL.md for a project
   */
  static generate(workspacePath: string): string {
    let projectName = path.basename(workspacePath);
    let techStack: string[] = ["TypeScript", "Node.js"];

    const pkgPath = path.join(workspacePath, "package.json");
    if (fs.existsSync(pkgPath)) {
      try {
        const pkgJson = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
        if (pkgJson.name) projectName = pkgJson.name;

        const deps = { ...pkgJson.dependencies, ...pkgJson.devDependencies };
        if (deps.react) techStack.push("React");
        if (deps.next) techStack.push("Next.js");
        if (deps.prisma) techStack.push("Prisma ORM");
        if (deps.vitest) techStack.push("Vitest");
      } catch {
        // Skip
      }
    }

    return [
      `# SKILL.md — Project Knowledge Base`,
      ``,
      `> **Version:** 1.0.0`,
      `> **Last Updated:** ${new Date().toISOString().split("T")[0]}`,
      `> **Purpose:** Teach every AI agent how to work with this codebase.`,
      ``,
      `---`,
      ``,
      `## 1. Project Identity`,
      ``,
      `### What This Project Does`,
      `${projectName} — intelligent software application.`,
      ``,
      `### Tech Stack`,
      ...techStack.map((t) => `- **Framework/Library:** ${t}`),
      ``,
      `---`,
      ``,
      `## 2. Architecture`,
      ``,
      `### Directory Structure`,
      `\`\`\``,
      `src/`,
      `├── components/   — UI components`,
      `├── services/     — Business logic layer`,
      `└── utils/        — Pure utility functions`,
      `\`\`\``,
      ``,
      `---`,
      ``,
      `## 3. Naming Conventions`,
      ``,
      `- **Components:** PascalCase (\`Button.tsx\`)`,
      `- **Services:** camelCase (\`authService.ts\`)`,
      `- **Functions:** camelCase (\`getUser\`)`,
      ``,
      `---`,
      ``,
      `## 4. Changelog Preferences`,
      ``,
      `Group changes by: **Added**, **Changed**, **Fixed**, **Removed**, **Security**`,
      `- Include file paths in backticks`,
      `- Use past tense: "Added", "Fixed", "Updated"`,
      `- Never use AI-sounding language ("appears to", "seems like")`,
      ``,
      `---`,
      ``,
      `## 5. Code Review Preferences`,
      ``,
      `1. Security: No hardcoded secrets`,
      `2. Performance: Avoid redundant loops`,
      `3. Error Handling: All async calls wrapped in try/catch`,
      ``,
      `---`,
      ``,
      `## 6. Anti-Patterns — What Agents MUST NOT Suggest`,
      ``,
      `1. ❌ Never suggest storing API keys in source code`,
      `2. ❌ Never suggest disabling TypeScript strict mode`,
      `3. ❌ Never suggest removing error handling`,
      ``,
      `---`,
      ``,
      `## 7. Agent Permissions`,
      ``,
      `- ✅ Read any file in the project`,
      `- ✅ Suggest code changes`,
      `- ✅ Generate changelogs`,
      `- ⚠️ Modifying configuration files`,
      `- ⚠️ Installing dependencies`,
      ``,
      `---`,
      ``,
      `## 8. Communication Style`,
      ``,
      `- Be direct and concise`,
      `- Cite specific file paths and line numbers`,
    ].join("\n");
  }

  /**
   * Validate SKILL.md content
   */
  static validate(content: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!content.includes("# SKILL.md")) {
      errors.push("Missing `# SKILL.md` root heading");
    }

    const requiredSections = [
      "Project Identity",
      "Architecture",
      "Naming Conventions",
      "Changelog Preferences",
    ];

    for (const section of requiredSections) {
      if (
        !content.includes(`## ${section}`) &&
        !content.toLowerCase().includes(section.toLowerCase())
      ) {
        errors.push(`Missing section: \`## ${section}\``);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  private static extractChangelogPreferences(
    sections: SkillSection[],
  ): ChangelogPreferences | null {
    const section = sections.find((s) =>
      s.title.toLowerCase().includes("changelog"),
    );
    if (!section) return null;

    const preferences: ChangelogPreferences = {
      groups: [],
      rules: [],
      example: "",
    };

    const allLines = [
      ...section.content,
      ...section.subsections.flatMap((sub) => sub.content),
    ];

    for (const line of allLines) {
      if (line.includes("MUST") || line.startsWith("-")) {
        preferences.rules.push(line.trim());
      }
      if (line.includes("Group changes by")) {
        const groups = line.match(/\*\*(.+?)\*\*/g);
        if (groups) {
          preferences.groups = groups.map((g) => g.replace(/\*/g, ""));
        }
      }
    }

    return preferences;
  }

  private static extractCodeReviewPreferences(
    sections: SkillSection[],
  ): string[] {
    const section = sections.find((s) =>
      s.title.toLowerCase().includes("code review"),
    );
    if (!section) return [];

    const allLines = [
      ...section.content,
      ...section.subsections.flatMap((sub) => sub.content),
    ];

    return allLines
      .filter((line) => line.match(/^\d+\./))
      .map((line) => line.trim());
  }

  private static extractAntiPatterns(sections: SkillSection[]): string[] {
    const section = sections.find((s) =>
      s.title.toLowerCase().includes("anti-pattern"),
    );
    if (!section) return [];

    const allLines = [
      ...section.content,
      ...section.subsections.flatMap((sub) => sub.content),
    ];

    return allLines
      .filter((line) => line.includes("❌"))
      .map((line) => line.trim());
  }

  private static extractNamingConventions(
    sections: SkillSection[],
  ): Record<string, string> {
    const section = sections.find((s) =>
      s.title.toLowerCase().includes("naming"),
    );
    if (!section) return {};

    const conventions: Record<string, string> = {};
    const allLines = [
      ...section.content,
      ...section.subsections.flatMap((sub) => sub.content),
    ];

    for (const line of allLines) {
      const match = line.match(/\*\*(.+?)\*\*:\s*(.+)/);
      if (match) {
        conventions[match[1].toLowerCase()] = match[2].trim();
      }
    }

    return conventions;
  }

  private static extractArchitecture(
    sections: SkillSection[],
  ): ArchitectureInfo | null {
    const section = sections.find((s) =>
      s.title.toLowerCase().includes("architecture"),
    );
    if (!section) return null;

    return {
      structure: section.content
        .filter((line) => line.startsWith("-"))
        .map((line) => line.trim()),
      modules: section.subsections
        .filter((sub) => sub.title.toLowerCase().includes("key modules"))
        .flatMap((sub) => sub.content),
    };
  }

  private static extractPermissions(
    sections: SkillSection[],
  ): AgentPermissions | null {
    const section = sections.find((s) =>
      s.title.toLowerCase().includes("permission"),
    );
    if (!section) return null;

    const allowed: string[] = [];
    const requiresPermission: string[] = [];
    const allLines = [
      ...section.content,
      ...section.subsections.flatMap((sub) => sub.content),
    ];

    for (const line of allLines) {
      if (line.includes("✅")) allowed.push(line.trim());
      if (line.includes("⚠️")) requiresPermission.push(line.trim());
    }

    return { allowed, requiresPermission };
  }
}
