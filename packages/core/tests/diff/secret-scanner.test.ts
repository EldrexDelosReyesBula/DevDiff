import { describe, it, expect } from "vitest";
import { redactSecrets, scanForSecrets } from "../../src/diff/secret-scanner";

describe("secret-scanner", () => {
  it("redacts generic API keys and keeps key labels", () => {
    const code = 'const apiKey = "super-secret-key-12345";';
    const result = redactSecrets(code);
    expect(result).toBe('const apiKey = "[REDACTED]";');
  });

  it("redacts specific provider API keys", () => {
    const code =
      'export const geminiKey = "AIzaSyabc123abc123abc123abc123abc123abc";';
    const result = redactSecrets(code);
    expect(result).toContain("[REDACTED]");
    expect(result).not.toContain("AIzaSy");
  });

  it("redacts PEM keys", () => {
    const code = `
-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC3y...
-----END PRIVATE KEY-----
`;
    const result = redactSecrets(code);
    expect(result.trim()).toBe("[REDACTED]");
  });

  it("scans and returns names of detected secret types", () => {
    const code = 'const token = "my-token-123";\nconst key = "sk-proj-123456";';
    const detected = scanForSecrets(code);
    expect(detected.length).toBeGreaterThan(0);
    expect(detected).toContain("Generic API Key / Token");
  });
});
