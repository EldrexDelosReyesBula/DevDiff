import { Command } from "commander";
import picocolors from "picocolors";
import { StudyEngine } from "@eldrex/core";

export function registerStudyCommand(program: Command) {
  const study = program
    .command("study")
    .description("DevDiff Study Buddy Mode — Learn any codebase with interactive guidance");

  study
    .command("start")
    .description("Activates Study Buddy Mode for the current project workspace")
    .action(async () => {
      console.log(picocolors.bold(picocolors.cyan("📖 DevDiff Study Buddy Mode Activated!")));
      console.log(picocolors.dim("DevDiff is ready to explain code, build learning paths, and guide your exploration."));
      console.log("");
      console.log(picocolors.yellow("Try these commands:"));
      console.log("  • " + picocolors.green("devdiff study tour") + "          — Take a 5-minute newcomer codebase tour");
      console.log("  • " + picocolors.green("devdiff study learn auth") + "     — Create a learning path for authentication");
      console.log("  • " + picocolors.green('devdiff study ask "what is a Promise?"') + " — Ask any educational question");
    });

  study
    .command("tour")
    .description("Takes a 5-minute newcomer tour of the codebase structure")
    .action(async () => {
      console.log(picocolors.bold(picocolors.cyan("🗺️ Generating Codebase Tour...")));
      const engine = new StudyEngine();
      const tour = await engine.generateCodebaseTour();

      console.log("");
      console.log(picocolors.bold(`## 📖 Welcome to ${tour.projectName}!`));
      console.log(tour.overview);
      console.log("");
      console.log(picocolors.bold("## 🛠️ Tech Stack Detected:"));
      console.log("• " + tour.techStack.join(", "));
      console.log("");
      console.log(picocolors.bold("## 🔑 Key Entry Files to Start With:"));
      for (const f of tour.suggestedFirstFiles) {
        console.log(`• ${picocolors.cyan(f)}`);
      }
      console.log("");
      console.log(picocolors.bold("## 💡 Questions to Explore Next:"));
      for (const p of tour.explorationPrompts) {
        console.log(`• ${p}`);
      }
    });

  study
    .command("learn <topic>")
    .description("Generates an interactive learning path for a specific topic in this repository")
    .action(async (topic: string) => {
      console.log(picocolors.bold(picocolors.cyan(`📚 Generating Learning Path for "${topic}"...`)));
      const engine = new StudyEngine();
      const path = await engine.generateLearningPath(topic);

      console.log("");
      console.log(picocolors.bold(`## 📚 Learning Path: ${path.topic} (${path.totalDurationMinutes} mins)`));
      console.log(path.overview);
      console.log("");

      for (const step of path.steps) {
        console.log(picocolors.bold(`### Step ${step.step}: ${step.title} (${step.durationMinutes} min)`));
        console.log(`• ${step.explanation}`);
        console.log(`• Key Concept: ${picocolors.yellow(step.keyConcept)}`);
        console.log(`• Files: ${step.relevantFiles.map((f) => picocolors.cyan(f)).join(", ")}`);
        console.log("");
      }
    });

  study
    .command("ask <question>")
    .description("Asks an educational question about the codebase in Study Buddy Mode")
    .action(async (question: string) => {
      console.log(picocolors.bold(picocolors.cyan("📖 Study Buddy is thinking...")));
      const engine = new StudyEngine();
      const answer = await engine.explainCode(question);
      console.log("");
      console.log(answer);
    });

  study
    .command("quiz <topic>")
    .description("Generates a self-quiz on a topic in this codebase")
    .action(async (topic: string) => {
      console.log(picocolors.bold(picocolors.cyan(`🧪 Generating Self-Quiz for "${topic}"...`)));
      const engine = new StudyEngine();
      const quiz = await engine.generateQuiz(topic);

      console.log("");
      console.log(picocolors.bold(`## 🧪 Self-Quiz: ${quiz.topic}`));
      for (const q of quiz.questions) {
        console.log("");
        console.log(picocolors.bold(`Q${q.id}: ${q.question}`));
        q.options.forEach((opt, idx) => {
          console.log(`   ${idx + 1}) ${opt}`);
        });
        console.log(picocolors.dim(`   (Correct: Option ${q.correctAnswerIndex + 1}) — ${q.explanation}`));
      }
    });

  study
    .command("stop")
    .description("Exits Study Buddy Mode")
    .action(() => {
      console.log(picocolors.yellow("Study Buddy Mode deactivated. Happy coding!"));
    });
}
