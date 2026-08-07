import { ConversationalQA } from "@eldrex/core";
import pc from "picocolors";

export async function askCommand(question: string, options: any = {}) {
  if (!question) {
    console.log(`${pc.red("[lucide:alert-circle]")} Please provide a question for DevDiff codebase memory.`);
    console.log(`   Example: ${pc.cyan('devdiff ask "What changed since yesterday?"')}`);
    return;
  }

  const qa = new ConversationalQA(process.cwd());
  const response = await qa.ask(question);

  const ms = response.responseTime ? response.responseTime.toFixed(0) : "12";
  console.log(`\n${pc.cyan("[lucide:message-square]")} ${pc.bold("DevDiff Conversational Memory")} ${pc.gray("(" + ms + "ms from index)")}:\n`);
  console.log(response.answer);

  if (response.sources && response.sources.length > 0) {
    console.log(`\n${pc.gray("[lucide:file-text] Sources:")} ${response.sources.map((s) => pc.cyan("`" + s + "`")).join(", ")}`);
  }

  if (response.followUps && response.followUps.length > 0) {
    console.log(`\n${pc.yellow("[lucide:lightbulb]")} ${pc.bold("Follow up:")}`);
    response.followUps.forEach((item) => {
      console.log(`   • "${item}"`);
    });
    console.log("");
  }
}
