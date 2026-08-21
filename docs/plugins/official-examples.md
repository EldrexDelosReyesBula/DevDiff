# Official Plugin Examples

DevDiff provides production-ready plugin reference implementations built on `@eldrex/plugin-sdk`. These examples demonstrate real-world lifecycle hooks, storage, diff scanning, and event dispatching.

To quickly scaffold your own custom plugin, use the [DevDiff Plugin Template Repository](https://github.com/EldrexDelosReyesBula/devdiff-template-plugin).

---

## 1. 📢 Slack Notifier Plugin

Dispatches formatted DevDiff changelog updates and AI usage metrics directly to a Slack webhook.

```typescript
import {
  DevDiffPlugin,
  PluginContext,
  ChangelogResult,
  AIResult,
} from "@eldrex/plugin-sdk";

export const SlackNotifierPlugin: DevDiffPlugin = {
  id: "devdiff-plugin-slack",
  name: "Slack Changelog Notifier",
  version: "1.0.0",
  description:
    "Dispatches automated DevDiff changelog updates and AI usage to Slack channels.",
  author: {
    name: "DevDiff Core Team",
    url: "https://github.com/EldrexDelosReyesBula/devdiff",
  },
  devdiffVersion: ">=1.5.0",

  async activate(context: PluginContext) {
    context.logger.info("Slack Notifier Plugin activated successfully.");
  },

  hooks: {
    async afterAnalysis(changelog: ChangelogResult) {
      const text = `🚀 *DevDiff Changelog Generated*\n*Impact Level:* ${changelog.impact.toUpperCase()}\n\n*Summary:* ${changelog.summary}\n\n*Files Changed:* ${changelog.files.length}`;
      console.log(`[Slack Plugin] Dispatching payload to Slack Webhook...`);
      return changelog;
    },

    async onAIComplete(result: AIResult) {
      console.log(
        `[Slack Plugin] AI Completion logged: ${result.model} used ${result.tokensUsed || 0} tokens.`,
      );
    },
  },
};

export default SlackNotifierPlugin;
```

---

## 2. 🎫 Jira Issue Auto-Linker Plugin

Scans staged diffs to detect Jira issue keys (e.g. `PROJ-123`, `ENG-404`) and links them directly to changelog metadata.

```typescript
import { DevDiffPlugin, PluginContext, ParsedDiff } from "@eldrex/plugin-sdk";

export const JiraLinkerPlugin: DevDiffPlugin = {
  id: "devdiff-plugin-jira",
  name: "Jira Issue Auto-Linker",
  version: "1.0.0",
  description:
    "Extracts Jira issue keys (e.g. PROJ-123) from diffs and links them to DevDiff metadata.",
  author: {
    name: "DevDiff Core Team",
    url: "https://github.com/EldrexDelosReyesBula/devdiff",
  },
  devdiffVersion: ">=1.5.0",

  async activate(context: PluginContext) {
    context.logger.info("Jira Linker Plugin activated.");
  },

  hooks: {
    async beforeAnalysis(diff: ParsedDiff) {
      const jiraRegex = /[A-Z]{2,10}-\d+/g;
      const issuesFound = new Set<string>();

      for (const file of diff.files) {
        if (file.content) {
          const matches = file.content.match(jiraRegex);
          if (matches) {
            matches.forEach((issue) => issuesFound.add(issue));
          }
        }
      }

      if (issuesFound.size > 0) {
        console.log(
          `[Jira Plugin] Detected ${issuesFound.size} Jira issues: ${Array.from(issuesFound).join(", ")}`,
        );
      }
      return diff;
    },
  },
};

export default JiraLinkerPlugin;
```

---

## 3. 💰 LLM Token & Cost Tracker Plugin

Tracks cumulative LLM token consumption across local and cloud AI models and records metrics to persistent plugin storage.

```typescript
import { DevDiffPlugin, PluginContext, AIResult } from "@eldrex/plugin-sdk";

export const CostTrackerPlugin: DevDiffPlugin = {
  id: "devdiff-plugin-cost-tracker",
  name: "LLM Token & Cost Tracker",
  version: "1.0.0",
  description:
    "Tracks cumulative token usage and estimates API costs across local/cloud AI calls.",
  author: {
    name: "DevDiff Core Team",
    url: "https://github.com/EldrexDelosReyesBula/devdiff",
  },
  devdiffVersion: ">=1.5.0",

  async activate(context: PluginContext) {
    const totalTokens = (await context.storage.get("total_tokens")) || 0;
    context.logger.info(
      `Cost Tracker active. Historical tokens used: ${totalTokens}`,
    );
  },

  hooks: {
    async onAIComplete(result: AIResult) {
      const tokens = result.tokensUsed || 0;
      console.log(
        `[Cost Tracker] Model ${result.model} consumed ${tokens} tokens.`,
      );
    },
  },
};

export default CostTrackerPlugin;
```

---

## 4. 🛡️ Security Gate Enforcer Plugin

Inspects incoming diffs for high-risk security violations (such as unencrypted RSA/PEM private keys) and halts processing before any payloads reach an LLM.

```typescript
import { DevDiffPlugin, PluginContext, ParsedDiff } from "@eldrex/plugin-sdk";

export const SecurityGatePlugin: DevDiffPlugin = {
  id: "devdiff-plugin-security-gate",
  name: "Security Gate Enforcer",
  version: "1.0.0",
  description:
    "Enforces strict security checks on diffs to prevent unencrypted keys or dangerous imports.",
  author: {
    name: "DevDiff Core Team",
    url: "https://github.com/EldrexDelosReyesBula/devdiff",
  },
  devdiffVersion: ">=1.5.0",

  async activate(context: PluginContext) {
    context.logger.info("Security Gate Plugin initialized.");
  },

  hooks: {
    async beforeAnalysis(diff: ParsedDiff) {
      const privateKeyRegex = /-----BEGIN PRIVATE KEY-----/;
      for (const file of diff.files) {
        if (file.content && privateKeyRegex.test(file.content)) {
          throw new Error(
            `[Security Gate] Blocked diff containing unencrypted Private Key in ${file.newPath}`,
          );
        }
      }
      return diff;
    },
  },
};

export default SecurityGatePlugin;
```
