import * as fs from "fs";
import * as path from "path";
import {
  SkillLoader,
  SkillDocument,
  SkillSection,
  ArchitectureInfo,
  ChangelogPreferences,
  AgentPermissions,
} from "../skill/skill-loader";

export interface ProjectKnowledge {
  name: string;
  purpose: string;
  techStack: string[];
  primaryLanguage: string;
}

export interface UnifiedKnowledge {
  source: "SKILL.md" | "context.md" | "auto-generated";
  project: ProjectKnowledge;
  architecture?: ArchitectureInfo | null;
  conventions?: Record<string, string>;
  preferences?: {
    changelog?: ChangelogPreferences | null;
    codeReview?: string[];
    antiPatterns?: string[];
  };
  permissions?: AgentPermissions | null;
  lastUpdated: string;
}

export class UnifiedContext {
  /**
   * Load the unified knowledge layer.
   * Priority: SKILL.md > context.md > auto-generate
   */
  static async load(workspacePath: string): Promise<UnifiedKnowledge> {
    // ── Step 1: Try SKILL.md first (most complete) ──
    const skill = SkillLoader.load(workspacePath);

    if (skill && skill.sections.length >= 2) {
      return {
        source: "SKILL.md",
        project: this.extractProjectFromSkill(skill, workspacePath),
        architecture: skill.architecture,
        conventions: skill.namingConventions,
        preferences: {
          changelog: skill.changelogPreferences,
          codeReview: skill.codeReviewPreferences,
          antiPatterns: skill.antiPatterns,
        },
        permissions: skill.permissions,
        lastUpdated: this.getLastModified(path.join(workspacePath, "SKILL.md")),
      };
    }

    // ── Step 2: Fall back to context.md ──
    const contextPath = path.join(workspacePath, ".devdiff", "context.md");

    if (fs.existsSync(contextPath)) {
      try {
        const contextContent = fs.readFileSync(contextPath, "utf-8");
        return {
          source: "context.md",
          project: this.extractProjectFromContext(contextContent, workspacePath),
          lastUpdated: this.getLastModified(contextPath),
        };
      } catch {
        // Fall back to auto-generate
      }
    }

    // ── Step 3: Auto-generate as last resort ──
    const generated = await this.autoGenerate(workspacePath);

    return {
      source: "auto-generated",
      project: generated,
      lastUpdated: new Date().toISOString(),
    };
  }

  /**
   * Extract structured project info from SKILL.md
   */
  private static extractProjectFromSkill(
    skill: SkillDocument,
    workspacePath: string
  ): ProjectKnowledge {
    const identitySection = skill.sections.find(
      (s) =>
        s.title.toLowerCase().includes("project identity") ||
        s.title.toLowerCase().includes("overview")
    );

    return {
      name:
        this.extractField(identitySection, "name") || path.basename(workspacePath),
      purpose:
        this.extractField(identitySection, "purpose") ||
        identitySection?.content.slice(0, 3).join(" ") ||
        `${path.basename(workspacePath)} application`,
      techStack: this.extractListField(identitySection, "tech stack"),
      primaryLanguage: this.detectPrimaryLanguage(skill),
    };
  }

  /**
   * Extract project info from legacy context.md format
   */
  private static extractProjectFromContext(
    content: string,
    workspacePath: string
  ): ProjectKnowledge {
    const lines = content.split("\n");

    const projectLine = lines.find((l) => l.startsWith("# Project:"));
    const purposeLine = lines.find((l) => l.startsWith("## Purpose"));
    const techLine = lines.find((l) => l.startsWith("## Tech Stack"));

    return {
      name:
        projectLine?.replace("# Project:", "").trim() || path.basename(workspacePath),
      purpose: purposeLine
        ? lines
          .slice(lines.indexOf(purposeLine) + 1, lines.indexOf(purposeLine) + 4)
          .join(" ")
          .trim()
        : "",
      techStack: techLine
        ? lines
          .slice(lines.indexOf(techLine) + 1, lines.indexOf(techLine) + 5)
          .map((l) => l.replace("- ", "").trim())
        : [],
      primaryLanguage: this.detectLanguageFromTechStack(content),
    };
  }

