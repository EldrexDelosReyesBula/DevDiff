export interface PrivacyDecision {
  allowed: boolean;
  reason?: string;
  requiresUserConsent?: boolean;
  classification?: string;
}

export class PrivacyEnforcer {
  
  private readonly DATA_CLASSIFICATIONS: Record<string, { allowLocal: boolean; allowCloud: boolean; requireEncryption: boolean }> = {
    'source-code':       { allowLocal: true,  allowCloud: false, requireEncryption: false },
    'file-paths':        { allowLocal: true,  allowCloud: false, requireEncryption: true  },
    'commit-messages':   { allowLocal: true,  allowCloud: true,  requireEncryption: false },
    'diff-content':      { allowLocal: true,  allowCloud: false, requireEncryption: false },
    'dependency-names':  { allowLocal: true,  allowCloud: true,  requireEncryption: false },
    'dependency-versions': { allowLocal: true,allowCloud: true,  requireEncryption: false },
    'environment-vars':  { allowLocal: false, allowCloud: false, requireEncryption: true  },
    'api-keys':          { allowLocal: false, allowCloud: false, requireEncryption: true  },
    'secrets':           { allowLocal: false, allowCloud: false, requireEncryption: true  },
    'user-emails':       { allowLocal: true,  allowCloud: false, requireEncryption: true  },
    'hostnames':         { allowLocal: true,  allowCloud: false, requireEncryption: true  },
    'ip-addresses':      { allowLocal: true,  allowCloud: false, requireEncryption: true  },
  }
  
  check(data: any, destination: 'local' | 'cloud'): PrivacyDecision {
    const classification = this.classify(data)
    const rules = this.DATA_CLASSIFICATIONS[classification]
    
    if (!rules) {
      return {
        allowed: false,
        reason: `Unknown data classification: ${classification}. Blocked by default.`,
        requiresUserConsent: true,
        classification
      }
    }
    
    if (destination === 'local' && !rules.allowLocal) {
      return {
        allowed: false,
        reason: `${classification} cannot be processed locally.`,
        requiresUserConsent: false,
        classification
      }
    }
    
    if (destination === 'cloud' && !rules.allowCloud) {
      return {
        allowed: false,
        reason: `${classification} cannot be sent to cloud. Use local AI only.`,
        requiresUserConsent: false,
        classification
      }
    }
    
    return { allowed: true, classification }
  }
  
  private classify(data: any): string {
    const str = typeof data === 'string' ? data : JSON.stringify(data)
    if (/sk-[a-zA-Z0-9]{32,}/.test(str)) return 'api-keys'
    if (/-----BEGIN.*PRIVATE KEY-----/.test(str)) return 'secrets'
    if (/(?:password|secret|token|key)\s*[:=]\s*['"][^'"]+['"]/.test(str)) return 'secrets'
    if (/^[A-Z_]+=/.test(str)) return 'environment-vars'
    if (/^(?:\/|[A-Z]:\\|~\/)/.test(str)) return 'file-paths'
    if (/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(str)) return 'user-emails'
    return 'source-code'
  }
}
