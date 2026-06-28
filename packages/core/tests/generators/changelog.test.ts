import { describe, it, expect, vi } from "vitest";
import { generateChangelog } from "../../src/generators/changelog";

vi.mock("../../src/ai/router", () => {
  return {
    AIRouter: vi.fn().mockImplementation(() => ({
      getExplanation: vi.fn().mockResolvedValue({
        summary: "Mocked explanation summary",
        impact: "minor",
        breaking: false,
        files: [{ path: "file.ts", explanation: "some changes" }],
        relatedIssues: [],
      }),
    })),
  };
});

describe("generateChangelog orchestrator", () => {
  it("runs the pipeline and generates markdown output", async () => {
    const diff = `diff --git a/file.ts b/file.ts
index 0000000..1111111 100644
--- a/file.ts
+++ b/file.ts
@@ -1,2 +1,3 @@
 const a = 1
+const b = 2
 `;
    const result = await generateChangelog({
      diffText: diff,
      format: "markdown",
    });

    expect(result.format).toBe("markdown");
    expect(result.rawResult.summary).toBe("Mocked explanation summary");
    expect(result.formattedOutput).toContain("Mocked explanation summary");
    expect(result.formattedOutput).toContain("file.ts");
  });
});
