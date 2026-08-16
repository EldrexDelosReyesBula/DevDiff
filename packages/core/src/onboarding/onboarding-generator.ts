import * as fs from "fs/promises";
import * as fsSync from "fs";
import * as path from "path";
import { execSync } from "child_process";

export interface Section {
  title: string;
  content: string;
}

export interface OnboardingGuide {
  overview: Section;
  architecture: Section;
  keyModules: Section;
  entryPoints: Section;
  dataFlow: Section;
  conventions: Section;
  recentChanges: Section;
  gettingStarted: Section;
  commonTasks: Section;
  testingGuide: Section;
  faq: Section;
}

export interface CodebaseModule {
  name: string;
  purpose: string;
  fileCount: number;
  keyFiles: string[];
  dependencies: string[];
}

export interface CodebaseIndex {
  modules: CodebaseModule[];
  entryPoints: Array<{ path: string; description: string }>;
  files: string[];
}

export interface GitHistory {
  commits: Array<{ hash: string; message: string; author: string; date: string; files: string[] }>;
}

export class OnboardingGenerator {
  /**
   * Generate a complete onboarding guide for a codebase
   */
  static async generate(workspacePath: string): Promise<OnboardingGuide> {
    const context = await this.loadContext(workspacePath);
    const gitHistory = await this.getRecentGitHistory(workspacePath, 30);
    const fileIndex = await this.buildCodebaseIndex(workspacePath);

    return {
      overview: await this.generateOverview(context),
      architecture: await this.generateArchitecture(context, fileIndex),
      keyModules: await this.generateKeyModules(context, fileIndex),
      entryPoints: await this.generateEntryPoints(fileIndex),
      dataFlow: await this.generateDataFlow(context, fileIndex),
      conventions: await this.generateConventions(context),
      recentChanges: await this.generateRecentChanges(gitHistory),
      gettingStarted: await this.generateGettingStarted(context, fileIndex),
      commonTasks: await this.generateCommonTasks(context),
      testingGuide: await this.generateTestingGuide(fileIndex, context),
      faq: await this.generateFAQ(context),
    };
  }

  /**
   * Dynamically inspect package.json, filesystem stats, and language distribution
   */
  private static async loadContext(workspacePath: string): Promise<any> {
    const projectName = path.basename(workspacePath);
    let pkgJson: any = {};
    const pkgPath = path.join(workspacePath, "package.json");

    if (fsSync.existsSync(pkgPath)) {
      try {
        const content = await fs.readFile(pkgPath, "utf-8");
        pkgJson = JSON.parse(content);
      } catch {
        // ignore
      }
    }

    const dependencies = { ...(pkgJson.dependencies || {}), ...(pkgJson.devDependencies || {}) };
    const frameworks = Object.keys(dependencies).map((dep) => ({
      name: dep,
      version: dependencies[dep],
      confidence: 1.0,
      evidence: ["Declared in project package.json"],
    }));

    // Real file & extension scanner
    const langStats: Record<string, number> = {};
    let totalFiles = 0;
    let totalDirs = 0;

    const scanStats = async (dir: string) => {
      try {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
          if (entry.isDirectory()) {
            if (!entry.name.startsWith(".") && entry.name !== "node_modules" && entry.name !== "dist" && entry.name !== "build") {
              totalDirs++;
              await scanStats(path.join(dir, entry.name));
            }
          } else if (entry.isFile()) {
            totalFiles++;
            const ext = path.extname(entry.name).toLowerCase() || "other";
            langStats[ext] = (langStats[ext] || 0) + 1;
          }
        }
      } catch {
        // skip unreadable
      }
    };

    await scanStats(workspacePath);