  /**
   * Auto-generate minimal context as last resort
   */
  private static async autoGenerate(workspacePath: string): Promise<ProjectKnowledge> {
    const files = await this.scanProject(workspacePath);
    const extensions = this.countExtensions(files);
    const primaryExt = Object.entries(extensions).sort((a, b) => b[1] - a[1])[0];

    return {
      name: path.basename(workspacePath),
      purpose: `${path.basename(workspacePath)} project`,
      techStack: [],
      primaryLanguage: this.mapExtensionToLanguage(primaryExt?.[0] || ".ts"),
    };
  }

  private static extractField(
    section: SkillSection | undefined,
    field: string
  ): string | null {
    if (!section) return null;

    const line = section.content.find((l) =>
      l.toLowerCase().includes(field.toLowerCase())
    );

    return (
      line
        ?.replace(/^[*-]\s*/, "")
        .replace(/\*\*/g, "")
        .trim() || null
    );
  }

  private static extractListField(
    section: SkillSection | undefined,
    field: string
  ): string[] {
    if (!section) return [];

    const startIndex = section.content.findIndex((l) =>
      l.toLowerCase().includes(field.toLowerCase())
    );

    if (startIndex === -1) return [];

    return section.content
      .slice(startIndex + 1)
      .filter((l) => l.startsWith("-") || l.startsWith("*"))
      .map((l) => l.replace(/^[*-]\s*/, "").replace(/\*\*/g, "").trim());
  }

  private static detectPrimaryLanguage(skill: SkillDocument): string {
    const techSection = skill.sections.find((s) =>
      s.title.toLowerCase().includes("tech stack")
    );
    if (!techSection) return "TypeScript";

    const content = techSection.content.join(" ").toLowerCase();

    if (content.includes("typescript")) return "TypeScript";
    if (content.includes("javascript")) return "JavaScript";
    if (content.includes("python")) return "Python";
    if (content.includes("go")) return "Go";
    if (content.includes("rust")) return "Rust";
    if (content.includes("java")) return "Java";

    return "TypeScript";
  }

  private static detectLanguageFromTechStack(content: string): string {
    const lower = content.toLowerCase();
    if (lower.includes("typescript")) return "TypeScript";
    if (lower.includes("javascript")) return "JavaScript";
    if (lower.includes("python")) return "Python";
    return "TypeScript";
  }

  private static mapExtensionToLanguage(ext: string): string {
    const map: Record<string, string> = {
      ".ts": "TypeScript",
      ".tsx": "TypeScript",
      ".js": "JavaScript",
      ".jsx": "JavaScript",
      ".py": "Python",
      ".go": "Go",
      ".rs": "Rust",
      ".java": "Java",
      ".rb": "Ruby",
      ".php": "PHP",
    };
    return map[ext] || ext.replace(".", "").toUpperCase();
  }

  private static async scanProject(workspacePath: string): Promise<string[]> {
    const fileList: string[] = [];

    const walk = (dir: string) => {
      try {
        if (!fs.existsSync(dir)) return;
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          if (entry.name.startsWith(".") || entry.name === "node_modules" || entry.name === "dist") {
            continue;
          }
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            walk(fullPath);
          } else if (entry.isFile()) {
            fileList.push(fullPath);
          }
        }
      } catch {
        // Ignore
      }
    };

    walk(workspacePath);
    return fileList;
  }

  private static countExtensions(files: string[]): Record<string, number> {
    const counts: Record<string, number> = {};
    for (const file of files) {
      const ext = path.extname(file);
      if (ext) {
        counts[ext] = (counts[ext] || 0) + 1;
      }
    }
    return counts;
  }

  private static getLastModified(filePath: string): string {
    try {
      return fs.statSync(filePath).mtime.toISOString();
    } catch {
      return new Date().toISOString();
    }
  }
}
