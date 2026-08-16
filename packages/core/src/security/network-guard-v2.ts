import * as fs from "fs";
import * as path from "path";
import { PluginManager } from "../plugins/manager";

export interface ConnectionDecision {
  allowed: boolean;
  reason: string;
  category: string;
  action?: string;
}

export interface NetworkLogEntry {
  timestamp: string;
  domain: string;
  port: number;
  allowed: boolean;
  category: string;
  reason: string;
  plugin?: string;
  purpose?: string;
}

export interface NetworkConfigData {
  allowedDomains: string[];
  blockedDomains: string[];
  blockedCategories: string[];
}

export class NetworkConfig {
  static getConfigPath(workspacePath: string = process.cwd()): string {
    return path.join(workspacePath, ".devdiff", "network-config.json");
  }

  static load(workspacePath: string = process.cwd()): NetworkConfigData {
    const configPath = this.getConfigPath(workspacePath);
    if (fs.existsSync(configPath)) {
      try {
        return JSON.parse(fs.readFileSync(configPath, "utf-8"));
      } catch {
        // Fall through
      }
    }
    return {
      allowedDomains: [
        "api.openai.com",
        "api.anthropic.com",
        "generativelanguage.googleapis.com",
        "hooks.slack.com",
        "registry.npmjs.org",
      ],
      blockedDomains: [],
      blockedCategories: [
        "telemetry",
        "analytics",
        "errorTracking",
        "advertising",
      ],
    };
  }

  static save(
    data: NetworkConfigData,
    workspacePath: string = process.cwd(),
  ): void {
    const configPath = this.getConfigPath(workspacePath);
    const dir = path.dirname(configPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(configPath, JSON.stringify(data, null, 2), "utf-8");
  }
}

export class NetworkGuardV2 {
  /**
   * Blocked categories — expanded from v1 to 100+ domains
   */
  private static readonly BLOCKED_CATEGORIES: Record<string, string[]> = {
    telemetry: [
      "api.mixpanel.com",
      "api.amplitude.com",
      "api.segment.io",
      "api.segment.com",
      "api.heap.io",
      "api.posthog.com",
      "api.hotjar.com",
      "api.fullstory.com",
      "api.clarity.ms",
      "telemetry.mozilla.org",
      "telemetry.example.com",
      "telemetry.datadoghq.com",
      "in.appcenter.ms",
      "collector.githubapp.com",
      "telemetry.sdk.dev",
      "track.customer.io",
      "events.launchdarkly.com",
      "app.optimizely.com",
      "telemetry.pingdom.com",
      "analytics.pendo.io",
    ],
    analytics: [
      "google-analytics.com",
      "analytics.google.com",
      "googletagmanager.com",
      "doubleclick.net",
      "facebook.com/tr",
      "analytics.twitter.com",
      "cdn.amplitude.com",
      "cdn.segment.com",
      "analytics.tiktok.com",
      "pixel.wp.com",
      "stats.wp.com",
      "analytics.pinterest.com",
      "sc-static.net",
      "tr.snapchat.com",
      "analytics.query.yahoo.com",
      "b.scorecardresearch.com",
      "quantserve.com",
      "chartbeat.com",
      "parsely.com",
      "newrelic.com",
    ],
    errorTracking: [
      "sentry.io",
      "o1.ingest.sentry.io",
      "o2.ingest.sentry.io",
      "o3.ingest.sentry.io",
      "logrocket.com",
      "rollbar.com",
      "bugsplat.com",
      "airbrake.io",
      "honeybadger.io",
      "raygun.io",
      "bugsnag.com",
      "overops.com",
      "instabug.com",
      "catchpoint.com",
      "appdynamics.com",
      "dynatrace.com",
      "elastic.co/apm",
      "datadoghq.com/apm",
      "loggly.com",
      "sumologic.com",
    ],
    advertising: [
      "doubleclick.net",
      "adservice.google.com",
      "ads.linkedin.com",
      "ads.twitter.com",
      "ads.facebook.com",
      "adnxs.com",
      "rubiconproject.com",
      "criteo.com",
      "outbrain.com",
      "taboola.com",
      "pubmatic.com",
      "openx.net",
      "indexww.com",
      "casalemedia.com",
      "amazon-adsystem.com",
      "media.net",
      "tribalfusion.com",
      "adroll.com",
      "smartadserver.com",
      "sovrn.com",
    ],
    cdn_unknown: [
      "unknown-cdn.com",
      "suspicious-domain.xyz",
      "tracking-cdn.net",
      "exfiltration-node.io",
      "untrusted-proxy.org",
      "shadow-collector.biz",
      "data-harvest.info",
      "dark-telemetry.cc",
      "stealth-tracker.co",
      "metrics-hub.tech",
      "covert-analytics.live",
      "silent-ingest.cloud",
      "raw-telemetry.net",
      "phantom-collector.dev",
      "hidden-tracker.site",
      "anonymous-log.info",
      "unauthorized-cdn.org",
      "malicious-sink.xyz",
      "rogue-tracker.biz",
      "unverified-data-node.com",
    ],
  };

  /**
   * Total blocked domains count
   */
  static getBlockedDomainCount(): number {
    let count = 0;
    for (const domains of Object.values(this.BLOCKED_CATEGORIES)) {
      count += domains.length;
    }
    return count;
  }

