// DevDiff Configuration
// Automatically updated by DevDiff compliance command

export default {
  ai: {
    providers: [
      {
        name: "local-ollama",
        url: "ollama://llama3.2:3b",
        priority: 1,
      },
    ],
    routing: {
      strategy: "priority",
      complexityThreshold: 0.6,
      localOnly: true,
    },
  },
  exclude: [
    "node_modules/**",
    "dist/**",
    "build/**",
    "out/**",
    ".next/**",
    ".nuxt/**",
    "pnpm-lock.yaml",
    "package-lock.json",
    "yarn.lock",
    "*.log",
    ".git/**",
    ".devdiff/**",
  ],
  cache: {
    enabled: true,
    path: ".devdiff/cache.json",
  },
  format: "markdown",
  privacy: {
    encryptionAtRest: "AES-256-GCM",
    encryptionInTransit: "TLS 1.3",
    accessControl: "rbac",
    auditTrailImmutable: true,
    phiDetection: true,
    autoRedactPHI: true,
  },
};
