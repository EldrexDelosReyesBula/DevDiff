const { Command } = require("commander");

const program = new Command();
program
  .command("generate")
  .option("--dry-run, -d", "dry run")
  .action((options) => {
    console.log("Parsed options:", options);
  });

program.parse(["node", "test", "generate", "--dry-run"]);
