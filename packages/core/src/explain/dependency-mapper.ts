import * as fs from "fs/promises";
import * as fsSync from "fs";
import * as path from "path";

export interface DependencyNode {
  file: string;
  label: string;
  type: string;
  dependents?: string[];
  dependencies?: string[];
  children: DependencyNode[];
}

export interface DependencyDiagram {
  mermaid: string;
  summary: string;
  keyFiles: string[];
}

export type ProjectContext = any;

export class DependencyMapper {
  /**
   * Generate Mermaid diagram showing how a file connects to the project dynamically from disk
   */
  static generateDiagram(params: {
    filePath: string;
    projectContext?: ProjectContext;
    depth?: number;
  }): DependencyDiagram {
    const depth = params.depth || 2;
    const visited = new Set<string>();
    const workspaceRoot = params.projectContext?.workspacePath || process.cwd();

    const absolutePath = path.isAbsolute(params.filePath)
      ? params.filePath
      : path.resolve(workspaceRoot, params.filePath);

    const relativeTarget = path.relative(workspaceRoot, absolutePath).replace(/\\/g, "/");

    const diagramNode = this.buildDependencyGraph(
      absolutePath,
      relativeTarget,
      workspaceRoot,
      depth,
      visited
    );

    return {
      mermaid: this.toMermaid(diagramNode),
      summary: this.summarize(diagramNode),
      keyFiles: this.extractKeyFiles(diagramNode),
    };
  }

  /**
   * Build dependency graph from disk recursively
   */
  private static buildDependencyGraph(
    absolutePath: string,
    relativePath: string,
    workspaceRoot: string,
    maxDepth: number,
    visited: Set<string>,
    currentDepth: number = 0
  ): DependencyNode {
    const type = this.classifyFile(relativePath);

    if (visited.has(relativePath) || currentDepth > maxDepth) {
      return {
        file: relativePath,
        label: this.shortenPath(relativePath),
        type,
        children: [],
      };
    }

    visited.add(relativePath);

    const realDeps = this.parseFileDependencies(absolutePath, workspaceRoot);
    const realDependents = this.findFileDependents(relativePath, workspaceRoot);

    const node: DependencyNode = {
      file: relativePath,
      label: this.shortenPath(relativePath),
      type,
      dependents: realDependents,
      dependencies: realDeps.map((d) => d.relative),
      children: [],
    };

    // Recurse into dependencies on disk
    for (const dep of realDeps.slice(0, 5)) {
      if (dep.absolute && fsSync.existsSync(dep.absolute)) {
        const child = this.buildDependencyGraph(
          dep.absolute,
          dep.relative,
          workspaceRoot,
          maxDepth,
          visited,
          currentDepth + 1
        );
        node.children.push(child);
      }
    }

    return node;
  }

  /**
   * Parse real file dependencies on disk
   */
  private static parseFileDependencies(
    absolutePath: string,
    workspaceRoot: string
  ): Array<{ absolute?: string; relative: string }> {
    const results: Array<{ absolute?: string; relative: string }> = [];
    try {
      if (!fsSync.existsSync(absolutePath)) return results;

      const content = fsSync.readFileSync(absolutePath, "utf-8");
      const importRegex = /(?:import\s+.*?from\s+['"]([^'"]+)['"]|require\(['"]([^'"]+)['"]\))/g;

      let match;
      while ((match = importRegex.exec(content)) !== null) {
        const importPath = match[1] || match[2];
        if (!importPath) continue;

        if (importPath.startsWith(".")) {
          const dir = path.dirname(absolutePath);
          let resolved = path.resolve(dir, importPath);

          // Resolve extensions
          if (!fsSync.existsSync(resolved)) {
            const extensions = [".ts", ".js", ".tsx", ".jsx", "/index.ts", "/index.js"];
            for (const ext of extensions) {
              if (fsSync.existsSync(resolved + ext)) {
                resolved = resolved + ext;
                break;
              }
            }
          }

          const rel = path.relative(workspaceRoot, resolved).replace(/\\/g, "/");
          results.push({ absolute: resolved, relative: rel });
        } else {
          results.push({ relative: importPath });
        }
      }
    } catch {
      // Ignore read errors
    }

    return results;
  }

  /**
   * Find files in workspace importing target relativePath
   */
  private static findFileDependents(relativePath: string, workspaceRoot: string): string[] {
    const dependents: string[] = [];
    const baseName = path.basename(relativePath, path.extname(relativePath));
    if (!baseName) return dependents;

    try {
      const searchTarget = baseName === "index" ? path.basename(path.dirname(relativePath)) : baseName;
      const candidates = this.scanWorkspace(workspaceRoot, 50);

      for (const file of candidates) {
        const relCandidate = path.relative(workspaceRoot, file).replace(/\\/g, "/");
        if (relCandidate === relativePath) continue;

        try {
          const content = fsSync.readFileSync(file, "utf-8");
          if (content.includes(searchTarget) && (content.includes("import ") || content.includes("require("))) {
            dependents.push(relCandidate);
          }
        } catch {
          // Skip
        }

        if (dependents.length >= 8) break;
      }
    } catch {
      // Skip
    }

    return dependents;
  }

