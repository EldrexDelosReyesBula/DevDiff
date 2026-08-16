import { DevDiffPlugin, PluginContext } from "@eldrex/plugin-sdk";
import { StudyBuddyEngine } from "./explainer";
import { ExplanationLevel } from "./levels";
import { StudyBuddyAIRouter } from "./ai-router";

export { StudyBuddyEngine } from "./explainer";
export { LanguageDetector } from "./languages/detector";
export { UniversalExplainer } from "./languages/universal";
export { CSSExplainer } from "./languages/css";
export { JavaScriptExplainer } from "./languages/javascript";
export { PythonExplainer } from "./languages/python";
export { HTMLExplainer } from "./languages/html";
export { RustExplainer } from "./languages/rust";
export { GoExplainer } from "./languages/go";
export { StudyBuddyAIRouter } from "./ai-router";
export type { ExplanationLevel } from "./levels";
export type { CodeExplanation } from "./languages/universal";

export const StudyBuddyPlugin: DevDiffPlugin = {
  id: "@eldrex/plugin-study-buddy",
  name: "Study Buddy",
  version: "1.0.0",
  description: "Your patient senior dev — explains ANY code in ANY language across 5 progressive levels",
  author: {
    name: "Eldrex",
    email: "dev@devdiff.dev",
    url: "https://github.com/EldrexDelosReyesBula/devdiff",
  },
  devdiffVersion: ">=1.0.0",

  async activate(context: PluginContext) {
    const provider = StudyBuddyAIRouter.getProvider();
    context.logger.info(`Study Buddy plugin activated using provider: ${provider.name}`);
  },

  async deactivate() {
    // Cleanup resources
  },

  commands: [
    {
      name: "devdiff study explain",
      description: "Explain selected code or file",
      handler: async (args: Record<string, any>) => {
        const code = args.code || "";
        const filePath = args.filePath || "snippet.txt";
        const level: ExplanationLevel = args.level || "developer";

        const explanation = StudyBuddyEngine.explain({
          code,
          level,
          filePath,
        });

        console.log(`\n🎓 [Study Buddy Explanation — ${explanation.language} (${explanation.level})]`);
        console.log(`Summary: ${explanation.summary}\n`);
        for (const section of explanation.sections) {
          console.log(`### ${section.title}\n${section.content}\n`);
        }
      },
    },
    {
      name: "devdiff study ask",
      description: "Ask a learning question about code",
      handler: async (args: Record<string, any>) => {
        const question = args.question || "Explain this code";
        const code = args.code || "";
        const filePath = args.filePath || "snippet.txt";

        const answer = StudyBuddyEngine.ask(question, code, filePath);
        console.log(answer);
      },
    },
  ],

  hooks: {},

  configSchema: {
    defaultLevel: {
      type: "string",
      description: "Default explanation depth level (beginner, student, developer, senior, architect)",
      default: "developer",
    },
  },
};

export default StudyBuddyPlugin;
