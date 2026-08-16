import * as fs from "fs";
import * as path from "path";

export interface AgenticPackageManifest {
  /** Unique package identifier */
  name: string;

  /** What kind of package this is */
  packageType: "engine" | "sdk" | "plugin-sdk" | "connector" | "cli" | "extension" | "template";

  /** What this package can do */
  capabilities: string[];

  /** What this package exports */
  exports: {
    main: string;
    classes: string[];
    functions: string[];
    types: string[];
  };

  /** Dependencies */
  dependencies: {
    required: string[];
    optional: string[];
  };

  /**
   * Agent Context — Written for AI agents to understand.
   * This is the key to zero-shot understanding.
   */
  agentContext: {
    /** What does this package do? */
    purpose: string;

    /** When should an agent use this package? */
    whenToUse: string;

    /** Key concepts the agent needs to understand */
    keyConcepts: string[];

    /** Common integration patterns with code examples */
    commonPatterns: string[];

    /**
     * Agent Quick Start — Copy-paste ready code for agents.
     */
    quickStart?: {
      install: string;
      import: string;
      basicUsage: string;
    };

    /**
     * Agent Tools — If this package exposes tools for MCP/agent use.
     */
    tools?: Array<{
      name: string;
      description: string;
      parameters: Record<string, { type: string; description: string; required?: boolean }>;
      returns: string;
      example: string;
    }>;
  };
}

/**
 * Agent discovers DevDiff packages by reading their manifests.
 * No training needed. No fine-tuning. Just read the JSON.
 */
export class PackageDiscovery {
  /**
   * Discover all installed DevDiff packages and their capabilities
   */
  static discover(workspaceRoot?: string): AgenticPackageManifest[] {
    const packages: AgenticPackageManifest[] = [];

    const eldrexPackages = this.findEldrexPackages(workspaceRoot);

    for (const pkgPath of eldrexPackages) {
      try {
        if (!fs.existsSync(pkgPath)) continue;
        const content = fs.readFileSync(pkgPath, "utf-8");
        const pkgJson = JSON.parse(content);

        if (pkgJson.devdiff) {
          packages.push({
            name: pkgJson.name,
            ...pkgJson.devdiff,
          });
        }
      } catch {
        // Skip packages without valid agentic manifests
      }
    }

    return packages;
  }

  /**
   * Generate a prompt that teaches an AI agent about available DevDiff packages
   */
  static generateAgentPrompt(workspaceRoot?: string): string {
    const packages = this.discover(workspaceRoot);

    if (packages.length === 0) {
      return "No DevDiff packages detected. Install @eldrex/core to get started.";
    }

    const sections: string[] = [
      "# DevDiff Platform — Available Packages",
      "",
      "The following DevDiff packages are available. Each package includes",
      "self-documenting metadata. You can use these capabilities immediately.",
      "",
    ];

    for (const pkg of packages) {
      sections.push(`## ${pkg.name} (${pkg.packageType})`);
      sections.push("");
      sections.push(pkg.agentContext.purpose);
      sections.push("");
      sections.push("**When to use:** " + pkg.agentContext.whenToUse);
      sections.push("");
      sections.push("**Key concepts:**");
      for (const concept of pkg.agentContext.keyConcepts || []) {
        sections.push(`- ${concept}`);
      }
      sections.push("");
      sections.push("**Common patterns:**");
      for (const pattern of pkg.agentContext.commonPatterns || []) {
        sections.push(`- ${pattern}`);
      }
      sections.push("");

      if (pkg.agentContext.quickStart) {
        sections.push("**Quick start:**");
        sections.push("```bash");
        sections.push(pkg.agentContext.quickStart.install);
        sections.push("```");
        sections.push("```typescript");
        sections.push(pkg.agentContext.quickStart.import);
        sections.push("");
        sections.push(pkg.agentContext.quickStart.basicUsage);
        sections.push("```");
        sections.push("");
      }

      if (pkg.agentContext.tools && pkg.agentContext.tools.length > 0) {
        sections.push("**Available tools:**");
        for (const tool of pkg.agentContext.tools) {
          sections.push(`- \`${tool.name}\` — ${tool.description}`);
          sections.push(`  Example: ${tool.example}`);
        }
        sections.push("");
      }

      sections.push("---");
      sections.push("");
    }

    return sections.join("\n");
  }

  private static findEldrexPackages(workspaceRoot?: string): string[] {
    const root = workspaceRoot || process.cwd();
    const manifestPaths: string[] = [];

    // Check workspace packages directory
    const packagesDir = path.join(root, "packages");
    if (fs.existsSync(packagesDir)) {
      try {
        const entries = fs.readdirSync(packagesDir, { withFileTypes: true });
        for (const entry of entries) {
          if (entry.isDirectory()) {
            const pkgJsonPath = path.join(packagesDir, entry.name, "package.json");
            if (fs.existsSync(pkgJsonPath)) {
              manifestPaths.push(pkgJsonPath);
            }
          }
        }
      } catch {
        // Skip
      }
    }

    // Check root package.json if it exists
    const rootPkgJson = path.join(root, "package.json");
    if (fs.existsSync(rootPkgJson) && !manifestPaths.includes(rootPkgJson)) {
      manifestPaths.push(rootPkgJson);
    }

    // Check node_modules/@eldrex
    const nodeModulesEldrex = path.join(root, "node_modules", "@eldrex");
    if (fs.existsSync(nodeModulesEldrex)) {
      try {
        const entries = fs.readdirSync(nodeModulesEldrex, { withFileTypes: true });
        for (const entry of entries) {
          if (entry.isDirectory()) {
            const pkgJsonPath = path.join(nodeModulesEldrex, entry.name, "package.json");
            if (fs.existsSync(pkgJsonPath) && !manifestPaths.includes(pkgJsonPath)) {
              manifestPaths.push(pkgJsonPath);
            }
          }
        }
      } catch {
        // Skip
      }
    }

    return manifestPaths;
  }
}
