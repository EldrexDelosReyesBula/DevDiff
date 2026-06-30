export {
  generateChangelog,
  GenerateOptions,
  GenerateResult,
} from "./generators/changelog";
export { formatMarkdown } from "./generators/markdown";
export { formatJSON } from "./generators/json";
export { formatHTML } from "./generators/html";
export {
  diffParser,
  ParseResult,
  ParsedFileDiff,
  DiffHunk,
  DiffLine,
} from "./diff/parser";
export { trimAST } from "./diff/ast-trimmer";
export { redactSecrets, scanForSecrets } from "./diff/secret-scanner";
export { loadConfig } from "./config/loader";
export { DevDiffConfig, Provider, Routing } from "./config/schema";
export { DEFAULTS } from "./config/defaults";
export { AIRouter } from "./ai/router";
export { ExplanationCache } from "./ai/cache";
export {
  AIExplanationResult,
  AIProvider,
  SYSTEM_PROMPT,
} from "./ai/providers/base";
export { SECURITY_ADVISORIES } from "./security/patches";
export { PrivacyEnforcer, PrivacyDecision } from "./privacy/enforcement";
export {
  COMPLIANCE_FRAMEWORKS,
  applyCompliance,
  deepMerge,
} from "./compliance/frameworks";
export { WebGPUProvider } from "./ai/providers/webgpu-provider";
export {
  LocalInferenceChain,
  WASMProvider,
  NativeCPUProvider,
} from "./ai/providers/fallback-chain";
export {
  MultiAgentOrchestrator,
  Agent,
  AgentAnalysis,
  AgentDiscussion,
  AgentMessage,
  CollaborativeAnalysis,
  Consensus,
} from "./agents/orchestrator";
export {
  VibeCoderGuardian,
  Checkpoint,
  VibeSession,
  RecoveryResult,
  VibeSessionReport,
} from "./resilience/vibe-coder-guardian";
export { SecurityAudit, AuditEntry } from "./security/security-audit";
export {
  ShellSandbox,
  ShellAccessDeniedError,
  SHELL_ACCESS_CONFIG,
} from "./security/shell-sandbox";
export { NETWORK_ACCESS } from "./security/network-disclosure";
export { DevDiffEngine } from "./engine";
export { PromptSanitizer, SanitizationResult } from "./security/sanitization";
export { SecretScanner } from "./diff/secret-scanner";
export { VERSION_GUARANTEE } from "./version/guarantee";
export {
  checkConfigCompatibility,
  CompatibilityResult,
} from "./version/compatibility";
export {
  getGitInfo,
  getDiffStats,
  getTotalFiles,
  checkAIStatus,
} from "./playground/workspace-info";