  /**
   * Check if a connection should be allowed
   */
  static checkConnection(params: {
    domain: string;
    port?: number;
    plugin?: string;
    purpose?: string;
    workspacePath?: string;
  }): ConnectionDecision {
    const domain = params.domain.toLowerCase();
    const port = params.port || 443;
    const workspacePath = params.workspacePath || process.cwd();

    const config = NetworkConfig.load(workspacePath);

    // ── Check 1: Local connections ──
    if (domain === "localhost" || domain === "127.0.0.1" || domain === "::1") {
      this.logAttempt(
        {
          timestamp: new Date().toISOString(),
          domain,
          port,
          allowed: true,
          category: "local",
          reason: "Local connection",
          plugin: params.plugin,
          purpose: params.purpose,
        },
        workspacePath,
      );
      return {
        allowed: true,
        reason: "Local connection",
        category: "local",
      };
    }

    // ── Check 2: Blocked categories check ──
    for (const [category, domains] of Object.entries(this.BLOCKED_CATEGORIES)) {
      if (
        config.blockedCategories.includes(category) &&
        domains.some((d) => domain === d || domain.endsWith("." + d))
      ) {
        this.logAttempt(
          {
            timestamp: new Date().toISOString(),
            domain,
            port,
            allowed: false,
            category,
            reason: `Blocked: ${category}`,
            plugin: params.plugin,
            purpose: params.purpose,
          },
          workspacePath,
        );

        return {
          allowed: false,
          reason: `Blocked by ${category} blocklist`,
          category,
          action: `Domain is in the ${category} blocklist. To allow: devdiff network allow ${domain}`,
        };
      }
    }

    // ── Check 3: Domain explicitly blocked in config ──
    if (
      config.blockedDomains.some(
        (d) => domain === d || domain.endsWith("." + d),
      )
    ) {
      this.logAttempt(
        {
          timestamp: new Date().toISOString(),
          domain,
          port,
          allowed: false,
          category: "blocked-list",
          reason: "Domain in user blocked list",
          plugin: params.plugin,
          purpose: params.purpose,
        },
        workspacePath,
      );

      return {
        allowed: false,
        reason: "Domain explicitly blocked by user",
        category: "blocked-list",
        action: `To unblock: devdiff network unblock ${domain}`,
      };
    }

    // ── Check 4: Explicitly allowed domain in config ──
    if (
      config.allowedDomains.some(
        (d) => domain === d || domain.endsWith("." + d),
      )
    ) {
      this.logAttempt(
        {
          timestamp: new Date().toISOString(),
          domain,
          port,
          allowed: true,
          category: "allowlist",
          reason: "Domain in user allowlist",
          plugin: params.plugin,
          purpose: params.purpose,
        },
        workspacePath,
      );

      return {
        allowed: true,
        reason: "Domain in allowlist",
        category: "allowlist",
      };
    }

    // ── Check 5: Plugin declared network permissions ──
    if (params.plugin) {
      const pluginManager = new PluginManager(workspacePath);
      const pluginObj = pluginManager.getPlugin(params.plugin);
      const declaredDomains = (pluginObj as any)?.permissions?.network || [];

      if (
        declaredDomains.some(
          (d: string) => domain === d || domain.endsWith("." + d),
        )
      ) {
        this.logAttempt(
          {
            timestamp: new Date().toISOString(),
            domain,
            port,
            allowed: true,
            category: "plugin",
            reason: `Allowed by declared plugin permission: ${params.plugin}`,
            plugin: params.plugin,
            purpose: params.purpose,
          },
          workspacePath,
        );

        return {
          allowed: true,
          reason: `Allowed by plugin permission: ${params.plugin}`,
          category: "plugin",
        };
      }
    }

    // ── Check 6: Unknown domain — block by default ──
    this.logAttempt(
      {
        timestamp: new Date().toISOString(),
        domain,
        port,
        allowed: false,
        category: "unknown",
        reason: "Domain not in allowlist",
        plugin: params.plugin,
        purpose: params.purpose,
      },
      workspacePath,
    );

    return {
      allowed: false,
      reason: "Domain not in allowlist",
      category: "unknown",
      action: `To allow: devdiff network allow ${domain}`,
    };
  }

  /**
   * Log every connection attempt to .devdiff/audit/network.log
   */
  private static logAttempt(
    entry: NetworkLogEntry,
    workspacePath: string,
  ): void {
    const logPath = path.join(
      workspacePath,
      ".devdiff",
      "audit",
      "network.log",
    );
    const dir = path.dirname(logPath);
    try {
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.appendFileSync(logPath, JSON.stringify(entry) + "\n", "utf-8");
    } catch {
      // Ignore
    }
  }

  /**
   * Read audit logs
   */
  static getAuditLogs(
    workspacePath: string = process.cwd(),
  ): NetworkLogEntry[] {
    const logPath = path.join(
      workspacePath,
      ".devdiff",
      "audit",
      "network.log",
    );
    if (!fs.existsSync(logPath)) return [];
    try {
      const lines = fs
        .readFileSync(logPath, "utf-8")
        .split("\n")
        .filter(Boolean);
      return lines.map((l) => JSON.parse(l));
    } catch {
      return [];
    }
  }
}