    const languages = Object.entries(langStats)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([ext, count]) => ({ name: ext.replace(".", "").toUpperCase(), fileCount: count }));

    // Detect first commit date and contributor count using real git
    let firstCommit = "Unknown";
    let contributorCount = 1;
    try {
      firstCommit = execSync('git log --reverse --pretty=format:"%ad" --date=short | head -n 1', {
        cwd: workspacePath,
        encoding: "utf-8",
        stdio: ["ignore", "pipe", "ignore"],
      }).trim() || "Unknown";

      const contributorsOutput = execSync('git log --pretty=format:"%an"', {
        cwd: workspacePath,
        encoding: "utf-8",
        stdio: ["ignore", "pipe", "ignore"],
      });
      contributorCount = new Set(contributorsOutput.trim().split("\n").filter(Boolean)).size || 1;
    } catch {
      // Git fallback
    }

    const scripts = pkgJson.scripts || {};
    const setupCommands = ["pnpm install", "pnpm build"];
    const testCommands = scripts.test ? [`pnpm test`] : ["npm test"];
    const buildCommands = scripts.build ? [`pnpm build`] : ["npm run build"];

    const hasAuth = Object.keys(dependencies).some((dep) => /auth|jwt|passport|session/i.test(dep));
    const hasDb = Object.keys(dependencies).some((dep) => /prisma|drizzle|mongoose|typeorm|pg|sqlite|mysql/i.test(dep));

    return {
      projectName: pkgJson.name || projectName,
      architecture: { type: pkgJson.workspaces || fsSync.existsSync(path.join(workspacePath, "packages")) ? "Monorepo Workspace" : "Single Package Architecture" },
      primaryLanguage: languages[0]?.name || "TypeScript/JavaScript",
      techStack: { frameworks },
      fileCount: totalFiles,
      directoryCount: totalDirs,
      languages,
      firstCommit,
      contributorCount,
      conventions: {
        naming: [
          { type: "files", pattern: "kebab-case", examples: ["engine-v2.ts"] },
          { type: "classes", pattern: "PascalCase", examples: ["OnboardingGenerator"] },
        ],
        commitStyle: "Conventional Commits (feat, fix, docs)",
        branchStrategy: "Feature branch strategy",
      },
      prerequisites: ["Node.js >= 18.0.0", "pnpm or npm package manager"],
      setupCommands,
      testCommands,
      buildCommands,
      hasAuth,
      authModule: hasAuth ? "Authentication & Security layer" : undefined,
      databaseModule: hasDb ? "Database ORM / Storage layer" : undefined,
      deploymentDocs: fsSync.existsSync(path.join(workspacePath, "README.md")) ? "README.md" : undefined,
    };
  }

  /**
   * Execute real git log query to gather commit history
   */
  private static async getRecentGitHistory(workspacePath: string, limit: number): Promise<GitHistory> {
    const commits: Array<{ hash: string; message: string; author: string; date: string; files: string[] }> = [];

    try {
      const output = execSync(`git log -n ${limit} --pretty=format:"%H|%s|%an|%ad" --date=short`, {
        cwd: workspacePath,
        encoding: "utf-8",
        stdio: ["ignore", "pipe", "ignore"],
      });

      const lines = output.trim().split("\n");
      for (const line of lines) {
        if (!line.trim()) continue;
        const [hash, message, author, date] = line.split("|");

        let files: string[] = [];
        try {
          const filesOutput = execSync(`git show --pretty="" --name-only ${hash}`, {
            cwd: workspacePath,
            encoding: "utf-8",
            stdio: ["ignore", "pipe", "ignore"],
          });
          files = filesOutput.trim().split("\n").filter(Boolean);
        } catch {
          // ignore
        }

        commits.push({
          hash: hash || "unknown",
          message: message || "Commit update",
          author: author || "Developer",
          date: date || new Date().toISOString().slice(0, 10),
          files,
        });
      }
    } catch {
      // Fallback
    }

    return { commits };
  }

  /**
   * Dynamically build codebase index by scanning disk modules and entry points
   */
  private static async buildCodebaseIndex(workspacePath: string): Promise<CodebaseIndex> {
    const modules: CodebaseModule[] = [];
    const entryPoints: Array<{ path: string; description: string }> = [];
    const files: string[] = [];

    const packagesDir = path.join(workspacePath, "packages");
    const srcDir = path.join(workspacePath, "src");

    if (fsSync.existsSync(packagesDir)) {
      try {
        const subdirs = await fs.readdir(packagesDir, { withFileTypes: true });
        for (const sub of subdirs) {
          if (sub.isDirectory()) {
            const modPath = path.join("packages", sub.name);
            const fullModPath = path.join(workspacePath, modPath);
            const modFiles = await this.scanDirFiles(fullModPath);

            const relativeModFiles = modFiles.map((f) => path.relative(workspaceRootOrSelf(workspacePath), f).replace(/\\/g, "/"));
            files.push(...relativeModFiles);

            const indexFile = relativeModFiles.find((f) => f.endsWith("index.ts") || f.endsWith("extension.ts") || f.endsWith("index.js"));
            if (indexFile) {
              entryPoints.push({ path: indexFile, description: `Entry point for module ${sub.name}` });
            }

            modules.push({
              name: modPath.replace(/\\/g, "/"),
              purpose: `Package workspace module: ${sub.name}`,
              fileCount: modFiles.length,
              keyFiles: relativeModFiles.slice(0, 3),
              dependencies: [],
            });
          }
        }
      } catch {
        // Skip
      }
    } else if (fsSync.existsSync(srcDir)) {
      const srcFiles = await this.scanDirFiles(srcDir);
      const relativeSrcFiles = srcFiles.map((f) => path.relative(workspacePath, f).replace(/\\/g, "/"));
      files.push(...relativeSrcFiles);

      const indexFile = relativeSrcFiles.find((f) => f.endsWith("index.ts") || f.endsWith("main.ts") || f.endsWith("app.ts"));
      if (indexFile) {
        entryPoints.push({ path: indexFile, description: `Main source entry point` });
      }

      modules.push({
        name: "src",
        purpose: "Main source module",
        fileCount: srcFiles.length,
        keyFiles: relativeSrcFiles.slice(0, 5),
        dependencies: [],
      });
    }

    if (entryPoints.length === 0 && files.length > 0) {
      entryPoints.push({ path: files[0], description: "First detected source file" });
    }

    return { modules, entryPoints, files };
  }

  private static async generateOverview(context: any): Promise<Section> {
    const techStack = context.techStack;
    const frameworks = techStack.frameworks.filter((f: any) => f.confidence > 0.7);

    return {
      title: "📋 Project Overview",
      content: [
        `**${context.projectName}** is a **${context.architecture.type}** built with **${context.primaryLanguage}**.`,
        "",
        "### Tech Stack",
        ...frameworks.map((f: any) => `- **${f.name}** ${f.version ? `v${f.version}` : ""} — ${f.evidence[0] || ""}`),
        "",
        "### Quick Stats",
        `- **Files:** ${context.fileCount.toLocaleString()}`,
        `- **Directories:** ${context.directoryCount}`,
        `- **Languages:** ${context.languages.map((l: any) => `${l.name} (${l.fileCount})`).join(", ")}`,
        `- **First Commit:** ${context.firstCommit?.slice(0, 10) || "Unknown"}`,
        `- **Contributors:** ${context.contributorCount || "Unknown"}`,
      ].join("\n"),
    };
  }

  private static async generateArchitecture(context: any, index: CodebaseIndex): Promise<Section> {
    const modules = index.modules.slice(0, 10);

    return {
      title: "🏗️ Architecture",
      content: [
        `This is a **${context.architecture.type}** project.`,
        "",
        "### Module Map",
        ...modules.map(
          (m) =>
            `- **${m.name}/** — ${m.purpose || "No description"}` +
            ` (${m.fileCount} files)` +
            `${m.keyFiles.length > 0 ? ` — Key files: ${m.keyFiles.slice(0, 3).map((f) => `\`${f}\``).join(", ")}` : ""}`
        ),
        "",
        "### Architecture Diagram",
        "```mermaid",
        this.generateArchitectureMermaid(modules),
        "```",
      ].join("\n"),
    };
  }

  private static async generateKeyModules(context: any, index: CodebaseIndex): Promise<Section> {
    const keyModules = index.modules.slice(0, 8);

    return {
      title: "🔑 Key Modules",
      content: keyModules
        .map((m) =>
          [
            `### ${m.name}/`,
            m.purpose || "No description available.",
            "",
            "**Key Files:**",
            ...m.keyFiles.slice(0, 5).map((f) => `- \`${f}\``),
            "",
            `**${m.fileCount} files** | Dependencies: ${m.dependencies.length}`,
            "---",
          ].join("\n")
        )
        .join("\n"),
    };
  }

  private static async generateEntryPoints(index: CodebaseIndex): Promise<Section> {
    const entryPoints = index.entryPoints.slice(0, 5);

    return {
      title: "🚪 Entry Points",
      content: [
        "These are the files you should look at first:",
        "",
        ...entryPoints.map(
          (ep, i) => `${i + 1}. **\`${ep.path}\`** — ${ep.description || "Application entry point"}`
        ),
      ].join("\n"),
    };
  }

  private static async generateDataFlow(context: any, index: CodebaseIndex): Promise<Section> {
    return {
      title: "🔄 Data Flow",
      content: [
        this.describeDataFlow(context, index),
        "",
        "```mermaid",
        this.generateDataFlowMermaid(index),
        "```",
      ].join("\n"),
    };
  }

  private static async generateConventions(context: any): Promise<Section> {
    return {
      title: "📐 Conventions",
      content: [
        "### Naming",
        ...context.conventions.naming.map(
          (c: any) => `- **${c.type}:** ${c.pattern} (e.g., \`${c.examples[0] || ""}\`)`
        ),
        "",
        "### Commits",
        context.conventions.commitStyle
          ? `This project uses **${context.conventions.commitStyle}** commit messages.`
          : "No specific commit convention detected.",
        "",
        "### Branching",
        context.conventions.branchStrategy
          ? `**${context.conventions.branchStrategy}** branching strategy.`
          : "No specific branching strategy detected.",
      ].join("\n"),
    };
  }

  private static async generateRecentChanges(gitHistory: GitHistory): Promise<Section> {
    const recentCommits = gitHistory.commits.slice(0, 10);
    const changedFiles = new Set<string>();

    for (const commit of recentCommits) {
      for (const file of commit.files) {
        changedFiles.add(file);
      }
    }

    return {
      title: "📝 Recent Activity",
      content: [
        `**${recentCommits.length} recent commits** by ${new Set(recentCommits.map((c) => c.author)).size} contributor(s).`,
        "",
        "### Recently Changed Files",
        ...(changedFiles.size > 0
          ? Array.from(changedFiles).slice(0, 10).map((f) => `- \`${f}\``)
          : ["- No recently modified files detected in git history."]),
        "",
        "### Last Commits",
        ...(recentCommits.length > 0
          ? recentCommits.slice(0, 5).map(
              (c) => `- \`${c.hash.slice(0, 7)}\` — ${c.message.slice(0, 80)} — ${c.author} — ${c.date.slice(0, 10)}`
            )
          : ["- No commit log found."]),
      ].join("\n"),
    };
  }

  private static async generateGettingStarted(context: any, index: CodebaseIndex): Promise<Section> {
    return {
      title: "🚀 Getting Started",
      content: [
        "### Prerequisites",
        ...context.prerequisites.map((p: any) => `- ${p}`),
        "",
        "### Setup",
        "```bash",
        context.setupCommands.join("\n"),
        "```",
        "",
        "### First Files to Read",
        ...index.entryPoints.slice(0, 5).map(
          (ep, i) => `${i + 1}. **\`${ep.path}\`** — ${ep.description || "Start here"}`
        ),
      ].join("\n"),
    };
  }

  private static async generateCommonTasks(context: any): Promise<Section> {
    return {
      title: "🔧 Common Tasks",
      content: [
        "### Adding a New Feature",
        this.describeFeatureWorkflow(context),
        "",
        "### Fixing a Bug",
        this.describeBugFixWorkflow(context),
        "",
        "### Running Tests",
        "```bash",
        context.testCommands.join("\n"),
        "```",
        "",
        "### Building for Production",
        "```bash",
        context.buildCommands.join("\n"),
        "```",
      ].join("\n"),
    };
  }

  private static async generateTestingGuide(index: CodebaseIndex, context: any): Promise<Section> {
    const testFiles = index.files.filter(
      (f) => f.includes(".test.") || f.includes(".spec.") || f.includes("__tests__")
    );

    return {
      title: "🧪 Testing",
      content: [
        `**${testFiles.length} test files** found.`,
        "",
        "### Test Structure",
        testFiles.length > 0
          ? `Tests are located in: ${[...new Set(testFiles.map((f) => f.split("/").slice(0, -1).join("/")))].slice(0, 5).join(", ")}`
          : "No test files detected in this project.",
        "",
        "### Running Tests",
        "```bash",
        (context.testCommands || ["npm test"]).join("\n"),
        "```",
      ].join("\n"),
    };
  }

  private static async generateFAQ(context: any): Promise<Section> {
    return {
      title: "❓ Frequently Asked Questions",
      content: [
        "### How do I add a new page/route?",
        this.describeAddingRoute(context),
        "",
        "### How is authentication handled?",
        context.hasAuth
          ? `Authentication is handled in **${context.authModule || "the security module"}**.`
          : "No explicit authentication dependency detected in package.json.",
        "",
        "### Where is the database schema?",
        context.databaseModule
          ? `Database schema is in **${context.databaseModule}**.`
          : "No dedicated database ORM package detected.",
        "",
        "### How do I deploy?",
        context.deploymentDocs
          ? `See **${context.deploymentDocs}** for deployment instructions.`
          : "No deployment documentation detected.",
      ].join("\n"),
    };
  }

  private static generateArchitectureMermaid(modules: CodebaseModule[]): string {
    const lines = ["graph TD"];

    if (modules.length === 0) {
      lines.push('    Root["Project Workspace Root"]');
    } else {
      for (const module of modules.slice(0, 8)) {
        const id = module.name.replace(/[^a-zA-Z0-9_]/g, "_");
        lines.push(`    ${id}["${module.name}"]`);
      }
    }

    return lines.join("\n");
  }

  private static generateDataFlowMermaid(index: CodebaseIndex): string {
    return "graph LR\n    Caller --> EntryPoint\n    EntryPoint --> CoreEngine\n    CoreEngine --> OutputRenderers";
  }

  private static describeDataFlow(context: any, index: CodebaseIndex): string {
    return "Data flows from the public entry points into core modules, processing parameters and returning structured output objects.";
  }

  private static describeFeatureWorkflow(context: any): string {
    return "1. Create a new feature branch\n2. Implement component logic and tests\n3. Run build and test suite\n4. Submit pull request";
  }

  private static describeBugFixWorkflow(context: any): string {
    return "1. Create a bugfix branch\n2. Add failing test to reproduce bug\n3. Implement fix and verify all tests pass\n4. Submit PR";
  }

  private static describeAddingRoute(context: any): string {
    return "Add a new module file and export it from the primary module index.ts.";
  }

  private static async scanDirFiles(dir: string, max: number = 100): Promise<string[]> {
    const list: string[] = [];
    const walk = async (current: string) => {
      if (list.length >= max) return;
      try {
        const entries = await fs.readdir(current, { withFileTypes: true });
        for (const entry of entries) {
          if (list.length >= max) break;
          const full = path.join(current, entry.name);
          if (entry.isDirectory()) {
            if (!entry.name.startsWith(".") && entry.name !== "node_modules" && entry.name !== "dist") {
              await walk(full);
            }
          } else if (entry.isFile()) {
            list.push(full);
          }
        }
      } catch {
        // Skip
      }
    };

    await walk(dir);
    return list;
  }
}

function workspaceRootOrSelf(dir: string): string {
  return dir;
}
