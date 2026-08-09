import { DevDiffPlugin, PluginContext, AIResult } from "@eldrex/plugin-sdk";

export const CostTrackerPlugin: DevDiffPlugin = {
  id: "devdiff-plugin-cost-tracker",
  name: "LLM Token & Cost Tracker",
  version: "1.0.0",
  description:
    "Tracks cumulative token usage and estimates API costs across local/cloud AI calls.",
  author: {
    name: "DevDiff Core Team",
    url: "https://github.com/EldrexDelosReyesBula/DevDiff",
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
