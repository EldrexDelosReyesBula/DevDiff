import * as fs from "fs";
import * as path from "path";

export interface DependencyInfo {
  name: string;
  version: string;
  depth: number;
  path: string | null;
  isDirect: boolean;
  networkTargets?: string[];
  hasNativeBinaries?: boolean;
  hasDangerousPatterns?: boolean;
}

export interface DependencyFinding {
  severity: "critical" | "high" | "medium" | "low";
  type: string;
  package: string;
  version?: string;
  detail: string;
  networkTargets?: string[];
  source?: string;
}

export interface DependencyWarning {
  severity: "medium" | "low";
  type: string;
  package: string;
  detail: string;
}

export interface DependencyGraphNode {
  name: string;
  version?: string;
  type: string;
  depth: number;
  hasNetworkAccess?: boolean;
  hasNativeBinaries?: boolean;
  hasDangerousPatterns?: boolean;
}

export interface DependencyGraphEdge {
  from: string;
  to: string;
}

export interface DependencyGraph {
  nodes: DependencyGraphNode[];
  edges: DependencyGraphEdge[];
}

export interface PluginRecommendation {
  action: "approve" | "warn" | "block";
  title: string;
  description: string;
  allowOverride: boolean;
  overrideWarning?: string;
}

export interface DependencyScanResult {
  totalDependencies: number;
  directDependencies: number;
  transitiveDependencies: number;
  findings: DependencyFinding[];
  warnings: DependencyWarning[];
  dependencyGraph: DependencyGraph;
  recommendation: PluginRecommendation;
}

export class DependencyScanner {
  /**
   * Scan a plugin's ENTIRE dependency tree before installation.
   * Not just the plugin itself — every package it imports.
   */
  static async scan(pluginPath: string): Promise<DependencyScanResult> {
    const findings: DependencyFinding[] = [];
    const warnings: DependencyWarning[] = [];

    // Step 1: Read package.json
    const pkgJson = this.readPackageJson(pluginPath);

    // Step 2: Get full dependency tree
    const allDependencies = await this.getDependencyTree(pluginPath);

    // Step 3: Check each dependency
    for (const dep of allDependencies) {
      // Check 1: Known malicious package via OSV / npm advisory / Socket.dev?
      if (await this.isKnownMalicious(dep.name, dep.version)) {
        findings.push({
          severity: "critical",
          type: "known-malicious",
          package: dep.name,
          version: dep.version,
          detail: `${dep.name}@${dep.version} is flagged as malicious in the ecosystem advisory registry`,
          source: "registry-advisory",
        });
      }

      // Check 2: Deprecated or unmaintained via live npm registry metadata?
      if (await this.isDeprecated(dep.name)) {
        warnings.push({
          severity: "medium",
          type: "deprecated",
          package: dep.name,
          detail: `${dep.name} is flagged as deprecated in the npm registry`,
        });
      }

      // Check 3: Network access in dependency?
      if (dep.path) {
        const networkTargets = await this.extractNetworkTargets(dep.path);
        if (networkTargets.length > 0) {
          dep.networkTargets = networkTargets;
          findings.push({
            severity: "high",
            type: "dependency-network",
            package: dep.name,
            version: dep.version,
            detail: `Transitive dependency ${dep.name} makes network calls to: ${networkTargets.join(", ")}`,
            networkTargets,
          });
        }

        // Check 4: Uses eval or dynamic code execution?
        if (await this.usesDangerousPatterns(dep.path)) {
          dep.hasDangerousPatterns = true;
          findings.push({
            severity: "high",
            type: "dangerous-patterns",
            package: dep.name,
            version: dep.version,
            detail: `${dep.name} uses eval(), Function(), or dynamic code execution`,
          });
        }

        // Check 5: Has native binaries?
        if (await this.hasNativeBinaries(dep.path)) {
          dep.hasNativeBinaries = true;
          findings.push({
            severity: "high",
            type: "native-binaries",
            package: dep.name,
            version: dep.version,
            detail: `${dep.name} includes native binary addons (.node, .so, .dll)`,
          });
        }
      }
    }

    // Step 4: Build dependency graph for visualization
    const graph = this.buildDependencyGraph(pluginPath, allDependencies);

    const directCount = Object.keys(pkgJson?.dependencies || {}).length;

    return {
      totalDependencies: allDependencies.length,
      directDependencies: directCount,
      transitiveDependencies: Math.max(0, allDependencies.length - directCount),
      findings,
      warnings,
      dependencyGraph: graph,
      recommendation: this.generateRecommendation(findings, warnings),
    };
  }

