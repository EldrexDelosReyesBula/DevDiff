import * as fs from "fs/promises";
import * as path from "path";
import { execSync } from "child_process";

export interface DeepContext {
  generatedAt: string;
  repositorySize: {
    files: number;
    lines: number;
    directories: number;
    languages: Record<string, number>; // { "typescript": 450, "markdown": 120 }
  };
  structure: {
    rootDirectories: string[]; // packages/, src/, docs/, etc.
    keyEntryPoints: string[]; // main.ts, index.ts, app.tsx
    testDirectories: string[]; // __tests__/, tests/, spec/
    configFiles: string[]; // tsconfig.json, .eslintrc, etc.
  };
  dependencies: {
    runtime: string[]; // Top-level dependencies
    devDependencies: string[];
    peerDependencies: string[];
    detectedFrameworks: string[]; // "Next.js 14", "Express 4.x", "React 18"
  };
  patterns: {
    namingConventions: string[]; // "services/ for business logic", "hooks/ for React hooks"
    commonPrefixes: string[]; // ["src/", "lib/"]
    monorepo: boolean;
    workspacePackages: string[]; // ["@org/core", "@org/web"]
  };
  git: {
    totalCommits: number;
    activeBranch: string;
    branches: number;
    contributors: number;
    firstCommit: string;
    lastCommit: string;
    releaseTags: string[];
  };
}

export class DeepContextIndexer {
  /**
   * Index a codebase WITHOUT sending code to any AI.
   * Pure file system and package.json analysis.
   */
  static async index(workspacePath: string): Promise<DeepContext> {
    console.log("🔍 First-run: Indexing your codebase...");
    console.log("   (No code is sent to AI — analyzing structure only)");

    const files = await this.scanFiles(workspacePath);
    const packages = await this.scanPackages(workspacePath);
    const git = await this.scanGit(workspacePath);

    // Analyze structure
    const structure = this.analyzeStructure(files);

    // Detect frameworks
    const frameworks = this.detectFrameworks(packages);

    // Detect patterns
    const patterns = this.detectPatterns(files, structure);

    // Calculate size
    const size = await this.calculateSize(workspacePath, files);

    const context: DeepContext = {
      generatedAt: new Date().toISOString(),
      repositorySize: size,
      structure,
      dependencies: {
        runtime: packages.runtime || [],
        devDependencies: packages.devDependencies || [],
        peerDependencies: packages.peerDependencies || [],
        detectedFrameworks: frameworks,
      },
      patterns,
      git,
    };

    // Save to .devdiff/context/deep-context.json
    await this.save(workspacePath, context);

    console.log(
      `✅ Indexing complete: ${size.files} files, ${size.lines.toLocaleString()} lines`
    );
    if (frameworks.length > 0) {
      console.log(`   Detected: ${frameworks.join(", ")}`);
    }
    console.log(`   Monorepo: ${patterns.monorepo ? "Yes" : "No"}`);

    return context;
  }

  /**
   * Generate AI-friendly context summary (token-efficient)
   */
  static toPromptContext(deep: DeepContext): string {
    const lines: string[] = [];

    lines.push(`[PROJECT OVERVIEW]`);
    lines.push(
      `Repository: ${deep.repositorySize.files.toLocaleString()} files, ${deep.repositorySize.lines.toLocaleString()} lines across ${deep.repositorySize.directories} directories`
    );
    lines.push(
      `Primary language: ${this.getPrimaryLanguage(deep.repositorySize.languages)}`
    );

    if (deep.dependencies.detectedFrameworks.length > 0) {
      lines.push(`Frameworks: ${deep.dependencies.detectedFrameworks.join(", ")}`);
    }

    if (deep.patterns.monorepo) {
      lines.push(
        `Monorepo with ${deep.patterns.workspacePackages.length} packages: ${deep.patterns.workspacePackages.join(", ")}`
      );
    }

    lines.push(`Key directories: ${deep.structure.rootDirectories.join(", ")}`);

    if (deep.patterns.namingConventions.length > 0) {
      lines.push(`Conventions: ${deep.patterns.namingConventions.join("; ")}`);
    }

    lines.push(
      `Git: ${deep.git.totalCommits.toLocaleString()} commits, ${deep.git.contributors} contributors, active since ${deep.git.firstCommit?.slice(0, 10)}`
    );

    return lines.join("\n");
  }

