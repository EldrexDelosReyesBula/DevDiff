import { PersistentMemory } from "@eldrex/core";
import pc from "picocolors";

export async function memoryCommand(subcommand: string = "status", options: any = {}) {
  const memory = new PersistentMemory(process.cwd());

  switch (subcommand) {
    case "init": {
      await memory.initialize();
      break;
    }

    case "status": {
      await memory.initialize();
      const status = memory.getStatus();
      console.log(`\n${pc.cyan("[lucide:bar-chart-3]")} ${pc.bold("DevDiff Persistent Codebase Memory Status")}`);
      console.log(pc.gray("──────────────────────────────────────────────"));
      console.log(`Files Indexed:        ${pc.white(status.filesIndexed.toLocaleString())}`);
      console.log(`Lines Indexed:        ${pc.white(status.linesIndexed.toLocaleString())}`);
      console.log(`Last Scan:            ${pc.white(status.lastScan)}`);
      console.log(`Historical Snapshots: ${pc.white(status.snapshotsCount)}`);
      console.log(`Conversation Turns:   ${pc.white(status.turnsCount)}`);
      console.log(`\n${pc.cyan("[lucide:layers]")} ${pc.bold("Indexed Entities:")}`);
      console.log(`  • Functions:  ${pc.white(status.entitiesCount.functions)}`);
      console.log(`  • Classes:    ${pc.white(status.entitiesCount.classes)}`);
      console.log(`  • Components: ${pc.white(status.entitiesCount.components)}`);
      console.log(`  • Routes:     ${pc.white(status.entitiesCount.routes)}\n`);
      break;
    }

    case "rescan": {
      await memory.initialize();
      await memory.rescan();
      console.log(`${pc.green("[lucide:check-circle]")} Codebase re-scanned and persistent index updated.`);
      break;
    }

    case "clear-conversation": {
      memory.clearConversation();
      console.log(`${pc.gray("[lucide:eraser]")} Conversation history cleared. Codebase memory retained.`);
      break;
    }

    case "clear-all": {
      memory.clearAll();
      console.log(`${pc.red("[lucide:trash-2]")} All DevDiff persistent memory and snapshots deleted.`);
      break;
    }

    default: {
      console.log(`${pc.red("[lucide:alert-circle]")} Unknown memory subcommand: ${subcommand}`);
      console.log("Valid subcommands: init, status, rescan, clear-conversation, clear-all");
    }
  }
}
