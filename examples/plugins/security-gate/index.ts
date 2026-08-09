import { DevDiffPlugin, PluginContext, ParsedDiff } from "@eldrex/plugin-sdk";

export const SecurityGatePlugin: DevDiffPlugin = {
  id: "devdiff-plugin-security-gate",
  name: "Security Gate Enforcer",
  version: "1.0.0",
  description: "Enforces strict security checks on diffs to prevent unencrypted keys or dangerous imports.",
  author: {
    name: "DevDiff Core Team",
    url: "https://github.com/EldrexDelosReyesBula/DevDiff",
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
          throw new Error(`[Security Gate] Blocked diff containing unencrypted Private Key in ${file.newPath}`);
        }
      }
      return diff;
    },
  },
};

export default SecurityGatePlugin;
