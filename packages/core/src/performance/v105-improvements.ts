/**
 * v1.0.5 Performance & Stability Improvements
 */

export const V105_IMPROVEMENTS = {
  // ── Memory ──
  memory: {
    diffStreaming: true, // Stream diffs instead of loading all at once
    lazyContextLoading: true, // Load project context only when needed
    checkpointCompression: true, // gzip checkpoints (60% size reduction)
    maxMemoryLimit: "256MB", // Reduced from 500MB
    gcOptimization: true, // Explicit GC hints for large repos
  },

  // ── Speed ──
  speed: {
    parallelAnalysis: true, // Multi-agent analysis in parallel
    incrementalDiffing: true, // Only re-analyze changed portions
    cacheWarming: true, // Pre-warm cache on IDE open
    astCaching: true, // Cache AST fingerprints
    gitNativeOptimization: true, // Use git's native rename detection
  },

  // ── Stability ──
  stability: {
    gracefulDegradation: true, // Template fallback when AI unavailable
    retryWithBackoff: true, // Exponential backoff on transient failures
    circuitBreaker: true, // Stop calling failing AI after 5 failures
    healthCheckInterval: "30s", // Regular health checks
    watchdogTimer: true, // Kill stuck processes after 5 minutes
  },

  // ── Security ──
  security: {
    hardenedNetworkGuard: true, // Block all known telemetry domains
    inputSanitizationV2: true, // Improved injection detection
    modelVerification: true, // Verify Ollama model checksums
    auditEncryption: "AES-256-GCM", // All audit logs encrypted
    secureDefaults: true, // All ports localhost-only by default
  },
};
