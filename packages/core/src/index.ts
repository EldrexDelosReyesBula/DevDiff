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

// DevDiff v1.7.0 Overhaul Exports
export { MermaidEngineV2 } from "./outputs/mermaid/engine-v2";
export type { MermaidResult, DiagramType } from "./outputs/mermaid/engine-v2";
export { ContextAwareExplainer } from "./explain/context-aware-explainer";
export type { CodeExplanation, CodeReferences } from "./explain/context-aware-explainer";
export { SecurityAuditEngineV2 } from "./security/audit-engine-v2";
export type { SecurityAuditResult, AuditOptions, SecurityFinding as SecurityAuditFinding } from "./security/audit-engine-v2";

// DevDiff v1.7.0 Progressive Intelligence & Architecture Awareness Exports
export { ProgressiveExplainer } from "./explain/progressive-explainer";
export type { ProgressiveExplanation, ExplanationLevel, ExplanationSection } from "./explain/progressive-explainer";
export { DependencyMapper } from "./explain/dependency-mapper";
export type { DependencyDiagram, DependencyNode } from "./explain/dependency-mapper";
export { OnboardingGenerator } from "./onboarding/onboarding-generator";
export type { OnboardingGuide, Section as OnboardingSection, CodebaseIndex } from "./onboarding/onboarding-generator";

// DevDiff v1.7.0 Agentic Platform Exports
export { PackageDiscovery } from "./agentic/package-manifest";
export type { AgenticPackageManifest } from "./agentic/package-manifest";

// DevDiff v1.7.0 Output Quality & Generation Reliability Exports
export { CompletenessValidator } from "./output/completeness-validator";
export type { ValidationResult } from "./output/completeness-validator";
export { OptimizedPrompts, TOKEN_BUDGETS } from "./ai/prompts/optimized-prompts";
export { OutputQualityGate } from "./output/quality-gate";
export type { QualityGateOptions, QualityGateResult } from "./output/quality-gate";
export { NeverPushIncomplete, IncompleteOutputError } from "./git/never-push-incomplete";

// DevDiff v1.7.0 SKILL.md Universal Agent Standard Exports
export { SkillLoader } from "./skill/skill-loader";
export type {
  SkillDocument,
  SkillSection,
  SkillSubsection,
  ChangelogPreferences,
  ArchitectureInfo,
  AgentPermissions,
} from "./skill/skill-loader";

// DevDiff v1.7.0 Context, SKILL.md & Memory Unification Exports
export { UnifiedContext } from "./context/unified-context";
export type { UnifiedKnowledge, ProjectKnowledge } from "./context/unified-context";
export { ContextMemorySync } from "./memory/context-sync";
export type { SyncResult, SyncChange } from "./memory/context-sync";
export { HallucinationGuard } from "./verify/hallucination-guard";
export type {
  VerificationResult as HallucinationVerificationResult,
  VerificationIssue as HallucinationVerificationIssue,
} from "./verify/hallucination-guard";

// DevDiff v1.7.0 Memory Control & Timeline Management Exports
export { MemoryManager, MemoryConfig } from "./memory/memory-manager";
export type {
  DeleteResult,
  UseRangeResult,
  CategorySummary,
  SnapshotSummary,
  OptimizeResult,
} from "./memory/memory-manager";
export { TimeAwareGenerator } from "./generators/time-aware-generator";
export type { TimeReference } from "./generators/time-aware-generator";

// DevDiff v1.7.0 Trust & Transparency Platform Exports
export { NetworkGuardV2, NetworkConfig } from "./security/network-guard-v2";
export type { ConnectionDecision, NetworkLogEntry as NetworkLogEntryV2, NetworkConfigData } from "./security/network-guard-v2";
export { PluginAuditor, DisclosureReport } from "./security/disclosure-engine";
export type { PluginAuditResult, DisclosureReportData } from "./security/disclosure-engine";

// DevDiff v1.7.0 Supply Chain & Plugin Security Exports
export { DependencyScanner } from "./plugins/dependency-scanner";
export type {
  DependencyScanResult,
  DependencyFinding,
  DependencyWarning,
  DependencyGraph,
  DependencyInfo,
} from "./plugins/dependency-scanner";
export { ObfuscationDetector } from "./plugins/obfuscation-detector";
export type {
  ObfuscationAnalysis,
  ObfuscationIndicator,
} from "./plugins/obfuscation-detector";
export { PermissionReviewer } from "./plugins/permission-reviewer";
export type {
  PermissionReview,
  RequestedPermission,
} from "./plugins/permission-reviewer";

// DevDiff v1.7.0 Dynamic Security Engine Exports
export { BehavioralEngine } from "./security/dynamic/behavioral-engine";
export type {
  BehavioralProfile,
  ActivitySnapshot,
  BehaviorAnomaly,
  AnomalyReport,
  NetworkBaseline,
  FilesystemBaseline,
  AIBaseline,
  PluginBaseline,
  DevelopmentBaseline,
} from "./security/dynamic/behavioral-engine";
export { AdaptiveRuleEngine } from "./security/dynamic/adaptive-rules";
export type {
  AdaptiveRule,
  ThreatIntel,
  SecurityContext,
  AdaptiveEvaluation,
  RuleUpdateResult,
  RuleEffectiveness,
} from "./security/dynamic/adaptive-rules";

// DevDiff v1.7.0 Universal AI Prompt Export & Import Engine Exports
export { PromptGenerator } from "./prompt-export/prompt-generator";
export type {
  GeneratedPrompt,
  PromptSection,
  ImportInstructions,
} from "./prompt-export/prompt-generator";
export { ImportEngine } from "./prompt-export/import-engine";
export type { ImportResult } from "./prompt-export/import-engine";

// DevDiff v1.7.0 Agent Orchestration & OpenClaw Integration Platform Exports
export { AgentRegistry } from "./agents/universal-registry";
export type {
  RegisteredAgent,
  AgentTask,
  AgentTaskResult,
  SwarmResult,
  ConsensusResult,
  AgentDirectory,
} from "./agents/universal-registry";
export { OpenClawSupervisorV2 } from "./agents/openclaw-supervisor";
export type {
  SupervisorConfig,
  TaskDecomposition,
} from "./agents/openclaw-supervisor";













