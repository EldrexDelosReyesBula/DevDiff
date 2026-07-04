import { execSync } from "child_process";
import * as os from "os";
import * as fs from "fs";

export interface PlatformIssue {
  severity: "critical" | "warning" | "info";
  component: string;
  message: string;
  fix: string;
}

export interface PlatformCheckResult {
  platform: PlatformInfo;
  compatible: boolean;
  issues: PlatformIssue[];
  recommendations: PlatformIssue[];
}

export interface PlatformInfo {
  os: "windows" | "macos" | "linux" | "wsl" | "unknown";
  arch: "x64" | "arm64" | "ia32";
  version: string;
  isWSL: boolean;
  isContainer: boolean;
  isCI: boolean;
  isHeadless: boolean;
  hasSystemd: boolean;
  hasLaunchd: boolean;
  hasWindowsService: boolean;
  homeDir: string;
  tempDir: string;
  lineEnding: "lf" | "crlf";
  pathSeparator: string;
  shellCommand: string;
  maxPathLength: number;
  caseSensitive: boolean;
}

export class PlatformCompat {
  static detect(): PlatformInfo {
    const osType = process.platform;
    const arch = process.arch as "x64" | "arm64" | "ia32";
    const release = os.release();

    // WSL detection
    const isWSL =
      osType === "linux" &&
      (release.includes("Microsoft") ||
        release.includes("WSL") ||
        !!process.env.WSL_DISTRO_NAME ||
        !!process.env.WSLENV);

    // Container detection
    const isContainer =
      !!process.env.CONTAINER ||
      fs.existsSync("/.dockerenv") ||
      fs.existsSync("/run/.containerenv");

    // CI detection
    const isCI =
      !!process.env.CI ||
      !!process.env.GITHUB_ACTIONS ||
      !!process.env.GITLAB_CI ||
      !!process.env.JENKINS_HOME;

    // Headless detection
    const isHeadless = !process.stdout.isTTY && !process.env.DISPLAY;

    return {
      os: osType === "win32" ? "windows" : osType === "darwin" ? "macos" : "linux",
      arch,
      version: release,
      isWSL,
      isContainer,
      isCI,
      isHeadless,
      hasSystemd: this.checkSystemd(),
      hasLaunchd: osType === "darwin",
      hasWindowsService: osType === "win32",
      homeDir: os.homedir(),
      tempDir: os.tmpdir(),
      lineEnding: osType === "win32" ? "crlf" : "lf",
      pathSeparator: osType === "win32" ? "\\" : "/",
      shellCommand: this.getDefaultShell(osType),
      maxPathLength: osType === "win32" ? 260 : 4096,
      caseSensitive: osType !== "win32",
    };
  }

  /**
   * Verify all required binaries are available for this platform
   */
  static async checkRequirements(): Promise<PlatformCheckResult> {
    const platform = this.detect();
    const issues: PlatformIssue[] = [];

    // Git check
    try {
      execSync("git --version", { stdio: "pipe" });
    } catch {
      issues.push({
        severity: "critical",
        component: "git",
        message: "Git is not installed or not in PATH",
        fix:
          platform.os === "windows"
            ? "Install from https://git-scm.com/download/win"
            : "Install with your package manager (apt, brew, etc.)",
      });
    }

    // Node version check
    const nodeVersion = process.versions.node;
    const major = parseInt(nodeVersion.split(".")[0]);
    if (major < 20) {
      issues.push({
        severity: "critical",
        component: "node",
        message: `Node.js ${nodeVersion} is too old (need >= 20.0.0)`,
        fix: "Install from https://nodejs.org",
      });
    }

    // Platform-specific checks
    switch (platform.os) {
      case "windows":
        // Check PowerShell available
        try {
          execSync('powershell -Command "Write-Host test"', { stdio: "pipe" });
        } catch {
          issues.push({
            severity: "warning",
            component: "powershell",
            message: "PowerShell not available (some features may be limited)",
            fix: "Install PowerShell from https://github.com/PowerShell/PowerShell",
          });
        }

        // Check for Windows Terminal (recommended)
        if (!process.env.WT_SESSION) {
          issues.push({
            severity: "info",
            component: "terminal",
            message: "Windows Terminal recommended for best experience",
            fix: 'Install from Microsoft Store: "Windows Terminal"',
          });
        }
        break;

      case "macos":
        // Check Xcode CLI tools (needed for git, compilation)
        try {
          execSync("xcode-select -p", { stdio: "pipe" });
        } catch {
          issues.push({
            severity: "warning",
            component: "xcode",
            message: "Xcode Command Line Tools not installed",
            fix: "Run: xcode-select --install",
          });
        }
        break;

      case "linux":
        // Check for build essentials (needed for native modules)
        try {
          execSync("which make", { stdio: "pipe" });
        } catch {
          issues.push({
            severity: "warning",
            component: "build-tools",
            message: "Build tools not found",
            fix:
              'Ubuntu/Debian: sudo apt install build-essential\n' +
              'Fedora: sudo dnf groupinstall "Development Tools"',
          });
        }
        break;
    }

    return {
      platform,
      compatible: !issues.some((i) => i.severity === "critical"),
      issues,
      recommendations: issues.filter((i) => i.severity !== "critical"),
    };
  }

  private static checkSystemd(): boolean {
    try {
      execSync("systemctl --version", { stdio: "pipe" });
      return true;
    } catch {
      return false;
    }
  }

  private static getDefaultShell(osType: string): string {
    if (osType === "win32") {
      return process.env.COMSPEC || "cmd.exe";
    }
    return process.env.SHELL || "/bin/bash";
  }
}
