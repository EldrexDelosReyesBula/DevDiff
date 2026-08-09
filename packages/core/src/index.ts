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

// Project Context System
export {
  ProjectContextScanner,
  formatContext,
  loadContext,
  injectContextIntoPrompt,
  generateContextFile,
  validateContextFile,
} from "./context";
export type { ScannedContext, LoadedContext } from "./context";

// Accuracy Verification
export { verifyExplanation } from "./verification/accuracy-check";
export type {
  VerificationResult,
  VerificationIssue,
} from "./verification/accuracy-check";

// Trust & Reliability System
export { NetworkGuard } from "./security/network-guard";
export type {
  NetworkDecision,
  NetworkLogEntry,
} from "./security/network-guard";
export { MVPDetector, MVPStorage } from "./mvp";
export type { TemplateSummary, MVPEntry } from "./mvp";
export { IDEGuardian } from "./performance/ide-guardian";
export type { SystemHealth } from "./performance/ide-guardian";

// Platform Compatibility, AI Discovery, Deep Context & Security Guards
export { PlatformCompat } from "./platform/compatibility";
export type {
  PlatformInfo,
  PlatformCheckResult,
  PlatformIssue,
} from "./platform/compatibility";
export * from "./errors";
export * from "./errors/handler";
export { OllamaModelDiscovery } from "./ai/providers/ollama-discovery";
export type { OllamaModel } from "./ai/providers/ollama-discovery";
export { DeepContextIndexer } from "./context/deep-indexer";
export type { DeepContext } from "./context/deep-indexer";
export { AccuracyGuard } from "./verification/pre-generation-check";
export type {
  PreCheckResult,
  PostCheckResult,
} from "./verification/pre-generation-check";
export { InjectionGuard } from "./security/injection-guard";

// Diff & Relationship Engine V2
export { ASTFingerprintExtractor } from "./diff/similarity/ast-fingerprint";
export type { ASTFingerprint } from "./diff/similarity/ast-fingerprint";
export { FilePairPrefilter } from "./diff/prefilter";
export { GitNativeDetector } from "./git/native-detection";
export type {
  GitFileChange,
  GitNativeDiff,
  GitRename,
  GitCopy,
} from "./git/native-detection";
export { ImportResolver } from "./diff/import-resolver";
export { FileRelationshipDetectorV2 } from "./diff/relationship-detector-v2";
export type {
  FileChange,
  FileRelationship,
} from "./diff/relationship-detector-v2";

// v1.0.5 Agentic & Plugin Exports
export { PluginManager } from "./plugins/manager";
export { V105_IMPROVEMENTS } from "./performance/v105-improvements";
export { DEFAULT_AGENTIC_CONFIG } from "./agentic/auto-start";
export type { AgenticConfig } from "./agentic/auto-start";

// v1.0.5 Part 2 Supervisor & Optimization Exports
export { DependencyManager } from "./auto-install/dependency-manager";
export { HYPER_OPTIMIZATIONS } from "./performance/hyper-optimization";
export { HumanReviewSystem } from "./human-review/interrupt-handler";

// v1.0.5 Part 3 Enterprise & Fast Path Exports
export { FastPathOptimizer } from "./performance/fast-path";
export {
  ContextWindowManager,
  DEFAULT_CONTEXT_CONFIG,
} from "./context/window-manager";
export { TeamCollaboration } from "./collaboration/team-notes";

// v1.0.5 Timeout & Generation Failure Fixes
export {
  ChunkingEngine,
  reconstructDiffForFiles,
} from "./ai/chunking-strategy";
export type { ChunkStrategy, DiffChunk } from "./ai/chunking-strategy";
export { TemplateFallbackGenerator } from "./generators/changelog-fallback";
export { ProgressiveChunking } from "./ai/progressive-chunking";
export { InjectionGuardV2 } from "./security/injection-guard-v2";
export { RedactionEngineV2 } from "./security/redaction-engine-v2";

// v1.5.0 Persistent Codebase Memory & Continuous Chat Exports
export { PersistentMemory } from "./memory/persistent-memory";
export type {
  CodebaseSnapshot,
  EntityIndex,
  EntityInfo,
  ChangeRecord,
  ArchitectureGraph,
  DependencyMap,
  MemoryAnswer,
  ConversationTurn,
} from "./memory/persistent-memory";

// v1.5.0 SKILL.md, Low-End Performance, & Scheduling Exports
export { SkillManager, SkillCoverage } from "./skill/skill-manager";
export {
  LowEndOptimizer,
  DeviceProfile,
  PerformanceConfig,
} from "./performance/low-end-optimizer";
export {
  BackgroundScheduler,
  Schedule,
} from "./scheduler/background-scheduler";

// Automated Versioning & Release Exports
export {
  SemverDetector,
  VersionBump,
  VersionBumpReason,
  ParsedDiff,
  FileChangeInfo,
} from "./versioning/semver-detector";
export {
  ChangelogGenerator,
  ChangelogEntry,
} from "./versioning/changelog-generator";

// Developer Sovereignty & Natural Changelog Exports
export { CloudGuard } from "./ai/cloud-guard";
export { FlexibleIgnore } from "./config/flexible-ignore";
export {
  NaturalChangelogGenerator,
  ChangeItem,
  NaturalChangelogData,
} from "./generators/natural-changelog";
export { NATURAL_CHANGELOG_PROMPT } from "./ai/prompts/natural-prompt";
// Universal Language & Project Detection Exports
export {
  UniversalProjectDetector,
  ProjectDetection,
  LanguageCount,
} from "./detection/universal-detector";

// Conversational Q&A Engine Exports
export {
  ConversationalQA,
  ConversationContext,
  QAAnswer,
  QATurn,
} from "./qa/conversational-qa";

// Onboarding & Zero-Friction AI Detection Exports
export { AIDetector } from "./onboarding/ai-detector";
export type {
  AIDetectionResult,
  AIPath,
  Action as AIAction,
} from "./onboarding/ai-detector";

// Plugin Ecosystem Security Scanner Exports
export { PluginSecurityScanner } from "./plugins/security-scanner";
export type {
  PluginScanResult,
  SecurityFinding,
  SecurityWarning,
  PluginRecommendation,
} from "./plugins/security-scanner";

// Study Buddy Mode Exports
export { StudyEngine } from "./study/study-engine";
export type {
  LearningPath,
  LearningStep,
  CodebaseTour,
  CodebaseTourSection,
  StudyQuiz,
  QuizQuestion,
} from "./study/study-engine";
