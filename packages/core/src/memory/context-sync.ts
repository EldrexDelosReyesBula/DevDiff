import * as fs from "fs";
import * as path from "path";
import { UnifiedContext } from "../context/unified-context";
import { PersistentMemory } from "./persistent-memory";

export interface SyncChange {
  type: string;
  detail: string;
}

export interface SyncResult {
  synchronized: boolean;
  changes: SyncChange[];
  memoryAge: number;
  knowledgeAge: number;
}

export class ContextMemorySync {
  /**
   * Keep memory in sync with SKILL.md changes.
   * When SKILL.md is updated, re-index affected parts.
   */
  static async synchronize(workspacePath: string): Promise<SyncResult> {
    const knowledge = await UnifiedContext.load(workspacePath);
    const memory = new PersistentMemory(workspacePath);
    await memory.initialize();

    const changes: SyncChange[] = [];

    // ── Check 1: Project identity synchronized ──
    if (knowledge.project.name) {
      changes.push({
        type: "identity",
        detail: `Project name synchronized: "${knowledge.project.name}"`,
      });
    }

    // ── Check 2: Anti-patterns synchronized ──
    if (
      knowledge.preferences?.antiPatterns &&
      knowledge.preferences.antiPatterns.length > 0
    ) {
      changes.push({
        type: "anti-patterns",
        detail: `${knowledge.preferences.antiPatterns.length} anti-pattern(s) synchronized from SKILL.md`,
      });
    }

    // ── Check 3: Naming conventions synchronized ──
    if (
      knowledge.conventions &&
      Object.keys(knowledge.conventions).length > 0
    ) {
      changes.push({
        type: "conventions",
        detail: "Naming conventions synchronized from SKILL.md",
      });
    }

    // ── Apply changes to sync record ──
    if (changes.length > 0) {
      await this.setLastSyncTime(workspacePath, Date.now());
    }

    const lastSyncTime = this.getLastSyncTime(workspacePath);
    const memoryAge = Date.now() - (lastSyncTime || Date.now());
    const knowledgeAge = Date.now() - new Date(knowledge.lastUpdated).getTime();

    return {
      synchronized: changes.length > 0,
      changes,
      memoryAge,
      knowledgeAge,
    };
  }

  /**
   * Auto-sync on every generation
   */
  static async autoSync(workspacePath: string): Promise<void> {
    const skillPath = path.join(workspacePath, "SKILL.md");
    const contextPath = path.join(workspacePath, ".devdiff", "context.md");

    const lastSync = this.getLastSyncTime(workspacePath);
    const skillModified = fs.existsSync(skillPath)
      ? fs.statSync(skillPath).mtimeMs
      : 0;
    const contextModified = fs.existsSync(contextPath)
      ? fs.statSync(contextPath).mtimeMs
      : 0;

    if (skillModified > lastSync || contextModified > lastSync) {
      await this.synchronize(workspacePath);
      await this.setLastSyncTime(workspacePath, Date.now());
    }
  }

  private static getLastSyncTime(workspacePath: string): number {
    const syncFile = path.join(
      workspacePath,
      ".devdiff",
      "memory",
      ".last-sync",
    );
    try {
      return parseInt(fs.readFileSync(syncFile, "utf-8"), 10);
    } catch {
      return 0;
    }
  }

  private static async setLastSyncTime(
    workspacePath: string,
    time: number,
  ): Promise<void> {
    const syncFile = path.join(
      workspacePath,
      ".devdiff",
      "memory",
      ".last-sync",
    );
    const dir = path.dirname(syncFile);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(syncFile, time.toString(), "utf-8");
  }
}
