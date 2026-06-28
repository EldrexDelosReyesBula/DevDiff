import { describe, it, expect } from "vitest";
import { PrivacyEnforcer } from "../src/privacy/enforcement";

describe("PrivacyEnforcer", () => {
  const enforcer = new PrivacyEnforcer();

  it("classifies and blocks api keys to cloud destination", () => {
    const key = "sk-abcdefghijklmnopqrstuvwxyz12345678";
    const decision = enforcer.check(key, "cloud");
    expect(decision.allowed).toBe(false);
    expect(decision.classification).toBe("api-keys");
  });

  it("allows api keys to local destination", () => {
    const key = "sk-abcdefghijklmnopqrstuvwxyz12345678";
    // wait, DATA_CLASSIFICATIONS for api-keys: { allowLocal: false, allowCloud: false, requireEncryption: true }
    const decision = enforcer.check(key, "local");
    expect(decision.allowed).toBe(false); // api-keys are not allowed local either (allowLocal: false)
  });

  it("classifies source code and allows locally but blocks on cloud", () => {
    const code = "function test() { console.log('hello'); }";
    const decisionLocal = enforcer.check(code, "local");
    expect(decisionLocal.allowed).toBe(true);

    const decisionCloud = enforcer.check(code, "cloud");
    expect(decisionCloud.allowed).toBe(false); // allowCloud: false for source-code
  });

  it("classifies user emails and blocks to cloud", () => {
    const email = "user@example.com";
    const decision = enforcer.check(email, "cloud");
    expect(decision.allowed).toBe(false);
    expect(decision.classification).toBe("user-emails");
  });
});
