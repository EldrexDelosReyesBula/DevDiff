import { DevDiffConfig } from "../config/schema";

export interface SecretPattern {
  name: string;
  type: string;
  regex: RegExp;
  severity: "info" | "low" | "medium" | "high" | "critical";
}

export const SECRET_PATTERNS: SecretPattern[] = [
  {
    name: "Generic API Key / Token",
    type: "generic-api-key",
    // Matches patterns like apiKey = "...", token: "..."
    regex:
      /(api[_-]?key|secret|token|password|passwd|auth[_-]?key|private[_-]?key|passphrase)\s*[:=]\s*['"`]([A-Za-z0-9%_-]{8,})['"`]/gi,
    severity: "high",
  },
  {
    name: "OpenAI API Key",
    type: "openai-api-key",
    regex: /sk-[a-zA-Z0-9-]{20,}/g,
    severity: "critical",
  },
  {
    name: "Anthropic API Key",
    type: "anthropic-api-key",
    regex: /sk-ant-[a-zA-Z0-9-]{20,}/g,
    severity: "critical",
  },
  {
    name: "Google Gemini API Key",
    type: "gemini-api-key",
    regex: /AIzaSy[a-zA-Z0-9_-]{33}/g,
    severity: "critical",
  },
  {
    name: "Slack Webhook / Token",
    type: "slack-webhook",
    regex:
      /https:\/\/hooks\.slack\.com\/services\/[A-Za-z0-9]+\/[A-Za-z0-9]+\/[A-Za-z0-9]+/g,
    severity: "high",
  },
  {
    name: "AWS Access Key ID / Secret",
    type: "aws-access-key",
    regex: /(A3T[A-Z0-9]|AKIA|AGPA|AIDA|AROA|AIPA|ANPA|ANVA|ASIA)[A-Z0-9]{16}/g,
    severity: "high",
  },
  {
    name: "Connection String",
    type: "connection-string",
    regex:
      /(mongodb\+srv|mongodb|postgres|postgresql|mysql|redis|sqlite):\/\/[^:\s]+:[^@\s]+@[^@\s]+/gi,
    severity: "high",
  },
  {
    name: "Private Key PEM Block",
    type: "private-key",
    regex:
      /-----BEGIN (RSA |EC |PGP |)?PRIVATE KEY-----[\s\S]+?-----END (RSA |EC |PGP |)?PRIVATE KEY-----/g,
    severity: "high",
  },
  {
    name: "JWT Token",
    type: "jwt-token",
    regex: /eyJhbGciOi[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*/g,
    severity: "medium",
  },
];

export interface Finding {
  type: string;
  name: string;
  severity: string;
}

export class SecretScanner {
  private customPatterns: SecretPattern[] = [];

  constructor(config?: DevDiffConfig) {
    if (config?.security?.customSecretPatterns) {
      for (const [index, p] of config.security.customSecretPatterns.entries()) {
        try {
          this.customPatterns.push({
            name: `Custom Pattern ${index + 1}`,
            type: `custom-secret-${index + 1}`,
            regex: new RegExp(p, "g"),
            severity: "high",
          });
        } catch {}
      }
    }
  }

  scan(content: string): Finding[] {
    if (!content) return [];
    const findings: Finding[] = [];
    const allPatterns = [...SECRET_PATTERNS, ...this.customPatterns];

    for (const pattern of allPatterns) {
      // Reset regex index for safety
      pattern.regex.lastIndex = 0;
      if (pattern.regex.test(content)) {
        findings.push({
          type: pattern.type,
          name: pattern.name,
          severity: pattern.severity,
        });
      }
    }

    return findings;
  }

  redact(content: string): string {
    if (!content) return "";
    let redacted = content;
    const allPatterns = [...SECRET_PATTERNS, ...this.customPatterns];

    for (const pattern of allPatterns) {
      pattern.regex.lastIndex = 0;
      if (pattern.type === "generic-api-key") {
        // Redact only the captured secret value
        redacted = redacted.replace(pattern.regex, (match, prefix, secret) => {
          const secretIndex = match.lastIndexOf(secret);
          const prefixPart = match.substring(0, secretIndex);
          const suffixPart = match.substring(secretIndex + secret.length);
          return `${prefixPart}[REDACTED:${pattern.type}]${suffixPart}`;
        });
      } else {
        redacted = redacted.replace(
          pattern.regex,
          `[REDACTED:${pattern.type}]`,
        );
      }
    }

    return redacted;
  }
}

// Legacy helper functions for backward compatibility:
export function redactSecrets(content: string): string {
  const scanner = new SecretScanner();
  // We need generic replacement style compat for legacy
  let redacted = content;
  for (const pattern of SECRET_PATTERNS) {
    if (pattern.type === "generic-api-key") {
      redacted = redacted.replace(pattern.regex, (match, prefix, secret) => {
        const secretIndex = match.lastIndexOf(secret);
        const prefixPart = match.substring(0, secretIndex);
        const suffixPart = match.substring(secretIndex + secret.length);
        return `${prefixPart}[REDACTED]${suffixPart}`;
      });
    } else {
      redacted = redacted.replace(pattern.regex, "[REDACTED]");
    }
  }
  return redacted;
}

export function scanForSecrets(content: string): string[] {
  const scanner = new SecretScanner();
  return scanner.scan(content).map((f) => f.name);
}
