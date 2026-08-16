import * as fs from "fs";

export interface FileChangeInfo {
  path: string;
  status: "added" | "modified" | "deleted" | "renamed";
  content?: string;
  oldContent?: string;
  commitMessage?: string;
  additions?: number;
  deletions?: number;
  isBreaking?: boolean;
}

export interface ParsedDiff {
  files: FileChangeInfo[];
  commits?: Array<{ hash: string; message: string; tags?: string[] }>;
}

export type DiagramType = "architecture" | "dependencies" | "timeline" | "flowchart" | { type: "architecture" | "dependencies" | "timeline" | "flowchart" };

export interface MermaidResult {
  diagram: string;
  type: string;
  valid: boolean;
  note?: string;
}

export type ProjectContext = any;

export class MermaidEngineV2 {
  private static readonly RESERVED_WORDS = [
    "graph", "subgraph", "end", "style", "classDef", "class",
    "click", "direction", "TB", "BT", "LR", "RL", "TD"
  ];

  /**
   * Generate diagram — NEVER fails, always returns valid Mermaid
   */
  static generate(diff: ParsedDiff, context: ProjectContext = {}, type: DiagramType = "architecture"): MermaidResult {
    const rawType = typeof type === "string" ? type : type?.type || "architecture";
    const safeDiff: ParsedDiff = {
      files: diff?.files || [],
      commits: diff?.commits || []
    };

    try {
      switch (rawType) {
        case "architecture":
          return this.generateArchitecture(safeDiff, context);
        case "dependencies":
          return this.generateDependencies(safeDiff, context);
        case "timeline":
          return this.generateTimeline(safeDiff);
        case "flowchart":
          return this.generateFlowchart(safeDiff);
        default:
          return this.generateArchitecture(safeDiff, context);
      }
    } catch (error) {
      // ALWAYS fall back to simple valid diagram
      return this.generateFallbackDiagram(safeDiff, error as Error);
    }
  }

  /**
   * Sanitize ANY string to a valid Mermaid node ID
   */
  static sanitizeNodeId(input: string): string {
    if (!input || input.trim().length === 0) {
      return "node_" + Math.random().toString(36).slice(2, 8);
    }

    let id = input
      // Replace path separators
      .replace(/[\/\\]/g, "_")
      // Replace special characters with underscore
      .replace(/[^a-zA-Z0-9_]/g, "_")
      // Collapse multiple underscores
      .replace(/_+/g, "_")
      // Trim leading/trailing underscores
      .replace(/^_|_$/g, "")
      // Can't start with number
      .replace(/^(\d)/, "n_$1")
      // Truncate long names
      .slice(0, 50);

    // Handle reserved words
    if (this.RESERVED_WORDS.includes(id.toLowerCase())) {
      id = "node_" + id;
    }

    // Fallback for empty after sanitization
    if (!id || id.length === 0) {
      id = "node_" + Math.random().toString(36).slice(2, 8);
    }

    return id;
  }

