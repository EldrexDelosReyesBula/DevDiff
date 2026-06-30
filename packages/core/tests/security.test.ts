import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  ShellSandbox,
  ShellAccessDeniedError,
  SecurityAudit,
} from "../src/index";
import * as fs from "fs/promises";
import * as path from "path";

describe("ShellSandbox and SecurityAudit Tests", () => {
  const uniqueId = Math.random().toString(36).substring(7);
  const logPath = path.resolve(
    process.cwd(),
    `.devdiff/security-audit-test-${uniqueId}.json`,
  );
  const encPath = path.resolve(
    process.cwd(),
    `.devdiff/security-audit-test-${uniqueId}.enc`,
  );

  beforeEach(async () => {
    process.env.DEVDIFF_LEGACY_AUDIT_PATH = logPath;
    process.env.DEVDIFF_AUDIT_PATH = encPath;
    // Clear log files before each test
    try {
      await fs.unlink(logPath);
    } catch {
      // Ignored if file doesn't exist
    }
    try {
      await fs.unlink(encPath);
    } catch {
      // Ignored
    }
  });

  afterEach(async () => {
    delete process.env.DEVDIFF_LEGACY_AUDIT_PATH;
    delete process.env.DEVDIFF_AUDIT_PATH;
    // Clean up log files
    try {
      await fs.unlink(logPath);
    } catch {
      // Ignored
    }
    try {
      await fs.unlink(encPath);
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
        ShellAccessDeniedError,
      );
    });

    it("should reject commands containing blocked patterns", async () => {
      // Trying to inject a blocked pattern
      await expect(
        ShellSandbox.exec("git", ["status", ";", "rm", "-rf", "/"]),
      ).rejects.toThrow(ShellAccessDeniedError);

      await expect(
        ShellSandbox.exec("git", ["status", "&&", "node"]),
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
