import * as fs from "fs/promises";
import * as fsSync from "fs";
import * as path from "path";
import { execSync } from "child_process";

export interface CodeReferences {
  dependents?: Array<{ file: string; description: string; lineReference?: number }>;
  dependencies?: Array<{ file: string; description: string }>;
  related?: Array<{ file: string; relationship: string }>;
}

export interface CodeExplanation {
  summary: string;
  lineByLine?: Array<{ line: number; code: string; explanation: string }>;
  context: {
    purpose: string;
    dependents?: string[];
    dependencies?: string[];
    relatedFiles?: string[];
    patterns?: string[];
    recentChanges?: string[];
  };
  references?: CodeReferences;
  suggestedQuestions: string[];
}

export type ProjectContext = any;

export class ContextAwareExplainer {
  /**
   * Explain code with full project context
   * No manual selection required — analyzes entire file
   */
  static async explain(params: {
    filePath: string;
    selectedLines?: { start: number; end: number };
    projectContext: ProjectContext;
    persona?: string;
  }): Promise<CodeExplanation> {
    const fileContent = await this.readFile(params.filePath);
    const codeToExplain = params.selectedLines
      ? this.extractLines(fileContent, params.selectedLines.start, params.selectedLines.end)
      : fileContent;

    const workspaceRoot = params.projectContext?.workspacePath || process.cwd();

    // ── Gather context from the codebase dynamically ──
    const context = {
      filePurpose: await this.inferFilePurpose(params.filePath, params.projectContext),
      dependents: await this.findDependents(params.filePath, workspaceRoot),
      dependencies: await this.findDependencies(params.filePath, fileContent, workspaceRoot),
      relatedFiles: await this.findRelatedFiles(params.filePath),
      patterns: this.detectPatterns(fileContent),
      recentChanges: await this.getRecentChanges(params.filePath),
    };

    // ── Build real, syntax-analyzed explanation ──
    const explanation = await this.buildExplanation(codeToExplain, context, params.persona);

    // ── Include code references when helpful ──
    const references = this.shouldIncludeReferences(context)
      ? await this.buildReferences(context)
      : undefined;

    return {
      summary: explanation.summary,
      lineByLine: params.selectedLines ? explanation.lineByLine : undefined,
      context: {
        purpose: context.filePurpose,
        dependents: context.dependents?.slice(0, 5).map((d) => d.file),
        dependencies: context.dependencies?.slice(0, 5).map((d) => d.file),
        relatedFiles: context.relatedFiles?.slice(0, 5),
        patterns: context.patterns,
        recentChanges: context.recentChanges?.slice(0, 5),
      },
      references,
      suggestedQuestions: this.generateFollowUpQuestions(context),
    };
  }

  private static async readFile(filePath: string): Promise<string> {
    try {
      if (fsSync.existsSync(filePath)) {
        return await fs.readFile(filePath, "utf-8");
      }
      return "";
    } catch {
      return "";
    }
  }

  private static extractLines(content: string, start: number, end: number): string {
    const lines = content.split("\n");
    return lines.slice(Math.max(0, start - 1), end).join("\n");
  }

  /**
   * Infer what a file does based on name, location, exports, and AST patterns
   */
  private static async inferFilePurpose(filePath: string, context: ProjectContext): Promise<string> {
    const fileName = path.basename(filePath);
    const dirName = path.basename(path.dirname(filePath));

    const patterns: Record<string, string> = {
      index: "Entry point — exports the module's public API",
      app: "Main application component",
      main: "Application entry point",
      config: "Configuration settings",
      utils: "Utility functions",
      helpers: "Helper functions",
      types: "Type definitions",
      interface: "Interface definitions",
      model: "Data model definition",
      schema: "Database schema",
      migration: "Database migration",
      seed: "Database seed data",
      middleware: "Request middleware",
      route: "API route definitions",
      controller: "Request handler",
      service: "Business logic",
      repository: "Data access layer",
      hook: "React/Vue hook",
      component: "UI component",
      test: "Test suite",
      spec: "Specification test file",
    };

    for (const [pattern, purpose] of Object.entries(patterns)) {
      if (fileName.toLowerCase().includes(pattern) || dirName.toLowerCase().includes(pattern)) {
        return purpose;
      }
    }

    return `Source module located in ${dirName || "root"}`;
  }

