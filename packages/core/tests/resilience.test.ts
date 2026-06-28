import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as fs from "fs/promises";
import * as path from "path";
import { VibeCoderGuardian } from "../src/resilience/vibe-coder-guardian";

describe("VibeCoderGuardian", () => {
  const testFile = "temp-vibe-test-file.txt";

  beforeEach(async () => {
    await fs.writeFile(testFile, "initial content", "utf-8");
  });

  afterEach(async () => {
    await fs.rm(testFile, { force: true });
    await fs.rm(path.resolve(process.cwd(), ".devdiff"), {
      recursive: true,
      force: true,
    });
  });

  it("creates and restores pre-AI checkpoints successfully", async () => {
    const guardian = new VibeCoderGuardian();

    // Save checkpoint
    const checkpoint = await guardian.preAICheckpoint({
      files: [testFile],
      model: "ollama://llama3.2:3b",
      prompt: "explain this change",
    });

    expect(checkpoint.id).toBeDefined();
    expect(checkpoint.snapshot.files.length).toBe(1);
    expect(checkpoint.snapshot.files[0][0]).toBe(testFile);
    expect(checkpoint.snapshot.files[0][1]).toBe("initial content");

    // Modify file
    await fs.writeFile(testFile, "modified content by AI", "utf-8");

    // Restore checkpoint
    await guardian.restoreCheckpoint(checkpoint.id);

    const restoredContent = await fs.readFile(testFile, "utf-8");
    expect(restoredContent).toBe("initial content");
  });

  it("handles failure and recommends fallbacks", async () => {
    const guardian = new VibeCoderGuardian();
    const checkpoint = await guardian.preAICheckpoint({
      files: [testFile],
      model: "ollama://llama3.2:3b",
      prompt: "explain this change",
    });

    const recovery = await guardian.handleFailure({
      error: new Error("Connection refused"),
      model: "ollama://llama3.2:3b",
      checkpointId: checkpoint.id,
      attempt: 1,
    });

    expect(recovery.status).toBe("retrying");
    expect(recovery.nextModel).toBe("ollama://llama3.1:8b");
    expect(recovery.transparency.whatHappened).toContain("llama3.2:3b failed");
  });
});
