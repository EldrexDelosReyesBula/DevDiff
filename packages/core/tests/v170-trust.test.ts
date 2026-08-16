import { describe, it, expect } from "vitest";
import {
  NetworkGuardV2,
  NetworkConfig,
  PluginAuditor,
  DisclosureReport,
} from "../src/index";
import * as path from "path";

describe("DevDiff v1.7.0 — Complete Trust & Transparency Platform", () => {
  const rootDir = process.cwd().endsWith("packages\\core") || process.cwd().endsWith("packages/core")
    ? path.resolve(process.cwd(), "../..")
    : process.cwd();

  it("verifies 100+ blocked domains in NetworkGuardV2", () => {
    const count = NetworkGuardV2.getBlockedDomainCount();
    expect(count).toBeGreaterThanOrEqual(100);
  });

  it("allows local and allowlist connections while blocking telemetry", () => {
    // Local connection
    const localRes = NetworkGuardV2.checkConnection({
      domain: "localhost",
      workspacePath: rootDir,
    });
    expect(localRes.allowed).toBe(true);

    // Telemetry domain
    const telemetryRes = NetworkGuardV2.checkConnection({
      domain: "api.mixpanel.com",
      workspacePath: rootDir,
    });
    expect(telemetryRes.allowed).toBe(false);
    expect(telemetryRes.category).toBe("telemetry");

    // Analytics domain
    const analyticsRes = NetworkGuardV2.checkConnection({
      domain: "google-analytics.com",
      workspacePath: rootDir,
    });
    expect(analyticsRes.allowed).toBe(false);
    expect(analyticsRes.category).toBe("analytics");
  });

  it("audits plugins and generates plugin audit verdicts", async () => {
    const audit = await PluginAuditor.auditPlugin("@eldrex/plugin-slack", rootDir);
    expect(audit).toBeDefined();
    expect(audit.pluginName).toBe("@eldrex/plugin-slack");
    expect(audit.verdict).toBeDefined();
  });

  it("generates complete full disclosure report", async () => {
    const report = await DisclosureReport.generate(rootDir);
    expect(report.generatedAt).toBeDefined();
    expect(report.version).toBe("1.7.0");
    expect(report.privacyGuarantees.length).toBeGreaterThan(0);
    expect(report.compliance.GDPR).toBeDefined();

    const markdown = DisclosureReport.formatMarkdown(report);
    expect(markdown).toContain("Full Disclosure Report");
  });
});
