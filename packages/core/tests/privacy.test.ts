import { describe, it, expect } from 'vitest'
import { PrivacyEnforcer } from '../src/privacy/enforcement'

describe('PrivacyEnforcer', () => {
  const enforcer = new PrivacyEnforcer()

  describe('check()', () => {
    it('allows source code locally', () => {
      const result = enforcer.check('function hello() {}', 'local')
      expect(result.allowed).toBe(true)
    })

    it('blocks source code from cloud', () => {
      const result = enforcer.check('function hello() {}', 'cloud')
      expect(result.allowed).toBe(false)
      expect(result.reason).toContain('cannot be sent to cloud')
    })

    it('blocks API keys everywhere', () => {
      const result = enforcer.check('sk-abc123def456', 'local')
      expect(result.allowed).toBe(false)
    })

    it('blocks private keys everywhere', () => {
      const result = enforcer.check('-----BEGIN RSA PRIVATE KEY-----', 'local')
      expect(result.allowed).toBe(false)
    })

    it('allows commit messages to cloud', () => {
      const result = enforcer.check('fix: update dependencies', 'cloud')
      expect(result.allowed).toBe(true)
    })

    it('blocks environment variables', () => {
      const result = enforcer.check('DATABASE_URL=postgres://...', 'local')
      expect(result.allowed).toBe(false)
    })

    it('classifies user emails correctly', () => {
      const result = enforcer.check('user@company.com', 'local')
      expect(result.classification).toBe('user-emails')
    })
  })
})
