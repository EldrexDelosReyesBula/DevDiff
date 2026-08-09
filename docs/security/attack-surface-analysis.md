# Attack Surface & Threat Matrix

DevDiff is designed as a **local-first developer security tool**. Because developer tools operate directly on engineer workstations with access to source code and environment credentials, minimizing the software attack surface is a primary design goal.

---

## 🔍 Threat Profile & Mitigation Matrix

```mermaid
quadrantChart
    title DevDiff Risk vs. Mitigation Matrix
    x-axis Low Exploitability --> High Exploitability
    y-axis Low Impact --> High Impact
    quadrant-1 High Risk (Mitigated)
    quadrant-2 Critical Focus
    quadrant-3 Low Risk
    quadrant-4 Low Impact
    "Path Traversal": [0.2, 0.8]
    "Command Injection": [0.15, 0.9]
    "Network Interception": [0.1, 0.7]
    "Prompt Injection": [0.35, 0.5]
    "XSS in Webview": [0.25, 0.4]
```

---

## 🛡️ Attack Surfaces & Defensive Mitigations

### 1. File System Access Surface
- **Threat Vector**: Malicious workspace configuration files (`.devdiff/config.json` or `.cursorrules`) referencing system files outside the repository.
- **Impact**: Unauthorized reading of SSH keys, cloud credentials, or sensitive files (`/etc/passwd`, `~/.aws/credentials`).
- **Mitigation**: `InjectionGuardV2.validateFilePath` enforces strict path normalization and workspace boundary checks.

### 2. Process Execution & Subprocess Surface
- **Threat Vector**: Malicious branch names, git tag names, or file names containing shell commands executed via git subcommands.
- **Impact**: Arbitrary command execution with developer privileges.
- **Mitigation**: Subprocesses are spawned directly without shell context (`shell: false`), bypassing shell syntax parsing.

### 3. Local Webview & IPC Surface
- **Threat Vector**: VS Code webview panel receiving untrusted Markdown changelogs or Mermaid diagrams.
- **Impact**: Cross-Site Scripting (XSS) or local IPC message spoofing.
- **Mitigation**: VS Code webview panels enforce strict Content Security Policy (`CSP`) headers allowing script execution only from nonced sources.

### 4. Local Gateway Network Binding Surface
- **Threat Vector**: External devices on the local local network (LAN) connecting to DevDiff HTTP/MCP ports (`3737`, `3740`).
- **Impact**: Unauthorized remote querying of codebase memory index.
- **Mitigation**: Network interfaces strictly bind to loopback (`127.0.0.1` / `::1`) by default. External network binding requires explicit CLI authorization (`--host 0.0.0.0`).

### 5. AI Provider Integration Surface
- **Threat Vector**: Unsanitized code diffs containing API keys or PII sent to third-party AI APIs.
- **Impact**: Credential leakage to cloud AI logs or model training sets.
- **Mitigation**: `RedactionEngineV2` redacts keys before payloads leave the workstation.

---

## 📊 Security Vulnerability Classification

| Threat Vector | CVSS v3 Base Score | Severity Rating | Mitigation Mechanism |
|---|---|---|---|
| Command Injection | 8.8 (High) | **CRITICAL** | Subprocess argument array passing (`shell: false`) |
| Out-of-Bound File Access | 7.5 (High) | **HIGH** | `validateFilePath` workspace jail |
| Network Eavesdropping | 7.4 (High) | **HIGH** | Loopback binding (`127.0.0.1`) |
| Secret Leakage | 7.2 (High) | **HIGH** | `RedactionEngineV2` automatic masking |
| Prompt Injection | 5.3 (Medium) | **MEDIUM** | `PromptSanitizer` Unicode Tag block stripping |
| Webview XSS | 4.7 (Medium) | **MEDIUM** | VS Code Webview CSP & HTML Sanitization |
