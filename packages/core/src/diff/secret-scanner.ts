export interface SecretPattern {
  name: string
  regex: RegExp
}

export const SECRET_PATTERNS: SecretPattern[] = [
  {
    name: 'Generic API Key / Token',
    // Matches patterns like apiKey = "...", token: "..."
    regex: /(api[_-]?key|secret|token|password|passwd|auth[_-]?key|private[_-]?key|passphrase)\s*[:=]\s*['"`]([A-Za-z0-9%_-]{8,})['"`]/gi,
  },
  {
    name: 'OpenAI API Key',
    regex: /sk-[a-zA-Z0-9]{20,}/g,
  },
  {
    name: 'Anthropic API Key',
    regex: /sk-ant-[a-zA-Z0-9]{20,}/g,
  },
  {
    name: 'Google Gemini API Key',
    regex: /AIzaSy[a-zA-Z0-9_-]{33}/g,
  },
  {
    name: 'Slack Webhook / Token',
    regex: /https:\/\/hooks\.slack\.com\/services\/[A-Za-z0-9]+\/[A-Za-z0-9]+\/[A-Za-z0-9]+/g,
  },
  {
    name: 'AWS Access Key ID / Secret',
    regex: /(A3T[A-Z0-9]|AKIA|AGPA|AIDA|AROA|AIPA|ANPA|ANVA|ASIA)[A-Z0-9]{16}/g,
  },
  {
    name: 'Connection String',
    regex: /(mongodb\+srv|mongodb|postgres|postgresql|mysql|redis|sqlite):\/\/[^:\s]+:[^@\s]+@[^@\s]+/gi,
  },
  {
    name: 'Private Key PEM Block',
    regex: /-----BEGIN (RSA |EC |PGP |)?PRIVATE KEY-----[\s\S]+?-----END (RSA |EC |PGP |)?PRIVATE KEY-----/g,
  },
]

export function redactSecrets(content: string): string {
  let redacted = content

  for (const pattern of SECRET_PATTERNS) {
    if (pattern.name === 'Generic API Key / Token') {
      // For this pattern, we want to redact only the captured secret value, not the label itself
      // e.g. apiKey: "my-secret-key" -> apiKey: "[REDACTED]"
      redacted = redacted.replace(pattern.regex, (match, prefix, secret) => {
        // Find the index of the secret within the match and replace it
        const secretIndex = match.lastIndexOf(secret)
        const prefixPart = match.substring(0, secretIndex)
        const suffixPart = match.substring(secretIndex + secret.length)
        return `${prefixPart}[REDACTED]${suffixPart}`
      })
    } else {
      // For other patterns, redact the entire match
      redacted = redacted.replace(pattern.regex, '[REDACTED]')
    }
  }

  return redacted
}

export function scanForSecrets(content: string): string[] {
  const detected: string[] = []

  for (const pattern of SECRET_PATTERNS) {
    const matches = content.match(pattern.regex)
    if (matches && matches.length > 0) {
      detected.push(pattern.name)
    }
  }

  return detected
}
