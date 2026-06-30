/**
 * DevDiff Version Immutability Guarantee
 *
 * Every published version is FROZEN forever.
 * No auto-updates. No breaking changes without a major version bump.
 * Users explicitly choose when to upgrade.
 */

export const VERSION_GUARANTEE = {
  /** Every published npm version is immutable — content never changes after release. */
  immutable: true,

  /** DevDiff will never silently update itself. */
  autoUpdate: false,

  /** Current package version — set by the build process. */
  version: "1.0.3",

  /** How users can interact with version management. */
  upgrade: {
    command: "npm install @eldrex/cli@latest",
    check: "npx devdiff version --check",
    info: "npx devdiff version --info",
    changelog: "npx devdiff version --changelog",
  },

  /**
   * Version support policy:
   * - latest:   Full support (fixes + features)
   * - previous: Critical security patches for 12 months
   * - older:    Documentation available forever, no active support
   */
  support: {
    latest: "Full support (fixes, features)",
    previous: "Critical security patches for 12 months",
    older: "Documentation available forever, no active support",
  },

  /**
   * These things NEVER happen in DevDiff:
   */
  never: [
    "Auto-update without user consent",
    "Silent breaking changes",
    "Deprecation without migration guide",
    "Removal of features in same major version",
    "Config file incompatibility in same major version",
  ],
} as const;

export type VersionGuarantee = typeof VERSION_GUARANTEE;
