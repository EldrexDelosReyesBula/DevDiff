export interface AdaptiveRule {
  id: string;
  threatId: string;
  name: string;
  pattern: string;
  severity: "critical" | "high" | "medium" | "low";
  category: "network" | "filesystem" | "code-pattern" | "plugin" | "ai";
  action: "block" | "warn" | "log";
  created: string;
  lastUpdated: string;
  source: string;
  enabled: boolean;
  confidence?: "low" | "medium" | "high";
  truePositiveCount?: number;
  falsePositiveCount?: number;
}

export interface ThreatIntel {
  id: string;
  name: string;
  pattern: string;
  severity: "critical" | "high" | "medium" | "low";
  category: "network" | "filesystem" | "code-pattern" | "plugin" | "ai";
  recommendedAction: "block" | "warn" | "log";
  source: string;
  discoveredAt: string;
}

export interface SecurityContext {
  domain?: string;
  filePath?: string;
  code?: string;
  pluginName?: string;
  category?: string;
}

export interface AdaptiveEvaluation {
  allowed: boolean;
  triggered: AdaptiveRule[];
  blockedBy: string[];
  warnings: string[];
  requiresConsent: boolean;
}

export interface RuleUpdateResult {
  newRules: number;
  updatedRules: number;
  totalRules: number;
  latestThreatUpdate: string;
}

export interface RuleEffectiveness {
  totalRules: number;
  enabledRules: number;
  highConfidenceRules: number;
  totalTruePositives: number;
  totalFalsePositives: number;
  accuracy: number;
  mostEffectiveRule: string;
  mostProblematicRule: string;
}

export class AdaptiveRuleEngine {
  private static rules: AdaptiveRule[] = [
    {
      id: "rule-telemetry-block",
      threatId: "threat-001",
      name: "Telemetry Domain Blocker",
      pattern: "api\\.mixpanel\\.com|google-analytics\\.com|segment\\.io",
      severity: "critical",
      category: "network",
      action: "block",
      created: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      source: "DevDiff Security Advisory",
      enabled: true,
      confidence: "high",
      truePositiveCount: 127,
      falsePositiveCount: 2,
    },
    {
      id: "rule-new-domain-alert",
      threatId: "threat-002",
      name: "New Domain Alert",
      pattern: ".*\\.localtunnel\\.me|.*\\.ngrok\\.io",
      severity: "high",
      category: "network",
      action: "warn",
      created: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      source: "DevDiff Threat Feed",
      enabled: true,
      confidence: "medium",
      truePositiveCount: 45,
      falsePositiveCount: 8,
    },
  ];

