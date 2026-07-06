import { execSync } from "child_process";

export type PackageManager = "npm" | "pnpm" | "yarn" | "bun";

export interface Dependency {
  name: string;
  required: boolean;
  installCommand: string;
  versionRange: string;
  checkCommand: string;
  installDocs: string;
  autoInstallable: boolean;
}

const REQUIRED_DEPENDENCIES: Record<string, Dependency> = {
  git: {
    name: "Git",
    required: true,
    installCommand: "", // Platform-specific
    versionRange: ">=2.40.0",
    checkCommand: "git --version",
    installDocs: "https://git-scm.com/downloads",
    autoInstallable: false, // Must be installed manually
  },
  ollama: {
    name: "Ollama",
    required: false, // Optional — can use cloud AI
    installCommand:
      process.platform === "win32"
        ? "winget install Ollama.Ollama"
        : "curl -fsSL https://ollama.com/install.sh | sh",
    versionRange: ">=0.1.0",
    checkCommand: "ollama --version",
    installDocs: "https://ollama.com/download",
    autoInstallable: true,
  },
  "llama3.2:3b": {
    name: "Llama 3.2 3B Model",
    required: false,
    installCommand: "ollama pull llama3.2:3b",
    versionRange: "latest",
    checkCommand: "ollama list | grep llama3.2:3b",
    installDocs: "https://ollama.com/library/llama3.2",
    autoInstallable: true,
  },
};

export class DependencyManager {
  private detectedPM: PackageManager | null = null;

  /**
   * Detect which package manager is available
   */
  detectPackageManager(): PackageManager | null {
    const checks: Array<{ pm: PackageManager; command: string }> = [
      { pm: "pnpm", command: "pnpm --version" },
      { pm: "yarn", command: "yarn --version" },
      { pm: "bun", command: "bun --version" },
      { pm: "npm", command: "npm --version" },
    ];

    for (const { pm, command } of checks) {
      try {
        execSync(command, { stdio: "pipe" });
        this.detectedPM = pm;
        return pm;
      } catch {
        continue;
      }
    }

    return null;
  }

  /**
   * Install DevDiff dependencies automatically
   */
  async installDependencies(
    options: {
      packageManager?: PackageManager;
      autoYes?: boolean;
      skipOptional?: boolean;
    } = {},
  ): Promise<InstallResult> {
    const pm = options.packageManager || this.detectPackageManager();

    if (!pm) {
      return {
        success: false,
        error: "No package manager found. Install npm, pnpm, or yarn.",
        fix: "Download Node.js from https://nodejs.org (includes npm)",
      };
    }

    console.log(`📦 Using package manager: ${pm}`);

    const results: DependencyResult[] = [];

    for (const [id, dep] of Object.entries(REQUIRED_DEPENDENCIES)) {
      // Skip optional if requested
      if (options.skipOptional && !dep.required) continue;

      // Check if already installed
      const installed = await this.checkInstalled(dep);

      if (installed) {
        results.push({ id, name: dep.name, status: "already-installed" });
        continue;
      }

      // Cannot auto-install
      if (!dep.autoInstallable) {
        results.push({
          id,
          name: dep.name,
          status: "manual-install-required",
          message: `${dep.name} must be installed manually.`,
          docs: dep.installDocs,
        });
        continue;
      }

      // Auto-install
      console.log(`📥 Installing ${dep.name}...`);

      try {
        if (options.autoYes) {
          execSync(dep.installCommand, { stdio: "inherit" });
        } else {
          console.log(`   Command: ${dep.installCommand}`);
          execSync(dep.installCommand, { stdio: "inherit" });
        }

        results.push({ id, name: dep.name, status: "installed" });
        console.log(`   ✅ ${dep.name} installed`);
      } catch (error) {
        results.push({
          id,
          name: dep.name,
          status: "install-failed",
          message: `Failed to install ${dep.name}.`,
          error: (error as Error).message,
          docs: dep.installDocs,
        });
      }
    }

    const failures = results.filter((r) => r.status === "install-failed");
    const manualRequired = results.filter(
      (r) => r.status === "manual-install-required",
    );

    return {
      success: failures.length === 0,
      results,
      summary: {
        alreadyInstalled: results.filter(
          (r) => r.status === "already-installed",
        ).length,
        newlyInstalled: results.filter((r) => r.status === "installed").length,
        failed: failures.length,
        manualRequired: manualRequired.length,
      },
      nextSteps: this.generateNextSteps(failures, manualRequired),
    };
  }

  /**
   * Check if a dependency is installed
   */
  private async checkInstalled(dep: Dependency): Promise<boolean> {
    try {
      execSync(dep.checkCommand, { stdio: "pipe" });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Generate next steps for the developer
   */
  private generateNextSteps(
    failures: DependencyResult[],
    manualRequired: DependencyResult[],
  ): string[] {
    const steps: string[] = [];

    if (manualRequired.length > 0) {
      steps.push("── Manual Installation Required ──");
      for (const dep of manualRequired) {
        steps.push(`  • ${dep.name}: ${dep.docs}`);
      }
    }

    if (failures.length > 0) {
      steps.push("── Installation Failed ──");
      for (const dep of failures) {
        steps.push(`  • ${dep.name}: ${dep.error}`);
        steps.push(`    Docs: ${dep.docs}`);
      }
    }

    if (steps.length === 0) {
      steps.push("✅ All dependencies installed. DevDiff is ready!");
    }

    return steps;
  }
}

export interface DependencyResult {
  id: string;
  name: string;
  status:
    | "already-installed"
    | "installed"
    | "install-failed"
    | "manual-install-required";
  message?: string;
  error?: string;
  docs?: string;
}

export interface InstallResult {
  success: boolean;
  results?: DependencyResult[];
  error?: string;
  fix?: string;
  summary?: any;
  nextSteps?: string[];
}
