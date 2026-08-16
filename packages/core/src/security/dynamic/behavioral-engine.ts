import * as fs from "fs";
import * as path from "path";

export interface NetworkBaseline {
  avgConnectionsPerDay: number;
  avgDomainsContacted: number;
  avgDataSentMB: number;
  commonDomains: string[];
  peakHours: number[];
}

export interface FilesystemBaseline {
  avgFilesReadPerDay: number;
  commonReadPaths: string[];
  commonWritePaths: string[];
  avgFileSizeRead: number;
}

export interface AIBaseline {
  avgCallsPerDay: number;
  avgTokensPerCall: number;
  commonPersonas: string[];
  preferredProvider: string | null;
  avgResponseTime: number;
}

export interface PluginBaseline {
  activePlugins: string[];
  pluginNetworkPatterns: Record<string, string[]>;
}

export interface DevelopmentBaseline {
  avgCommitsPerDay: number;
  avgFilesPerCommit: number;
  commonCommitHours: number[];
  avgChangelogsPerDay: number;
}

export interface BehavioralProfile {
  generatedAt: string;
  learningPeriod: string;
  baselines: {
    network: NetworkBaseline;
    filesystem: FilesystemBaseline;
    ai: AIBaseline;
    plugins: PluginBaseline;
    development: DevelopmentBaseline;
  };
  riskProfile: {
    network: number;
    filesystem: number;
    ai: number;
    plugins: number;
    overall: number;
  };
}

export interface ActivitySnapshot {
  network: {
    connectionsPerDay: number;
    domains: string[];
    dataSentMB: number;
  };
  filesystem: {
    filesRead: number;
    pathsRead: string[];
    pathsWritten: string[];
  };
  ai: {
    callsPerDay: number;
    avgTokensPerCall: number;
    personas: string[];
    providers: string[];
  };
  plugins: {
    activePlugins: string[];
  };
  development: {
    commitsPerDay: number;
    changelogsPerDay: number;
  };
}

export interface BehaviorAnomaly {
  area: string;
  severity: "critical" | "high" | "medium" | "low";
  type: string;
  detail: string;
  current: any;
  baseline: any;
  recommendation: string;
}

export interface AnomalyReport {
  detectedAt: string;
  totalAnomalies: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  anomalies: BehaviorAnomaly[];
  requiresAttention: boolean;
  recommendedActions: string[];
}

export class BehavioralEngine {
  private static readonly LEARNING_PERIOD_DAYS = 7;

  /**
   * Learn normal behavior patterns from project history
   */
  static async learn(workspacePath: string): Promise<BehavioralProfile> {
    const history = await this.getActivityHistory(workspacePath);

    const networkBaseline: NetworkBaseline = {
      avgConnectionsPerDay: this.average(
        history.network.map((d: any) => d.connectionsPerDay),
      ),
      avgDomainsContacted: this.average(
        history.network.map((d: any) => d.uniqueDomains),
      ),
      avgDataSentMB: this.average(
        history.network.map((d: any) => d.dataSentMB),
      ),
      commonDomains: this.frequentItems(
        history.network.flatMap((d: any) => d.domains || []),
        3,
      ),
      peakHours: this.peakHours(
        history.network.map((d: any) => ({
          hour: d.hour || 10,
          count: d.connectionsPerDay || 0,
        })),
      ),
    };

    const filesystemBaseline: FilesystemBaseline = {
      avgFilesReadPerDay: this.average(
        history.filesystem.map((d: any) => d.filesRead),
      ),
      commonReadPaths: this.frequentItems(
        history.filesystem.flatMap((d: any) => d.pathsRead || []),
        10,
      ),
      commonWritePaths: this.frequentItems(
        history.filesystem.flatMap((d: any) => d.pathsWritten || []),
        5,
      ),
      avgFileSizeRead: this.average(
        history.filesystem.map((d: any) => d.avgFileSizeKB),
      ),
    };

    const aiBaseline: AIBaseline = {
      avgCallsPerDay: this.average(history.ai.map((d: any) => d.callsPerDay)),
      avgTokensPerCall: this.average(
        history.ai.map((d: any) => d.avgTokensPerCall),
      ),
      commonPersonas: this.frequentItems(
        history.ai.flatMap((d: any) => d.personas || []),
        2,
      ),
      preferredProvider: this.mostFrequent(
        history.ai.flatMap((d: any) => d.providers || []),
      ),
      avgResponseTime: this.average(
        history.ai.map((d: any) => d.avgResponseTimeMs),
      ),
    };

    const pluginBaseline: PluginBaseline = {
      activePlugins: this.frequentItems(
        history.plugins.flatMap((d: any) => d.activePlugins || []),
        5,
      ),
      pluginNetworkPatterns: this.buildPluginNetworkMap(history.plugins),
    };

    const devBaseline: DevelopmentBaseline = {
      avgCommitsPerDay: this.average(
        history.development.map((d: any) => d.commitsPerDay),
      ),
      avgFilesPerCommit: this.average(
        history.development.map((d: any) => d.avgFilesPerCommit),
      ),
      commonCommitHours: this.peakHours(
        history.development.map((d: any) => ({
          hour: d.hour || 14,
          count: d.commitsPerDay || 0,
        })),
      ),
      avgChangelogsPerDay: this.average(
        history.development.map((d: any) => d.changelogsPerDay),
      ),
    };

    const riskProfile = {
      network: this.calculateRiskScore(history.network),
      filesystem: this.calculateRiskScore(history.filesystem),
      ai: this.calculateRiskScore(history.ai),
      plugins: this.calculateRiskScore(history.plugins),
      overall: 0,
    };

    riskProfile.overall =
      riskProfile.network * 0.25 +
      riskProfile.filesystem * 0.25 +
      riskProfile.ai * 0.25 +
      riskProfile.plugins * 0.25;

    return {
      generatedAt: new Date().toISOString(),
      learningPeriod: `${this.LEARNING_PERIOD_DAYS} days`,
      baselines: {
        network: networkBaseline,
        filesystem: filesystemBaseline,
        ai: aiBaseline,
        plugins: pluginBaseline,
        development: devBaseline,
      },
      riskProfile,
    };
  }

