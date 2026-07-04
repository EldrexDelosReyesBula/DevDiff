import * as os from "os";

export interface SystemHealth {
  cpu: number; // Percent CPU usage (estimated or dynamic)
  ram: number; // RAM usage fraction (0-1)
  load: number; // 1-minute system load average
  canProcess: boolean;
  recommendation: string;
}

export class IDEGuardian {
  private static MAX_RAM_MB = 500;
  private static MAX_LOAD = 0.8;

  /**
   * Run a task asynchronously with non-blocking checks to prevent freezing the IDE main thread.
   */
  static async processSafely<T>(task: () => Promise<T>): Promise<T> {
    const health = this.checkSystemHealth();
    if (!health.canProcess) {
      throw new Error(
        `IDE Guardian: System resources are under high load. Recommendation: ${health.recommendation}`,
      );
    }

    // Wrap in setImmediate to allow event loop yielding
    return new Promise<T>((resolve, reject) => {
      setImmediate(() => {
        task().then(resolve).catch(reject);
      });
    });
  }

  /**
   * Check system performance metrics.
   */
  static checkSystemHealth(): SystemHealth {
    const memUsage = process.memoryUsage();
    const ramFraction = memUsage.heapUsed / (os.totalmem() || 1);
    const heapMb = Math.round(memUsage.heapUsed / 1024 / 1024);

    // Load average (1 min)
    let load = 0;
    try {
      const loads = os.loadavg();
      if (loads && loads.length > 0) {
        load = loads[0] / os.cpus().length; // Normalized by CPU count
      }
    } catch {
      load = 0.1; // Fallback for Windows where loadavg might not be fully functional/meaningful
    }

    // Simple CPU usage check
    const startUsage = process.cpuUsage();
    const startTime = Date.now();
    // Simulate tiny delay measurement or compute differential
    const cpuPercent = 5; // Placeholder/default for CLI executions

    const overRamLimit = heapMb > this.MAX_RAM_MB;
    const overLoadLimit = load > this.MAX_LOAD;
    const canProcess = !overRamLimit && !overLoadLimit;

    let recommendation = "System is healthy.";
    if (overRamLimit) {
      recommendation = `RAM usage high (${heapMb}MB > ${this.MAX_RAM_MB}MB limit). Try clearing memory or stopping background tasks.`;
    } else if (overLoadLimit) {
      recommendation = `System load average high (${Math.round(load * 100)}%). Defer intensive AI tasks or run in MVP Mode.`;
    }

    return {
      cpu: cpuPercent,
      ram: ramFraction,
      load,
      canProcess,
      recommendation,
    };
  }
}
