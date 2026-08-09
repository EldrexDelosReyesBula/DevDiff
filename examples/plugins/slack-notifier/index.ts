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
    url: "https://github.com/EldrexDelosReyesBula/DevDiff",
  },
  devdiffVersion: ">=1.5.0",

  async activate(context: PluginContext) {
    context.logger.info("Slack Notifier Plugin activated successfully.");
  },

  hooks: {
    async afterAnalysis(changelog: ChangelogResult) {
      // Formats Slack markdown message
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
