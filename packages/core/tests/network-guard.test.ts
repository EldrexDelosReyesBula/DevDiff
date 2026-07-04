import { describe, it, expect } from "vitest";
import { NetworkGuard } from "../src/security/network-guard";
import { DevDiffConfig } from "../src/config/schema";

describe("NetworkGuard", () => {
  it("blocks blacklisted telemetry domains", () => {
    const d1 = NetworkGuard.check("https://api.mixpanel.com/track");
    expect(d1.allowed).toBe(false);
    expect(d1.category).toBe("blocked-telemetry");

    const d2 = NetworkGuard.check("https://sentry.io/api/123/store");
    expect(d2.allowed).toBe(false);
    expect(d2.category).toBe("blocked-telemetry");
  });

  it("allows local domains (localhost / 127.0.0.1)", () => {
    const d1 = NetworkGuard.check("http://localhost:11434/api/tags");
    expect(d1.allowed).toBe(true);
    expect(d1.category).toBe("local");

    const d2 = NetworkGuard.check("http://127.0.0.1:8000/v1/models");
    expect(d2.allowed).toBe(true);
    expect(d2.category).toBe("local");
  });

  it("allows configured cloud AI providers", () => {
    // With env var
    process.env.OPENAI_API_KEY = "sk-test123456";
    const d1 = NetworkGuard.check("https://api.openai.com/v1/chat/completions");
    expect(d1.allowed).toBe(true);
    expect(d1.category).toBe("configured");

    // With config provider URL
    const config: DevDiffConfig = {
      ai: {
        providers: [
          {
            name: "custom-provider",
            url: "https://custom-ai.dev/v1",
            priority: 1,
          },
        ],
        routing: {
          strategy: "priority",
          complexityThreshold: 0.6,
          localOnly: false,
        },
      },
      exclude: [],
      cache: { enabled: true, path: "" },
      format: "markdown",
    };

    const d2 = NetworkGuard.check("https://custom-ai.dev/v1/chat", config);
    expect(d2.allowed).toBe(true);
    expect(d2.category).toBe("configured");
  });

  it("blocks unknown domains", () => {
    const d1 = NetworkGuard.check("https://unauthorized-domain.com/api");
    expect(d1.allowed).toBe(false);
    expect(d1.category).toBe("blocked-unknown");
  });
});
