import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { ShellSandbox, ShellAccessDeniedError, SecurityAudit } from "../src/index";
import * as fs from "fs/promises";
import * as path from "path";

describe("ShellSandbox and SecurityAudit Tests", () => {
  const logPath = path.resolve(process.cwd(), ".devdiff/security-audit.json");

  beforeEach(async () => {
    // Clear log file before each test
    try {
      await fs.unlink(logPath);
    } catch {
      // Ignored if file doesn't exist
    }
  });

  afterEach(async () => {
    // Clean up log file
    try {
      await fs.unlink(logPath);
    } catch {
      // Ignored
    }
  });

  describe("ShellSandbox Whitelisting & Blacklisting", () => {
    it("should allow running whitelisted commands", async () => {
      // Running 'node -v' or similar check
      const result = await ShellSandbox.exec("node", ["-v"]);
      expect(result).toBeDefined();
    });

    it("should reject commands not on the whitelist", async () => {
      await expect(ShellSandbox.exec("cat", ["package.json"])).rejects.toThrow(
        ShellAccessDeniedError
      );
    });

    it("should reject commands containing blocked patterns", async () => {
      // Trying to inject a blocked pattern
      await expect(
        ShellSandbox.exec("git", ["status", ";", "rm", "-rf", "/"])
      ).rejects.toThrow(ShellAccessDeniedError);

      await expect(
        ShellSandbox.exec("git", ["status", "&&", "node"])
      ).rejects.toThrow(ShellAccessDeniedError);
    });
  });

  describe("SecurityAudit Log Trail", () => {
    it("should write audit trail log to file", async () => {
      const logsBefore = await SecurityAudit.getLogs();
      expect(logsBefore.length).toBe(0);

      // Perform a sandboxed execution which logs automatically
      await ShellSandbox.exec("node", ["-v"]);

      const logsAfter = await SecurityAudit.getLogs();
      expect(logsAfter.length).toBe(1);
      expect(logsAfter[0].type).toBe("shell-access");
      expect(logsAfter[0].command).toBe("node");
      expect(logsAfter[0].args).toEqual(["-v"]);
      expect(logsAfter[0].timestamp).toBeLessThanOrEqual(Date.now());
    });
  });
});
