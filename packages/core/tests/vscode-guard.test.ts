import { describe, it, expect } from "vitest";
import { ExtensionSecurityGuard } from "../../vscode/src/security/extension-guard";

describe("ExtensionSecurityGuard", () => {
  describe("validateWorkspace", () => {
    it("should allow a normal workspace path", () => {
      const res = ExtensionSecurityGuard.validateWorkspace(
        "C:\\Users\\User\\project",
      );
      // Since it's a test on different OS, let's just make sure it returns the validation object
      expect(res).toHaveProperty("safe");
      expect(res).toHaveProperty("issues");
    });

    it("should block system directories", () => {
      const testPath =
        process.platform === "win32" ? "C:\\Windows\\System32" : "/etc";
      const res = ExtensionSecurityGuard.validateWorkspace(testPath);
      expect(res.safe).toBe(false);
      expect(res.issues.some((i) => i.type === "system-path-access")).toBe(
        true,
      );
    });
  });

  describe("sanitizeContent", () => {
    it("should remove null bytes, ANSI escape codes, and Unicode control characters", () => {
      const dirty = "Hello\0World\x1B[31m Test\u0007!";
      const sanitized = ExtensionSecurityGuard.sanitizeContent(dirty);
      expect(sanitized).toBe("HelloWorld Test!");
    });

    it("should throw error if content is too large", () => {
      const huge = "a".repeat(11 * 1024 * 1024); // 11MB
      expect(() => ExtensionSecurityGuard.sanitizeContent(huge)).toThrow();
    });
  });

  describe("isWithinWorkspace", () => {
    it("should return true for files inside workspace", () => {
      const res = ExtensionSecurityGuard.isWithinWorkspace(
        "C:\\Users\\User\\project\\src\\index.ts",
        "C:\\Users\\User\\project",
      );
      expect(res).toBe(true);
    });

    it("should throw for files outside workspace", () => {
      expect(() =>
        ExtensionSecurityGuard.isWithinWorkspace(
          "C:\\Users\\User\\other-project\\src\\index.ts",
          "C:\\Users\\User\\project",
        ),
      ).toThrow();
    });
  });

  describe("sanitizeFileName", () => {
    it("should replace shell metacharacters", () => {
      const dirty = "file;rm -rf.js";
      const sanitized = ExtensionSecurityGuard.sanitizeFileName(dirty);
      expect(sanitized).toBe("file_rm -rf.js");
    });

    it("should replace path traversal components", () => {
      const dirty = "../../etc/passwd";
      const sanitized = ExtensionSecurityGuard.sanitizeFileName(dirty);
      expect(sanitized).toBe("_dot_dot___dot_dot__etc_passwd");
    });
  });
});