  /**
   * Update security rules based on new threat intelligence
   */
  static async updateFromThreatIntelligence(): Promise<RuleUpdateResult> {
    const threats = await this.fetchThreatIntelligence();

    const newRules: AdaptiveRule[] = [];
    const updatedRules: AdaptiveRule[] = [];

    for (const threat of threats) {
      const existing = this.rules.find((r) => r.threatId === threat.id);

      if (existing) {
        existing.pattern = threat.pattern;
        existing.severity = threat.severity;
        existing.lastUpdated = new Date().toISOString();
        updatedRules.push(existing);
      } else {
        const rule: AdaptiveRule = {
          id: `adaptive-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          threatId: threat.id,
          name: threat.name,
          pattern: threat.pattern,
          severity: threat.severity,
          category: threat.category,
          action: threat.recommendedAction,
          created: new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
          source: threat.source,
          enabled: threat.severity !== "low",
          confidence: "medium",
          truePositiveCount: 0,
          falsePositiveCount: 0,
        };

        newRules.push(rule);
        this.rules.push(rule);
      }
    }

    return {
      newRules: newRules.length,
      updatedRules: updatedRules.length,
      totalRules: this.rules.length,
      latestThreatUpdate: new Date().toISOString(),
    };
  }

  /**
   * Apply all adaptive rules to an operation
   */
  static evaluate(context: SecurityContext): AdaptiveEvaluation {
    const triggered: AdaptiveRule[] = [];

    for (const rule of this.rules) {
      if (!rule.enabled) continue;

      if (this.ruleMatches(rule, context)) {
        triggered.push(rule);
      }
    }

    const criticalRules = triggered.filter((r) => r.severity === "critical");
    const highRules = triggered.filter((r) => r.severity === "high");

    return {
      allowed: criticalRules.length === 0,
      triggered,
      blockedBy: criticalRules.map((r) => r.name),
      warnings: highRules.map((r) => r.name),
      requiresConsent: criticalRules.length > 0 || highRules.length > 2,
    };
  }

  /**
   * Learn from false positives to improve accuracy
   */
  static reportFalsePositive(ruleId: string, context?: SecurityContext): void {
    const rule = this.rules.find(
      (r) => r.id === ruleId || r.threatId === ruleId,
    );
    if (!rule) return;

    rule.falsePositiveCount = (rule.falsePositiveCount || 0) + 1;

    if (rule.falsePositiveCount >= 5) {
      rule.enabled = false;
    }
  }

  /**
   * Report a true positive to reinforce the rule
   */
  static reportTruePositive(ruleId: string): void {
    const rule = this.rules.find(
      (r) => r.id === ruleId || r.threatId === ruleId,
    );
    if (!rule) return;

    rule.truePositiveCount = (rule.truePositiveCount || 0) + 1;
    rule.falsePositiveCount = Math.max(0, (rule.falsePositiveCount || 0) - 1);

    if ((rule.truePositiveCount || 0) >= 10) {
      rule.confidence = "high";
    }
  }

  /**
   * Get all active adaptive rules
   */
  static getRules(): AdaptiveRule[] {
    return [...this.rules];
  }

  /**
   * Get rule effectiveness statistics
   */
  static getEffectiveness(): RuleEffectiveness {
    const total = this.rules.length;
    const enabled = this.rules.filter((r) => r.enabled).length;
    const highConfidence = this.rules.filter(
      (r) => r.confidence === "high",
    ).length;

    const totalTruePositives = this.rules.reduce(
      (sum, r) => sum + (r.truePositiveCount || 0),
      0,
    );
    const totalFalsePositives = this.rules.reduce(
      (sum, r) => sum + (r.falsePositiveCount || 0),
      0,
    );

    const accuracy =
      totalTruePositives + totalFalsePositives > 0
        ? Math.round(
            (totalTruePositives / (totalTruePositives + totalFalsePositives)) *
              100,
          )
        : 100;

    const mostEffectiveRule =
      [...this.rules]
        .filter((r) => (r.truePositiveCount || 0) > 0)
        .sort(
          (a, b) => (b.truePositiveCount || 0) - (a.truePositiveCount || 0),
        )[0]?.name || "N/A";

    const mostProblematicRule =
      [...this.rules]
        .filter((r) => (r.falsePositiveCount || 0) > 0)
        .sort(
          (a, b) => (b.falsePositiveCount || 0) - (a.falsePositiveCount || 0),
        )[0]?.name || "N/A";

    return {
      totalRules: total,
      enabledRules: enabled,
      highConfidenceRules: highConfidence,
      totalTruePositives,
      totalFalsePositives,
      accuracy,
      mostEffectiveRule,
      mostProblematicRule,
    };
  }

  private static ruleMatches(
    rule: AdaptiveRule,
    context: SecurityContext,
  ): boolean {
    try {
      const regex = new RegExp(rule.pattern, "i");

      switch (rule.category) {
        case "network":
          return regex.test(context.domain || "");
        case "filesystem":
          return regex.test(context.filePath || "");
        case "code-pattern":
          return regex.test(context.code || "");
        case "plugin":
          return regex.test(context.pluginName || "");
        default:
          return false;
      }
    } catch {
      return false;
    }
  }

  private static async fetchThreatIntelligence(): Promise<ThreatIntel[]> {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);
      const res = await fetch(
        "https://devdiff.vercel.app/api/security/threat-intel.json",
        { signal: controller.signal },
      );
      clearTimeout(timeout);

      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data.threats) ? data.threats : [];
    } catch {
      return [];
    }
  }
}
