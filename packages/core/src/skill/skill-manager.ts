import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";

export interface SkillCoverage {
  projectIdentity: boolean;
  architecture: boolean;
  namingConventions: boolean;
  businessDomain: boolean;
  patterns: boolean;
  antiPatterns: boolean;
  compliance: boolean;
  outputPreferences: boolean;
  teamContext: boolean;
  historicalContext: boolean;
  coverageScore: number;
}

export class SkillManager {
  private workspaceRoot: string;
  private skillPath: string;

  constructor(workspaceRoot: string = process.cwd()) {
    this.workspaceRoot = workspaceRoot;
    this.skillPath = path.join(this.workspaceRoot, ".devdiff", "SKILL.md");
  }

  /**
   * Auto-generate SKILL.md by scanning project structure, package manifests, and README
   */
  async generate(): Promise<string> {
    const devdiffDir = path.join(this.workspaceRoot, ".devdiff");
    if (!fs.existsSync(devdiffDir)) {
      fs.mkdirSync(devdiffDir, { recursive: true });
    }

    let projectName = path.basename(this.workspaceRoot);
    let description = "Project codebase analyzed and indexed by DevDiff.";
    let dependencies: string[] = [];
    let scripts: string[] = [];

    const pkgPath = path.join(this.workspaceRoot, "package.json");
    if (fs.existsSync(pkgPath)) {
      try {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
        if (pkg.name) projectName = pkg.name;
        if (pkg.description) description = pkg.description;
        dependencies = [
          ...Object.keys(pkg.dependencies || {}),
          ...Object.keys(pkg.devDependencies || {}),
        ];
        scripts = Object.keys(pkg.scripts || {});
      } catch (e) {
        // ignore parse error
      }
    }

    let gitHistorySummary = "";
    try {
      gitHistorySummary = execSync(
        'git log -n 5 --pretty=format:"| %cd | %s |"',
        { cwd: this.workspaceRoot, encoding: "utf-8" },
      );
    } catch (e) {
      gitHistorySummary = "| Recent | Workspace initialized |";
    }

    const template = `# SKILL.md — Project Knowledge Base

> **Version:** 1.5.0  
> **Last Updated:** ${new Date().toISOString().split("T")[0]}  
> **Purpose:** Teach DevDiff's AI how to understand this codebase accurately.

---

## 1. Project Identity

### What This Project Does
${description}

### Tech Stack
- **Project Name:** ${projectName}
- **Primary Dependencies:** ${dependencies.slice(0, 8).join(", ") || "TypeScript / JavaScript"}
- **Available Scripts:** ${scripts.slice(0, 6).join(", ") || "build, test, dev"}

---

## 2. Architecture

### Directory Structure
\`\`\`
.devdiff/       — DevDiff local persistent memory & skill configuration
src/            — Primary source code modules
packages/       — Monorepo workspaces (if applicable)
docs/           — Documentation & user guides
\`\`\`

---

## 3. Naming Conventions

### Files & Code
- **Components & Classes:** PascalCase (\`UserProfile.tsx\`, \`SkillManager.ts\`)
- **Functions & Hooks:** camelCase (\`generateSkill\`, \`useAuth.ts\`)
- **Constants:** UPPER_SNAKE_CASE (\`MAX_RETRY_COUNT\`)

---

## 4. Business Domain

### Key Terminology
| Term | Definition |
|------|-----------|
| **Diff** | Code modification delta between commits |
| **Snapshot** | Indexed state of workspace entities |
| **AST** | Abstract Syntax Tree structural representation |

---

## 5. Patterns the AI Should Recognize

- Changes to configuration files trigger validation checks.
- Code modifications require unit or integration test updates.

---

## 6. Anti-Patterns — What NOT to Suggest

1. ❌ Never suggest storing secrets or credentials in source code.
2. ❌ Never suggest removing error handling or log boundaries.
3. ❌ Never suggest hardcoding environment-specific absolute paths.

---

## 7. Compliance Requirements

- ✅ Security redaction enforced for API keys and tokens.
- ✅ Privacy protection active for all dry-run exports.

---

## 8. Output Preferences

- **Default Persona:** developer
- **Include:** File paths, function names, breaking changes
- **Exclude:** Trivial comment formatting changes

---

## 9. Team Context

- **Code Review:** All pull requests require green CI builds and test passes.

---

## 10. Historical Context

### Recent Changes
| Date | Change |
|------|--------|
${gitHistorySummary || "| Initial | Project setup |"}
`;

    fs.writeFileSync(this.skillPath, template, "utf-8");
    return this.skillPath;
  }

  /**
   * Validate SKILL.md for completeness across all 10 required sections
   */
  validate(): SkillCoverage {
    if (!fs.existsSync(this.skillPath)) {
      return {
        projectIdentity: false,
        architecture: false,
        namingConventions: false,
        businessDomain: false,
        patterns: false,
        antiPatterns: false,
        compliance: false,
        outputPreferences: false,
        teamContext: false,
        historicalContext: false,
        coverageScore: 0,
      };
    }

    const content = fs.readFileSync(this.skillPath, "utf-8");

    const checks = {
      projectIdentity: /Project Identity/i.test(content),
      architecture: /Architecture/i.test(content),
      namingConventions: /Naming Conventions/i.test(content),
      businessDomain: /Business Domain/i.test(content),
      patterns: /Patterns/i.test(content),
      antiPatterns: /Anti-Patterns/i.test(content),
      compliance: /Compliance/i.test(content),
      outputPreferences: /Output Preferences/i.test(content),
      teamContext: /Team Context/i.test(content),
      historicalContext: /Historical Context/i.test(content),
    };

    const passedCount = Object.values(checks).filter(Boolean).length;
    const coverageScore = Math.round((passedCount / 10) * 100);

    return {
      ...checks,
      coverageScore,
    };
  }

  getSkillPath(): string {
    return this.skillPath;
  }
}
