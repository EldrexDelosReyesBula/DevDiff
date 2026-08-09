import * as fs from "fs/promises";
import * as path from "path";

export interface SecurityFinding {
  severity: "critical" | "high" | "medium" | "low";
  category: string;
  title: string;
  details: string;
  domains?: string[];
  code?: string[];
  paths?: string[];
}

export interface SecurityWarning {
  severity: "medium" | "low";
  category: string;
  title: string;
  details: string;
}

export interface PluginRecommendation {
  action: "approve" | "warn" | "block";
  title: string;
  description: string;
  allowForceInstall: boolean;
}

export interface PluginScanResult {
  safety: "safe" | "suspicious" | "dangerous";
  findings: SecurityFinding[];
  warnings: SecurityWarning[];
  recommendation: PluginRecommendation;
}

export class PluginSecurityScanner {
  /**
   * Scan a plugin before installation for suspicious behavior
   */
  static async scan(pluginPath: string): Promise<PluginScanResult> {
    const findings: SecurityFinding[] = [];
    const warnings: SecurityWarning[] = [];

    const manifest = await this.readManifest(pluginPath);
    const sourceCode = await this.readSourceFiles(pluginPath);

    // ── Check 1: Unsafe network destinations ──
    const networkTargets = this.extractNetworkTargets(sourceCode);
    const suspiciousDomains = this.checkSuspiciousDomains(networkTargets);

    if (suspiciousDomains.length > 0) {
      findings.push({
        severity: "critical",
        category: "network",
        title: "Suspicious network destinations detected",
        details: `Plugin attempts to connect to: ${suspiciousDomains.join(", ")}`,
        domains: suspiciousDomains,
      });
    }

    // ── Check 2: Shell command execution ──
    const shellPatterns = this.extractShellPatterns(sourceCode);
    if (shellPatterns.length > 0) {
      findings.push({
        severity: "high",
        category: "shell",
        title: "Shell command execution detected",
        details: "Plugin contains code that executes shell commands",
        code: shellPatterns,
      });
    }

    // ── Check 3: File system access outside workspace ──
    const externalPaths = this.detectExternalFileAccess(sourceCode);
    if (externalPaths.length > 0) {
      findings.push({
        severity: "high",
        category: "filesystem",
        title: "External file system access detected",
        details: "Plugin attempts to access paths outside workspace",
        paths: externalPaths,
      });
    }

    // ── Check 4: Obfuscated or minified code ──
    if (this.detectObfuscation(sourceCode)) {
      findings.push({
        severity: "high",
        category: "obfuscation",
        title: "Obfuscated code detected",
        details: "Plugin contains obfuscated or heavily minified code that cannot be reviewed",
      });
    }

    // ── Check 5: Telemetry or data exfiltration patterns ──
    if (this.detectTelemetryPatterns(sourceCode)) {
      findings.push({
        severity: "critical",
        category: "telemetry",
        title: "Potential data exfiltration detected",
        details: "Plugin contains patterns commonly used for data collection or exfiltration",
      });
    }

    // ── Check 6: Unsigned or unverified publisher ──
    if (!manifest.signed) {
      warnings.push({
        severity: "medium",
        category: "identity",
        title: "Unsigned plugin",
        details: "Plugin is not cryptographically signed. Cannot verify publisher identity.",
      });
    }

    // ── Check 7: Permission vs actual usage mismatch ──
    const declaredPermissions = manifest.permissions || [];
    const actualUsage = this.analyzeActualUsage(sourceCode);
    const undeclaredUsage = this.findUndeclaredPermissions(declaredPermissions, actualUsage);

    if (undeclaredUsage.length > 0) {
      findings.push({
        severity: "critical",
        category: "permissions",
        title: "Undeclared permissions detected",
        details: `Plugin uses capabilities not declared in manifest: ${undeclaredUsage.join(", ")}`,
      });
    }

    const criticalCount = findings.filter((f) => f.severity === "critical").length;
    const highCount = findings.filter((f) => f.severity === "high").length;

    let safety: "safe" | "suspicious" | "dangerous";
    if (criticalCount > 0) {
      safety = "dangerous";
    } else if (highCount > 1) {
      safety = "suspicious";
    } else {
      safety = "safe";
    }

    return {
      safety,
      findings,
      warnings,
      recommendation: this.generateRecommendation(safety, findings, warnings),
    };
  }

  private static async readManifest(pluginPath: string): Promise<{ signed?: boolean; permissions?: string[] }> {
    try {
      const manifestFile = path.join(pluginPath, "package.json");
      const raw = await fs.readFile(manifestFile, "utf-8");
      const json = JSON.parse(raw);
      return {
        signed: Boolean(json.devdiff?.signed || json.signed),
        permissions: json.devdiff?.permissions || [],
      };
    } catch {
      return { signed: false, permissions: [] };
    }
  }

  private static async readSourceFiles(pluginPath: string): Promise<string> {
    try {
      const entries = await fs.readdir(pluginPath, { recursive: true });
      let combined = "";
      for (const entry of entries) {
        if (typeof entry === "string" && (entry.endsWith(".js") || entry.endsWith(".ts"))) {
          const fullPath = path.join(pluginPath, entry);
          try {
            const content = await fs.readFile(fullPath, "utf-8");
            combined += content + "\n";
          } catch {
            // ignore unreadable files
          }
        }
      }
      return combined;
    } catch {
      return "";
    }
  }

