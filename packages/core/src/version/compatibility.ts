import type { DevDiffConfig } from "../config/schema";

export interface CompatibilityResult {
  compatible: boolean;
  warning?: string;
  error?: string;
}

/**
 * Compare two semver strings by their individual parts.
 * Returns { major, minor, patch } or null on parse failure.
 */
function parseSemver(v: string): { major: number; minor: number; patch: number } | null {
  // Strip leading ^ ~ >= etc.
  const cleaned = v.replace(/^[\^~>=<]+/, "").trim();
  const match = cleaned.match(/^(\d+)\.(\d+)\.(\d+)/);
  if (!match) return null;
  return {
    major: parseInt(match[1], 10),
    minor: parseInt(match[2], 10),
    patch: parseInt(match[3], 10),
  };
}

/**
 * Checks whether the running CLI version is compatible with the
 * `version` field declared in the project's `.devdiff.config.js`.
 *
 * Rules:
 *  - Major mismatch → incompatible (hard error)
 *  - Running minor < required minor → compatible with warning
 *  - Otherwise → fully compatible
 *
 * @param config         The loaded DevDiff config object.
 * @param currentVersion The CLI version string (e.g. "1.0.3").
 */
export function checkConfigCompatibility(
  config: Partial<DevDiffConfig> & { version?: string },
  currentVersion: string,
): CompatibilityResult {
  const configVersion = config.version;

  // No version pinning in config — always compatible.
  if (!configVersion) {
    return { compatible: true };
  }

  const current = parseSemver(currentVersion);
  const required = parseSemver(configVersion);

  if (!current || !required) {
    // Unparseable — allow with a warning.
    return {
      compatible: true,
      warning: `Could not parse version strings (config: "${configVersion}", current: "${currentVersion}"). Proceeding anyway.`,
    };
  }

  // Major version MUST match.
  if (current.major !== required.major) {
    return {
      compatible: false,
      error:
        `Config requires v${required.major}.x but running v${currentVersion}. ` +
        `Install @eldrex/cli@${required.major}.x or update your config version field.`,
    };
  }

  // If running on an older minor than the config targets, warn but allow.
  if (current.minor < required.minor) {
    return {
      compatible: true,
      warning:
        `Config targets v${configVersion}+. Some features may not be available in v${currentVersion}. ` +
        `Consider upgrading: npm install -g @eldrex/cli@latest`,
    };
  }

  return { compatible: true };
}
