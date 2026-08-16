import { describe, it, expect } from "vitest";
import { PromptGenerator, ImportEngine } from "../src/index";
import * as path from "path";

describe("DevDiff v1.7.0 — Universal AI Prompt Export & Import Engine", () => {
  const rootDir =
    process.cwd().endsWith("packages\\core") ||
    process.cwd().endsWith("packages/core")
      ? path.resolve(process.cwd(), "../..")
      : process.cwd();

  describe("PromptGenerator", () => {
    it("generates a copy-paste ready prompt for ChatGPT", () => {
      const generated = PromptGenerator.generate({
        workspacePath: rootDir,
        targetAI: "chatgpt",
        persona: "developer",
        format: "markdown",
      });

      expect(generated).toBeDefined();
      expect(generated.prompt).toContain("Instructions");
      expect(generated.prompt).toContain("Git Diff");
      expect(generated.targetAI).toBe("chatgpt");
      expect(generated.estimatedTokens).toBeGreaterThan(0);
      expect(generated.copyReady).toContain("COPY EVERYTHING BELOW THIS LINE");
    });

    it("tailors system instructions for Claude and Gemini", () => {
      const claude = PromptGenerator.generate({
        workspacePath: rootDir,
        targetAI: "claude",
        persona: "ceo",
      });
      expect(claude.prompt).toContain("Be thorough but concise");

      const gemini = PromptGenerator.generate({
        workspacePath: rootDir,
        targetAI: "gemini",
        persona: "pm",
      });
      expect(gemini.prompt).toContain("Use clear structure");
    });
  });

  describe("ImportEngine", () => {
    it("cleans conversational preambles and imports markdown response", async () => {
      const aiResponse = `
Here is your requested changelog:

\`\`\`markdown
## 2026-08-16

### Added
- Feature dynamic prompt exporter (\`packages/core/src/prompt-export/prompt-generator.ts\`)
- Universal import engine (\`packages/core/src/prompt-export/import-engine.ts\`)
\`\`\`

Hope this helps! Let me know if you need anything else.
      `;

      const result = await ImportEngine.import({
        content: aiResponse,
        format: "markdown",
        outputPath: "scratch/test-changelog.md",
        validate: false,
        workspacePath: rootDir,
      });

      expect(result.success).toBe(true);
      expect(result.lines).toBeGreaterThan(0);
      expect(result.preview).toContain("## 2026-08-16");
    });

    it("cleans and imports JSON format responses", async () => {
      const jsonResponse = `
Sure! Here is the JSON output:

\`\`\`json
{
  "date": "2026-08-16",
  "summary": "Added universal prompt exporter",
  "changes": [
    {
      "type": "added",
      "description": "Prompt exporter module",
      "files": ["src/prompt-export/prompt-generator.ts"]
    }
  ]
}
\`\`\`
      `;

      const result = await ImportEngine.import({
        content: jsonResponse,
        format: "json",
        outputPath: "scratch/test-changelog.json",
        validate: false,
        workspacePath: rootDir,
      });

      expect(result.success).toBe(true);
      expect(result.preview).toContain("2026-08-16");
    });
  });
});
