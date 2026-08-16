import { describe, it, expect } from "vitest";
import {
  BehavioralEngine,
  AdaptiveRuleEngine,
  ActivitySnapshot,
} from "../src/index";
import * as path from "path";

describe("DevDiff v1.7.0 — Dynamic Security Engine", () => {
  const rootDir =
    process.cwd().endsWith("packages\\core") ||
    process.cwd().endsWith("packages/core")
      ? path.resolve(process.cwd(), "../..")
      : process.cwd();

  describe("BehavioralEngine", () => {
    it("learns baseline behavioral profile for workspace", async () => {
      const profile = await BehavioralEngine.learn(rootDir);
      expect(profile).toBeDefined();
      expect(profile.baselines.network).toBeDefined();
      expect(profile.baselines.filesystem).toBeDefined();
      expect(profile.baselines.ai).toBeDefined();
      expect(profile.riskProfile.overall).toBeGreaterThanOrEqual(0);
    });

    it("detects network and AI usage anomalies when exceeding baseline", async () => {
      const profile = await BehavioralEngine.learn(rootDir);

      const spikeSnapshot: ActivitySnapshot = {
        network: {
          connectionsPerDay: 500, // 3x+ spike
          domains: ["unknown-domain-test.com"],
          dataSentMB: 50,
        },
        filesystem: {
          filesRead: 10,
          pathsRead: ["src/index.ts"],
          pathsWritten: ["dist/"],
        },
        ai: {
          callsPerDay: 100, // 5x+ spike
          avgTokensPerCall: 2000,
          personas: ["developer"],
          providers: ["openai"],
        },
        plugins: {
          activePlugins: ["@eldrex/plugin-slack"],
        },
        development: {
          commitsPerDay: 5,
          changelogsPerDay: 4,
        },
      };

      const report = BehavioralEngine.detectAnomalies(spikeSnapshot, profile);
      expect(report.totalAnomalies).toBeGreaterThan(0);
      expect(report.requiresAttention).toBe(true);
      expect(report.anomalies.some((a) => a.type === "unusual-traffic-volume")).toBe(true);
      expect(report.anomalies.some((a) => a.type === "new-domain")).toBe(true);
      expect(report.anomalies.some((a) => a.type === "unusual-ai-usage")).toBe(true);
    });
  });

  describe("AdaptiveRuleEngine", () => {
    it("evaluates security context against adaptive rules", () => {
      const blockedRes = AdaptiveRuleEngine.evaluate({
        domain: "api.mixpanel.com",
        category: "network",
      });

      expect(blockedRes.allowed).toBe(false);
      expect(blockedRes.blockedBy).toContain("Telemetry Domain Blocker");

      const allowedRes = AdaptiveRuleEngine.evaluate({
        domain: "localhost",
        category: "network",
      });

      expect(allowedRes.allowed).toBe(true);
    });

    it("handles false positive reporting and auto-disables rule after 5 false positives", () => {
      const rules = AdaptiveRuleEngine.getRules();
      const testRule = rules[1]; // "New Domain Alert"
      expect(testRule).toBeDefined();

      for (let i = 0; i < 5; i++) {
        AdaptiveRuleEngine.reportFalsePositive(testRule.id);
      }

      const updatedRules = AdaptiveRuleEngine.getRules();
      const disabledRule = updatedRules.find((r) => r.id === testRule.id);
      expect(disabledRule?.enabled).toBe(false);
    });

    it("calculates rule effectiveness metrics", () => {
      const stats = AdaptiveRuleEngine.getEffectiveness();
      expect(stats.totalRules).toBeGreaterThan(0);
      expect(stats.accuracy).toBeGreaterThanOrEqual(0);
      expect(stats.mostEffectiveRule).toBeDefined();
    });
  });
});
