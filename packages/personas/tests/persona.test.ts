import { describe, it, expect, beforeEach } from "vitest";
import * as path from "path";
import * as fs from "fs/promises";
import { PersonaRegistry, PersonaEngine, CustomPersonaLoader } from "../src";

describe("Persona Engine & Registry", () => {
  beforeEach(() => {
    PersonaRegistry.clearCustom();
  });

  it("retrieves built-in personas", () => {
    const dev = PersonaRegistry.get("developer");
    expect(dev).toBeDefined();
    expect(dev?.id).toBe("developer");
    expect(dev?.tone).toBe("technical");

    const ceo = PersonaRegistry.get("ceo");
    expect(ceo).toBeDefined();
    expect(ceo?.verbosity).toBe(1);
  });

  it("generates correct system prompts", () => {
    const dev = PersonaRegistry.get("developer")!;
    const prompt = PersonaEngine.generateSystemPrompt(dev);
    expect(prompt).toContain("You are a senior developer");
    expect(prompt).toContain("Tone: technical");
    expect(prompt).toContain("Verbosity level: 3/5");
  });

  it("post-processes output correctly by stripping emojis if not preferred", () => {
    const ceo = PersonaRegistry.get("ceo")!; // emoji_usage is false
    const output = "Hello! 🚀 This is an executive update. 📈";
    const processed = PersonaEngine.postProcess(output, ceo);
    expect(processed).not.toContain("🚀");
    expect(processed).not.toContain("📈");
    expect(processed).toContain("This is an executive update.");
  });

  it("loads custom persona extending existing persona", async () => {
    const tmpDir = path.resolve(__dirname, "../temp");
    await fs.mkdir(tmpDir, { recursive: true });
    const yamlPath = path.join(tmpDir, "custom-ceo.yaml");

    await fs.writeFile(
      yamlPath,
      `
id: custom-ceo
extends: ceo
name: Sarah's Executive Summary
emoji_usage: true
focus:
  - revenue_impact
`,
      "utf-8",
    );

    try {
      const custom = await CustomPersonaLoader.loadFromFile(yamlPath);
      expect(custom.id).toBe("custom-ceo");
      expect(custom.name).toBe("Sarah's Executive Summary");
      expect(custom.emoji_usage).toBe(true);
      expect(custom.focus).toContain("revenue_impact");
      expect(custom.verbosity).toBe(1); // Inherited from ceo

      const registered = PersonaRegistry.get("custom-ceo");
      expect(registered).toBeDefined();
      expect(registered?.id).toBe("custom-ceo");
    } finally {
      await fs.rm(tmpDir, { recursive: true, force: true });
    }
  });
});
