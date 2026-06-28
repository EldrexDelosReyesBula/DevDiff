import { Command } from "commander";
import { initCommand } from "./commands/init";
import { generateCommand } from "./commands/generate";
import { watchCommand } from "./commands/watch";
import { reportCommand } from "./commands/report";
import { configCommand } from "./commands/config";
import { auditCommand } from "./commands/audit";
import {
  applyComplianceCommand,
  statusComplianceCommand,
  validateComplianceCommand,
  reportComplianceCommand,
  listComplianceCommand,
} from "./commands/compliance";
import { vibeStartCommand, vibeStatusCommand } from "./commands/vibe";
import { recoverCommand } from "./commands/recover";

const program = new Command();

program
  .name("devdiff")
  .description("Privacy-first, BYOAI changelog intelligence for developers")
  .version("1.0.0");

program
  .command("init")
  .description(
    "Initialize DevDiff configuration and install Git hooks in the repository",
  )
  .option("-f, --force", "force overwrite of existing configuration files")
  .action(async (options) => {
    await initCommand(options);
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
  .option("-f, --format <format>", "output format: markdown, json, html")
  .option("-o, --output <file>", "output file path to write the changelog")
  .option("-d, --dry-run", "dry run mode (simulates AI call)")
  .action(async (options) => {
    await generateCommand(options);
  });

program
  .command("watch")
  .description(
    "Watch Git index for staged changes and print summaries in real-time",
  )
  .action(async () => {
    await watchCommand();
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
  .command("audit")
  .description("Display log audits of past AI provider calls")
  .action(async () => {
    await auditCommand();
  });

const compliance = program
  .command("compliance")
  .description("Manage compliance frameworks (GDPR, CCPA, HIPAA, etc.)");

compliance
  .command("apply")
  .description("Apply a compliance framework to configuration")
  .requiredOption(
    "--framework <framework>",
    "framework ID to apply (e.g. gdpr, hipaa)",
  )
  .action(async (options) => {
    await applyComplianceCommand(options.framework);
  });

compliance
  .command("status")
  .description("Check current compliance status against all frameworks")
  .action(async () => {
    await statusComplianceCommand();
  });

compliance
  .command("validate")
  .description("Validate current configuration against specified frameworks")
  .requiredOption(
    "--frameworks <frameworks>",
    "comma-separated framework IDs to validate",
  )
  .action(async (options) => {
    await validateComplianceCommand(options.frameworks);
  });

compliance
  .command("report")
  .description("Generate audit-ready compliance report")
  .option("-f, --format <format>", "report format: pdf, txt", "txt")
  .option(
    "-o, --output <file>",
    "output report file path",
    "compliance-report.txt",
  )
  .action(async (options) => {
    await reportComplianceCommand(options);
  });

compliance
  .command("list")
  .description("List all supported compliance frameworks")
  .action(() => {
    listComplianceCommand();
  });

const vibe = program
  .command("vibe")
  .description("Manage Vibe-Coding resilient session");

vibe
  .command("start")
  .description("Start a new vibe coding session")
  .action(async () => {
    await vibeStartCommand();
  });

vibe
  .command("status")
  .description("Show active vibe session status")
  .action(async () => {
    await vibeStatusCommand();
  });

program
  .command("recover")
  .description("Restore checkpoint from a vibe session")
  .requiredOption("--checkpoint <checkpointId>", "checkpoint ID to restore")
  .action(async (options) => {
    await recoverCommand(options);
  });

program.parse(process.argv);