  /**
   * Convert dependency graph to Mermaid
   */
  private static toMermaid(root: DependencyNode): string {
    const lines: string[] = [];
    lines.push("graph TD");

    const nodeIds = new Map<string, string>();
    let counter = 0;

    const addNode = (node: DependencyNode, parentId?: string) => {
      if (nodeIds.has(node.file)) {
        const existingId = nodeIds.get(node.file);
        if (parentId && existingId) {
          lines.push(`    ${parentId} --> ${existingId}`);
        }
        return;
      }

      const nodeId = `N${counter++}`;
      nodeIds.set(node.file, nodeId);

      const styles: Record<string, string> = {
        "entry-point": "fill:#6366f1,color:#fff",
        service: "fill:#22c55e,color:#fff",
        utility: "fill:#f59e0b,color:#000",
        component: "fill:#3b82f6,color:#fff",
        middleware: "fill:#ef4444,color:#fff",
        model: "fill:#8b5cf6,color:#fff",
        config: "fill:#6b7280,color:#fff",
        test: "fill:#ec4899,color:#fff",
        unknown: "fill:#e2e8f0,color:#333",
      };

      const style = styles[node.type] || styles["unknown"];

      lines.push(`    ${nodeId}["${this.sanitizeLabel(node.label)}"]`);
      lines.push(`    style ${nodeId} ${style}`);

      if (parentId) {
        lines.push(`    ${parentId} --> ${nodeId}`);
      }

      for (const child of node.children) {
        addNode(child, nodeId);
      }
    };

    addNode(root);

    const rootId = nodeIds.get(root.file);
    if (rootId) {
      lines.push(`    style ${rootId} stroke:#6366f1,stroke-width:3px`);
    }

    return lines.join("\n");
  }

  /**
   * Generate human-readable summary of dependency map
   */
  private static summarize(root: DependencyNode): string {
    const lines: string[] = [];

    lines.push(`**${root.label}** is classified as a **${root.type}** component.`);

    const dependents = root.dependents || [];
    if (dependents.length > 0) {
      lines.push(`\n### Used By (${dependents.length})`);
      for (const dep of dependents.slice(0, 5)) {
        lines.push(`- \`${this.shortenPath(dep)}\``);
      }
      if (dependents.length > 5) {
        lines.push(`- ... and ${dependents.length - 5} more`);
      }
    }

    const dependencies = root.dependencies || [];
    if (dependencies.length > 0) {
      lines.push(`\n### Depends On (${dependencies.length})`);
      for (const dep of dependencies.slice(0, 5)) {
        lines.push(`- \`${this.shortenPath(dep)}\``);
      }
      if (dependencies.length > 5) {
        lines.push(`- ... and ${dependencies.length - 5} more`);
      }
    }

    return lines.join("\n");
  }

  private static classifyFile(filePath: string): string {
    const normalized = filePath.replace(/\\/g, "/");
    const fileName = normalized.split("/").pop()?.toLowerCase() || "";
    const parts = normalized.split("/");
    const dirName = parts.slice(-2, -1)[0]?.toLowerCase() || "";

    if (fileName.includes("index") || fileName.includes("main") || fileName.includes("app") || fileName.includes("server")) return "entry-point";
    if (dirName.includes("service") || fileName.includes("service")) return "service";
    if (dirName.includes("util") || dirName.includes("helper") || fileName.includes("util")) return "utility";
    if (dirName.includes("component") || fileName.includes("component")) return "component";
    if (dirName.includes("middleware")) return "middleware";
    if (dirName.includes("model") || dirName.includes("schema") || dirName.includes("entity")) return "model";
    if (dirName.includes("config") || fileName.includes("config")) return "config";
    if (fileName.includes("test") || fileName.includes("spec")) return "test";
    return "unknown";
  }

  private static shortenPath(filePath: string): string {
    const parts = filePath.replace(/\\/g, "/").split("/");
    if (parts.length <= 2) return filePath;
    return `${parts[0]}/.../${parts[parts.length - 1]}`;
  }

  private static extractKeyFiles(root: DependencyNode): string[] {
    const keyFiles: string[] = [];

    if (root.type === "entry-point" || root.type === "service") keyFiles.push(root.file);

    for (const child of root.children) {
      if (child.type === "service" || child.type === "middleware" || child.type === "entry-point") {
        keyFiles.push(child.file);
      }
    }

    return Array.from(new Set(keyFiles));
  }

  private static sanitizeLabel(input: string): string {
    if (!input) return "";
    return input.replace(/"/g, '\\"').replace(/\n/g, " ").slice(0, 60);
  }

  private static scanWorkspace(dir: string, maxFiles: number = 50): string[] {
    const results: string[] = [];
    const walk = (current: string) => {
      if (results.length >= maxFiles) return;
      try {
        const entries = fsSync.readdirSync(current, { withFileTypes: true });
        for (const entry of entries) {
          if (results.length >= maxFiles) break;
          const full = path.join(current, entry.name);
          if (entry.isDirectory()) {
            if (!entry.name.startsWith(".") && entry.name !== "node_modules" && entry.name !== "dist") {
              walk(full);
            }
          } else if (entry.isFile() && /\.(js|ts|jsx|tsx)$/i.test(entry.name)) {
            results.push(full);
          }
        }
      } catch {
        // Ignore unreadable
      }
    };

    walk(dir);
    return results;
  }
}
