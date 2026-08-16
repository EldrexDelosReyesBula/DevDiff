import * as path from "path";

export class LanguageDetector {
  /**
   * Auto-detect programming language from code content and file path
   */
  static detect(code: string, filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();

    const extensionMap: Record<string, string> = {
      ".js": "javascript",
      ".jsx": "javascript",
      ".mjs": "javascript",
      ".ts": "typescript",
      ".tsx": "typescript",
      ".py": "python",
      ".css": "css",
      ".scss": "scss",
      ".sass": "css",
      ".html": "html",
      ".htm": "html",
      ".rs": "rust",
      ".go": "go",
      ".java": "java",
      ".cpp": "cpp",
      ".c": "c",
      ".cs": "csharp",
      ".php": "php",
      ".rb": "ruby",
      ".sh": "bash",
    };

    if (ext && extensionMap[ext]) {
      return extensionMap[ext];
    }

    // Snippet content heuristics
    if (/import\s+React|export\s+default\s+function|const\s+\w+\s*=\s*\(\)\s*=>/i.test(code)) {
      return "typescript";
    }
    if (/def\s+\w+\s*\(|import\s+os|from\s+\w+\s+import/i.test(code)) {
      return "python";
    }
    if (/^\s*[.#@][a-zA-Z0-9_-]+\s*\{|margin:|padding:/im.test(code)) {
      return "css";
    }
    if (/<html|<div|<span|<section/i.test(code)) {
      return "html";
    }
    if (/fn\s+main\s*\(\)|let\s+mut\s+|impl\s+\w+/i.test(code)) {
      return "rust";
    }
    if (/package\s+main|func\s+main\s*\(\)|fmt\.Println/i.test(code)) {
      return "go";
    }

    return "universal";
  }
}
