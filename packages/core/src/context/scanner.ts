import * as fs from "fs/promises";
import * as path from "path";

export interface ScannedContext {
  projectName: string;
  purpose: string;
  techStack: string[];
  architecture: { path: string; description: string }[];
  entryPoints: string[];
  keyConcepts: string[];
}

/**
 * Known framework signatures mapped from dependency keys.
 */
const FRAMEWORK_SIGNATURES: Record<string, string> = {
  next: "Next.js (React SSR/SSG)",
  react: "React",
  vue: "Vue.js",
  svelte: "Svelte",
  angular: "@angular/core",
  express: "Express (Node.js HTTP server)",
  fastify: "Fastify (Node.js HTTP server)",
  koa: "Koa (Node.js HTTP server)",
  hono: "Hono (edge-first HTTP framework)",
  nestjs: "NestJS (@nestjs/core)",
  "@nestjs/core": "NestJS",
  vite: "Vite",
  astro: "Astro",
  nuxt: "Nuxt.js",
  remix: "Remix",
  electron: "Electron (desktop app)",
  tauri: "@tauri-apps/api",
  "@tauri-apps/api": "Tauri (desktop app)",
  prisma: "Prisma ORM",
  drizzle: "Drizzle ORM",
  mongoose: "Mongoose (MongoDB ODM)",
  typeorm: "TypeORM",
  trpc: "@trpc/server",
  "@trpc/server": "tRPC",
  graphql: "GraphQL",
  "@apollo/server": "Apollo GraphQL Server",
};

/**
 * Directory names and their likely purpose.
 */
const DIR_PURPOSE: Record<string, string> = {
  src: "main source code",
  lib: "library/shared code",
  app: "application entry & routing",
  api: "API routes/handlers",
  server: "server-side code",
  client: "client-side code",
  pages: "page components (Next.js/Nuxt style)",
  components: "reusable UI components",
  hooks: "custom React hooks",
  utils: "utility functions",
  helpers: "helper functions",
  services: "business logic / service layer",
  repositories: "data access layer",
  models: "data models / entities",
  schemas: "data schemas / validation",
  controllers: "MVC controllers",
  routes: "HTTP route definitions",
  middleware: "middleware functions",
  handlers: "request handlers",
  queries: "database queries / CQRS queries",
  commands: "CQRS commands / CLI commands",
  config: "configuration files",
  types: "TypeScript type definitions",
  interfaces: "TypeScript interfaces",
  constants: "application constants",
  migrations: "database migrations",
  seeds: "database seed data",
  scripts: "build/automation scripts",
  tests: "test suites",
  test: "test suites",
  __tests__: "test suites (Jest convention)",
  spec: "test specs",
  e2e: "end-to-end tests",
  packages: "monorepo packages",
  plugins: "plugins / extensions",
  adapters: "adapter pattern implementations",
  providers: "dependency injection providers",
  store: "state management (Redux/Zustand/Pinia)",
  assets: "static assets",
  public: "publicly served files",
  styles: "CSS/SCSS stylesheets",
  i18n: "internationalization strings",
  locales: "locale files",
  docs: "documentation",
};

/**
 * Directories to skip during scanning — not relevant to project architecture.
 */
const SKIP_DIRS = new Set([
  "node_modules",
  ".git",
  "dist",
  "build",
  ".turbo",
  ".next",
  ".nuxt",
  ".svelte-kit",
  "coverage",
  ".cache",
  "__pycache__",
  ".vitepress",
  ".changeset",
  "tmp",
  "temp",
]);

const ENTRY_POINT_NAMES = [
  "index.ts",
  "index.js",
  "index.mjs",
  "main.ts",
  "main.js",
  "app.ts",
  "app.js",
  "app.tsx",
  "server.ts",
  "server.js",
];

/**
 * Scans a project directory and extracts structured context.
 * Caps total output at ~2000 chars (~500 tokens).
 */
export class ProjectContextScanner {
  private repoPath: string;

