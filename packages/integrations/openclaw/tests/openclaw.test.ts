import { describe, it, expect } from "vitest";
import { OpenClawTriggerEngine } from "../src";

describe("OpenClaw Integration", () => {
  it("correctly parses git push trigger into inputs", () => {
    const trigger = OpenClawTriggerEngine.processTrigger({
      type: "git_push",
      timestamp: new Date().toISOString(),
      details: {
        repoPath: "/home/user/project",
        branch: "feat/users",
        before: "a1b2c3d",
        after: "e5f6g7h",
      },
    });

    expect(trigger.shouldRun).toBe(true);
    expect(trigger.skillInputs.repository).toBe("/home/user/project");
    expect(trigger.skillInputs.branch).toBe("feat/users");
    expect(trigger.skillInputs.since).toBe("a1b2c3d..e5f6g7h");
  });
});
