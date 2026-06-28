export interface BullMQConfig {
  redis: {
    host: string;
    port: number;
    password?: string;
  };
  maxConcurrent?: number;
  maxJobsPerSecond?: number;
}

export class BullMQQueueAdapter {
  private queue: any;
  private worker: any;

  constructor(config: BullMQConfig) {
    console.log(
      `[BullMQ] Initializing Redis-backed queue on ${config.redis.host}:${config.redis.port}`,
    );
    this.init(config).catch((err) => {
      console.warn(
        "[BullMQ] Initialization failed, running in fallback mode:",
        err.message,
      );
    });
  }

  private async init(config: BullMQConfig) {
    try {
      // Dynamic import for ES Modules compatibility
      const bullMQ = await Function('return import("bullmq")')();
      const Queue = bullMQ.Queue;
      const Worker = bullMQ.Worker;

      this.queue = new Queue("devdiff-events", {
        connection: config.redis,
        defaultJobOptions: {
          attempts: 3,
          backoff: { type: "exponential", delay: 1000 },
          removeOnComplete: { age: 3600 * 24 },
          removeOnFail: { age: 3600 * 24 * 7 },
        },
      });

      this.worker = new Worker(
        "devdiff-events",
        async (job: any) => this.processJob(job),
        {
          connection: config.redis,
          concurrency: config.maxConcurrent || 4,
          limiter: {
            max: config.maxJobsPerSecond || 10,
            duration: 1000,
          },
        },
      );

      if (this.worker.opts) {
        this.worker.opts.group = {
          maxConcurrency: 1, // Sequential per group
        };
      }
    } catch {
      console.warn(
        "[BullMQ] bullmq package not installed. Running in mock/fallback mode.",
      );
    }
  }

  private async processJob(job: any): Promise<any> {
    console.log(`[BullMQ] Processing job ${job.id}:`, job.data);
    return { success: true };
  }

  async addJob(name: string, data: any, groupId: string): Promise<void> {
    if (this.queue) {
      await this.queue.add(name, data, { jobId: groupId });
    } else {
      console.log(`[BullMQ Mock] Job added: ${name}`, data);
    }
  }
}
