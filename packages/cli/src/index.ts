import { Command } from "commander";
import { initCommand } from "./commands/init";
import { generateCommand } from "./commands/generate";
import { watchCommand } from "./commands/watch";
import { reportCommand } from "./commands/report";
import { configCommand } from "./commands/config";
import { auditCommand } from "./commands/audit";
import { complianceCommand } from "./commands/compliance";
import { vibeCommand } from "./commands/vibe";
import { recoverCommand } from "./commands/recover";
import { versionCommand } from "./commands/version";
import { playgroundCommand } from "./commands/playground";

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

program.parse(process.argv);
