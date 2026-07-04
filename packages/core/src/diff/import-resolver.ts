import * as fs from "fs";
import * as path from "path";

/**
 * Import Resolver
 *
 * Resolves imports to absolute workspace paths for accurate matching.
 * Handles:
 * - Relative imports: ../../utils/format
 * - Aliased imports: @utils/format
 * - Sub-path imports: utils/formatCurrency/index
 * - Extensionless imports: ./format (resolves .ts, .tsx, .js, .jsx)
 */

export class ImportResolver {
  private workspaceRoot: string;
  private aliasMap: Map<string, string>; // @utils → src/utils
  private extensions = [".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"];

  constructor(workspaceRoot: string, tsconfigPath?: string) {
    this.workspaceRoot = workspaceRoot;
    this.aliasMap = this.loadAliases(tsconfigPath);
  }

  /**
   * Resolve an import path to absolute workspace path
   */
  resolveToWorkspacePath(importPath: string, fromFile: string): string | null {
    // 1. Alias resolution: @utils/format → src/utils/format
    for (const [alias, mappedPath] of this.aliasMap) {
      if (importPath.startsWith(alias)) {
        const resolved = importPath.replace(alias, mappedPath);
        return this.resolveExtension(path.join(this.workspaceRoot, resolved));
      }
    }

    // 2. Relative import: ./format → /workspace/src/components/format
    if (importPath.startsWith(".")) {
      const fromDir = path.dirname(fromFile);
      const resolved = path.resolve(fromDir, importPath);
      return this.resolveExtension(resolved);
    }

    // 3. Absolute-like: utils/format → /workspace/src/utils/format
    // Try common base directories
    const baseDirs = ["src", "lib", "app", "packages"];
    for (const base of baseDirs) {
      const resolved = this.resolveExtension(
        path.join(this.workspaceRoot, base, importPath)
      );
      if (resolved) return resolved;
    }

    return null;
  }

  /**
   * Check if a deleted file is imported by any changed files
   */
  findDanglingReferences(
    deletedPath: string,
    changedFiles: Map<string, string> // path → content
  ): string[] {
    const references: string[] = [];
    const deletedBasename = path.basename(deletedPath, path.extname(deletedPath));
    const deletedDir = path.dirname(deletedPath);

    for (const [changedPath, content] of changedFiles) {
      if (changedPath === deletedPath) continue;

      // Extract all imports from this file
      const imports = this.extractImportPaths(content);

      for (const imp of imports) {
        const resolved = this.resolveToWorkspacePath(imp, changedPath);

        if (resolved) {
          const resolvedBasename = path.basename(resolved, path.extname(resolved));

          if (
            resolved === deletedPath ||
            resolvedBasename === deletedBasename ||
            path.dirname(resolved) === deletedDir
          ) {
            references.push(changedPath);
            break;
          }
        }
      }
    }

    return references;
  }

  /**
   * Extract all import paths from file content
   */
  private extractImportPaths(content: string): string[] {
    const paths: string[] = [];
    const patterns = [
      /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g,
      /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
      /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
      /from\s+['"]([^'"]+)['"]/g,
    ];

    for (const pattern of patterns) {
      pattern.lastIndex = 0; // Reset
      let match;
      while ((match = pattern.exec(content)) !== null) {
        if (match[1] && !match[1].startsWith("node:") && !match[1].startsWith("node:")) {
          paths.push(match[1]);
        }
      }
    }

    return [...new Set(paths)];
  }

  /**
   * Resolve extensionless import to actual file
   */
  private resolveExtension(basePath: string): string | null {
    // Direct match
    if (fs.existsSync(basePath) && fs.statSync(basePath).isFile()) {
      return basePath;
    }

    // Extension resolution
    for (const ext of this.extensions) {
      if (fs.existsSync(basePath + ext)) {
        return basePath + ext;
      }
    }

    // Index file resolution: format → format/index.ts
    for (const ext of this.extensions) {
      const indexPath = path.join(basePath, "index" + ext);
      if (fs.existsSync(indexPath)) {
        return indexPath;
      }
    }

    return null;
  }

  /**
   * Load path aliases from tsconfig.json
   */
  private loadAliases(tsconfigPath?: string): Map<string, string> {
    const aliases = new Map<string, string>();

    const configPath = tsconfigPath || path.join(this.workspaceRoot, "tsconfig.json");

    try {
      if (fs.existsSync(configPath)) {
        const content = fs.readFileSync(configPath, "utf-8");
        // Strip single line & multi-line comments from json (common in tsconfig)
        const cleanContent = content
          .replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, "$1")
          .trim();
        const config = JSON.parse(cleanContent);
        const paths = config.compilerOptions?.paths || {};

        for (const [alias, targets] of Object.entries(paths)) {
          if (Array.isArray(targets) && targets.length > 0) {
            // Convert glob pattern to directory: @utils/* → src/utils
            const cleanAlias = alias.replace(/\/\*$/, "/");
            const cleanTarget = targets[0].replace(/\/\*$/, "/");
            aliases.set(cleanAlias, cleanTarget);
          }
        }
      }
    } catch {
      // tsconfig not found or unreadable
    }

    return aliases;
  }
}