  private static extractNetworkTargets(sourceCode: string): string[] {
    const urlRegex = /https?:\/\/([a-zA-Z0-9.-]+\.[a-zA-Z]{2,}|[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3})/g;
    const matches = sourceCode.match(urlRegex) || [];
    const domains: string[] = [];
    for (const match of matches) {
      try {
        const domain = new URL(match).hostname;
        if (!domains.includes(domain)) domains.push(domain);
      } catch {
        // ignore invalid URL
      }
    }
    return domains;
  }

  private static checkSuspiciousDomains(domains: string[]): string[] {
    const suspicious: string[] = [];
    const suspiciousPatterns = [
      /raw\.githubusercontent\.com/,
      /\.ngrok\.io/,
      /\.serveo\.net/,
      /\.localhost\.run/,
      /\.localtunnel\.me/,
      /pastebin\.com/,
      /hastebin\.com/,
      /\.ru$/i,
      /\.cn$/i,
      /\.su$/i,
      /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,
    ];

    for (const domain of domains) {
      for (const pattern of suspiciousPatterns) {
        if (pattern.test(domain) && !suspicious.includes(domain)) {
          suspicious.push(domain);
        }
      }
    }
    return suspicious;
  }

  private static extractShellPatterns(sourceCode: string): string[] {
    const patterns = [
      /child_process/,
      /execSync\(/,
      /spawn\(/,
      /exec\(/,
      /process\.env\.SHELL/,
    ];
    const matches: string[] = [];
    for (const pattern of patterns) {
      if (pattern.test(sourceCode)) {
        matches.push(pattern.source);
      }
    }
    return matches;
  }

  private static detectExternalFileAccess(sourceCode: string): string[] {
    const paths: string[] = [];
    const absolutePathRegex = /['"`](\/etc\/|\/usr\/|C:\\Windows\\|C:\\Users\\|\.\.\/\.\.\/)/g;
    let match: RegExpExecArray | null;
    while ((match = absolutePathRegex.exec(sourceCode)) !== null) {
      if (!paths.includes(match[1])) {
        paths.push(match[1]);
      }
    }
    return paths;
  }

  private static detectObfuscation(sourceCode: string): boolean {
    const indicators = [
      sourceCode.includes("eval("),
      sourceCode.includes("atob("),
      sourceCode.includes("btoa("),
      sourceCode.includes("Function("),
      sourceCode.includes("fromCharCode"),
      /\\x[0-9a-f]{2}/i.test(sourceCode),
      /\\u[0-9a-f]{4}/i.test(sourceCode),
    ];
    const indicatorCount = indicators.filter(Boolean).length;
    const lines = sourceCode.split("\n");
    const avgLineLength = lines.length > 0 ? sourceCode.length / lines.length : 0;
    return indicatorCount >= 2 || avgLineLength > 500;
  }

  private static detectTelemetryPatterns(sourceCode: string): boolean {
    const patterns = [
      /fetch\s*\(\s*['"`][^'"`]*telemetry/i,
      /fetch\s*\(\s*['"`][^'"`]*analytics/i,
      /fetch\s*\(\s*['"`][^'"`]*track/i,
      /fetch\s*\(\s*['"`][^'"`]*collect/i,
      /fetch\s*\(\s*['"`][^'"`]*beacon/i,
      /navigator\.sendBeacon/,
      /new\s+Image\(\)\.src/,
      /XMLHttpRequest.*\.send/,
    ];
    return patterns.some((p) => p.test(sourceCode));
  }

  private static analyzeActualUsage(sourceCode: string): string[] {
    const used: string[] = [];
    if (this.extractNetworkTargets(sourceCode).length > 0) used.push("network");
    if (this.extractShellPatterns(sourceCode).length > 0) used.push("shell");
    if (this.detectExternalFileAccess(sourceCode).length > 0) used.push("filesystem");
    return used;
  }

  private static findUndeclaredPermissions(declared: string[], actual: string[]): string[] {
    return actual.filter((perm) => !declared.includes(perm));
  }

  private static generateRecommendation(
    safety: string,
    findings: SecurityFinding[],
    warnings: SecurityWarning[]
  ): PluginRecommendation {
    if (safety === "dangerous") {
      const criticals = findings.filter((f) => f.severity === "critical");
      return {
        action: "block",
        title: "⚠️ This plugin may be dangerous",
        description: [
          `${criticals.length} critical security concern(s) detected.`,
          "",
          "Critical findings:",
          ...criticals.map((f) => `• ${f.title}`),
          "",
          "We strongly recommend NOT installing this plugin.",
        ].join("\n"),
        allowForceInstall: true,
      };
    }

    if (safety === "suspicious") {
      return {
        action: "warn",
        title: "⚠️ This plugin has some security concerns",
        description: [
          `${findings.length} finding(s) and ${warnings.length} warning(s).`,
          "",
          "Concerns:",
          ...findings.map((f) => `• ${f.title}`),
          "",
          "You can still install, but please review the concerns above.",
        ].join("\n"),
        allowForceInstall: false,
      };
    }

    return {
      action: "approve",
      title: "✅ Plugin looks safe",
      description: "No critical or high-severity concerns detected.",
      allowForceInstall: false,
    };
  }
}
