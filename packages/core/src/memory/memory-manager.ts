import * as fs from "fs";
import * as path from "path";
import { PersistentMemory, CodebaseSnapshot } from "./persistent-memory";

export interface DeleteResult {
  action: "dry-run" | "deleted";
  snapshotsToDelete: number;
  snapshotsToKeep: number;
  dateRange: string;
  storageFreed: number;
  snapshots?: Array<{ date: string; files: number; entities: number }>;
}

export interface UseRangeResult {
  activeRange: { from: string; to: string };
  snapshotCount: number;
}

export interface CategorySummary {
  name: string;
  count: number;
  earliestDate: string;
  latestDate: string;
}

export interface SnapshotSummary {
  date: string;
  time: string;
  files: number;
  entities: number;
  category: string;
  gitHash: string;
}

export interface OptimizeResult {
  beforeSize: number;
  afterSize: number;
  saved: number;
  deduplicated: number;
}

export interface MemoryConfigData {
  activeRange?: { from: string; to: string } | null;
  retentionDays?: number | null;
  categories?: Record<string, string>;
}

export class MemoryConfig {
  static getConfigPath(workspacePath: string): string {
    return path.join(workspacePath, ".devdiff", "memory", "memory-config.json");
  }

  static load(workspacePath: string): MemoryConfigData {
    const configPath = this.getConfigPath(workspacePath);
    if (fs.existsSync(configPath)) {
      try {
        return JSON.parse(fs.readFileSync(configPath, "utf-8"));
      } catch {
        // Fall back to default
      }
    }
    return { activeRange: null, retentionDays: null, categories: {} };
  }

  static save(workspacePath: string, data: MemoryConfigData): void {
    const configPath = this.getConfigPath(workspacePath);
    const dir = path.dirname(configPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(configPath, JSON.stringify(data, null, 2), "utf-8");
  }
}

export class MemoryManager {
  /**
   * Delete memory for a specific time range
   */
  static async deleteRange(params: {
    from: string;
    to: string;
    workspacePath: string;
    dryRun?: boolean;
  }): Promise<DeleteResult> {
    const fromDate = this.parseDate(params.from);
    const toDate = this.parseDate(params.to);

    const memory = new PersistentMemory(params.workspacePath);
    await memory.initialize();

    const historyPath = path.join(
      params.workspacePath,
      ".devdiff",
      "memory",
      "snapshot-history.json"
    );

    let snapshotHistory: Array<CodebaseSnapshot & { category?: string }> = [];
    if (fs.existsSync(historyPath)) {
      try {
        snapshotHistory = JSON.parse(fs.readFileSync(historyPath, "utf-8"));
      } catch {
        // Empty
      }
    }

    const toDelete = snapshotHistory.filter((s) => {
      const snapshotDate = new Date(s.timestamp);
      return snapshotDate >= fromDate && snapshotDate <= toDate;
    });

    const toKeep = snapshotHistory.filter((s) => {
      const snapshotDate = new Date(s.timestamp);
      return snapshotDate < fromDate || snapshotDate > toDate;
    });

    const freed = this.estimateStorage(toDelete);

    if (params.dryRun) {
      return {
        action: "dry-run",
        snapshotsToDelete: toDelete.length,
        snapshotsToKeep: toKeep.length,
        dateRange: `${fromDate.toISOString().slice(0, 10)} to ${toDate.toISOString().slice(0, 10)}`,
        storageFreed: freed,
        snapshots: toDelete.map((s) => ({
          date: s.timestamp.slice(0, 10),
          files: s.files || 0,
          entities: (s.entities?.functions ? Object.keys(s.entities.functions).length : 0) +
            (s.entities?.classes ? Object.keys(s.entities.classes).length : 0),
        })),
      };
    }

    // Persist kept snapshots
    if (fs.existsSync(historyPath)) {
      fs.writeFileSync(historyPath, JSON.stringify(toKeep, null, 2), "utf-8");
    }

    return {
      action: "deleted",
      snapshotsToDelete: toDelete.length,
      snapshotsToKeep: toKeep.length,
      dateRange: `${fromDate.toISOString().slice(0, 10)} to ${toDate.toISOString().slice(0, 10)}`,
      storageFreed: freed,
    };
  }

