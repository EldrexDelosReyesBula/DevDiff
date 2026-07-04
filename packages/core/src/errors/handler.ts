import { DevDiffError } from "./index";

export interface RetryConfig {
  maxAttempts: number;
  backoffMs: number;
  backoffMultiplier: number;
  maxBackoffMs: number;
  retryableErrors: string[];
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  backoffMs: 1000,
  backoffMultiplier: 2,
  maxBackoffMs: 30000,
  retryableErrors: ["AI_001", "NET_001"],
};

/**
 * Execute a function with automatic retry on transient errors
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {},
): Promise<T> {
  const cfg = { ...DEFAULT_RETRY_CONFIG, ...config };
  let lastError: Error | null = null;
  let backoff = cfg.backoffMs;

  for (let attempt = 1; attempt <= cfg.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // Check if error is retryable
      if (error instanceof DevDiffError) {
        if (!cfg.retryableErrors.includes(error.code)) {
          throw error; // Non-retryable — throw immediately
        }
      }

      // Don't retry on last attempt
      if (attempt === cfg.maxAttempts) break;

      // Wait with backoff
      console.log(
        `⚠️ Attempt ${attempt}/${cfg.maxAttempts} failed. Retrying in ${backoff}ms...`,
      );
      console.log(`   Error: ${(error as Error).message}`);

      await sleep(backoff);
      backoff = Math.min(backoff * cfg.backoffMultiplier, cfg.maxBackoffMs);
    }
  }

  throw lastError!;
}

/**
 * Safe wrapper — never throws, always returns a result
 */
export async function safeExecute<T>(
  fn: () => Promise<T>,
  fallback: T,
): Promise<{ success: boolean; data: T; error?: Error }> {
  try {
    const data = await fn();
    return { success: true, data };
  } catch (error) {
    return { success: false, data: fallback, error: error as Error };
  }
}

/**
 * Execute with timeout
 */
export async function withTimeout<T>(
  fn: () => Promise<T>,
  timeoutMs: number,
  timeoutMessage: string = "Operation timed out",
): Promise<T> {
  return Promise.race([
    fn(),
    new Promise<T>((_, reject) =>
      setTimeout(
        () =>
          reject(
            new DevDiffError({
              code: "TIMEOUT_001",
              message: timeoutMessage,
              fix: "The operation took too long. Try with a smaller scope or check your AI provider.",
            }),
          ),
        timeoutMs,
      ),
    ),
  ]);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
