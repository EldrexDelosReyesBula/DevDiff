import pc from "picocolors";
import { PersistentMemory } from "@eldrex/core";

export async function reportCommand(options: { port?: string }) {
  console.log(
    `\n${pc.cyan("[lucide:file-text]")} ${pc.bold("DevDiff IDE Workspace Report")}`,
  );
  console.log(`──────────────────────────────────────────────`);

  const memory = new PersistentMemory(process.cwd());
  await memory.initialize();
  const status = memory.getStatus();

  console.log(`  • ${pc.bold("Indexed Files:")} ${status.filesIndexed}`);
  console.log(
    `  • ${pc.bold("Indexed Lines:")} ${status.linesIndexed.toLocaleString()}`,
  );
  console.log(
    `  • ${pc.bold("Last Scan:")} ${status.lastScan ? new Date(status.lastScan).toLocaleString() : "Never"}`,
  );
  console.log(
    `  • ${pc.bold("Historical Snapshots:")} ${status.snapshotsCount}\n`,
  );

  console.log(
    `${pc.yellow("[lucide:lightbulb]")} To query workspace memory directly in your terminal/IDE:`,
  );
  console.log(`   ${pc.cyan('devdiff ask "What changed recently?"')}\n`);
}
