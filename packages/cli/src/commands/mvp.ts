import pc from "picocolors";
import { MVPStorage } from "@eldrex/core";

export async function mvpCommand(
  action: "status" | "process" | "process-all" | "clear",
  options?: { id?: string; all?: boolean }
): Promise<void> {
  const repoPath = process.cwd();

  switch (action) {
    case "status":
      await handleStatus(repoPath);
      break;
    case "process":
      await handleProcess(repoPath, options?.id);
      break;
    case "process-all":
      await handleProcessAll(repoPath);
      break;
    case "clear":
      await handleClear(repoPath, options?.all);
      break;
    default:
      console.log(pc.red(`❌ Unknown action: "${action}"`));
  }
}

async function handleStatus(repoPath: string): Promise<void> {
  const entries = await MVPStorage.listMVP(repoPath);
  
  console.log(pc.cyan("┌────────────────────────────────────────────┐"));
  console.log(pc.cyan("│") + pc.bold(pc.white("  MVP STORAGE                                ")) + pc.cyan("│"));
  console.log(pc.cyan("│                                            │"));

  const queued = entries.filter((e) => e.status === "queued");
  const processed = entries.filter((e) => e.status === "processed");
  const failed = entries.filter((e) => e.status === "failed");

  console.log(pc.cyan("│") + pc.yellow("  Queued for AI processing:                 ") + pc.cyan("│"));
  if (queued.length === 0) {
    console.log(pc.cyan("│") + pc.dim("   None                                     ") + pc.cyan("│"));
  } else {
    for (const entry of queued) {
      const label = `📦 ${entry.id} (${entry.change_range.files} files)`;
      console.log(pc.cyan("│") + pc.white(`   ${label.padEnd(41)}`) + pc.cyan("│"));
    }
  }
  
  console.log(pc.cyan("│                                            │"));
  console.log(pc.cyan("│") + pc.green("  Processed:                                ") + pc.cyan("│"));
  if (processed.length === 0) {
    console.log(pc.cyan("│") + pc.dim("   None                                     ") + pc.cyan("│"));
  } else {
    for (const entry of processed) {
      const label = `✅ ${entry.id} (${entry.change_range.files} files)`;
      console.log(pc.cyan("│") + pc.white(`   ${label.padEnd(41)}`) + pc.cyan("│"));
    }
  }

  if (failed.length > 0) {
    console.log(pc.cyan("│                                            │"));
    console.log(pc.cyan("│") + pc.red("  Failed:                                   ") + pc.cyan("│"));
    for (const entry of failed) {
      const label = `❌ ${entry.id} (${entry.change_range.files} files)`;
      console.log(pc.cyan("│") + pc.white(`   ${label.padEnd(41)}`) + pc.cyan("│"));
    }
  }

  console.log(pc.cyan("│                                            │"));
  console.log(pc.cyan("│") + pc.white(`  Total entries: ${entries.length.toString().padEnd(28)}`) + pc.cyan("│"));
  console.log(pc.cyan("└────────────────────────────────────────────┘"));
}

async function handleProcess(repoPath: string, id?: string): Promise<void> {
  const entries = await MVPStorage.listMVP(repoPath);
  const queued = entries.filter((e) => e.status === "queued");

  if (id) {
    const found = entries.find((e) => e.id === id);
    if (!found) {
      console.log(pc.red(`❌ MVP entry with ID "${id}" not found.`));
      return;
    }
    console.log(pc.blue(`🔄 Processing MVP entry ${id}...`));
    const processed = await MVPStorage.processMVP(repoPath, id);
    if (processed.status === "processed") {
      console.log(pc.green(`✅ Successfully processed MVP entry ${id}!`));
      console.log("\n" + processed.changelog);
    } else {
      console.log(pc.red(`❌ Failed to process entry: ${processed.error}`));
    }
    return;
  }

  if (queued.length === 0) {
    console.log(pc.green("✅ No queued MVP entries to process."));
    return;
  }

  const next = queued[queued.length - 1]; // Oldest first
  console.log(pc.blue(`🔄 Processing next queued entry: ${next.id}...`));
  const processed = await MVPStorage.processMVP(repoPath, next.id);
  if (processed.status === "processed") {
    console.log(pc.green(`✅ Successfully processed MVP entry ${next.id}!`));
    console.log("\n" + processed.changelog);
  } else {
    console.log(pc.red(`❌ Failed to process entry: ${processed.error}`));
  }
}

async function handleProcessAll(repoPath: string): Promise<void> {
  const entries = await MVPStorage.listMVP(repoPath);
  const queued = entries.filter((e) => e.status === "queued");

  if (queued.length === 0) {
    console.log(pc.green("✅ No queued MVP entries to process."));
    return;
  }

  console.log(pc.blue(`🔄 Processing all ${queued.length} queued entries...`));
  for (const entry of queued.reverse()) {
    console.log(pc.blue(`\nProcessing ${entry.id}...`));
    const processed = await MVPStorage.processMVP(repoPath, entry.id);
    if (processed.status === "processed") {
      console.log(pc.green(`✅ Successfully processed ${entry.id}`));
    } else {
      console.log(pc.red(`❌ Failed to process ${entry.id}: ${processed.error}`));
    }
  }
}

async function handleClear(repoPath: string, clearAll = false): Promise<void> {
  await MVPStorage.clearMVP(repoPath, clearAll);
  console.log(pc.green(`✅ Clear operation complete (all: ${clearAll})`));
}