  /**
   * Get the FULL dependency tree, not just direct deps
   */
  private static async getDependencyTree(
    pluginPath: string,
  ): Promise<DependencyInfo[]> {
    const dependencies: DependencyInfo[] = [];
    const visited = new Set<string>();

    const traverse = async (currentPath: string, depth: number = 0) => {
      if (depth > 10) return;

      const pkgJson = this.readPackageJson(currentPath);
      if (!pkgJson) return;

      const deps = {
        ...pkgJson.dependencies,
        ...pkgJson.peerDependencies,
      };

      for (const [name, version] of Object.entries(deps)) {
        const versionStr = String(version);
        const depKey = `${name}@${versionStr}`;
        if (visited.has(depKey)) continue;
        visited.add(depKey);

        const depPath = this.resolveDependencyPath(currentPath, name);

        dependencies.push({
          name,
          version: versionStr,
          depth,
          path: depPath,
          isDirect: depth === 0,
        });

        if (depPath) {
          await traverse(depPath, depth + 1);
        }
      }
    };

    await traverse(pluginPath);
    return dependencies;
  }

  /**
   * Live vulnerability check against OSV.dev, npm Advisories, and Socket.dev
   */
  private static async isKnownMalicious(
    name: string,
    version: string,
  ): Promise<boolean> {
    const sources = [
      this.checkOSV(name, version),
      this.checkNpmAdvisory(name, version),
      this.checkSocketDev(name, version),
    ];

    const results = await Promise.all(sources);
    return results.some((r) => r === true);
  }