  constructor(repoPath: string) {
    this.repoPath = repoPath;
  }

  async scan(): Promise<ScannedContext> {
    const [pkgInfo, readmePurpose, topDirs] = await Promise.all([
      this.readPackageJson(),
      this.readReadme(),
      this.listTopLevelDirs(),
    ]);

    const entryPoints = await this.findEntryPoints(topDirs.rawDirs);

    const techStack = this.buildTechStack(
      pkgInfo.dependencies,
      pkgInfo.devDependencies,
      pkgInfo.lang,
    );

    return {
      projectName: pkgInfo.name || path.basename(this.repoPath),
      purpose: pkgInfo.description || readmePurpose,
      techStack,
      architecture: topDirs.architecture,
      entryPoints,
      keyConcepts: [],
    };
  }

  private async readPackageJson(): Promise<{
    name: string;
    description: string;
    dependencies: Record<string, string>;
    devDependencies: Record<string, string>;
    lang: string;
  }> {
    try {
      const raw = await fs.readFile(
        path.join(this.repoPath, "package.json"),
        "utf-8",
      );
      const pkg = JSON.parse(raw);
      return {
        name: pkg.name || "",
        description: pkg.description || "",
        dependencies: pkg.dependencies || {},
        devDependencies: pkg.devDependencies || {},
        lang: "TypeScript/JavaScript",
      };
    } catch {
      // Not a Node.js project — check for other languages
      const lang = await this.detectLanguage();
      return {
        name: "",
        description: "",
        dependencies: {},
        devDependencies: {},
        lang,
      };
    }
  }

  private async detectLanguage(): Promise<string> {
    const checks: [string, string][] = [
      ["Cargo.toml", "Rust"],
      ["go.mod", "Go"],
      ["pyproject.toml", "Python"],
      ["requirements.txt", "Python"],
      ["pom.xml", "Java (Maven)"],
      ["build.gradle", "Java/Kotlin (Gradle)"],
      ["composer.json", "PHP"],
      ["Gemfile", "Ruby"],
    ];
    for (const [file, lang] of checks) {
      try {
        await fs.access(path.join(this.repoPath, file));
        return lang;
      } catch {}
    }
    return "Unknown";
  }

