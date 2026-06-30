import { describe, it, expect } from 'vitest'
import { SecretScanner } from '../../src/diff/secret-scanner'

describe('SecretScanner', () => {
  const scanner = new SecretScanner()

  describe('scan()', () => {
    it('detects OpenAI API keys', () => {
      const code = 'const apiKey = "sk-proj-abc123def456ghi789jkl012"'
      const findings = scanner.scan(code)
      expect(findings.length).toBeGreaterThanOrEqual(1)
      const openAIFinding = findings.find(f => f.type === 'openai-api-key')
      expect(openAIFinding).toBeDefined()
      expect(openAIFinding?.severity).toBe('critical')
    })

    it('detects AWS access keys', () => {
      const code = 'AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE'
      const findings = scanner.scan(code)
      expect(findings).toHaveLength(1)
      expect(findings[0].type).toBe('aws-access-key')
    })

    it('detects private keys', () => {
      const code = `-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA...
-----END RSA PRIVATE KEY-----`
      const findings = scanner.scan(code)
      expect(findings).toHaveLength(1)
      expect(findings[0].type).toBe('private-key')
    })

    it('detects JWT tokens', () => {
      const code = 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
      const findings = scanner.scan(code)
      expect(findings).toHaveLength(1)
      expect(findings[0].type).toBe('jwt-token')
    })

    it('detects .env file contents', () => {
      const code = 'DATABASE_URL=postgres://user:password@localhost:5432/db'
      const findings = scanner.scan(code)
      expect(findings).toHaveLength(1)
      expect(findings[0].type).toBe('connection-string')
    })

    it('no false positive on safe code', () => {
      const code = 'const x = "hello world"; const y = 42;'
      const findings = scanner.scan(code)
      expect(findings).toHaveLength(0)
    })

    it('handles empty input', () => {
      expect(scanner.scan('')).toHaveLength(0)
      expect(scanner.scan(null as any)).toHaveLength(0)
    })
  })

  describe('redact()', () => {
    it('redacts detected secrets', () => {
      const code = 'key = "sk-abc123def456ghi789jkl012mno345pqr"'
      const redacted = scanner.redact(code)
      expect(redacted).not.toContain('sk-abc123def456ghi789jkl012mno345pqr')
      expect(redacted).toContain('[REDACTED:openai-api-key]')
    })

    it('preserves non-secret content', () => {
      const code = 'const name = "John"; const key = "sk-abc123def456ghi789jkl012mno345pqr"'
      const redacted = scanner.redact(code)
      expect(redacted).toContain('const name = "John"')
      expect(redacted).not.toContain('sk-abc123def456ghi789jkl012mno345pqr')
    })
  })
})
