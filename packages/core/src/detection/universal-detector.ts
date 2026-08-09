import * as fs from "fs";
import * as path from "path";

export interface LanguageCount {
  name: string;
  fileCount: number;
}

export interface ProjectDetection {
  type: "node" | "web" | "python" | "generic" | "unknown";
  primaryLanguage: string;
  languages: LanguageCount[];
  frameworks: string[];
  hasPackageJson: boolean;
  isSingleFile: boolean;
  entryPoints: string[];
  totalFiles: number;
}

export class UniversalProjectDetector {
  /**
   * Detect ANY project type — no matter how simple or complex
   */
  static detect(workspacePath: string): ProjectDetection {
    const allFiles = this.scanFiles(workspacePath);

    // Tier 1: Has package.json (Node.js project)
    const packageJson = allFiles.find((f) => f.endsWith("package.json"));
    if (packageJson) {
      return this.detectNodeProject(workspacePath, allFiles);
    }

    // Tier 2: Has HTML files (static site / web app)
    const htmlFiles = allFiles.filter(
      (f) => f.endsWith(".html") || f.endsWith(".htm"),
    );
    if (htmlFiles.length > 0) {
      return this.detectWebProject(workspacePath, allFiles, htmlFiles);
    }

    // Tier 3: Has Python files
    const pyFiles = allFiles.filter((f) => f.endsWith(".py"));
    if (pyFiles.length > 0) {
      return this.detectPythonProject(workspacePath, allFiles);
    }

    // Tier 4: Any other language — detect from file extensions
    return this.detectFromExtensions(workspacePath, allFiles);
  }

