import { EventEmitter } from "events";

export interface DevDiffEvent {
  id: string;
  timestamp: string;
  source: "git" | "webhook" | "api" | "schedule" | "manual";
  gateway_version?: string;
  repository: {
    url?: string;
    path: string;
    branch: string;
  };
  change_range?: {
    from: string;
    to: string;
    commit_count?: number;
    file_count?: number;
  };
  config: {
    persona: string;
    formats: string[];
    depth?: "minimal" | "standard" | "deep" | "exhaustive";
    language?: string;
    ai_routing?: "local" | "cloud" | "auto";
    batchWindow?: number;
  };
}

export interface QueueConfig {
  strategy: "per-repo-sequential" | "global-fifo" | "priority";
  maxConcurrent: number;
  maxConcurrentPerRepo: number;
  stallTimeout: number; // Cancel if processing exceeds this
  backpressureThreshold: number; // Pause watchers when queue depth exceeds
}

export class PriorityQueue<T> {
  private items: { element: T; priority: number }[] = [];

  enqueue(element: T, priority: number) {
    const queueElement = { element, priority };
    let added = false;
    for (let i = 0; i < this.items.length; i++) {
      if (queueElement.priority > this.items[i].priority) {
        this.items.splice(i, 0, queueElement);
        added = true;
        break;
      }
    }
    if (!added) {
      this.items.push(queueElement);
    }
  }

  dequeue(): T | undefined {
    return this.items.shift()?.element;
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }

  size(): number {
    return this.items.length;
  }

  find(predicate: (element: T) => boolean): T | undefined {
    return this.items.map((i) => i.element).find(predicate);
  }
}

export class Semaphore {
  private permits: number;
  private queue: Array<() => void> = [];

  constructor(permits: number) {
    this.permits = permits;
  }

  async acquire(): Promise<{ release: () => void }> {
    if (this.permits > 0) {
      this.permits--;
      return { release: () => this.release() };
    }

    return new Promise((resolve) => {
      this.queue.push(() => {
        this.permits--;
        resolve({ release: () => this.release() });
      });
    });
  }

  private release(): void {
    this.permits++;
    const next = this.queue.shift();
    if (next) next();
  }
}

export class Batch {
  id: string;
  createdAt: number;
  repository: { path: string; branch: string };
  events: DevDiffEvent[];
  config: { batchWindow: number };

  constructor(event: DevDiffEvent) {
    this.id = event.id || String(Date.now());
    this.createdAt = Date.now();
    this.repository = {
      path: event.repository.path,
      branch: event.repository.branch,
    };
    this.events = [event];
    this.config = { batchWindow: event.config.batchWindow || 300000 }; // Default 5 mins
  }

  merge(event: DevDiffEvent) {
    this.events.push(event);
  }
}

export class TieredQueueEngine extends EventEmitter {
  private config: QueueConfig;
  private repoQueues: Map<string, PriorityQueue<Batch>> = new Map();
  private activeJobs: Map<
    string,
    { batch: Batch; status: string; result?: any }
  > = new Map();
  private semaphore: Semaphore;

  constructor(config: QueueConfig) {
    super();
    this.config = config;
    this.semaphore = new Semaphore(config.maxConcurrent);
  }

  async enqueue(event: DevDiffEvent): Promise<string> {
    const repoKey = this.getRepoKey(event.repository);

    if (!this.repoQueues.has(repoKey)) {
      this.repoQueues.set(repoKey, new PriorityQueue());
    }

    // Merge with existing batch if within window
    const existingBatch = this.findMergeableBatch(repoKey, event);
    if (existingBatch) {
      existingBatch.merge(event);
      return existingBatch.id;
    }

    const batch = new Batch(event);
    const queue = this.repoQueues.get(repoKey)!;
    queue.enqueue(batch, this.calculatePriority(event));

    // Backpressure check
    const totalQueueSize = Array.from(this.repoQueues.values()).reduce(
      (acc, q) => acc + q.size(),
      0,
    );
    if (totalQueueSize > this.config.backpressureThreshold) {
      this.emit("backpressure:activate");
    }

    // Process asynchronously
    this.processNext(repoKey);
    return batch.id;
  }

  private getRepoKey(repo: { path: string; branch: string }): string {
    return `${repo.path}:${repo.branch}`;
  }

  private findMergeableBatch(
    repoKey: string,
    event: DevDiffEvent,
  ): Batch | null {
    const queue = this.repoQueues.get(repoKey);
    if (!queue) return null;

    return (
      queue.find(
        (batch) =>
          batch.repository.path === event.repository.path &&
          batch.repository.branch === event.repository.branch &&
          Date.now() - batch.createdAt < batch.config.batchWindow,
      ) || null
    );
  }

  private calculatePriority(event: DevDiffEvent): number {
    const scores: Record<string, number> = {
      manual: 100,
      api: 80,
      git: 50,
      webhook: 50,
      schedule: 10,
    };
    return scores[event.source] || 50;
  }

  private async processNext(repoKey: string): Promise<void> {
    const queue = this.repoQueues.get(repoKey);
    if (!queue || queue.isEmpty()) return;

    // Acquire semaphore slot
    const slot = await this.semaphore.acquire();

    try {
      const batch = queue.dequeue();
      if (!batch) return;

      this.activeJobs.set(batch.id, { batch, status: "processing" });

      // Process with stall timeout limit
      const result = await Promise.race([
        this.processBatch(batch),
        this.timeout(this.config.stallTimeout, `Batch ${batch.id} stalled`),
      ]);

      this.activeJobs.set(batch.id, { batch, status: "completed", result });

      // Cleanup job after TTL (1 hour)
      setTimeout(() => this.activeJobs.delete(batch.id), 3600000);
    } catch (error: any) {
      this.emit("error", { repoKey, error });
    } finally {
      slot.release();
      // Continue processing next
      this.processNext(repoKey);
    }
  }

  private async processBatch(batch: Batch): Promise<any> {
    // Simulated heavy processing (AI routing / AST tracing)
    return new Promise((resolve) =>
      setTimeout(
        () => resolve({ success: true, processedEvents: batch.events.length }),
        100,
      ),
    );
  }

  private timeout(ms: number, message: string): Promise<never> {
    return new Promise((_, reject) =>
      setTimeout(() => reject(new Error(message)), ms),
    );
  }

  getJob(id: string) {
    return this.activeJobs.get(id);
  }
}
