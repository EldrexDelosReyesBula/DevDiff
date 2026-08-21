import { Command } from "commander";
import picocolors from "picocolors";
import { DevDiffEngine, ProgressiveExplainer } from "@eldrex/core";

export function registerStudyCommand(program: Command) {
  const study = program
    .command("study")
    .description(
      "DevDiff Study & Code Intelligence (powered by @eldrex/plugin-study-buddy)",
    );

  study
    .command("start")
    .description(
      "Activates Study & Code Intelligence mode for the current project",
    )
    .action(async () => {
      console.log(
        picocolors.bold(
          picocolors.cyan("📖 DevDiff Study & Code Intelligence Activated!"),
        ),
      );
      console.log(
        picocolors.dim(
          "Powered by DevDiff core intelligence and @eldrex/plugin-study-buddy.",
        ),
      );
      console.log("");
      console.log(picocolors.yellow("Available commands:"));
      console.log(
        "  • " +
          picocolors.green("devdiff study tour") +
          "          — Take a 5-minute newcomer codebase tour",
      );
      console.log(
        "  • " +
          picocolors.green(
            "devdiff study explain <file> --level <beginner|senior>",
          ) +
          " — Progressive code breakdown",
      );
      console.log(
        "  • " +
          picocolors.green('devdiff study ask "what is a Promise?"') +
          " — Ask any architectural question",
      );
      console.log("");
      console.log(
        picocolors.dim(
          "💡 For standalone full quizzes and interactive tutorials, install:",
        ),
      );
      console.log(
        picocolors.dim(
          "   npm install -g @eldrex/plugin-study-buddy\n   https://github.com/EldrexDelosReyesBula/devdiff-study-buddy",
        ),
      );
    });

  study
    .command("tour")
    .description("Takes a 5-minute newcomer tour of the codebase structure")
    .action(async () => {
      console.log(
        picocolors.bold(picocolors.cyan("🗺️ Generating Codebase Tour...")),
      );
      const engine = new DevDiffEngine();
      const tour = await engine.generateOnboarding();
      console.log("");
      console.log(tour);
    });

  study
    .command("explain [file]")
    .option(
      "-l, --level <level>",
      "Explanation level (beginner, student, developer, senior, architect)",
      "developer",
    )
    .description("Explains a file or snippet across 5 progressive levels")
    .action(async (file?: string, options?: { level?: string }) => {
      console.log(
        picocolors.bold(
          picocolors.cyan(
            `🎓 Explaining ${file || "code"} at level: ${options?.level || "developer"}...`,
          ),
        ),
      );
      const engine = new DevDiffEngine();
      let code = "";
      if (file) {
        try {
          const fs = await import("fs/promises");
          code = await fs.readFile(file, "utf-8");
        } catch (err: any) {
          console.error(picocolors.red(`Could not read file: ${err.message}`));
          return;
        }
      }
      const explanation = await engine.explainCode({
        code: code || "const greeting = 'Hello, DevDiff!';",
        filePath: file,
        level: options?.level || "developer",
      });
      console.log("");
      console.log(explanation);
    });

  study
    .command("ask <question>")
    .description("Asks a codebase intelligence question")
    .action(async (question: string) => {
      console.log(
        picocolors.bold(
          picocolors.cyan("📖 DevDiff Intelligence is thinking..."),
        ),
      );
      const engine = new DevDiffEngine();
      const answer = await engine.ask({ question });
      console.log("");
      console.log(answer);
    });

  study
    .command("stop")
    .description("Exits Study Mode")
    .action(() => {
      console.log(picocolors.yellow("Study Mode deactivated. Happy coding!"));
    });
}
