import * as os from "os";
import * as fs from "fs";
import { execSync } from "child_process";

export interface PerformanceConfig {
  maxMemoryMB: number;
  maxFilesPerAnalysis: number;
  maxConcurrentChunks: number;
  useIncrementalDiffing: boolean;
  cacheASTRuns: boolean;
  disableBackgroundAnalysis: boolean;
  aiModelPreference: "smallest" | "balanced" | "best";
  promptCompressionLevel: "aggressive" | "moderate" | "minimal";
  streamOutput: boolean;
  workerThreads: number;
  gcInterval: number;
  pauseOnBattery: boolean;
  pauseOnThermal: boolean;
  idleTimeout: number;
}

export interface DeviceProfile {
  tier: "low" | "medium" | "high";
  totalRAM: number; // GB
  cpuCores: number;
  cpuModel: string;
  isLaptop: boolean;
  onBattery: boolean;
  estimatedBatteryRemaining: number; // minutes
  thermalState: "normal" | "warm" | "hot" | "critical";
}

export class LowEndOptimizer {
  /**
   * Detect device hardware capabilities
   */
  static detect(): DeviceProfile {
    const totalRAM = Math.round(os.totalmem() / (1024 * 1024 * 1024));
    const cpus = os.cpus();
    const cpuCores = cpus.length;
    const cpuModel = cpus[0]?.model || "Unknown";

    let tier: "low" | "medium" | "high" = "medium";
    if (totalRAM <= 4 || cpuCores <= 2) {
      tier = "low";
    } else if (totalRAM >= 16 && cpuCores >= 8) {
      tier = "high";
    }

    const onBattery = this.detectBattery();
    const estimatedBatteryRemaining = this.estimateBattery();
    const thermalState = this.detectThermalState();

    return {
      tier,
      totalRAM,
      cpuCores,
      cpuModel,
      isLaptop: this.isLaptop(),
      onBattery,
      estimatedBatteryRemaining,
      thermalState,
    };
  }

  /**
   * Apply optimized performance settings based on device profile
   */
  static optimize(profile: DeviceProfile): PerformanceConfig {
    const configs: Record<string, PerformanceConfig> = {
      low: {
        maxMemoryMB: 128,
        maxFilesPerAnalysis: 100,
        maxConcurrentChunks: 1,
        useIncrementalDiffing: true,
        cacheASTRuns: true,
        disableBackgroundAnalysis: true,
        aiModelPreference: "smallest",
        promptCompressionLevel: "aggressive",
        streamOutput: true,
        workerThreads: 1,
        gcInterval: 60000,
        pauseOnBattery: true,
        pauseOnThermal: true,
        idleTimeout: 300000,
      },
      medium: {
        maxMemoryMB: 256,
        maxFilesPerAnalysis: 500,
        maxConcurrentChunks: 2,
        useIncrementalDiffing: true,
        cacheASTRuns: true,
        disableBackgroundAnalysis: false,
        aiModelPreference: "balanced",
        promptCompressionLevel: "moderate",
        streamOutput: true,
        workerThreads: 2,
        gcInterval: 120000,
        pauseOnBattery: false,
        pauseOnThermal: true,
        idleTimeout: 600000,
      },
      high: {
        maxMemoryMB: 512,
        maxFilesPerAnalysis: 5000,
        maxConcurrentChunks: 4,
        useIncrementalDiffing: true,
        cacheASTRuns: true,
        disableBackgroundAnalysis: false,
        aiModelPreference: "best",
        promptCompressionLevel: "minimal",
        streamOutput: true,
        workerThreads: 4,
        gcInterval: 300000,
        pauseOnBattery: false,
        pauseOnThermal: false,
        idleTimeout: 0,
      },
    };

    return configs[profile.tier];
  }

  /**
   * Monitor device state and notify on critical changes
   */
  static monitor(callback: (profile: DeviceProfile) => void): NodeJS.Timeout {
    return setInterval(() => {
      const current = this.detect();
      if (current.thermalState === "critical") {
        console.warn("[lucide:alert-triangle] Device thermal critical — throttling DevDiff tasks");
      }
      if (current.onBattery && current.estimatedBatteryRemaining < 30) {
        console.warn("[lucide:battery-charging] Battery low — entering power saving mode");
      }
      callback(current);
    }, 30000);
  }

  private static detectBattery(): boolean {
    try {
      if (process.platform === "darwin") {
        const output = execSync("pmset -g batt", { encoding: "utf-8" });
        return output.includes("discharging");
      }
      if (process.platform === "linux") {
        const output = execSync("upower -i /org/freedesktop/UPower/devices/battery_BAT0", { encoding: "utf-8" });
        return output.includes("discharging");
      }
      if (process.platform === "win32") {
        const output = execSync("wmic path Win32_Battery get BatteryStatus", { encoding: "utf-8" });
        return output.includes("1");
      }
    } catch (e) {
      // ignore
    }
    return false;
  }

  private static estimateBattery(): number {
    try {
      if (process.platform === "darwin") {
        const output = execSync("pmset -g batt", { encoding: "utf-8" });
        const match = output.match(/(\d+):(\d+)/);
        if (match) return parseInt(match[1]) * 60 + parseInt(match[2]);
      }
    } catch (e) {
      // ignore
    }
    return 120;
  }

  private static detectThermalState(): "normal" | "warm" | "hot" | "critical" {
    try {
      if (process.platform === "darwin") {
        const output = execSync("pmset -g therm", { encoding: "utf-8" });
        if (output.includes("critical")) return "critical";
        if (output.includes("high")) return "hot";
        if (output.includes("mid")) return "warm";
      }
      if (process.platform === "linux" && fs.existsSync("/sys/class/thermal/thermal_zone0/temp")) {
        const temp = fs.readFileSync("/sys/class/thermal/thermal_zone0/temp", "utf-8");
        const tempC = parseInt(temp) / 1000;
        if (tempC > 90) return "critical";
        if (tempC > 75) return "hot";
        if (tempC > 60) return "warm";
      }
    } catch (e) {
      // ignore
    }
    return "normal";
  }

  private static isLaptop(): boolean {
    try {
      if (process.platform === "darwin") {
        const output = execSync("pmset -g batt", { encoding: "utf-8" });
        return !output.includes("No battery");
      }
      if (process.platform === "linux") {
        return fs.existsSync("/sys/class/power_supply/BAT0");
      }
    } catch (e) {
      // ignore
    }
    return false;
  }
}