  /**
   * Detect anomalies by comparing current behavior against baseline
   */
  static detectAnomalies(
    current: ActivitySnapshot,
    baseline: BehavioralProfile,
  ): AnomalyReport {
    const anomalies: BehaviorAnomaly[] = [];

    // ── Network Anomalies ──
    const avgConnections = Math.max(
      1,
      baseline.baselines.network.avgConnectionsPerDay,
    );
    if (current.network.connectionsPerDay > avgConnections * 3) {
      anomalies.push({
        area: "network",
        severity: "high",
        type: "unusual-traffic-volume",
        detail: `Network connections 3x above baseline (${current.network.connectionsPerDay} vs ${Math.round(avgConnections)} avg)`,
        current: current.network.connectionsPerDay,
        baseline: avgConnections,
        recommendation:
          "Review recent plugin installations or configuration changes",
      });
    }

    const newDomains = current.network.domains.filter(
      (d) => !baseline.baselines.network.commonDomains.includes(d),
    );

    for (const domain of newDomains) {
      anomalies.push({
        area: "network",
        severity: "medium",
        type: "new-domain",
        detail: `Connection to new domain: ${domain} (not in baseline)`,
        current: domain,
        baseline: "never contacted",
        recommendation: `Verify: devdiff network test ${domain}`,
      });
    }

    // ── Filesystem Anomalies ──
    const newReadPaths = current.filesystem.pathsRead.filter(
      (p) =>
        !baseline.baselines.filesystem.commonReadPaths.some((bp) =>
          p.startsWith(bp),
        ),
    );

    if (newReadPaths.length > 3) {
      anomalies.push({
        area: "filesystem",
        severity: "high",
        type: "unusual-file-access",
        detail: `Reading ${newReadPaths.length} paths outside normal patterns`,
        current: newReadPaths.slice(0, 5).join(", "),
        baseline: "standard workspace paths",
        recommendation: "Verify no unauthorized file access",
      });
    }

    // ── AI Usage Anomalies ──
    const avgCalls = Math.max(1, baseline.baselines.ai.avgCallsPerDay);
    if (current.ai.callsPerDay > avgCalls * 5) {
      anomalies.push({
        area: "ai",
        severity: "high",
        type: "unusual-ai-usage",
        detail: `AI calls 5x above baseline (${current.ai.callsPerDay} vs ${Math.round(avgCalls)} avg)`,
        current: current.ai.callsPerDay,
        baseline: avgCalls,
        recommendation: "Check for unauthorized AI usage or runaway automation",
      });
    }

    const preferred = baseline.baselines.ai.preferredProvider;
    const unexpectedProviders = current.ai.providers.filter(
      (p) => p !== preferred && p !== "ollama",
    );

    if (unexpectedProviders.length > 0 && preferred !== null) {
      anomalies.push({
        area: "ai",
        severity: "medium",
        type: "unexpected-ai-provider",
        detail: `Using cloud provider: ${unexpectedProviders.join(", ")} (usually: ${preferred})`,
        current: unexpectedProviders.join(", "),
        baseline: preferred,
        recommendation: "Verify cloud API usage is authorized",
      });
    }

    // ── Plugin Anomalies ──
    const newPlugins = current.plugins.activePlugins.filter(
      (p) => !baseline.baselines.plugins.activePlugins.includes(p),
    );

    if (newPlugins.length > 0) {
      anomalies.push({
        area: "plugins",
        severity: "medium",
        type: "new-plugin-activity",
        detail: `${newPlugins.length} new plugin(s) active: ${newPlugins.join(", ")}`,
        current: newPlugins.join(", "),
        baseline: "previously installed plugins",
        recommendation: "Audit new plugins: devdiff plugin audit <name>",
      });
    }

    // ── Development Anomalies ──
    const avgCommits = Math.max(
      1,
      baseline.baselines.development.avgCommitsPerDay,
    );
    if (current.development.commitsPerDay > avgCommits * 4) {
      anomalies.push({
        area: "development",
        severity: "low",
        type: "unusual-commit-activity",
        detail: `Commit rate 4x above baseline (${current.development.commitsPerDay} vs ${Math.round(avgCommits)} avg)`,
        current: current.development.commitsPerDay,
        baseline: avgCommits,
        recommendation:
          "May indicate automated code generation — verify if expected",
      });
    }

    const commonHours = baseline.baselines.development.commonCommitHours;
    const currentHour = new Date().getHours();
    const isOffHours =
      commonHours.length > 0 && !commonHours.includes(currentHour);

    if (isOffHours && current.development.commitsPerDay > 0) {
      anomalies.push({
        area: "development",
        severity: "low",
        type: "off-hours-activity",
        detail: "Development activity outside normal hours",
        current: `${currentHour}:00`,
        baseline: `Usually: ${commonHours.map((h) => `${h}:00`).join(", ")}`,
        recommendation: "Verify this activity is authorized",
      });
    }

    return {
      detectedAt: new Date().toISOString(),
      totalAnomalies: anomalies.length,
      criticalCount: anomalies.filter((a) => a.severity === "critical").length,
      highCount: anomalies.filter((a) => a.severity === "high").length,
      mediumCount: anomalies.filter((a) => a.severity === "medium").length,
      lowCount: anomalies.filter((a) => a.severity === "low").length,
      anomalies,
      requiresAttention: anomalies.some(
        (a) => a.severity === "critical" || a.severity === "high",
      ),
      recommendedActions: this.generateActions(anomalies),
    };
  }