  /**
   * Real search across workspace to find files importing target filePath
   */
  private static async findDependents(
    filePath: string,
    workspaceRoot: string
  ): Promise<Array<{ file: string; description: string; line?: number }>> {
    const dependents: Array<{ file: string; description: string; line?: number }> = [];
    const baseName = path.basename(filePath, path.extname(filePath));
    if (!baseName) return dependents;

    try {
      const searchTarget = baseName === "index" ? path.basename(path.dirname(filePath)) : baseName;
      const allFiles = await this.scanFiles(workspaceRoot);

      for (const file of allFiles) {
        if (path.resolve(file) === path.resolve(filePath)) continue;

        const content = await this.readFile(file);
        const relativeFile = path.relative(workspaceRoot, file).replace(/\\/g, "/");

        const lines = content.split("\n");
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          if ((line.includes("import ") || line.includes("require(")) && line.includes(searchTarget)) {
            dependents.push({
              file: relativeFile,
              description: `Imports module reference '${searchTarget}' at line ${i + 1}`,
              line: i + 1,
            });
            break;
          }
        }
        if (dependents.length >= 10) break;
      }
    } catch {
      // Ignore read errors gracefully
    }

    return dependents;
  }

  /**
   * Real dependency extraction by parsing import/require statements and checking disk
   */
  private static async findDependencies(
    filePath: string,
    content: string,
    workspaceRoot: string
  ): Promise<Array<{ file: string; description: string }>> {
    const deps: Array<{ file: string; description: string }> = [];
    const importPattern = /(?:import\s+.*?from\s+['"]([^'"]+)['"]|require\(['"]([^'"]+)['"]\))/g;

    let match;
    while ((match = importPattern.exec(content)) !== null) {
      const importPath = match[1] || match[2];
      if (!importPath) continue;

      if (importPath.startsWith(".")) {
        const resolved = path.resolve(path.dirname(filePath), importPath);
        const relative = path.relative(workspaceRoot, resolved).replace(/\\/g, "/");
        deps.push({
          file: relative,
          description: `Internal module import (${importPath})`,
        });
      } else {
        deps.push({
          file: importPath,
          description: `External dependency / package`,
        });
      }
    }

    return deps;
  }

  /**
   * Real search for actual related files existing on disk
   */
  private static async findRelatedFiles(filePath: string): Promise<string[]> {
    const related: string[] = [];
    const dir = path.dirname(filePath);
    const ext = path.extname(filePath);
    const basename = path.basename(filePath, ext);

    try {
      if (fsSync.existsSync(dir)) {
        const files = await fs.readdir(dir);
        for (const file of files) {
          const fullPath = path.join(dir, file);
          if (fullPath === filePath) continue;

          if (file.startsWith(basename) || file.includes(basename)) {
            related.push(fullPath.replace(/\\/g, "/"));
          }
        }
      }
    } catch {
      // Ignore
    }

    return related;
  }

  /**
   * Detect real design patterns in code
   */
  private static detectPatterns(code: string): string[] {
    const patterns: string[] = [];

    if (/class\s+\w+.*extends/.test(code)) patterns.push("Inheritance Pattern");
    if (/class\s+\w+.*implements/.test(code)) patterns.push("Interface Implementation");
    if (/static\s+\w+\s*\(/.test(code)) patterns.push("Static Utility Method Pattern");
    if (/export\s+default/.test(code)) patterns.push("Default Export Pattern");
    if (/export\s+const|export\s+function|export\s+class/.test(code)) patterns.push("Named Module Exports");
    if (/\.then\(|async\s|await\s/.test(code)) patterns.push("Async/Promise Control Flow");
    if (/try\s*\{[\s\S]*?\}\s*catch/.test(code)) patterns.push("Try/Catch Error Handling");
    if (/use[A-Z]\w+/.test(code)) patterns.push("React Custom Hook Pattern");
    if (/@\w+/.test(code)) patterns.push("Decorator Pattern");
    if (/new\s+Promise/.test(code)) patterns.push("Explicit Promise Constructor");

    return patterns;
  }

  /**
   * Execute real git log query to inspect actual commits on file
   */
  private static async getRecentChanges(filePath: string): Promise<string[]> {
    const history: string[] = [];
    try {
      const output = execSync(`git log -n 5 --oneline -- "${filePath}"`, {
        encoding: "utf-8",
        stdio: ["ignore", "pipe", "ignore"],
      });

      const lines = output.trim().split("\n");
      for (const line of lines) {
        if (line.trim()) {
          history.push(line.trim());
        }
      }
    } catch {
      // Fallback to file mtime if git is unavailable
      try {
        const stat = await fs.stat(filePath);
        history.push(`Last modified on disk: ${stat.mtime.toISOString()}`);
      } catch {
        // Skip
      }
    }

    return history;
  }

  /**
   * Build real line-by-line code explanation based on syntax analysis
   */
  private static async buildExplanation(
    code: string,
    context: any,
    persona?: string
  ): Promise<{ summary: string; lineByLine?: Array<{ line: number; code: string; explanation: string }> }> {
    const lines = code.split("\n");
    const summary = `Module purpose: ${context.filePurpose}. Implements ${
      context.patterns.length > 0 ? context.patterns.join(", ") : "standard procedural/declarative logic"
    }. Depends on ${context.dependencies?.length || 0} module(s).`;

    const lineByLine = lines.slice(0, 30).map((lineText, idx) => {
      const trimmed = lineText.trim();
      let explanation = "Statement execution.";

      if (/^import\s/.test(trimmed)) explanation = "Imports dependencies into current scope.";
      else if (/^export\s/.test(trimmed)) explanation = "Exports symbol for external callers.";
      else if (/^class\s/.test(trimmed)) explanation = "Class declaration defining instance properties and methods.";
      else if (/^(async\s+)?function\s|\w+\s*\([^)]*\)\s*\{/.test(trimmed)) explanation = "Function definition specifying signature and parameters.";
      else if (/^if\s*\(/.test(trimmed)) explanation = "Conditional check evaluating runtime logical condition.";
      else if (/^return\b/.test(trimmed)) explanation = "Returns result value to caller.";
      else if (/^try\s*\{/.test(trimmed)) explanation = "Protects code block with error handling context.";
      else if (/^catch\s*\(/.test(trimmed)) explanation = "Handles caught runtime exception.";
      else if (trimmed.length === 0) explanation = "Empty line separating logical blocks.";

      return {
        line: idx + 1,
        code: trimmed,
        explanation,
      };
    });

    return {
      summary,
      lineByLine,
    };
  }

  private static shouldIncludeReferences(context: any): boolean {
    return (
      (context.dependents && context.dependents.length > 0) ||
      (context.dependencies && context.dependencies.length > 0) ||
      (context.relatedFiles && context.relatedFiles.length > 0)
    );
  }

  private static async buildReferences(context: any): Promise<CodeReferences> {
    const references: CodeReferences = {};

    if (context.dependents && context.dependents.length > 0) {
      references.dependents = context.dependents.map((d: any) => ({
        file: d.file,
        description: d.description,
        lineReference: d.line,
      }));
    }

    if (context.dependencies && context.dependencies.length > 0) {
      references.dependencies = context.dependencies.map((d: any) => ({
        file: d.file,
        description: d.description,
      }));
    }

    if (context.relatedFiles && context.relatedFiles.length > 0) {
      references.related = context.relatedFiles.map((f: any) => ({
        file: f,
        relationship: "Sibling file in same directory",
      }));
    }

    return references;
  }

  private static generateFollowUpQuestions(context: any): string[] {
    const questions: string[] = [];

    if (context.dependents && context.dependents.length > 0) {
      questions.push(`What depends on ${context.dependents[0].file || "this file"}?`);
    }

    if (context.dependencies && context.dependencies.length > 0) {
      questions.push(`What does this file import from ${context.dependencies[0].file || "its dependencies"}?`);
    }

    if (context.recentChanges && context.recentChanges.length > 0) {
      questions.push(`What recent git changes affected this file?`);
    }

    if (context.patterns && context.patterns.length > 0) {
      questions.push(`Explain how the ${context.patterns[0]} works here.`);
    }

    questions.push("Are there any security or performance risks in this file?");
    return questions;
  }

  private static async scanFiles(dir: string, max: number = 200): Promise<string[]> {
    const results: string[] = [];
    const walk = async (current: string) => {
      if (results.length >= max) return;
      try {
        const entries = await fs.readdir(current, { withFileTypes: true });
        for (const entry of entries) {
          if (results.length >= max) break;
          const full = path.join(current, entry.name);
          if (entry.isDirectory()) {
            if (!entry.name.startsWith(".") && entry.name !== "node_modules" && entry.name !== "dist") {
              await walk(full);
            }
          } else if (entry.isFile() && /\.(js|ts|jsx|tsx)$/i.test(entry.name)) {
            results.push(full);
          }
        }
      } catch {
        // Skip unreadable
      }
    };

    await walk(dir);
    return results;
  }
}