  private static async scanFiles(root: string): Promise<string[]> {
    const results: string[] = [];
    const ignoreDirs = new Set([
      "node_modules",
      "dist",
      "build",
      ".git",
      ".devdiff",
      "coverage",
      "out",
      ".next",
      ".nuxt",
      "bin",
      "obj",
    ]);
    const ignoreExtensions = new Set([
      ".lock",
      ".min.js",
      ".min.css",
      ".map",
      ".d.ts",
      ".png",
      ".jpg",
      ".jpeg",
      ".gif",
      ".ico",
      ".pdf",
      ".zip",
      ".tar",
      ".gz",
    ]);

    async function traverse(dir: string) {
      let list;
      try {
        list = await fs.readdir(dir, { withFileTypes: true });
      } catch {
        return;
      }
      for (const entry of list) {
        const res = path.resolve(dir, entry.name);
        if (entry.isDirectory()) {
          if (ignoreDirs.has(entry.name)) continue;
          await traverse(res);
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name);
          if (
            ignoreExtensions.has(ext) ||
            entry.name.endsWith("-lock.json") ||
            entry.name.endsWith(".lock")
          ) {
            continue;
          }
          results.push(path.relative(root, res).replace(/\\/g, "/"));
        }
      }
    }

    await traverse(root);
    return results;
  }

  private static async calculateSize(
    root: string,
    files: string[]
  ): Promise<DeepContext["repositorySize"]> {
    const languages: Record<string, number> = {};
    let totalLines = 0;

    // Sample-based estimation for large codebases
    const SAMPLE_SIZE = 1000;
    const sampledFiles =
      files.length > SAMPLE_SIZE
        ? files.sort(() => 0.5 - Math.random()).slice(0, SAMPLE_SIZE)
        : files;

    for (const file of sampledFiles) {
      const ext = path.extname(file).slice(1) || "unknown";
      languages[ext] = (languages[ext] || 0) + 1;

      try {
        const fullPath = path.resolve(root, file);
        const content = await fs.readFile(fullPath, "utf-8");
        totalLines += content.split("\n").length;
      } catch {
        // Binary or unreadable — skip
      }
    }

    // Extrapolate if we sampled
    if (files.length > SAMPLE_SIZE) {
      totalLines = Math.round(totalLines * (files.length / SAMPLE_SIZE));
    }

    return {
      files: files.length,
      lines: totalLines,
      directories: new Set(files.map((f) => path.dirname(f))).size,
      languages,
    };
  }

  private static async scanPackages(root: string): Promise<any> {
    const pkgPath = path.join(root, "package.json");

    if (
      !(await fs
        .access(pkgPath)
        .then(() => true)
        .catch(() => false))
    ) {
      return { runtime: [], devDependencies: [], peerDependencies: [] };
    }

    try {
      const pkg = JSON.parse(await fs.readFile(pkgPath, "utf-8"));
      return {
        runtime: Object.keys(pkg.dependencies || {}),
        devDependencies: Object.keys(pkg.devDependencies || {}),
        peerDependencies: Object.keys(pkg.peerDependencies || {}),
      };
    } catch {
      return { runtime: [], devDependencies: [], peerDependencies: [] };
    }
  }

  private static async scanGit(root: string): Promise<DeepContext["git"]> {
    try {
      const totalCommits = parseInt(
        execSync("git rev-list --count HEAD", { cwd: root, encoding: "utf-8" }).trim()
      ) || 0;
      const activeBranch = execSync("git branch --show-current", {
        cwd: root,
        encoding: "utf-8",
      }).trim();
      
      // Multi-platform safe commands
      let branches = 1;
      try {
        branches = execSync("git branch", { cwd: root, encoding: "utf-8" })
          .split("\n")
          .filter(Boolean).length;
      } catch {}

      let contributors = 1;
      try {
        contributors = execSync("git shortlog -s", { cwd: root, encoding: "utf-8" })
          .split("\n")
          .filter(Boolean).length;
      } catch {}

      const firstCommit = execSync("git log --reverse --format=%ci", {
        cwd: root,
        encoding: "utf-8",
      })
        .split("\n")[0]
        ?.trim() || "";

      const lastCommit = execSync("git log -1 --format=%ci", {
        cwd: root,
        encoding: "utf-8",
      }).trim();

      const releaseTags = execSync("git tag --sort=-creatordate", {
        cwd: root,
        encoding: "utf-8",
      })
        .split("\n")
        .filter(Boolean)
        .slice(0, 10);

      return {
        totalCommits,
        activeBranch,
        branches,
        contributors,
        firstCommit,
        lastCommit,
        releaseTags,
      };
    } catch {
      return {
        totalCommits: 0,
        activeBranch: "unknown",
        branches: 0,
        contributors: 0,
        firstCommit: "",
        lastCommit: "",
        releaseTags: [],
      };
    }
  }

  private static detectFrameworks(packages: any): string[] {
    const frameworks: string[] = [];
    const allDeps = [
      ...(packages.runtime || []),
      ...(packages.devDependencies || []),
    ];

    const frameworkMap: Record<string, string> = {
      next: "Next.js",
      react: "React",
      vue: "Vue.js",
      svelte: "Svelte",
      angular: "Angular",
      express: "Express.js",
      fastify: "Fastify",
      nestjs: "NestJS",
      remix: "Remix",
      nuxt: "Nuxt.js",
      astro: "Astro",
      gatsby: "Gatsby",
      vite: "Vite",
      webpack: "Webpack",
      turborepo: "Turborepo",
      nx: "Nx",
      prisma: "Prisma",
      "drizzle-orm": "Drizzle ORM",
      typeorm: "TypeORM",
      tailwindcss: "Tailwind CSS",
      jest: "Jest",
      vitest: "Vitest",
      cypress: "Cypress",
    };

    for (const [dep, name] of Object.entries(frameworkMap)) {
      if (allDeps.some((d: string) => d.toLowerCase() === dep.toLowerCase())) {
        frameworks.push(name);
      }
    }

    return frameworks;
  }

  private static analyzeStructure(files: string[]): DeepContext["structure"] {
    const rootDirs = new Set<string>();
    const entryPoints: string[] = [];
    const testDirs: string[] = [];
    const configFiles: string[] = [];

    for (const file of files) {
      const parts = file.split("/");

      if (parts.length >= 1) {
        rootDirs.add(parts[0]);
      }

      if (/^(src\/)?(main|index|app|server)\.(ts|js|tsx|jsx)$/.test(file)) {
        entryPoints.push(file);
      }

      const dir = path.dirname(file);
      if (/(__tests__|tests?|spec|__mocks__)/.test(dir)) {
        testDirs.push(dir);
      }

      if (
        /\.(config|rc)\.(js|ts|json|yaml|yml)$/.test(file) ||
        file === ".env.example"
      ) {
        configFiles.push(file);
      }
    }

    return {
      rootDirectories: Array.from(rootDirs).slice(0, 20),
      keyEntryPoints: entryPoints.slice(0, 10),
      testDirectories: [...new Set(testDirs)].slice(0, 10),
      configFiles: configFiles.slice(0, 10),
    };
  }

  private static detectPatterns(
    files: string[],
    structure: DeepContext["structure"]
  ): DeepContext["patterns"] {
    const patterns: string[] = [];
    let isMonorepo = false;
    const workspacePackages: string[] = [];

    const dirNames = structure.rootDirectories;

    if (
      dirNames.includes("packages") ||
      dirNames.includes("apps") ||
      dirNames.includes("libs")
    ) {
      isMonorepo = true;
      patterns.push("Monorepo structure detected");
    }

    if (dirNames.includes("services")) patterns.push("services/ contains business logic");
    if (dirNames.includes("hooks") || dirNames.includes("composables"))
      patterns.push("Hooks/composables pattern");
    if (dirNames.includes("components")) patterns.push("Component-based architecture");
    if (dirNames.includes("utils") || dirNames.includes("helpers"))
      patterns.push("Utilities in utils/ or helpers/");
    if (dirNames.includes("types") || dirNames.includes("interfaces"))
      patterns.push("Type definitions in types/");
    if (dirNames.includes("api") || dirNames.includes("routes"))
      patterns.push("API routes in api/ or routes/");
    if (dirNames.includes("db") || dirNames.includes("database"))
      patterns.push("Database layer in db/");

    return {
      namingConventions: patterns,
      commonPrefixes: ["src/", "lib/", "packages/"].filter((p) =>
        dirNames.some((d) => p.startsWith(d) || p.includes(d))
      ),
      monorepo: isMonorepo,
      workspacePackages,
    };
  }

  private static getPrimaryLanguage(languages: Record<string, number>): string {
    const sorted = Object.entries(languages).sort((a, b) => b[1] - a[1]);
    return sorted[0]?.[0] || "unknown";
  }

  private static async save(workspacePath: string, context: DeepContext): Promise<void> {
    const dir = path.join(workspacePath, ".devdiff/context");
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(
      path.join(dir, "deep-context.json"),
      JSON.stringify(context, null, 2),
      "utf-8"
    );
  }
}
