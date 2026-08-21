import * as fs from "fs";
import * as path from "path";

export class StorageReport {
  /**
   * devdiff storage — show exactly what's taking up space
   */
  static async report(): Promise<void> {
    console.log("📦 DevDiff Storage Report");
    console.log("═".repeat(55));
    console.log("");

    // ── Package sizes ──
    const packages = [
      "@eldrex/cli",
      "@eldrex/vscode",
      "@eldrex/core",
      "@eldrex/plugin-sdk",
      "@eldrex/connectors",
      "@eldrex/mcp",
      "@eldrex/personas",
      "@eldrex/gateway",
      "@eldrex/vite",
      "create-devdiff-app",
    ];

    let totalSize = 0;

    for (const pkg of packages) {
      const size = await this.getPackageSize(pkg);
      totalSize += size;

      const sizeKB = (size / 1024).toFixed(0);
      const sizeMB = (size / 1024 / 1024).toFixed(2);

      const display = size > 1024 * 1024 ? `${sizeMB}MB` : `${sizeKB}KB`;

      console.log(`   ${pkg.padEnd(30)} ${display.padStart(10)}`);
    }

    console.log("");
    console.log(
      `   ${"Total".padEnd(30)} ${(totalSize / 1024 / 1024).toFixed(2).padStart(9)}MB`,
    );
    console.log("");

    // ── .devdiff directory size ──
    const devdiffDir = path.join(process.cwd(), ".devdiff");
    const devdiffSize = await this.getDirectorySize(devdiffDir);
    if (devdiffSize > 0) {
      console.log("📁 .devdiff Directory:");
      console.log(
        `   Memory: ${((await this.getDirectorySize(path.join(devdiffDir, "memory"))) / 1024 / 1024).toFixed(2)}MB`,
      );
      console.log(
        `   Cache: ${((await this.getDirectorySize(path.join(devdiffDir, "cache"))) / 1024 / 1024).toFixed(2)}MB`,
      );
      console.log(
        `   Checkpoints: ${((await this.getDirectorySize(path.join(devdiffDir, "checkpoints"))) / 1024 / 1024).toFixed(2)}MB`,
      );
      console.log(
        `   Audit logs: ${((await this.getDirectorySize(path.join(devdiffDir, "audit"))) / 1024 / 1024).toFixed(2)}MB`,
      );
      console.log(`   Total: ${(devdiffSize / 1024 / 1024).toFixed(2)}MB`);
      console.log("");

      console.log("💡 Cleanup tips:");
      console.log("   devdiff memory optimize    — Remove duplicate snapshots");
      console.log("   devdiff memory delete --from <date> --to <date>");
      console.log(
        "   rm -rf .devdiff/checkpoints/*.old  — Remove old checkpoints",
      );
    }
  }

  /**
   * devdiff storage clean — remove unnecessary files
   */
  static async clean(): Promise<void> {
    console.log("🧹 Cleaning DevDiff storage...");
    console.log("");

    let freedBytes = 0;

    // ── Clean old cache ──
    const cacheDir = path.join(process.cwd(), ".devdiff", "cache");
    if (fs.existsSync(cacheDir)) {
      const cacheFiles = fs.readdirSync(cacheDir);

      for (const file of cacheFiles) {
        const filePath = path.join(cacheDir, file);
        try {
          const stat = fs.statSync(filePath);

          // Remove files older than 7 days
          if (Date.now() - stat.mtimeMs > 7 * 86400000) {
            freedBytes += stat.size;
            fs.unlinkSync(filePath);
          }
        } catch {}
      }

      console.log("   ✅ Old cache cleaned");
    }

    // ── Clean old checkpoints ──
    const checkpointDir = path.join(process.cwd(), ".devdiff", "checkpoints");
    if (fs.existsSync(checkpointDir)) {
      const checkpoints = fs.readdirSync(checkpointDir);

      // Keep only 10 most recent
      const sorted = checkpoints
        .map((f) => {
          try {
            return {
              file: f,
              mtime: fs.statSync(path.join(checkpointDir, f)).mtimeMs,
              size: fs.statSync(path.join(checkpointDir, f)).size,
            };
          } catch {
            return { file: f, mtime: 0, size: 0 };
          }
        })
        .sort((a, b) => b.mtime - a.mtime);

      const toRemove = sorted.slice(10);

      for (const cp of toRemove) {
        const filePath = path.join(checkpointDir, cp.file);
        try {
          freedBytes += cp.size;
          fs.unlinkSync(filePath);
        } catch {}
      }

      if (toRemove.length > 0) {
        console.log(`   ✅ Removed ${toRemove.length} old checkpoint(s)`);
      }
    }

    console.log("");
    console.log(`   Freed: ${(freedBytes / 1024 / 1024).toFixed(2)}MB`);
  }

  private static async getPackageSize(pkgName: string): Promise<number> {
    try {
      const basePkg = pkgName.replace("@eldrex/", "");
      // Look for workspace package path
      const workspacePkgDir = path.resolve(process.cwd(), "packages", basePkg);
      if (fs.existsSync(path.join(workspacePkgDir, "package.json"))) {
        const distDir = path.join(workspacePkgDir, "dist");
        if (fs.existsSync(distDir)) {
          return await this.getDirectorySize(distDir);
        }
        return await this.getDirectorySize(workspacePkgDir);
      }

      // Check node_modules
      const nodeModulesDir = path.resolve(
        process.cwd(),
        "node_modules",
        "@eldrex",
        basePkg,
      );
      if (fs.existsSync(nodeModulesDir)) {
        return await this.getDirectorySize(nodeModulesDir);
      }

      return 0;
    } catch {
      return 0;
    }
  }

  public static async getDirectorySize(dir: string): Promise<number> {
    if (!fs.existsSync(dir)) return 0;

    let total = 0;

    const walk = (currentDir: string) => {
      try {
        for (const entry of fs.readdirSync(currentDir)) {
          const fullPath = path.join(currentDir, entry);
          const stat = fs.statSync(fullPath);

          if (stat.isDirectory()) {
            walk(fullPath);
          } else {
            total += stat.size;
          }
        }
      } catch {}
    };

    walk(dir);
    return total;
  }
}

export async function storageCommand(sub?: string, _opts?: any): Promise<void> {
  if (sub === "clean") {
    await StorageReport.clean();
  } else {
    await StorageReport.report();
  }
}
