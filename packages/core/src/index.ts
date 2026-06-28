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
