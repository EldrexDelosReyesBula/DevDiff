import { describe, it, expect } from "vitest";
import { checkConfigCompatibility } from "../../src/version/compatibility";

describe("checkConfigCompatibility", () => {
  it("is compatible when no version is pinned in config", () => {
    const result = checkConfigCompatibility({}, "1.0.3");
    expect(result.compatible).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it("is compatible when config version matches exactly", () => {
    const result = checkConfigCompatibility({ version: "1.0.3" }, "1.0.3");
    expect(result.compatible).toBe(true);
    expect(result.warning).toBeUndefined();
  });

  it("is compatible when running a newer patch than config requires", () => {
    const result = checkConfigCompatibility({ version: "1.0.0" }, "1.0.3");
    expect(result.compatible).toBe(true);
  });

  it("is compatible with warning when running older minor", () => {
    const result = checkConfigCompatibility({ version: "1.2.0" }, "1.0.3");
    expect(result.compatible).toBe(true);
    expect(result.warning).toContain("1.2.0+");
  });

  it("is incompatible on major version mismatch (higher)", () => {
    const result = checkConfigCompatibility({ version: "2.0.0" }, "1.0.3");
    expect(result.compatible).toBe(false);
    expect(result.error).toContain("v2.x");
  });

  it("is incompatible on major version mismatch (lower)", () => {
    const result = checkConfigCompatibility({ version: "0.9.0" }, "1.0.3");
    expect(result.compatible).toBe(false);
    expect(result.error).toContain("v0.x");
  });

  it("handles caret ranges gracefully", () => {
    const result = checkConfigCompatibility({ version: "^1.0.0" }, "1.0.3");
    expect(result.compatible).toBe(true);
  });

  it("handles tilde ranges gracefully", () => {
    const result = checkConfigCompatibility({ version: "~1.0.0" }, "1.0.3");
    expect(result.compatible).toBe(true);
  });

  it("returns compatible:true with warning on unparseable version", () => {
    const result = checkConfigCompatibility({ version: "not-a-version" }, "1.0.3");
    expect(result.compatible).toBe(true);
    expect(result.warning).toContain("Could not parse");
  });
});