  private static generateActions(anomalies: BehaviorAnomaly[]): string[] {
    const actions: string[] = [];
    const seen = new Set<string>();

    for (const anomaly of anomalies) {
      if (!seen.has(anomaly.recommendation)) {
        actions.push(anomaly.recommendation);
        seen.add(anomaly.recommendation);
      }
    }

    if (
      anomalies.some((a) => a.severity === "critical" || a.severity === "high")
    ) {
      actions.push("Run full security audit: devdiff network audit");
      actions.push("Review recent changes: devdiff generate --since 24h");
    }

    return actions;
  }

  private static average(values: number[]): number {
    if (!values || values.length === 0) return 0;
    return values.reduce((sum, v) => sum + v, 0) / values.length;
  }

  private static frequentItems(items: string[], limit: number): string[] {
    if (!items) return [];
    const counts = new Map<string, number>();
    for (const item of items) {
      counts.set(item, (counts.get(item) || 0) + 1);
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([item]) => item);
  }

  private static mostFrequent(items: string[]): string | null {
    if (!items || items.length === 0) return null;
    const counts = new Map<string, number>();
    for (const item of items) {
      counts.set(item, (counts.get(item) || 0) + 1);
    }
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1])[0][0];
  }

  private static peakHours(
    data: Array<{ hour: number; count: number }>,
  ): number[] {
    if (!data || data.length === 0) return [9, 10, 11, 14, 15, 16];
    const sorted = [...data].sort((a, b) => b.count - a.count);
    return sorted.slice(0, 8).map((d) => d.hour);
  }

  private static calculateRiskScore(history: any[]): number {
    if (!history || history.length < 3) return 50;
    return 25; // Low risk for established history
  }

  private static buildPluginNetworkMap(
    pluginHistory: any[],
  ): Record<string, string[]> {
    const map: Record<string, string[]> = {};
    if (!pluginHistory) return map;
    for (const entry of pluginHistory) {
      for (const [plugin, domains] of Object.entries(
        entry.pluginDomains || {},
      )) {
        map[plugin] = [
          ...new Set([
            ...(map[plugin] || []),
            ...((domains as string[]) || []),
          ]),
        ];
      }
    }
    return map;
  }

  private static async getActivityHistory(workspacePath: string): Promise<any> {
    const auditFile = path.join(
      workspacePath,
      ".devdiff",
      "security-audit.json",
    );
    if (fs.existsSync(auditFile)) {
      try {
        const raw = fs.readFileSync(auditFile, "utf-8");
        const json = JSON.parse(raw);
        if (json.history) return json.history;
      } catch {}
    }

    // Default baseline structure if no prior audit history
    return {
      network: [
        {
          connectionsPerDay: 12,
          uniqueDomains: 3,
          dataSentMB: 1.2,
          domains: ["localhost", "api.openai.com"],
          hour: 10,
        },
      ],
      filesystem: [
        {
          filesRead: 15,
          pathsRead: ["src/", "package.json"],
          pathsWritten: ["dist/"],
          avgFileSizeKB: 45,
        },
      ],
      ai: [
        {
          callsPerDay: 8,
          avgTokensPerCall: 1200,
          personas: ["developer"],
          providers: ["ollama"],
          avgResponseTimeMs: 450,
        },
      ],
      plugins: [
        {
          activePlugins: ["@eldrex/plugin-slack"],
          pluginDomains: { "@eldrex/plugin-slack": ["hooks.slack.com"] },
        },
      ],
      development: [
        {
          commitsPerDay: 5,
          avgFilesPerCommit: 3,
          hour: 14,
          changelogsPerDay: 4,
        },
      ],
    };
  }
}
