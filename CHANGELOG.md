# Changelog

All notable changes to the DevDiff project will be documented in this file.

---

## [1.0.2] - 2026-06-28 (Sentinel Release)

The **Sentinel** release represents a major evolutionary step for DevDiff, introducing enterprise-grade security hardening, robust local model compliance frameworks, parallel multi-agent collaboration swarms, and hardware-accelerated local inference.

### 🔒 Security Patches & Privacy
- **CVE Fixes**: Added full security advisories registry covering malformed webhook path traversals (CVSS 9.1) and Git commit message prompt injection filters.
- **Privacy Enforcement**: Added a regex-based `PrivacyEnforcer` engine that automatically flags and blocks sensitive API keys, credentials, environments, and private key structures.
- **Local-First Protection**: Fully separates local execution lanes from cloud routing destinations.

### 🌍 Compliance Frameworks
- **Framework Engines**: Added built-in configurations and automated setup support for 10 compliance standards: GDPR, CCPA, HIPAA, SOC 2, FedRAMP, ISO 27001, PIPEDA, LGPD, PDPA, and Australia Privacy Act.
- **CLI Commands**: Introduced `npx devdiff compliance` commands (`list`, `apply`, `status`, `validate`, `report`) to generate compliance audit reports.

### ⚡ Local Inference & WebGPU
- **WebGPU Provider**: Added an accelerated local AI provider leveraging ONNX Runtime Web for local GPU inference.
- **Fallback Chain**: Implemented a resilient fallback chain (WebGPU -> WebAssembly -> CPU -> Ollama) to guarantee continuous offline availability.

### 🤖 Multi-Agent swarms
- **Collaborative Swarms**: Added `MultiAgentOrchestrator` to coordinate specialized agents (Architect, Security, Performance, and Documentation) for consensus-based change analysis.

### 🛡️ Vibe-Coder Guardian Resilience
- **Pre-AI Checkpoints**: Implemented temporary file state snapshots before calling external AIs.
- **Automatic Recovery**: Re-routes requests to fallback models when primary endpoints experience outages.
- **CLI Subcommand**: Added `npx devdiff recover` for manual rollbacks.

### 🎭 Extensibility & VS Code Extension
- **Personas**: Added 8 built-in personas (e.g. Explainer, Tech Writer, Senior Dev, Security Auditor) to customize explanation tones.
- **VSIX Bundle**: Upgraded the VS Code extension to `1.0.2` with full support for local PNG icon assets, offline setup guides, and detailed user documentation.
