import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  securePrompt,
  canSecurePrompt,
} from "../../cli/src/utils/secure-input";

describe("securePrompt", () => {
  const originalIsTTY = process.stdin.isTTY;
  const originalSetRawMode = process.stdin.setRawMode;

  beforeEach(() => {
    // Ensure setRawMode exists as a mock spy
    if (!process.stdin.setRawMode) {
      process.stdin.setRawMode = (() => {}) as any;
    }
    process.env.DEVDIFF_PLATFORM_OVERRIDE = "windows";
  });

  afterEach(() => {
    delete process.env.DEVDIFF_PLATFORM_OVERRIDE;
    // Restore original properties
    if (originalSetRawMode) {
      process.stdin.setRawMode = originalSetRawMode;
    } else {
      delete (process.stdin as any).setRawMode;
    }
    Object.defineProperty(process.stdin, "isTTY", {
      value: originalIsTTY,
      configurable: true,
      writable: true,
    });
    vi.restoreAllMocks();
  });

  const mockIsTTY = (val: boolean) => {
    Object.defineProperty(process.stdin, "isTTY", {
      value: val,
      configurable: true,
      writable: true,
    });
  };

  it("detects non-TTY environments", async () => {
    mockIsTTY(false);

    await expect(securePrompt("Enter key: ")).rejects.toThrow(
      "Cannot read secure input",
    );
  });

  it("handles SIGINT during input", async () => {
    mockIsTTY(true);

    // Simulate Ctrl+C
    setTimeout(() => process.emit("SIGINT"), 50);

    await expect(securePrompt("Enter key: ")).rejects.toThrow("cancelled");
  });

  it("restores terminal on process exit", async () => {
    const setRawModeSpy = vi.spyOn(process.stdin, "setRawMode");
    mockIsTTY(true);

    // Simulate fast input
    setTimeout(() => {
      process.stdin.emit("data", Buffer.from("test-key\n"));
    }, 10);

    const result = await securePrompt("Enter key: ");

    expect(result).toBe("test-key");

    // Verify raw mode was restored
    expect(setRawModeSpy).toHaveBeenLastCalledWith(false);
  });

  it("handles backspace correctly", async () => {
    mockIsTTY(true);

    // Simulate: type 'abc', backspace, type 'd', enter
    const keys = ["a", "b", "c", "\x7f", "d", "\n"];
    let keyIndex = 0;

    setTimeout(function sendKey() {
      if (keyIndex < keys.length) {
        process.stdin.emit("data", Buffer.from(keys[keyIndex]));
        keyIndex++;
        setTimeout(sendKey, 10);
      }
    }, 10);

    const result = await securePrompt("Enter key: ");
    expect(result).toBe("abd"); // 'abc' backspace 'd' = 'abd'
  });

  it("cleans up on uncaught exception", async () => {
    const processOnSpy = vi
      .spyOn(process, "on")
      .mockImplementation(() => process);
    mockIsTTY(true);

    // Simulate fast input to exit the prompt
    setTimeout(() => {
      process.stdin.emit("data", Buffer.from("test\n"));
    }, 10);

    await securePrompt("Enter key: ");

    // Verify raw mode/cleanup listener was registered
    expect(processOnSpy).toHaveBeenCalledWith(
      "uncaughtException",
      expect.any(Function),
    );
  });
});
