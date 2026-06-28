import { DevDiffConfig } from "../config/schema";

export const COMPLIANCE_FRAMEWORKS: Record<string, { name: string; jurisdiction: string; autoConfig: any }> = {
  gdpr: {
    name: 'GDPR',
    jurisdiction: 'European Union + EEA',
    autoConfig: {
      privacy: {
        auditLogRetention: 30,
        autoDeleteAuditLogs: true,
        dataMinimization: 'strict',
        generateDPIAReport: true,
      },
      ai: {
        cloudProviders: 'blocked',
        allowedCloudRegions: [],
      }
    }
  },
  
  ccpa: {
    name: 'CCPA/CPRA',
    jurisdiction: 'California, USA',
    autoConfig: {
      privacy: {
        optOutMechanism: true,
        dataInventoryEnabled: true,
        thirdPartyDisclosure: true,
      }
    }
  },
  
  hipaa: {
    name: 'HIPAA',
    jurisdiction: 'United States (Healthcare)',
    autoConfig: {
      privacy: {
        encryptionAtRest: 'AES-256-GCM',
        encryptionInTransit: 'TLS 1.3',
        accessControl: 'rbac',
        auditTrailImmutable: true,
        phiDetection: true,
        autoRedactPHI: true,
      }
    }
  },
  
  soc2: {
    name: 'SOC 2 Type II',
    jurisdiction: 'Global (Service Organizations)',
    autoConfig: {
      monitoring: {
        healthCheck: true,
        metricsExport: true,
        alertingEnabled: true,
        uptimeTracking: true,
      }
    }
  },
  
  fedramp: {
    name: 'FedRAMP',
    jurisdiction: 'United States (Federal)',
    autoConfig: {
      security: {
        fipsMode: true,
        fipsValidatedCrypto: true,
        continuousMonitoring: true,
        networkBoundary: 'strict',
        allowedPorts: [3737],
      }
    }
  },
  
  iso27001: {
    name: 'ISO/IEC 27001',
    jurisdiction: 'Global',
    autoConfig: {
      security: {
        riskAssessmentEnabled: true,
        incidentResponsePlan: true,
        securityPolicyDocumented: true,
      }
    }
  },
  
  pipeda: {
    name: 'PIPEDA',
    jurisdiction: 'Canada',
    autoConfig: {
      privacy: {
        consentRequired: true,
        transparencyReport: true,
        safeguardsEnabled: true,
      }
    }
  },
  
  lgpd: {
    name: 'LGPD',
    jurisdiction: 'Brazil',
    autoConfig: {
      privacy: {
        legalBasisRequired: true,
        dataSubjectRightsEnabled: true,
        dpoContactConfigured: true,
      }
    }
  },
  
  pdpa: {
    name: 'PDPA',
    jurisdiction: 'Singapore',
    autoConfig: {
      privacy: {
        notificationEnabled: true,
        consentRequired: true,
        protectionMeasures: 'standard',
      }
    }
  },
  
  australia_privacy: {
    name: 'Australian Privacy Act 1988',
    jurisdiction: 'Australia',
    autoConfig: {
      privacy: {
        crossBorderDisclosure: 'blocked',
        securityMeasures: 'enhanced',
      }
    }
  }
};

export function deepMerge(target: any, source: any): any {
  if (!target) return source;
  if (!source) return target;
  
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (source[key] instanceof Object && !Array.isArray(source[key]) && key in target) {
      result[key] = deepMerge(target[key], source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}

export async function applyCompliance(frameworkId: string, config: DevDiffConfig): Promise<DevDiffConfig> {
  const framework = COMPLIANCE_FRAMEWORKS[frameworkId]
  if (!framework) throw new Error(`Unknown framework: ${frameworkId}`)
  
  console.log(`\n🔒 Applying ${framework.name} compliance (${framework.jurisdiction})`)
  
  const merged = deepMerge(config, framework.autoConfig)
  
  console.log('✅ Compliance applied')
  return merged;
}
