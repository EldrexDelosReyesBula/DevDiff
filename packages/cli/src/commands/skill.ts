import { SkillManager } from "@eldrex/core";
import pc from "picocolors";

export async function skillCommand(
  subcommand: string = "validate",
  options: any = {},
) {
  const manager = new SkillManager(process.cwd());

  switch (subcommand) {
    case "generate": {
      const generatedPath = await manager.generate();
      console.log(
        `${pc.green("[lucide:check-circle]")} SKILL.md auto-generated at: ${pc.cyan(generatedPath)}`,
      );
      break;
    }

    case "validate": {
      const coverage = manager.validate();
      if (coverage.coverageScore === 0) {
        console.log(
          `${pc.yellow("[lucide:alert-triangle]")} SKILL.md not found. Run ${pc.cyan("devdiff skill generate")} to create one.`,
        );
        return;
      }

      const pass = pc.green("[lucide:check]");
      const fail = pc.red("[lucide:x]");

      console.log(
        `\n${pc.cyan("[lucide:file-text]")} ${pc.bold("DevDiff SKILL.md Coverage & Validation:")}`,
      );
      console.log(pc.gray("──────────────────────────────────────────────"));
      console.log(
        `  • Project Identity:    ${coverage.projectIdentity ? pass : fail}`,
      );
      console.log(
        `  • Architecture:        ${coverage.architecture ? pass : fail}`,
      );
      console.log(
        `  • Naming Conventions:  ${coverage.namingConventions ? pass : fail}`,
      );
      console.log(
        `  • Business Domain:     ${coverage.businessDomain ? pass : fail}`,
      );
      console.log(
        `  • Patterns:            ${coverage.patterns ? pass : fail}`,
      );
      console.log(
        `  • Anti-Patterns:       ${coverage.antiPatterns ? pass : fail}`,
      );
      console.log(
        `  • Compliance:          ${coverage.compliance ? pass : fail}`,
      );
      console.log(
        `  • Output Preferences:  ${coverage.outputPreferences ? pass : fail}`,
      );
      console.log(
        `  • Team Context:        ${coverage.teamContext ? pass : fail}`,
      );
      console.log(
        `  • Historical Context:  ${coverage.historicalContext ? pass : fail}`,
      );
      console.log(
        `\n${pc.cyan("[lucide:bar-chart-2]")} ${pc.bold("Total Knowledge Base Coverage:")} ${pc.cyan(coverage.coverageScore + "%")}\n`,
      );
      break;
    }

    default: {
      console.log(
        `${pc.red("[lucide:alert-circle]")} Unknown skill subcommand: ${subcommand}`,
      );
      console.log("Valid subcommands: generate, validate");
    }
  }
}
