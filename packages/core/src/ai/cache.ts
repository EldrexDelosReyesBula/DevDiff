import * as fs from "fs/promises";
import * as path from "path";
import * as crypto from "crypto";
import { AIExplanationResult } from "./providers/base";

export interface CacheEntry {
  timestamp: string;
  result: AIExplanationResult;
  provider: string;
  model: string;
}

export class ExplanationCache {
  private cachePath: string;
  private enabled: boolean;
  private memoryCache: Record<string, CacheEntry> = {};

  constructor(enabled = true, cachePath = ".devdiff/cache.json") {
    this.enabled = enabled;
    this.cachePath = cachePath;
  }

  private hashDiff(diffText: string): string {
    return crypto.createHash("sha256").update(diffText).digest("hex");
  }

  async load(): Promise<void> {
    if (!this.enabled) return;
    try {
      const dir = path.dirname(this.cachePath);
      await fs.mkdir(dir, { recursive: true });

      const content = await fs.readFile(this.cachePath, "utf-8");
      this.memoryCache = JSON.parse(content);
    } catch {
      this.memoryCache = {};
    }
  }

  async get(diffText: string): Promise<CacheEntry | null> {
    if (!this.enabled) return null;

    const hash = this.hashDiff(diffText);
    if (Object.keys(this.memoryCache).length === 0) {
      await this.load();
    }

    return this.memoryCache[hash] || null;
  }

  async set(
    diffText: string,
    entry: Omit<CacheEntry, "timestamp">,
  ): Promise<void> {
    if (!this.enabled) return;

    const hash = this.hashDiff(diffText);
    this.memoryCache[hash] = {
      ...entry,
      timestamp: new Date().toISOString(),
    };

    try {
      const dir = path.dirname(this.cachePath);
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(
        this.cachePath,
        JSON.stringify(this.memoryCache, null, 2),
        "utf-8",
      );
    } catch (err) {
      console.warn("Failed to save explanation cache to disk:", err);
    }
  }
}
