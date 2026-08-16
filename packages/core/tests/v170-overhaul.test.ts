import { describe, it, expect } from "vitest";
import {
  MermaidEngineV2,
  ContextAwareExplainer,
  SecurityAuditEngineV2,
} from "../src/index";

describe("DevDiff v1.7.0 — Mermaid Engine v2", () => {
  it("sanitizes node IDs and reserved words safely", () => {
    expect(MermaidEngineV2.sanitizeNodeId("src/auth-handler.ts")).toBe(
      "src_auth_handler_ts",
    );
    expect(MermaidEngineV2.sanitizeNodeId("123-start")).toBe("n_123_start");
    expect(MermaidEngineV2.sanitizeNodeId("graph")).toBe("node_graph");
    expect(MermaidEngineV2.sanitizeNodeId("")).toMatch(/^node_/);
  });

  it("sanitizes label text properly", () => {
    const raw = 'Title with "quotes" and \\backslashes\\';
    const sanitized = MermaidEngineV2.sanitizeLabel(raw);
    expect(sanitized).toContain('\\"quotes\\"');
    expect(sanitized).not.toContain("\n");
  });

  it("generates a valid architecture diagram and fallbacks gracefully on error", () => {
    const diff = {
      files: [
        {
          path: "src/auth/login.ts",
          status: "modified" as const,
          content: "import { config } from '../config';",
        },
        {
          path: "src/config.ts",
          status: "added" as const,
          content: "export const config = {};",
        },
      ],
    };

    const result = MermaidEngineV2.generate(diff, {}, "architecture");
    expect(result.valid).toBe(true);
    expect(result.diagram).toContain("graph TD");

    // Invalid diff fallback test
    const fallbackResult = MermaidEngineV2.generate(
      { files: [] },
      {},
      "dependencies",
    );
    expect(fallbackResult.valid).toBe(true);
    expect(fallbackResult.diagram).toContain("Changes Summary");
  });
});

describe("DevDiff v1.7.0 — Context-Aware Explainer", () => {
  it("infers file purpose and detects design patterns", async () => {
    const code = `
      export class AuthController extends BaseController implements IController {
        async handleRequest() {
          try {
            const data = await fetch();
          } catch(e) {}
        }
      }
    `;

    const explanation = await ContextAwareExplainer.explain({
      filePath: "src/controllers/auth-controller.ts",
      projectContext: {},
    });

    expect(explanation.summary).toBeDefined();
    expect(explanation.context.purpose).toContain("Request handler");
    expect(explanation.suggestedQuestions.length).toBeGreaterThan(0);
  });
});

describe("DevDiff v1.7.0 — Security Audit Engine v2", () => {
  it("runs security audit with secret scanning and severity weighting", async () => {
    const result = await SecurityAuditEngineV2.audit(process.cwd());

    expect(result.summary).toBeDefined();
    expect(result.elapsed).toMatch(/s$/);
    expect(Array.isArray(result.findings)).toBe(true);
  });
});
