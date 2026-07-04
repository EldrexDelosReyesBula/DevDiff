import { Command } from "commander";
import { initCommand } from "./commands/init";
import { generateCommand } from "./commands/generate";
import { watchCommand } from "./commands/watch";
import { cliErrorBoundary } from "./error-boundary";

import { reportCommand } from "./commands/report";
import { configCommand } from "./commands/config";
import { auditCommand } from "./commands/audit";
import { complianceCommand } from "./commands/compliance";
import { vibeCommand } from "./commands/vibe";
import { recoverCommand } from "./commands/recover";
import { versionCommand } from "./commands/version";
import { playgroundCommand } from "./commands/playground";
import { contextCommand } from "./commands/context";
import { discloseCommand } from "./commands/disclose";
import { monitorCommand } from "./commands/monitor";
import { mvpCommand } from "./commands/mvp";
import {
  authAddCommand,
  authListCommand,
  authRemoveCommand,
  authTestCommand,
  authRotateCommand,
} from "./commands/auth";

const program = new Command();

program
  .name("devdiff")
  .description("Privacy-first, BYOAI changelog intelligence for developers")
  .version("1.0.3");

// Intercept --version flag to use our rich version display
program.on("option:version", () => {
  versionCommand().then(() => process.exit(0));
});

program
  .command("version")
  .description("Show version info, check for updates, and view changelog")
  .option("--check", "check npm registry for the latest available version")
  .option("--changelog", "display the embedded changelog")
  .option("--info", "show detailed version and compatibility info")
  .action(async (options) => {
    await versionCommand(options);
  });

program
  .command("generate")
  .description("Generate AI explanations for current repository changes")
  .option(
    "-m, --commit-msg-file <file>",
    "file path to append the generated explanation (used in Git hooks)",
  )
  .option(
    "-r, --range <range>",
    "Git commit range or branch (e.g. HEAD~1 or main..feature)",
  )
  .option(
    "-f, --format <format>",
    "output format: markdown, json, html",
    "markdown",
  )
  .option("-o, --output <file>", "output file path to write the changelog")
  .option("-d, --dry-run", "dry run mode (simulates AI call)")
  .option("-p, --persona <persona>", "AI persona for output style", "developer")
  .option("--since <range>", "Git revision range (alternative to -r)")
  .option(
    "--depth <depth>",
    "Analysis depth (minimal, standard, deep)",
    "standard",
  )
  .action(async (options) => {
    // Validate persona
    const validPersonas = [
      "developer",
      "ceo",
      "educator",
      "robot",
      "data-analyst",
      "journalist",
      "pm",
      "compliance",
    ];

    if (!validPersonas.includes(options.persona)) {
      console.log(`❌ Invalid persona: "${options.persona}"`);
      console.log(`   Valid options: ${validPersonas.join(", ")}`);
      console.log("");
      console.log("   Example: devdiff generate --persona ceo");
      return;
    }

    await generateCommand(options);
  });

program
  .command("watch")
  .description(
    "Watch Git index for staged changes and print summaries in real-time",
  )
  .option("-p, --persona <persona>", "AI persona for output style", "developer")
  .action(async (options) => {
    await watchCommand(options);
  });

program
  .command("report")
  .description("Serve the web dashboard locally and view changelogs")
  .option("-p, --port <port>", "port to host the dashboard server", "4200")
  .action(async (options) => {
    await reportCommand(options);
  });

program
  .command("config")
  .description("Validate and display active configuration")
  .action(async () => {
    await configCommand();
  });

program
  .command("init")
  .description(
    "Initialize DevDiff configuration and install Git hooks in the repository",
  )
  .option("-f, --force", "force overwrite of existing configuration files")
  .option("-y, --yes", "Skip prompts and use defaults")
  .action(async (options) => {
    await initCommand(options);
  });

program
  .command("vibe")
  .description("Start vibe coding session with auto-checkpoints")
  .argument("<action>", "start, stop, status")
  .action(async (action) => {
    await vibeCommand(action);
  });

program
  .command("recover")
  .description("Restore checkpoint from a vibe session")
  .option("-c, --checkpoint <checkpointId>", "checkpoint ID to restore")
  .action(async (options) => {
    await recoverCommand(options);
  });

program
  .command("compliance")
  .description("Compliance framework management")
  .argument("<action>", "apply, status, report, list")
  .option("-f, --framework <id>", "Compliance framework ID")
  .action(async (action, options) => {
    await complianceCommand(action, options);
  });

program
  .command("audit [type]")
  .description(
    "Display log audits of past AI provider calls, network disclosures, or shell logs",
  )
  .option(
    "-p, --package <package>",
    "show audit disclosure for a specific package",
  )
  .action(async (type, options) => {
    await auditCommand(type, options);
  });

program
  .command("playground")
  .description("Launch local playground UI connected to your workspace")
  .option("-p, --port <port>", "port to serve playground on", "3737")
  .option("--no-open", "do not auto-open browser")
  .action(async (options) => {
    await playgroundCommand(options);
  });

program
  .command("context")
  .description("Manage project context for accurate AI explanations")
  .argument("<action>", "generate, show, validate, edit")
  .action(async (action) => {
    const validActions = ["generate", "show", "validate", "edit"];
    if (!validActions.includes(action)) {
      console.log(`❌ Invalid context action: "${action}"`);
      console.log(`   Valid options: ${validActions.join(", ")}`);
      return;
    }
    await contextCommand(action as any);
  });

program
  .command("disclose")
  .description(
    "Full disclosure of DevDiff network, filesystem, shell, and AI practices",
  )
  .action(async () => {
    await discloseCommand();
  });

program
  .command("monitor")
  .description("Watch outbound and blocked network connections in real-time")
  .action(async () => {
    await monitorCommand();
  });

program
  .command("mvp")
  .description("Deferred change summaries for very large diffs or offline mode")
  .argument("<action>", "status, process, process-all, clear")
  .option("--id <id>", "specific entry ID to process")
  .option("--all", "clear all entries (not just processed/failed)")
  .action(async (action, options) => {
    const validActions = ["status", "process", "process-all", "clear"];
    if (!validActions.includes(action)) {
      console.log(
        `❌ Invalid action: "${action}". Valid options: ${validActions.join(", ")}`,
      );
      return;
    }
    await mvpCommand(action as any, options);
  });

program
  .command("auth")
  .description("Manage cloud AI provider API keys")
  .argument("<action>", "add, list, remove, test, rotate")
  .argument(
    "[provider]",
    "provider name (openai, anthropic, groq, gemini, deepseek, together)",
  )
  .action(async (action, provider) => {
    const validActions = ["add", "list", "remove", "test", "rotate"];
    if (!validActions.includes(action)) {
      console.log(
        `❌ Invalid action: "${action}". Valid options: ${validActions.join(", ")}`,
      );
      return;
    }

    if (action === "list") {
      await authListCommand();
    } else {
      if (!provider) {
        console.log(`❌ Provider name required for action: "${action}".`);
        console.log(`   e.g. devdiff auth ${action} openai`);
        return;
      }
      const provLower = provider.toLowerCase();
      if (action === "add") {
        await authAddCommand(provLower);
      } else if (action === "remove") {
        await authRemoveCommand(provLower);
      } else if (action === "test") {
        await authTestCommand(provLower);
      } else if (action === "rotate") {
        await authRotateCommand(provLower);
      }
    }
  });

cliErrorBoundary(async () => {
  await program.parseAsync(process.argv);
});

export { CLIOutputFormatter } from "./ui/output-formatter";
