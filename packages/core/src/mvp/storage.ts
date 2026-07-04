import * as fs from "fs/promises";
import * as path from "path";
import { generateChangelog } from "../generators/changelog";

export interface MVPEntry {
  id: string;
  timestamp: string;
  status: "queued" | "processed" | "failed";
  change_range: {
    from: string;
    to: string;
    commits: number;
    files: number;
    additions: number;
    deletions: number;
  };
  template_summary: string;
  diff_snapshot: string; // base64 encoded diff
  context_snapshot?: string;
  retry_count: number;
  max_retries: number;
  error?: string;
  changelog?: string;
}

export class MVPStorage {
  private static getMVPDir(repoPath: string): string {
    return path.resolve(repoPath, ".devdiff/mvp");
  }

  static async generateId(repoPath: string): Promise<string> {
    const dir = this.getMVPDir(repoPath);
    await fs.mkdir(dir, { recursive: true });
    const files = await fs.readdir(dir).catch(() => []);

    const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    let maxNum = 0;
    for (const f of files) {
      if (f.startsWith(`mvp-${today}-`) && f.endsWith(".json")) {
        const parts = f.split("-");
        const numPart = parseInt(parts[2].replace(".json", ""), 10);
        if (!isNaN(numPart) && numPart > maxNum) {
          maxNum = numPart;
        }
      }
    }

    const nextNum = (maxNum + 1).toString().padStart(3, "0");
    return `mvp-${today}-${nextNum}`;
  }

  static async saveMVP(repoPath: string, entry: MVPEntry): Promise<void> {
    const dir = this.getMVPDir(repoPath);
    await fs.mkdir(dir, { recursive: true });
    const filePath = path.join(dir, `${entry.id}.json`);
    await fs.writeFile(filePath, JSON.stringify(entry, null, 2), "utf-8");
  }

  static async listMVP(repoPath: string): Promise<MVPEntry[]> {
    const dir = this.getMVPDir(repoPath);
    try {
      const files = await fs.readdir(dir);
      const entries: MVPEntry[] = [];
      for (const f of files) {
        if (f.endsWith(".json")) {
          try {
            const raw = await fs.readFile(path.join(dir, f), "utf-8");
            entries.push(JSON.parse(raw));
          } catch {}
        }
      }
      // Sort entries by timestamp desc
      return entries.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
    } catch {
      return [];
    }
  }

  static async processMVP(repoPath: string, id: string): Promise<MVPEntry> {
    const dir = this.getMVPDir(repoPath);
    const filePath = path.join(dir, `${id}.json`);

    const raw = await fs.readFile(filePath, "utf-8");
    const entry: MVPEntry = JSON.parse(raw);

    if (entry.status === "processed") {
      return entry;
    }

    try {
      const diffText = Buffer.from(entry.diff_snapshot, "base64").toString(
        "utf-8",
      );

      const result = await generateChangelog({
        diffText,
        repoPath,
        skipVerification: false,
      });

      entry.status = "processed";
      entry.changelog = result.formattedOutput;
      entry.error = undefined;
    } catch (err: any) {
      entry.retry_count++;
      if (entry.retry_count >= entry.max_retries) {
        entry.status = "failed";
      }
      entry.error = err.message || String(err);
    }

    await fs.writeFile(filePath, JSON.stringify(entry, null, 2), "utf-8");
    return entry;
  }

  static async clearMVP(repoPath: string, clearAll = false): Promise<void> {
    const dir = this.getMVPDir(repoPath);
    try {
      const files = await fs.readdir(dir);
      for (const f of files) {
        if (f.endsWith(".json")) {
          const filePath = path.join(dir, f);
          if (clearAll) {
            await fs.rm(filePath, { force: true });
          } else {
            try {
              const raw = await fs.readFile(filePath, "utf-8");
              const entry: MVPEntry = JSON.parse(raw);
              if (entry.status === "processed" || entry.status === "failed") {
                await fs.rm(filePath, { force: true });
              }
            } catch {}
          }
        }
      }
    } catch {}
  }
}