  /**
   * Use only memory from a specific time range for context
   */
  static useRange(params: {
    from: string;
    to: string;
    workspacePath: string;
  }): UseRangeResult {
    const fromDate = this.parseDate(params.from);
    const toDate = this.parseDate(params.to);

    const config = MemoryConfig.load(params.workspacePath);
    config.activeRange = { from: fromDate.toISOString(), to: toDate.toISOString() };
    MemoryConfig.save(params.workspacePath, config);

    return {
      activeRange: config.activeRange,
      snapshotCount: this.countSnapshotsInRange(params.workspacePath, fromDate, toDate),
    };
  }

  /**
   * Reset to use all memory
   */
  static useAll(workspacePath: string): void {
    const config = MemoryConfig.load(workspacePath);
    config.activeRange = null;
    MemoryConfig.save(workspacePath, config);
  }

  /**
   * Categorize memory snapshots with labels
   */
  static async categorize(params: {
    from: string;
    to: string;
    label: string;
    workspacePath: string;
  }): Promise<void> {
    const fromDate = this.parseDate(params.from);
    const toDate = this.parseDate(params.to);

    const historyPath = path.join(
      params.workspacePath,
      ".devdiff",
      "memory",
      "snapshot-history.json"
    );

    let snapshotHistory: Array<CodebaseSnapshot & { category?: string }> = [];
    if (fs.existsSync(historyPath)) {
      try {
        snapshotHistory = JSON.parse(fs.readFileSync(historyPath, "utf-8"));
      } catch {
        // Empty
      }
    }

    for (const snapshot of snapshotHistory) {
      const d = new Date(snapshot.timestamp);
      if (d >= fromDate && d <= toDate) {
        snapshot.category = params.label;
      }
    }

    const dir = path.dirname(historyPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(historyPath, JSON.stringify(snapshotHistory, null, 2), "utf-8");
  }

  /**
   * List memory categories
   */
  static async listCategories(workspacePath: string): Promise<CategorySummary[]> {
    const historyPath = path.join(
      workspacePath,
      ".devdiff",
      "memory",
      "snapshot-history.json"
    );

    let snapshotHistory: Array<CodebaseSnapshot & { category?: string }> = [];
    if (fs.existsSync(historyPath)) {
      try {
        snapshotHistory = JSON.parse(fs.readFileSync(historyPath, "utf-8"));
      } catch {
        // Empty
      }
    }

    const categories = new Map<
      string,
      { count: number; earliestDate: string; latestDate: string }
    >();

    for (const snapshot of snapshotHistory) {
      const cat = snapshot.category || "uncategorized";

      if (!categories.has(cat)) {
        categories.set(cat, {
          count: 0,
          earliestDate: snapshot.timestamp,
          latestDate: snapshot.timestamp,
        });
      }

      const entry = categories.get(cat)!;
      entry.count++;

      if (snapshot.timestamp < entry.earliestDate) entry.earliestDate = snapshot.timestamp;
      if (snapshot.timestamp > entry.latestDate) entry.latestDate = snapshot.timestamp;
    }

    return Array.from(categories.entries()).map(([name, info]) => ({
      name,
      ...info,
      earliestDate: info.earliestDate.slice(0, 10),
      latestDate: info.latestDate.slice(0, 10),
    }));
  }

  /**
   * List all memory snapshots with dates
   */
  static async listSnapshots(
    workspacePath: string,
    options?: {
      category?: string;
      from?: string;
      to?: string;
    }
  ): Promise<SnapshotSummary[]> {
    const historyPath = path.join(
      workspacePath,
      ".devdiff",
      "memory",
      "snapshot-history.json"
    );

    let snapshots: Array<CodebaseSnapshot & { category?: string }> = [];
    if (fs.existsSync(historyPath)) {
      try {
        snapshots = JSON.parse(fs.readFileSync(historyPath, "utf-8"));
      } catch {
        // Empty
      }
    }

    // Filter by category
    if (options?.category) {
      snapshots = snapshots.filter((s) => s.category === options.category);
    }

    // Filter by date range
    if (options?.from) {
      const fromDate = this.parseDate(options.from);
      snapshots = snapshots.filter((s) => new Date(s.timestamp) >= fromDate);
    }

    if (options?.to) {
      const toDate = this.parseDate(options.to);
      snapshots = snapshots.filter((s) => new Date(s.timestamp) <= toDate);
    }

    return snapshots.map((s) => ({
      date: s.timestamp.slice(0, 10),
      time: s.timestamp.length >= 19 ? s.timestamp.slice(11, 19) : "00:00:00",
      files: s.files || 0,
      entities: (s.entities?.functions ? Object.keys(s.entities.functions).length : 0) +
        (s.entities?.classes ? Object.keys(s.entities.classes).length : 0),
      category: s.category || "uncategorized",
      gitHash: s.gitHash ? s.gitHash.slice(0, 7) : "unknown",
    }));
  }

  /**
   * Optimize storage — compact and deduplicate
   */
  static async optimize(workspacePath: string): Promise<OptimizeResult> {
    const beforeSize = await this.getStorageSize(workspacePath);

    const historyPath = path.join(
      workspacePath,
      ".devdiff",
      "memory",
      "snapshot-history.json"
    );

    let snapshots: Array<CodebaseSnapshot & { category?: string }> = [];
    if (fs.existsSync(historyPath)) {
      try {
        snapshots = JSON.parse(fs.readFileSync(historyPath, "utf-8"));
      } catch {
        // Empty
      }
    }

    const seenHashes = new Set<string>();
    const deduplicatedList: Array<CodebaseSnapshot & { category?: string }> = [];
    let deduplicatedCount = 0;

    for (const snapshot of snapshots) {
      if (snapshot.gitHash && seenHashes.has(snapshot.gitHash)) {
        deduplicatedCount++;
      } else {
        if (snapshot.gitHash) seenHashes.add(snapshot.gitHash);
        deduplicatedList.push(snapshot);
      }
    }

    if (fs.existsSync(historyPath)) {
      fs.writeFileSync(historyPath, JSON.stringify(deduplicatedList, null, 2), "utf-8");
    }

    const afterSize = await this.getStorageSize(workspacePath);
    const saved = Math.max(0, beforeSize - afterSize);

    return {
      beforeSize,
      afterSize,
      saved,
      deduplicated: deduplicatedCount,
    };
  }

  public static parseDate(input: string): Date {
    if (/^\d{2}-\d{2}$/.test(input)) {
      const year = new Date().getFullYear();
      const [month, day] = input.split("-").map(Number);
      return new Date(year, month - 1, day);
    }
    return new Date(input);
  }

  private static estimateStorage(snapshots: any[]): number {
    return snapshots.reduce((sum, s) => sum + (s.estimatedSize || 50000), 0);
  }

  public static formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  }

  private static countSnapshotsInRange(workspacePath: string, from: Date, to: Date): number {
    const historyPath = path.join(
      workspacePath,
      ".devdiff",
      "memory",
      "snapshot-history.json"
    );
    if (!fs.existsSync(historyPath)) return 0;
    try {
      const snapshots: CodebaseSnapshot[] = JSON.parse(fs.readFileSync(historyPath, "utf-8"));
      return snapshots.filter((s) => {
        const d = new Date(s.timestamp);
        return d >= from && d <= to;
      }).length;
    } catch {
      return 0;
    }
  }

  private static async getStorageSize(workspacePath: string): Promise<number> {
    const memoryPath = path.join(workspacePath, ".devdiff", "memory");
    if (!fs.existsSync(memoryPath)) return 0;

    let totalSize = 0;
    try {
      const files = fs.readdirSync(memoryPath);
      for (const file of files) {
        totalSize += fs.statSync(path.join(memoryPath, file)).size;
      }
    } catch {
      // Skip
    }
    return totalSize;
  }
}
