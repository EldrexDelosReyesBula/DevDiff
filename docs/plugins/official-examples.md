# Official Working Plugin Examples

DevDiff includes **4 production-ready, fully working plugin implementations** in the repository under `examples/plugins/`. Each example demonstrates real-world hooks, storage, logging, and error handling using `@eldrex/plugin-sdk`.

---

## 1. 📢 Slack Notifier Plugin
- **Source Location**: `examples/plugins/slack-notifier/index.ts`
- **Hooks Used**: `afterAnalysis`, `onAIComplete`
- **Description**: Formats DevDiff changelog summaries into rich Slack block payloads and dispatches webhooks to configured team channels.

---

## 2. 🎫 Jira Issue Auto-Linker Plugin
- **Source Location**: `examples/plugins/jira-linker/index.ts`
- **Hooks Used**: `beforeAnalysis`
- **Description**: Scans staged diffs using regex (`/[A-Z]{2,10}-\d+/g`) to extract Jira issue keys (e.g. `PROJ-123`) and links them directly to the DevDiff changelog metadata.

---

## 3. 💰 LLM Token & Cost Tracker Plugin
- **Source Location**: `examples/plugins/cost-tracker/index.ts`
- **Hooks Used**: `onAIComplete`
- **Description**: Tracks cumulative LLM token consumption across local (Ollama/WebGPU) and cloud (OpenAI/Anthropic/Gemini) model runs, saving metrics to `context.storage`.

---

## 4. 🛡️ Security Gate Enforcer Plugin
- **Source Location**: `examples/plugins/security-gate/index.ts`
- **Hooks Used**: `beforeAnalysis`
- **Description**: Inspects incoming diffs for high-risk pattern violations (such as unencrypted RSA/PEM private keys) and blocks the analysis before sending payloads to LLMs.
