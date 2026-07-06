export interface RedactionResult {
  redacted: string;
  findings: { type: string; value: string }[];
}

export class RedactionEngineV2 {
  private patterns = [
    {
      type: "OpenAI-API-Key",
      regex: /sk-proj-[a-zA-Z0-9-]{10,}/g,
    },
    {
      type: "Anthropic-API-Key",
      regex: /sk-ant-api[a-zA-Z0-9-]{10,}/g,
    },
    {
      type: "GitHub-Token",
      regex: /ghp_[a-zA-Z0-9]{20,}/g,
    },
    {
      type: "AWS-Access-Key",
      regex: /(AKIA|ASIP|AROA|AIDA)[A-Z0-9]{16}/g,
    },
    {
      type: "JWT-Token",
      regex: /eyJhbGciOi[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*/g,
    },
    {
      type: "Postgres-Connection",
      regex: /postgres(ql)?:\/\/[^:\s]+:[^@\s]+@[^@\s]+/gi,
    },
    {
      type: "RSA-Private-Key",
      regex:
        /-----BEGIN RSA PRIVATE KEY-----[\s\S]+?-----END RSA PRIVATE KEY-----/g,
    },
    {
      type: "Password",
      regex: /(password|passwd|pass)\s*[:=]\s*['"`]([A-Za-z0-9%_-]{4,})['"`]/gi,
    },
  ];

  redact(content: string): RedactionResult {
    let redacted = content;
    const findings: { type: string; value: string }[] = [];

    for (const pattern of this.patterns) {
      pattern.regex.lastIndex = 0;
      redacted = redacted.replace(pattern.regex, (match) => {
        findings.push({ type: pattern.type, value: match });
        if (pattern.type === "Password") {
          // Keep key part, redact only password value
          const eqIndex = match.indexOf("=");
          const colonIndex = match.indexOf(":");
          const idx = eqIndex !== -1 ? eqIndex : colonIndex;
          const keyPart = match.substring(0, idx + 1);
          // Get quote character used
          const remaining = match.substring(idx + 1).trim();
          const quote = remaining[0];
          return `${keyPart} ${quote}[REDACTED:${pattern.type}]${quote}`;
        }
        return `[REDACTED:${pattern.type}]`;
      });
    }

    return {
      redacted,
      findings,
    };
  }
}