  private static scanFiles(
    dir: string,
    baseDir: string = dir,
    maxDepth = 5,
  ): string[] {
    let files: string[] = [];
    if (maxDepth <= 0) return files;

    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relPath = path.relative(baseDir, fullPath).replace(/\\/g, "/");

        if (
          entry.name === "node_modules" ||
          entry.name === ".git" ||
          entry.name === ".turbo" ||
          entry.name === "dist" ||
          entry.name === "build" ||
          entry.name === ".devdiff"
        ) {
          continue;
        }

        if (entry.isDirectory()) {
          files = files.concat(this.scanFiles(fullPath, baseDir, maxDepth - 1));
        } else if (entry.isFile()) {
          files.push(relPath);
        }
      }
    } catch {
      // Ignore unreadable directories
    }

    return files;
  }

  private static detectNodeProject(
    root: string,
    allFiles: string[],
  ): ProjectDetection {
    const extensions = this.countExtensions(allFiles);
    const languages = this.mapExtensionsToLanguages(extensions);
    const frameworks: string[] = ["Node.js"];

    try {
      const pkg = JSON.parse(
        fs.readFileSync(path.join(root, "package.json"), "utf-8"),
      );
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };

      if (deps.react) frameworks.push("React");
      if (deps.vue) frameworks.push("Vue.js");
      if (deps.next) frameworks.push("Next.js");
      if (deps.vite) frameworks.push("Vite");
      if (deps.express) frameworks.push("Express");
      if (deps.tailwindcss) frameworks.push("Tailwind CSS");
      if (deps.typescript) frameworks.push("TypeScript");
    } catch {}

    return {
      type: "node",
      primaryLanguage: languages[0]?.name || "javascript",
      languages,
      frameworks,
      hasPackageJson: true,
      isSingleFile: allFiles.length === 1,
      entryPoints: allFiles
        .filter((f) => f.includes("index") || f.includes("main"))
        .slice(0, 5),
      totalFiles: allFiles.length,
    };
  }

  private static detectWebProject(
    root: string,
    allFiles: string[],
    htmlFiles: string[],
  ): ProjectDetection {
    const extensions = this.countExtensions(allFiles);
    const languages = this.mapExtensionsToLanguages(extensions);
    const frameworks: string[] = [];

    for (const htmlFile of htmlFiles.slice(0, 3)) {
      try {
        const content = fs.readFileSync(path.join(root, htmlFile), "utf-8");

        if (content.includes("tailwindcss"))
          frameworks.push("Tailwind CSS (CDN)");
        if (content.includes("bootstrap")) frameworks.push("Bootstrap (CDN)");
        if (content.includes("vue")) frameworks.push("Vue.js (CDN)");
        if (content.includes("react")) frameworks.push("React (CDN)");
        if (content.includes("alpine")) frameworks.push("Alpine.js");
        if (content.includes("htmx")) frameworks.push("HTMX");
        if (content.includes("jquery")) frameworks.push("jQuery");
        if (content.includes("fonts.googleapis.com"))
          frameworks.push("Google Fonts");
        if (content.includes("manifest.json")) frameworks.push("PWA");
        if (allFiles.some((f) => f.endsWith("sw.js")))
          frameworks.push("Service Worker");
        if (content.includes("viewport")) frameworks.push("Responsive Design");
      } catch {}
    }

    for (const jsFile of allFiles.filter((f) => f.endsWith(".js"))) {
      try {
        const content = fs.readFileSync(path.join(root, jsFile), "utf-8");
        if (content.includes("indexedDB") || content.includes("IDBDatabase"))
          frameworks.push("IndexedDB");
        if (content.includes("localStorage"))
          frameworks.push("localStorage API");
        if (content.includes("fetch")) frameworks.push("Fetch API");
        if (
          content.includes("SpeechRecognition") ||
          content.includes("webkitSpeechRecognition")
        )
          frameworks.push("Web Speech API");
        if (content.includes("navigator.vibrate"))
          frameworks.push("Vibration API");
        if (
          content.includes("serviceWorker") ||
          content.includes("navigator.serviceWorker")
        )
          frameworks.push("Service Worker API");
      } catch {}
    }

    return {
      type: "web",
      primaryLanguage: "html",
      languages,
      frameworks: [...new Set(frameworks)],
      hasPackageJson: false,
      isSingleFile: allFiles.length === 1,
      entryPoints: htmlFiles.slice(0, 5),
      totalFiles: allFiles.length,
    };
  }

  private static detectPythonProject(
    root: string,
    allFiles: string[],
  ): ProjectDetection {
    const extensions = this.countExtensions(allFiles);
    const languages = this.mapExtensionsToLanguages(extensions);
    const frameworks: string[] = ["Python"];

    if (
      allFiles.some(
        (f) => f.includes("requirements.txt") || f.includes("pyproject.toml"),
      )
    ) {
      frameworks.push("Pip / Poetry");
    }

    return {
      type: "python",
      primaryLanguage: "python",
      languages,
      frameworks,
      hasPackageJson: false,
      isSingleFile: allFiles.length === 1,
      entryPoints: allFiles.filter((f) => f.endsWith(".py")).slice(0, 5),
      totalFiles: allFiles.length,
    };
  }

  private static detectFromExtensions(
    root: string,
    allFiles: string[],
  ): ProjectDetection {
    const extensions = this.countExtensions(allFiles);
    const languages = this.mapExtensionsToLanguages(extensions);

    return {
      type: "generic",
      primaryLanguage: languages[0]?.name || "unknown",
      languages,
      frameworks: [],
      hasPackageJson: false,
      isSingleFile: allFiles.length === 1,
      entryPoints: allFiles.slice(0, 5),
      totalFiles: allFiles.length,
    };
  }

  private static countExtensions(allFiles: string[]): Map<string, number> {
    const extensions = new Map<string, number>();
    for (const file of allFiles) {
      const ext = path.extname(file).toLowerCase();
      if (ext) extensions.set(ext, (extensions.get(ext) || 0) + 1);
    }
    return extensions;
  }

  private static mapExtensionsToLanguages(
    extensions: Map<string, number>,
  ): LanguageCount[] {
    const languageMap: Record<string, string> = {
      ".js": "javascript",
      ".mjs": "javascript",
      ".cjs": "javascript",
      ".jsx": "javascript",
      ".ts": "typescript",
      ".tsx": "typescript",
      ".html": "html",
      ".htm": "html",
      ".css": "css",
      ".scss": "scss",
      ".sass": "sass",
      ".less": "less",
      ".py": "python",
      ".pyw": "python",
      ".pyx": "python",
      ".java": "java",
      ".kt": "kotlin",
      ".scala": "scala",
      ".go": "go",
      ".rs": "rust",
      ".c": "c",
      ".cpp": "cpp",
      ".h": "c",
      ".hpp": "cpp",
      ".cs": "csharp",
      ".swift": "swift",
      ".dart": "dart",
      ".rb": "ruby",
      ".php": "php",
      ".sh": "shell",
      ".ps1": "powershell",
      ".json": "json",
      ".yaml": "yaml",
      ".yml": "yaml",
      ".toml": "toml",
      ".md": "markdown",
      ".sql": "sql",
    };

    const languages: LanguageCount[] = [];
    for (const [ext, count] of extensions) {
      const lang = languageMap[ext] || `text (${ext})`;
      languages.push({ name: lang, fileCount: count });
    }

    languages.sort((a, b) => b.fileCount - a.fileCount);
    return languages;
  }
}
