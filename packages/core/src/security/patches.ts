export const SECURITY_ADVISORIES = [
  {
    id: 'DEVVIFF-SEC-2026-001',
    severity: 'critical',
    title: 'Path traversal in custom webhook receiver',
    description: 'Malformed webhook paths could read files outside repository',
    fix: 'Path canonicalization and boundary enforcement on all file operations',
    cvss: 9.1,
    cwe: 'CWE-22',
    credit: 'Internal security audit'
  },
  {
    id: 'DEVVIFF-SEC-2026-002',
    severity: 'high',
    title: 'Prompt injection via crafted git commit messages',
    description: 'Commit messages containing LLM injection sequences could manipulate AI output',
    fix: 'Input sanitization layer strips injection patterns before AI processing',
    cvss: 7.2,
    cwe: 'CWE-77',
    credit: 'Community report via security@devdiff.dev'
  },
  {
    id: 'DEVVIFF-SEC-2026-003',
    severity: 'high',
    title: 'WebSocket gateway exposed without authentication by default',
    description: 'WS endpoint accepted unauthenticated connections in default config',
    fix: 'WS requires token authentication; anonymous mode opt-in only',
    cvss: 6.8,
    cwe: 'CWE-306',
    credit: 'Internal review'
  },
  {
    id: 'DEVVIFF-SEC-2026-004',
    severity: 'medium',
    title: 'Secret leakage in Mermaid diagram labels',
    description: 'Environment variable values could appear in diagram node labels',
    fix: 'Mermaid sanitizer applies secret redaction before label generation',
    cvss: 5.5,
    cwe: 'CWE-200',
    credit: 'Automated secret scanning'
  },
  {
    id: 'DEVVIFF-SEC-2026-005',
    severity: 'medium',
    title: 'Audit log stored without encryption at rest',
    description: 'AI call audit logs contain sensitive file paths in plaintext',
    fix: 'Audit logs encrypted using AES-256-GCM with PBKDF2 key derivation',
    cvss: 4.2,
    cwe: 'CWE-312',
    credit: 'Privacy review'
  },
  {
    id: 'DEVVIFF-SEC-2026-006',
    severity: 'medium',
    title: 'Race condition in checkpoint file writes',
    description: 'Simultaneous checkpoint saves could corrupt snapshot files',
    fix: 'File locking with atomic write operations',
    cvss: 5.0,
    cwe: 'CWE-362',
    credit: 'Stress testing'
  },
  {
    id: 'DEVVIFF-SEC-2026-007',
    severity: 'low',
    title: 'Information disclosure in error messages',
    description: 'Stack traces could reveal internal file paths in API responses',
    fix: 'Production error handler sanitizes all outputs',
    cvss: 2.5,
    cwe: 'CWE-209',
    credit: 'Penetration testing'
  }
];
