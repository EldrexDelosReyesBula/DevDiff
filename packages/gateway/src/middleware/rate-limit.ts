import { IncomingMessage, ServerResponse } from "http";

export class TokenBucketLimiter {
  private capacity: number;
  private refillRate: number; // tokens per millisecond
  private buckets: Map<string, { tokens: number; lastRefill: number }> =
    new Map();

  constructor(capacity = 60, refillPerMin = 60) {
    this.capacity = capacity;
    this.refillRate = refillPerMin / 60000; // refill rate per millisecond
  }

  /**
   * Evaluates if a request from an IP/token exceeds the limit.
   */
  handle(req: IncomingMessage, res: ServerResponse): boolean {
    const ip = req.socket.remoteAddress || "anonymous";
    const apiKey = (req.headers["x-api-key"] || ip) as string;

    const now = Date.now();
    let bucket = this.buckets.get(apiKey);

    if (!bucket) {
      bucket = { tokens: this.capacity, lastRefill: now };
      this.buckets.set(apiKey, bucket);
    } else {
      // Refill tokens based on elapsed time
      const elapsed = now - bucket.lastRefill;
      const addedTokens = elapsed * this.refillRate;
      bucket.tokens = Math.min(this.capacity, bucket.tokens + addedTokens);
      bucket.lastRefill = now;
    }

    if (bucket.tokens >= 1) {
      bucket.tokens -= 1;
      res.setHeader("X-RateLimit-Limit", this.capacity);
      res.setHeader("X-RateLimit-Remaining", Math.floor(bucket.tokens));
      return true;
    }

    res.statusCode = 429;
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Retry-After", "60");
    res.end(
      JSON.stringify({ error: "Too Many Requests: Rate limit exceeded." }),
    );
    return false;
  }
}
