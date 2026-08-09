import { DevDiffPlugin, PluginContext, ParsedDiff } from "@eldrex/plugin-sdk";

export const JiraLinkerPlugin: DevDiffPlugin = {
  id: "devdiff-plugin-jira",
  name: "Jira Issue Auto-Linker",
  version: "1.0.0",
  description: "Extracts Jira issue keys (e.g. PROJ-123) from diffs and links them to DevDiff metadata.",
  author: {
    name: "DevDiff Core Team",
    url: "https://github.com/EldrexDelosReyesBula/DevDiff",
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
        console.log(`[Jira Plugin] Detected ${issuesFound.size} Jira issues: ${Array.from(issuesFound).join(", ")}`);
      }
      return diff;
    },
  },
};

export default JiraLinkerPlugin;
