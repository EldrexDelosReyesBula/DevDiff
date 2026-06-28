import pc from "picocolors";
import { loadConfig } from "@eldrex/core";

export async function configCommand() {
  console.log(pc.blue("⚙️ Loading DevDiff configuration..."));

  try {
    const config = await loadConfig();

    console.log(pc.green("✅ Configuration is valid! Loaded settings:\n"));

    console.log(pc.bold("Output Format:"), pc.cyan(config.format));
    console.log(
      pc.bold("Exclude Patterns:"),
      pc.cyan(config.exclude.join(", ")),
    );

    console.log(pc.bold("\nCache Settings:"));
    console.log(
      `  Enabled: ${config.cache.enabled ? pc.green("yes") : pc.red("no")}`,
    );
    console.log(`  Path:    ${pc.cyan(config.cache.path)}`);

    console.log(pc.bold("\nAI Routing:"));
    console.log(
      `  Strategy:             ${pc.cyan(config.ai.routing.strategy)}`,
    );
    console.log(
      `  Complexity Threshold: ${pc.cyan(config.ai.routing.complexityThreshold.toString())}`,
    );
    console.log(
      `  Local Only:           ${config.ai.routing.localOnly ? pc.green("yes") : pc.red("no")}`,
    );

    console.log(pc.bold("\nConfigured Providers:"));
    if (config.ai.providers.length === 0) {
      console.log(pc.yellow("  (No AI providers configured)"));
    } else {
      for (const provider of config.ai.providers) {
        console.log(`  - ${pc.bold(provider.name)}:`);
        console.log(`      URL:      ${pc.cyan(provider.url)}`);
        console.log(`      Priority: ${pc.cyan(provider.priority.toString())}`);
        if (provider.apiKey) {
          console.log(`      API Key:  ${pc.gray("********")}`);
        }
      }
    }
  } catch (error: any) {
    console.error(
      pc.red(`\n❌ Configuration validation failed: ${error.message}`),
    );
    process.exit(1);
  }
}
