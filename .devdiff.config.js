// DevDiff Configuration
// Automatically updated by DevDiff compliance command

export default {
  "ai": {
    "providers": [
      {
        "name": "local-ollama",
        "url": "ollama://llama3.2:3b",
        "priority": 1
      }
    ],
    "routing": {
      "strategy": "priority",
      "complexityThreshold": 0.6,
      "localOnly": false
    },
    "cloudProviders": "blocked",
    "allowedCloudRegions": []
  },
  "exclude": [
    "node_modules/**",
    "dist/**",
    "package-lock.json",
    "pnpm-lock.yaml",
    "yarn.lock"
  ],
  "cache": {
    "enabled": true,
    "path": ".devdiff/cache.json"
  },
  "format": "markdown",
  "agentic": {
    "enabled": true,
    "autoStart": false
  },
  "privacy": {
    "auditLogRetention": 30,
    "autoDeleteAuditLogs": true,
    "dataMinimization": "strict",
    "generateDPIAReport": true
  }
};