  private async readReadme(): Promise<string> {
    const candidates = ["README.md", "readme.md", "README.txt", "README"];
    for (const name of candidates) {
      try {
        const content = await fs.readFile(
          path.join(this.repoPath, name),
          "utf-8",
        );
        // Extract the first non-heading paragraph (first 400 words)
        const lines = content.split("\n");
        const paragraphs: string[] = [];
        let wordCount = 0;
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith("#") || trimmed.startsWith("![")) {
            continue;
          }
          // Skip badge lines
          if (trimmed.startsWith("[![")) continue;
          const words = trimmed.split(/\s+/);
          paragraphs.push(trimmed);
          wordCount += words.length;
          if (wordCount >= 80) break;
        }
        const excerpt = paragraphs.join(" ").substring(0, 500);
        return excerpt || "";
      } catch {}
    }
    return "";
  }

  private async listTopLevelDirs(): Promise<{
    architecture: { path: string; description: string }[];
    rawDirs: string[];
  }> {
    try {
      const entries = await fs.readdir(this.repoPath, { withFileTypes: true });
      const dirs = entries
        .filter(
          (e) =>
            e.isDirectory() &&
            !SKIP_DIRS.has(e.name) &&
            !e.name.startsWith("."),
        )
        .map((e) => e.name)
        .sort();

      const architecture: { path: string; description: string }[] = [];

      for (const dir of dirs) {
        const purpose = DIR_PURPOSE[dir.toLowerCase()];
        if (purpose) {
          architecture.push({ path: dir + "/", description: purpose });
        } else {
          // Try to infer from subdirectories
          architecture.push({
            path: dir + "/",
            description: "project directory",
          });
        }
      }

      // Limit to most meaningful dirs (max 12)
      const meaningful = architecture.filter(
        (a) => a.description !== "project directory",
      );
      const others = architecture.filter(
        (a) => a.description === "project directory",
      );

      return {
        architecture: [...meaningful.slice(0, 10), ...others.slice(0, 2)],
        rawDirs: dirs,
      };
    } catch {
      return { architecture: [], rawDirs: [] };
    }
  }

  private async findEntryPoints(topDirs: string[]): Promise<string[]> {
    const found: string[] = [];

    // Check root level
    for (const name of ENTRY_POINT_NAMES) {
      try {
        await fs.access(path.join(this.repoPath, name));
        found.push(name);
      } catch {}
    }

    // Check common source dirs
    const sourceDirs = topDirs.filter((d) =>
      ["src", "app", "lib", "packages"].includes(d),
    );
    for (const dir of sourceDirs.slice(0, 3)) {
      for (const name of ENTRY_POINT_NAMES) {
        try {
          await fs.access(path.join(this.repoPath, dir, name));
          found.push(`${dir}/${name}`);
        } catch {}
      }
    }

    return found.slice(0, 5);
  }

  private buildTechStack(
    deps: Record<string, string>,
    devDeps: Record<string, string>,
    lang: string,
  ): string[] {
    const stack: string[] = [lang];
    const allDeps = { ...deps, ...devDeps };

    // Detect frameworks
    const detected = new Set<string>();
    for (const [dep, label] of Object.entries(FRAMEWORK_SIGNATURES)) {
      if (allDeps[dep]) {
        detected.add(label);
      }
    }

    // Detect TypeScript
    if (allDeps["typescript"] || allDeps["ts-node"]) {
      if (!stack.includes("TypeScript/JavaScript")) {
        stack.push("TypeScript");
      }
    }

    // Detect test framework
    if (allDeps["vitest"]) stack.push("Vitest (testing)");
    else if (allDeps["jest"]) stack.push("Jest (testing)");
    else if (allDeps["mocha"]) stack.push("Mocha (testing)");

    // Detect monorepo tools
    if (allDeps["turbo"] || allDeps["turborepo"])
      stack.push("Turborepo (monorepo)");
    else if (allDeps["nx"]) stack.push("Nx (monorepo)");

    // Detect build tools
    if (allDeps["vite"]) stack.push("Vite (build)");
    else if (allDeps["webpack"]) stack.push("Webpack (build)");
    else if (allDeps["esbuild"]) stack.push("esbuild (build)");
    else if (allDeps["tsup"]) stack.push("tsup (build)");

    return [...stack, ...Array.from(detected)].slice(0, 8);
  }
}

/**
 * Generates a context markdown string from a scanned project.
 */
export function formatContext(ctx: ScannedContext): string {
  const lines: string[] = [`# Project: ${ctx.projectName}`];

  if (ctx.purpose) {
    lines.push(`\n## Purpose\n${ctx.purpose}`);
  }

  if (ctx.techStack.length > 0) {
    lines.push(`\n## Tech Stack`);
    for (const item of ctx.techStack) {
      lines.push(`- ${item}`);
    }
  }

  if (ctx.architecture.length > 0) {
    lines.push(`\n## Architecture`);
    for (const { path: p, description } of ctx.architecture) {
      lines.push(`- \`${p}\` — ${description}`);
    }
  }

  if (ctx.entryPoints.length > 0) {
    lines.push(`\n## Entry Points`);
    for (const ep of ctx.entryPoints) {
      lines.push(`- ${ep}`);
    }
  }

  if (ctx.keyConcepts.length > 0) {
    lines.push(`\n## Key Concepts`);
    for (const c of ctx.keyConcepts) {
      lines.push(`- ${c}`);
    }
  }

  lines.push(
    `\n## Custom Notes\n<!-- Edit this section to add domain knowledge, naming conventions, or architecture notes -->`,
  );

  return lines.join("\n");
}