  /**
   * Sanitize label text for Mermaid
   */
  static sanitizeLabel(input: string, maxLength: number = 80): string {
    if (!input) return "";
    return input
      .replace(/\\/g, "\\\\")
      .replace(/"/g, '\\"')
      .replace(/\n/g, " ")
      .replace(/\r/g, "")
      .replace(/\t/g, " ")
      .slice(0, maxLength)
      .trim();
  }

  /**
   * Generate architecture diagram
   */
  private static generateArchitecture(diff: ParsedDiff, context: ProjectContext): MermaidResult {
    const lines: string[] = [];
    lines.push("graph TD");

    // Track unique modules
    const modules = new Map<string, { id: string; label: string; files: number; changed: boolean }>();

    for (const file of diff.files) {
      const moduleName = this.extractModuleName(file.path);
      const moduleId = this.sanitizeNodeId(moduleName);

      if (!modules.has(moduleId)) {
        modules.set(moduleId, {
          id: moduleId,
          label: this.sanitizeLabel(moduleName),
          files: 0,
          changed: false,
        });
      }

      const module = modules.get(moduleId)!;
      module.files++;
      if (file.status === "modified" || file.status === "added" || file.status === "deleted") {
        module.changed = true;
      }
    }

    if (modules.size === 0) {
      return this.generateFallbackDiagram(diff, new Error("No files to analyze for architecture"));
    }

    // Add nodes
    for (const [id, module] of modules) {
      const style = module.changed ? "fill:#6366f1,color:#fff" : "fill:#e2e8f0,color:#333";
      lines.push(`    ${id}["${module.label}\n(${module.files} files)"]`);
      lines.push(`    style ${id} ${style}`);
    }

    // Add relationships based on imports
    const relationships = this.detectModuleRelationships(diff);
    for (const rel of relationships) {
      const fromId = this.sanitizeNodeId(rel.from);
      const toId = this.sanitizeNodeId(rel.to);

      if (modules.has(fromId) && modules.has(toId)) {
        const arrow = rel.type === "imports" ? "-->" : "-.->";
        const label = rel.count > 1 ? `|${rel.count} imports|` : "";
        lines.push(`    ${fromId} ${label}${arrow} ${toId}`);
      }
    }

    // Validate
    const diagram = lines.join("\n");
    const validation = this.validate(diagram);

    if (!validation.valid) {
      return this.generateFallbackDiagram(diff, new Error(validation.errors.join(", ")));
    }

    return {
      diagram,
      type: "architecture",
      valid: true,
    };
  }

  /**
   * Generate dependency graph
   */
  private static generateDependencies(diff: ParsedDiff, context: ProjectContext): MermaidResult {
    const lines: string[] = [];
    lines.push("graph LR");

    const changedPackages = new Set<string>();

    for (const file of diff.files) {
      if (file.path && file.path.includes("package.json")) {
        const pkgName = this.extractPackageName(file.path);
        if (pkgName) changedPackages.add(pkgName);
      }
    }

    if (changedPackages.size === 0) {
      return this.generateFallbackDiagram(diff, new Error("No dependency changes detected"));
    }

    for (const pkg of changedPackages) {
      const pkgId = this.sanitizeNodeId(pkg);
      lines.push(`    ${pkgId}["${this.sanitizeLabel(pkg)}"]`);

      if (pkg.includes("updated")) {
        lines.push(`    style ${pkgId} fill:#f59e0b,color:#000`);
      } else if (pkg.includes("added")) {
        lines.push(`    style ${pkgId} fill:#22c55e,color:#fff`);
      }
    }

    const diagram = lines.join("\n");
    const validation = this.validate(diagram);

    if (!validation.valid) {
      return this.generateFallbackDiagram(diff, new Error(validation.errors.join(", ")));
    }

    return {
      diagram,
      type: "dependencies",
      valid: true,
    };
  }

  /**
   * Generate git timeline
   */
  private static generateTimeline(diff: ParsedDiff): MermaidResult {
    if (!diff.commits || diff.commits.length === 0) {
      return this.generateFallbackDiagram(diff, new Error("No commits to display"));
    }

    const lines: string[] = [];
    lines.push("gitGraph");

    for (const commit of diff.commits.slice(-10)) {
      const msg = this.sanitizeLabel(commit.message, 40);
      lines.push(`    commit id: "${commit.hash.slice(0, 7)}"`);
      lines.push(`    commit msg: "${msg}"`);

      if (commit.tags && commit.tags.length > 0) {
        for (const tag of commit.tags) {
          lines.push(`    tag: "${this.sanitizeLabel(tag, 20)}"`);
        }
      }
    }

    const diagram = lines.join("\n");

    return {
      diagram,
      type: "timeline",
      valid: true,
    };
  }

  /**
   * Generate flowchart of changes
   */
  private static generateFlowchart(diff: ParsedDiff): MermaidResult {
    if (!diff.files || diff.files.length === 0) {
      return this.generateFallbackDiagram(diff, new Error("No files changed"));
    }

    const lines: string[] = [];
    lines.push("graph TD");

    const byType = {
      added: diff.files.filter((f) => f.status === "added"),
      modified: diff.files.filter((f) => f.status === "modified"),
      deleted: diff.files.filter((f) => f.status === "deleted"),
      renamed: diff.files.filter((f) => f.status === "renamed"),
    };

    const typeColors = {
      added: "#22c55e",
      modified: "#f59e0b",
      deleted: "#ef4444",
      renamed: "#3b82f6",
    };

    for (const [type, files] of Object.entries(byType)) {
      if (files.length === 0) continue;

      const typeId = this.sanitizeNodeId(`changes_${type}`);
      const color = typeColors[type as keyof typeof typeColors];

      lines.push(`    ${typeId}["${type.toUpperCase()} (${files.length} files)"]`);
      lines.push(`    style ${typeId} fill:${color},color:#fff`);

      for (const file of files.slice(0, 5)) {
        const fileId = this.sanitizeNodeId(file.path);
        const fileName = this.sanitizeLabel(file.path.split("/").pop() || file.path);
        lines.push(`    ${fileId}["${fileName}"]`);
        lines.push(`    ${typeId} --> ${fileId}`);
      }

      if (files.length > 5) {
        const moreId = this.sanitizeNodeId(`more_${type}`);
        lines.push(`    ${moreId}["+${files.length - 5} more"]`);
        lines.push(`    ${typeId} -.-> ${moreId}`);
      }
    }

    const diagram = lines.join("\n");
    const validation = this.validate(diagram);

    if (!validation.valid) {
      return this.generateFallbackDiagram(diff, new Error(validation.errors.join(", ")));
    }

    return {
      diagram,
      type: "flowchart",
      valid: true,
    };
  }

  /**
   * Fallback diagram — ALWAYS valid
   */
  private static generateFallbackDiagram(diff: ParsedDiff, error: Error): MermaidResult {
    const lines: string[] = [];
    lines.push("graph TD");
    lines.push(`    title["Changes Summary"]`);

    const files = diff?.files || [];
    const stats = {
      added: files.filter((f) => f.status === "added").length,
      modified: files.filter((f) => f.status === "modified").length,
      deleted: files.filter((f) => f.status === "deleted").length,
    };

    const totalId = this.sanitizeNodeId("total");
    lines.push(`    ${totalId}["${files.length} files changed"]`);
    lines.push(`    style ${totalId} fill:#6366f1,color:#fff`);
    lines.push(`    title --> ${totalId}`);

    if (stats.added > 0) {
      const addedId = this.sanitizeNodeId("added");
      lines.push(`    ${addedId}["+${stats.added} added"]`);
      lines.push(`    style ${addedId} fill:#22c55e,color:#fff`);
      lines.push(`    ${totalId} --> ${addedId}`);
    }

    if (stats.modified > 0) {
      const modifiedId = this.sanitizeNodeId("modified");
      lines.push(`    ${modifiedId}["~${stats.modified} modified"]`);
      lines.push(`    style ${modifiedId} fill:#f59e0b,color:#000`);
      lines.push(`    ${totalId} --> ${modifiedId}`);
    }

    if (stats.deleted > 0) {
      const deletedId = this.sanitizeNodeId("deleted");
      lines.push(`    ${deletedId}["-${stats.deleted} deleted"]`);
      lines.push(`    style ${deletedId} fill:#ef4444,color:#fff`);
      lines.push(`    ${totalId} --> ${deletedId}`);
    }

    const diagram = lines.join("\n");

    return {
      diagram,
      type: "fallback",
      valid: true,
      note: `Simplified diagram generated. Original error: ${error.message}`,
    };
  }

  /**
   * Validate Mermaid syntax before output
   */
  private static validate(diagram: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!diagram || diagram.trim().length === 0) {
      errors.push("Empty diagram");
      return { valid: false, errors };
    }

    // Check balanced brackets
    const openBrackets = (diagram.match(/\[/g) || []).length;
    const closeBrackets = (diagram.match(/\]/g) || []).length;
    if (openBrackets !== closeBrackets) {
      errors.push(`Unbalanced brackets: ${openBrackets} open, ${closeBrackets} close`);
    }

    // Check balanced quotes
    const quotes = (diagram.match(/"/g) || []).length;
    if (quotes % 2 !== 0) {
      errors.push(`Unbalanced quotes: ${quotes}`);
    }

    // Check balanced parentheses
    const openParens = (diagram.match(/\(/g) || []).length;
    const closeParens = (diagram.match(/\)/g) || []).length;
    if (openParens !== closeParens) {
      errors.push(`Unbalanced parentheses: ${openParens} open, ${closeParens} close`);
    }

    // Check for empty node definitions
    if (/\[\]/.test(diagram) || /\(\)/.test(diagram)) {
      errors.push("Empty node definition found");
    }

    // Check for invalid characters in node IDs
    const nodePattern = /\s+([a-zA-Z_][\w]*)\s*[\[\(\{]/g;
    let match;
    while ((match = nodePattern.exec(diagram)) !== null) {
      if (/[^a-zA-Z0-9_]/.test(match[1])) {
        errors.push(`Invalid characters in node ID: "${match[1]}"`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  private static extractModuleName(filePath: string): string {
    if (!filePath) return "root";
    const normalized = filePath.replace(/\\/g, "/");
    const parts = normalized.split("/");

    if (parts[0] === "src" && parts.length > 1) return parts[1];
    if (parts[0] === "packages" && parts.length > 1) return parts[1];
    if (parts[0] === "lib" && parts.length > 1) return parts[1];

    return parts[0] || "root";
  }

  private static extractPackageName(filePath: string): string | null {
    try {
      if (!fs.existsSync(filePath)) return null;
      const content = fs.readFileSync(filePath, "utf-8");
      const pkg = JSON.parse(content);
      return pkg.name || null;
    } catch {
      return null;
    }
  }

  private static detectModuleRelationships(diff: ParsedDiff): Array<{ from: string; to: string; type: string; count: number }> {
    const relationships: Array<{ from: string; to: string; type: string; count: number }> = [];
    const importPattern = /from\s+['"]([^'"]+)['"]/g;

    const files = diff?.files || [];
    for (const file of files.filter((f) => f.status === "modified" || f.status === "added")) {
      const content = file.content || "";
      const fromModule = this.extractModuleName(file.path);

      let match;
      while ((match = importPattern.exec(content)) !== null) {
        const importPath = match[1];
        if (importPath.startsWith(".") || importPath.startsWith("@")) {
          const toModule = this.extractModuleName(importPath);

          const existing = relationships.find((r) => r.from === fromModule && r.to === toModule);
          if (existing) {
            existing.count++;
          } else {
            relationships.push({ from: fromModule, to: toModule, type: "imports", count: 1 });
          }
        }
      }
    }

    return relationships;
  }
}
