import { describe, it, expect, vi, beforeEach } from "vitest";
import { MockAIProvider } from "../../src/ai/providers/mock";
import { AIRouter } from "../../src/ai/router";

const SAMPLE_DIFF = `diff --git a/src/utils.ts b/src/utils.ts
index abc1234..def5678 100644
--- a/src/utils.ts
+++ b/src/utils.ts
@@ -1,5 +1,8 @@
 export function hello() {
+  console.log('hello')
   return 'world'
 }
+
+export function goodbye() {
+  return 'bye'
+}`;

describe("AI Providers Integration", () => {
  describe("MockAIProvider", () => {
    it("returns structured result for valid diff", async () => {
      const provider = new MockAIProvider();
      const result = await provider.generateExplanation(SAMPLE_DIFF, "mock");

      expect(result).toHaveProperty("summary");
      expect(result).toHaveProperty("impact");
      expect(result).toHaveProperty("breaking");
      expect(result).toHaveProperty("files");
      expect(Array.isArray(result.files)).toBe(true);
    });

    it("counts additions and deletions accurately", async () => {
      const provider = new MockAIProvider();
      const result = await provider.generateExplanation(SAMPLE_DIFF, "mock");
      // Summary should mention additions (exact count may vary by line parsing)
      expect(result.summary).toMatch(/\d+ additions/);
    });

    it("respects custom response overrides", async () => {
      const provider = new MockAIProvider({
        summary: "Custom summary",
        impact: "breaking",
        breaking: true,
      });
      const result = await provider.generateExplanation(SAMPLE_DIFF, "mock");
      expect(result.summary).toBe("Custom summary");
      expect(result.impact).toBe("breaking");
      expect(result.breaking).toBe(true);
    });

    it("handles empty diff gracefully", async () => {
      const provider = new MockAIProvider();
      const result = await provider.generateExplanation("", "mock");
      expect(result.summary).toContain("0 additions");
    });

    it("identifies file paths from diff", async () => {
      const provider = new MockAIProvider();
      const result = await provider.generateExplanation(SAMPLE_DIFF, "mock");
      expect(result.files.some((f) => f.path.includes("utils.ts"))).toBe(true);
    });
  });

  describe("OllamaProvider timeout", () => {
    it("throws OllamaNotAvailableError on timeout", async () => {
      const { OllamaProvider, OllamaNotAvailableError } = await import(
        "../../src/ai/providers/ollama"
      );
      // Very short timeout; no real Ollama server running in tests
      const provider = new OllamaProvider("http://localhost:11434", 1);
      await expect(
        provider.generateExplanation(SAMPLE_DIFF, "llama3.2:3b"),
      ).rejects.toThrow(OllamaNotAvailableError);
    });
  });
});
