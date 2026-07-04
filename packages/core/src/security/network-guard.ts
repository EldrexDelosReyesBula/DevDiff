import * as fs from "fs/promises";
import * as path from "path";
import { SecurityAudit } from "./security-audit";
import { DevDiffConfig } from "../config/schema";

export interface NetworkDecision {
  allowed: boolean;
  reason?: string;
  category: "local" | "configured" | "blocked-telemetry" | "blocked-unknown";
}

export interface NetworkLogEntry {
  timestamp: number;
  url: string;
  domain: string;
  allowed: boolean;
  category: string;
  reason?: string;
  bytesSent?: number;
  bytesReceived?: number;
}

export class NetworkGuard {
  private static getLogPath(): string {
    return (
      process.env.DEVDIFF_NETWORK_LOG_PATH ||
      path.resolve(process.cwd(), ".devdiff/audit/network.log")
    );
  }

  private static BLOCKED_DOMAINS = [
    "api.mixpanel.com",
    "api.amplitude.com",
    "sentry.io",
    "logrocket.com",
    "datadoghq.com",
    "newrelic.com",
    "google-analytics.com",
    "analytics.google.com",
    "segment.io",
    "segment.com",
    "heap.io",
    "posthog.com",
    "hotjar.com",
    "fullstory.com",
    "clarity.ms",
    "api2.branch.io",
    "appsflyer.com",
    "adjust.com",
    "doubleclick.net",
    "googletagmanager.com",
  ];

  /**
   * Check if a URL is allowed to be requested.
   */
  static check(url: string, config?: DevDiffConfig): NetworkDecision {
    try {
      const parsed = new URL(url);
      const domain = parsed.hostname.toLowerCase();

      // 1. Check hard blocked domains (telemetry/analytics)
      for (const blocked of this.BLOCKED_DOMAINS) {
        if (domain === blocked || domain.endsWith("." + blocked)) {
          this.logRequestSync(url, false, "blocked-telemetry", `Domain ${domain} is blacklisted (telemetry/analytics)`);
          return {
            allowed: false,
            reason: `Domain ${domain} is on the blocklist (telemetry/analytics)`,
            category: "blocked-telemetry",
          };
        }
      }

      // 2. Check local domains (always allowed)
      if (
        domain === "localhost" ||
        domain === "127.0.0.1" ||
        domain === "::1" ||
        domain.endsWith(".localhost")
      ) {
        this.logRequestSync(url, true, "local");
        return { allowed: true, category: "local" };
      }

      // 3. Build allowed domains list
      const allowedDomains = new Set<string>();

      // Env keys
      if (process.env.OPENAI_API_KEY) {
        allowedDomains.add("api.openai.com");
      }
      if (process.env.ANTHROPIC_API_KEY) {
        allowedDomains.add("api.anthropic.com");
      }

      // Update checks
      if ((config as any)?.updates?.checkForUpdates !== false) {
        allowedDomains.add("registry.npmjs.org");
      }

      // Configured providers
      if (config?.ai?.providers) {
        for (const provider of config.ai.providers) {
          try {
            if (provider.url.startsWith("http")) {
              const pUrl = new URL(provider.url);
              allowedDomains.add(pUrl.hostname.toLowerCase());
            }
          } catch {}
        }
      }

      // User-configured webhooks & notifications
      if ((config as any)?.notifications?.webhooks) {
        for (const wh of (config as any).notifications.webhooks) {
          try {
            const whUrl = new URL(wh);
            allowedDomains.add(whUrl.hostname.toLowerCase());
          } catch {}
        }
      }

      // Check allowed list
      for (const allowed of allowedDomains) {
        if (domain === allowed || domain.endsWith("." + allowed)) {
          this.logRequestSync(url, true, "configured");
          return { allowed: true, category: "configured" };
        }
      }

      // 4. Unknown domain - block and warn
      const reason = `Domain ${domain} is not in the allowed list. Add to your configuration if intentional.`;
      this.logRequestSync(url, false, "blocked-unknown", reason);
      return {
        allowed: false,
        reason,
        category: "blocked-unknown",
      };
    } catch (err: any) {
      return {
        allowed: false,
        reason: `Invalid URL: ${err.message}`,
        category: "blocked-unknown",
      };
    }
  }

  /**
   * Log request synchronously (non-blocking file write)
   */
  private static logRequestSync(
    url: string,
    allowed: boolean,
    category: NetworkDecision["category"],
    reason?: string
  ): void {
    const logPath = this.getLogPath();
    const domain = new URL(url).hostname;
    const entry: NetworkLogEntry = {
      timestamp: Date.now(),
      url,
      domain,
      allowed,
      category,
      reason,
    };

    // Perform background logging without blocking
    fs.mkdir(path.dirname(logPath), { recursive: true })
      .then(() => {
        return fs.appendFile(logPath, JSON.stringify(entry) + "\n", "utf-8");
      })
      .catch(() => {
        // Silently catch logging errors to prevent application crash
      });

    // Also write to SecurityAudit if blocked
    if (!allowed) {
      SecurityAudit.log({
        type: "network-block",
        domain,
        reason: reason || "blocked",
        timestamp: Date.now(),
      }).catch(() => {});
    }
  }

  /**
   * Fetch recent network audit history for session stats.
   */
  static async getSessionStats(): Promise<{
    externalRequests: number;
    localRequests: number;
    blockedRequests: number;
    dataSentBytes: number;
  }> {
    const logPath = this.getLogPath();
    let externalRequests = 0;
    let localRequests = 0;
    let blockedRequests = 0;
    let dataSentBytes = 0;

    try {
      const content = await fs.readFile(logPath, "utf-8");
      const lines = content.split("\n").filter(Boolean);
      for (const line of lines) {
        try {
          const entry: NetworkLogEntry = JSON.parse(line);
          if (entry.allowed) {
            if (entry.category === "local") {
              localRequests++;
            } else {
              externalRequests++;
            }
          } else {
            blockedRequests++;
          }
          if (entry.bytesSent) {
            dataSentBytes += entry.bytesSent;
          }
        } catch {}
      }
    } catch {}

    return {
      externalRequests,
      localRequests,
      blockedRequests,
      dataSentBytes,
    };
  }
}
