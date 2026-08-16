import { MemoryManager } from "@eldrex/core";

export async function memoryListCommand(options: {
  category?: string;
  from?: string;
  to?: string;
}): Promise<void> {
  const snapshots = await MemoryManager.listSnapshots(process.cwd(), options);

  if (snapshots.length === 0) {
    console.log("📭 No memory snapshots found.");
    return;
  }

  console.log(`📊 Memory Snapshots (${snapshots.length}):\n`);
  for (const s of snapshots) {
    console.log(
      `  • [${s.date} ${s.time}] Git: ${s.gitHash} | Files: ${s.files} | Entities: ${s.entities} | Category: ${s.category}`,
    );
  }
}

export async function memoryDeleteCommand(options: {
  from: string;
  to: string;
  dryRun?: boolean;
}): Promise<void> {
  const result = await MemoryManager.deleteRange({
    from: options.from,
    to: options.to,
    workspacePath: process.cwd(),
    dryRun: options.dryRun,
  });

  if (result.action === "dry-run") {
    console.log(`🔍 [Dry Run] Memory Deletion Preview:`);
    console.log(`   Snapshots to delete: ${result.snapshotsToDelete}`);
    console.log(`   Snapshots to keep:   ${result.snapshotsToKeep}`);
    console.log(`   Date range:          ${result.dateRange}`);
    console.log(
      `   Estimated space:     ~${MemoryManager.formatBytes(result.storageFreed)}`,
    );
  } else {
    console.log(`🗑️ Memory Deletion Complete:`);
    console.log(`   Snapshots deleted: ${result.snapshotsToDelete}`);
    console.log(`   Snapshots remaining: ${result.snapshotsToKeep}`);
    console.log(
      `   Space freed:        ~${MemoryManager.formatBytes(result.storageFreed)}`,
    );
  }
}

export async function memoryUseCommand(options: {
  from?: string;
  to?: string;
  all?: boolean;
}): Promise<void> {
  if (options.all) {
    MemoryManager.useAll(process.cwd());
    console.log("📅 Active memory range reset — using all available memory.");
    return;
  }

  if (options.from && options.to) {
    const result = MemoryManager.useRange({
      from: options.from,
      to: options.to,
      workspacePath: process.cwd(),
    });

    console.log(`📅 Active memory range set: ${options.from} to ${options.to}`);
    console.log(`   Snapshots in range: ${result.snapshotCount}`);
    return;
  }

  console.log("⚠️ Please specify --from <date> --to <date> or --all");
}

export async function memoryCategorizeCommand(options: {
  from: string;
  to: string;
  label: string;
}): Promise<void> {
  await MemoryManager.categorize({
    from: options.from,
    to: options.to,
    label: options.label,
    workspacePath: process.cwd(),
  });

  console.log(
    `🏷️ Categorized snapshots between ${options.from} and ${options.to} as "${options.label}"`,
  );
}

export async function memoryCategoriesCommand(): Promise<void> {
  const categories = await MemoryManager.listCategories(process.cwd());

  if (categories.length === 0) {
    console.log("📭 No categorized snapshots.");
    return;
  }

  console.log(`🏷️ Memory Categories:\n`);
  for (const c of categories) {
    console.log(
      `  • ${c.name.padEnd(18)} (${c.count} snapshots, ${c.earliestDate} to ${c.latestDate})`,
    );
  }
}

export async function memoryOptimizeCommand(): Promise<void> {
  console.log("📦 Optimizing memory storage...");
  const result = await MemoryManager.optimize(process.cwd());

  console.log(`✅ Storage Optimization Complete:`);
  console.log(`   Before: ${MemoryManager.formatBytes(result.beforeSize)}`);
  console.log(`   After:  ${MemoryManager.formatBytes(result.afterSize)}`);
  console.log(`   Saved:  ${MemoryManager.formatBytes(result.saved)}`);
  if (result.deduplicated > 0) {
    console.log(`   Deduplicated: ${result.deduplicated} snapshots`);
  }
}

export async function memoryStatusCommand(): Promise<void> {
  const snapshots = await MemoryManager.listSnapshots(process.cwd());
  const categories = await MemoryManager.listCategories(process.cwd());

  console.log(`\n📊 Memory Status`);
  console.log(`═══════════════════════════════════════\n`);
  console.log(`Storage:`);
  console.log(`  Total snapshots: ${snapshots.length}`);
  if (snapshots.length > 0) {
    console.log(`  Oldest snapshot: ${snapshots[snapshots.length - 1].date}`);
    console.log(`  Newest snapshot: ${snapshots[0].date}`);
  }
  console.log(`\nCategories:`);
  for (const c of categories) {
    console.log(
      `  🏷️ ${c.name.padEnd(16)} — ${c.count} snapshots (${c.earliestDate} to ${c.latestDate})`,
    );
  }
  console.log("");
}

export async function memoryCommand(
  subcommand?: string,
  options: Record<string, any> = {},
): Promise<void> {
  switch (subcommand) {
    case "list":
      return memoryListCommand(options);
    case "delete":
      return memoryDeleteCommand(options as any);
    case "use":
      return memoryUseCommand(options);
    case "categorize":
      return memoryCategorizeCommand(options as any);
    case "categories":
      return memoryCategoriesCommand();
    case "optimize":
      return memoryOptimizeCommand();
    case "status":
    default:
      return memoryStatusCommand();
  }
}
