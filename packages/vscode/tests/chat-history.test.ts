import { describe, it, expect } from "vitest";
import { ChatHistory } from "../src/chat/chat-history";

describe("DevDiff v1.7.0 — Full Chat Window & Persistent History", () => {
  it("creates new conversation threads and appends message turns", async () => {
    const id = await ChatHistory.createConversation();
    expect(id).toBeDefined();
    expect(id).toContain("conv-");

    await ChatHistory.addMessage(id, {
      role: "user",
      content: "Explain auth module architecture",
      timestamp: new Date().toISOString(),
    });

    await ChatHistory.addMessage(id, {
      role: "assistant",
      content:
        "The auth module utilizes JWT authentication with rate limiting.",
      timestamp: new Date().toISOString(),
    });

    const conv = await ChatHistory.getConversation(id);
    expect(conv).toBeDefined();
    expect(conv?.messages.length).toBe(2);
    expect(conv?.title).toBe("Explain auth module architecture");
  });

  it("searches conversations by title and ID", async () => {
    const id = await ChatHistory.createConversation(
      undefined,
      "Security Review Thread",
    );
    await ChatHistory.addMessage(id, {
      role: "user",
      content: "Run vulnerability scan",
      timestamp: new Date().toISOString(),
    });

    const results = await ChatHistory.searchConversations("Security");
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((r) => r.id === id)).toBe(true);
  });

  it("exports conversation thread as clean Markdown document", async () => {
    const id = await ChatHistory.createConversation(
      undefined,
      "Changelog Export Thread",
    );
    await ChatHistory.addMessage(id, {
      role: "user",
      content: "Generate release notes",
      timestamp: new Date().toISOString(),
    });

    await ChatHistory.addMessage(id, {
      role: "assistant",
      content: "## Added\n- Feature Universal AI Prompt Exporter",
      timestamp: new Date().toISOString(),
    });

    const exportText = await ChatHistory.exportConversation(id);
    expect(exportText).toContain("# DevDiff Chat — Changelog Export Thread");
    expect(exportText).toContain("👤 You");
    expect(exportText).toContain("🤖 DevDiff");
  });
});
