# devdiff (VS Code Extension)

## 1.6.0

### Major Changes

- **Native Virtual Editor Getting Started Guide**: `devdiff://onboarding/DEVDIFF_GETTING_STARTED.md` opens automatically as a Virtual Markdown tab in the editor on first extension activation with dynamic AI status guidance.
- **Study Buddy Triggers**: Registered `devdiff.study.start` and `devdiff.study.explain` command palette triggers.
- **Zero-Friction Onboarding Banners**: Integrates `AIDetector` to show targeted VS Code notifications with zero-click & 1-click action triggers (`Generate First Changelog`, `Install Ollama`, `Configure Cloud AI`).
- **4-Panel Sidebar Architecture**:
  1. **Changelog Explorer** (`devdiff-changelog`): Staged diff summaries & Mermaid diagrams.
  2. **Q&A Chat Panel** (`devdiff-chat`): Natural language codebase Q&A.
  3. **Security & Compliance Panel** (`devdiff-security`): One-click regulatory vulnerability scanning.
  4. **Settings & Personas Panel** (`devdiff-settings`): Configures model, persona, redaction, and memory caps.
- **`@devdiff` Native VS Code Chat Participant**: Registered as a first-class participant (`devdiff.chat`) in VS Code Chat view.
- **IDEGuardian Worker Isolation**: Worker thread execution protecting VS Code extension host from AI process crashes.
- **3 New Settings**: `devdiff.model`, `devdiff.memoryCapMb`, `devdiff.idleDetectionSeconds`.
- **Created `.vscodeignore`**: Strips source files, test suites, and dev configs from `.vsix` bundle.
- **Fixed Extension Category**: Changed from `["Other", "Formatters"]` to `["AI", "Other"]`.

### Patch Changes

- Removed redundant `onView:*` activation events to fix extension host warnings.
- Fixed optional `threshold?: string` parameter type in security scan calls.

---

## 1.0.4

### Patch Changes

- Release v1.0.4 - Unified Design System, dynamic Ollama model detection, security guards, and contact address updates.