  /**
   * Live deprecation check against official npm registry
   */
  private static async isDeprecated(name: string): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);
      const res = await fetch(
        `https://registry.npmjs.org/${encodeURIComponent(name)}/latest`,
        { signal: controller.signal },
      );
      clearTimeout(timeout);

      if (!res.ok) return false;
      const data = await res.json();
      return Boolean(data.deprecated);
    } catch {
      return false;
    }
  }

  /**
   * Live OSV.dev query API
   */
  private static async checkOSV(
    name: string,
    version: string,
  ): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);
      const res = await fetch("https://api.osv.dev/v1/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          package: { name, ecosystem: "npm" },
          version: version.replace(/^[\^~>=]/, ""),
        }),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!res.ok) return false;
      const data = await res.json();
      return Array.isArray(data.vulns) && data.vulns.length > 0;
    } catch {
      return false;
    }
  }

  /**
   * Live npm advisory query API
   */
  private static async checkNpmAdvisory(
    name: string,
    version: string,
  ): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);
      const res = await fetch(
        `https://registry.npmjs.org/-/npm/v1/security/advisories/search?package=${encodeURIComponent(name)}`,
        { signal: controller.signal },
      );
      clearTimeout(timeout);

      if (!res.ok) return false;
      const data = await res.json();
      return Object.keys(data).length > 0;
    } catch {
      return false;
    }
  }

  /**
   * Socket.dev package security lookup fallback
   */
  private static async checkSocketDev(
    name: string,
    version: string,
  ): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);
      const cleanVer = version.replace(/^[\^~>=]/, "");
      const res = await fetch(
        `https://socket.dev/api/npm/package/info/${encodeURIComponent(name)}/${encodeURIComponent(cleanVer)}`,
        { signal: controller.signal },
      );
      clearTimeout(timeout);

      if (!res.ok) return false;
      const data = await res.json();
      return Boolean(
        data?.alerts?.some(
          (a: any) => a.severity === "critical" || a.severity === "high",
        ),
      );
    } catch {
      return false;
    }
  }

  /**
   * Extract ALL network targets from source code
   */
  private static async extractNetworkTargets(
    packagePath: string,
  ): Promise<string[]> {
    if (!packagePath || !fs.existsSync(packagePath)) return [];

    const targets: string[] = [];
    const files = this.getSourceFiles(packagePath);

    for (const file of files) {
      try {
        const content = fs.readFileSync(file, "utf-8");

        const urlPatterns = [
          /fetch\s*\(\s*['"`](https?:\/\/[^'"`]+)['"`]/g,
          /axios\.(?:get|post|put|delete)\s*\(\s*['"`](https?:\/\/[^'"`]+)['"`]/g,
          /request\s*\(\s*['"`](https?:\/\/[^'"`]+)['"`]/g,
          /\.open\s*\(\s*['"`]\w+['"`]\s*,\s*['"`](https?:\/\/[^'"`]+)['"`]/g,
          /new\s+WebSocket\s*\(\s*['"`](wss?:\/\/[^'"`]+)['"`]/g,
        ];

        for (const pattern of urlPatterns) {
          let match: RegExpExecArray | null;
          while ((match = pattern.exec(content)) !== null) {
            try {
              const url = new URL(match[1]);
              targets.push(url.hostname);
            } catch {}
          }
        }
      } catch {}
    }

    return [...new Set(targets)];
  }

  /**
   * Check for dangerous code patterns
   */
  private static async usesDangerousPatterns(
    packagePath: string,
  ): Promise<boolean> {
    if (!packagePath || !fs.existsSync(packagePath)) return false;

    const files = this.getSourceFiles(packagePath);
    const dangerousPatterns = [
      /\beval\s*\(/,
      /\bFunction\s*\(/,
      /\bexecScript\s*\(/,
      /child_process\.exec/,
      /child_process\.spawn/,
      /\brequire\s*\(\s*['"`][^'"`]+['"`]\s*\)/,
      /import\s*\([^'"]/,
    ];

    for (const file of files) {
      try {
        const content = fs.readFileSync(file, "utf-8");
        if (dangerousPatterns.some((p) => p.test(content))) {
          return true;
        }
      } catch {}
    }

    return false;
  }

  /**
   * Check for native binary addons
   */
  private static async hasNativeBinaries(
    packagePath: string,
  ): Promise<boolean> {
    if (!packagePath || !fs.existsSync(packagePath)) return false;

    const binaryExtensions = [".node", ".so", ".dylib", ".dll", ".wasm"];
    const files = this.getAllFiles(packagePath);

    return files.some((f) => binaryExtensions.some((ext) => f.endsWith(ext)));
  }

  private static getSourceFiles(dir: string): string[] {
    if (!fs.existsSync(dir)) return [];

    const files: string[] = [];
    const walk = (currentDir: string) => {
      try {
        for (const entry of fs.readdirSync(currentDir)) {
          const fullPath = path.join(currentDir, entry);
          const stat = fs.statSync(fullPath);

          if (
            stat.isDirectory() &&
            !entry.startsWith(".") &&
            entry !== "node_modules"
          ) {
            walk(fullPath);
          } else if (
            stat.isFile() &&
            /\.(js|ts|jsx|tsx|mjs|cjs)$/.test(entry)
          ) {
            files.push(fullPath);
          }
        }
      } catch {}
    };

    walk(dir);
    return files;
  }

  private static getAllFiles(dir: string): string[] {
    if (!fs.existsSync(dir)) return [];

    const files: string[] = [];
    const walk = (currentDir: string) => {
      try {
        for (const entry of fs.readdirSync(currentDir)) {
          const fullPath = path.join(currentDir, entry);
          const stat = fs.statSync(fullPath);

          if (
            stat.isDirectory() &&
            !entry.startsWith(".") &&
            entry !== "node_modules"
          ) {
            walk(fullPath);
          } else if (stat.isFile()) {
            files.push(fullPath);
          }
        }
      } catch {}
    };

    walk(dir);
    return files;
  }

  private static buildDependencyGraph(
    pluginPath: string,
    deps: DependencyInfo[],
  ): DependencyGraph {
    const graph: DependencyGraph = {
      nodes: [],
      edges: [],
    };

    const pkgJson = this.readPackageJson(pluginPath);
    const rootName = pkgJson?.name || "plugin";
    graph.nodes.push({
      name: rootName,
      type: "plugin",
      depth: 0,
    });

    for (const dep of deps) {
      graph.nodes.push({
        name: dep.name,
        version: dep.version,
        type: dep.isDirect ? "direct-dependency" : "transitive-dependency",
        depth: dep.depth,
        hasNetworkAccess:
          Boolean(dep.networkTargets) && (dep.networkTargets?.length || 0) > 0,
        hasNativeBinaries: dep.hasNativeBinaries,
        hasDangerousPatterns: dep.hasDangerousPatterns,
      });

      graph.edges.push({
        from:
          dep.depth === 0 ? rootName : deps[dep.depth - 1]?.name || rootName,
        to: dep.name,
      });
    }

    return graph;
  }

  private static generateRecommendation(
    findings: DependencyFinding[],
    warnings: DependencyWarning[],
  ): PluginRecommendation {
    const critical = findings.filter((f) => f.severity === "critical").length;
    const high = findings.filter((f) => f.severity === "high").length;

    if (critical > 0) {
      return {
        action: "block",
        title: "⚠️ Critical security concerns in dependencies",
        description: `${critical} critical finding(s) in plugin dependencies. Installation blocked.`,
        allowOverride: true,
        overrideWarning:
          "Installing despite critical findings may expose your codebase to supply chain attacks.",
      };
    }

    if (high > 2) {
      return {
        action: "warn",
        title: "⚠️ Security concerns detected",
        description: `${high} high-severity finding(s). Review before installing.`,
        allowOverride: true,
      };
    }

    return {
      action: "approve",
      title: "✅ Dependencies look safe",
      description: "No critical or high-severity concerns in dependency tree.",
      allowOverride: false,
    };
  }

  private static readPackageJson(dir: string): any {
    try {
      const pkgPath = path.join(dir, "package.json");
      if (fs.existsSync(pkgPath)) {
        return JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
      }
    } catch {}
    return null;
  }

  private static resolveDependencyPath(
    parentPath: string,
    depName: string,
  ): string | null {
    const possiblePaths = [
      path.join(parentPath, "node_modules", depName),
      path.join(parentPath, "..", "node_modules", depName),
      path.join(parentPath, "..", "..", "node_modules", depName),
    ];

    for (const p of possiblePaths) {
      if (fs.existsSync(p)) return p;
    }

    return null;
  }
}
