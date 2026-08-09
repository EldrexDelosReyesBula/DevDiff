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
    "autoStart": false,

    // Agent-First Q&A (v1.5.0)
    // DevDiff indexes the codebase ONCE. IDE agents query via MCP.
    // IDE agents use their own tokens — sub-500ms responses, no Ollama.
    "mcp": {
      "tools": [
        "devdiff_query_entity",
        "devdiff_query_changes",
        "devdiff_query_dependencies",
        "devdiff_query_architecture",
        "devdiff_query_search",
        "devdiff_query_compliance",
        "devdiff_query_stats",
        "devdiff_query_timeline"
      ],
      "rateLimit": {
        "maxQueriesPerMinute": 30,
        "maxQueriesPerHour": 200
      }
    },
    "allowedAgents": [
      "copilot",
      "gemini",
      "claude",
      "windsurf",
      "custom"
    ]
  },
  "memory": {
    "enabled": true,
    "autoIndex": true,
    "incrementalUpdates": true,
    "snapshotHistory": true
  },
  "privacy": {
    "auditLogRetention": 30,
    "autoDeleteAuditLogs": true,
    "dataMinimization": "strict",
    "generateDPIAReport": true
  }
};
