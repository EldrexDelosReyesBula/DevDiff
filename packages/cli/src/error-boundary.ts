import { DevDiffError } from "@eldrex/core";

/**
 * Wrap every CLI command with this boundary
 * Ensures:
 * - Errors are formatted consistently
 * - Exit codes are correct
 * - Terminal state is always restored
 * - Crash reports are NEVER sent
 */
export async function cliErrorBoundary(
  command: () => Promise<void>,
): Promise<void> {
  let terminalCleanup: (() => void) | null = null;

  try {
    // Save terminal state
    if (process.stdin.isTTY) {
      const originalRawMode = process.stdin.isRaw;
      terminalCleanup = () => {
        if (process.stdin.setRawMode && !originalRawMode) {
          process.stdin.setRawMode(false);
        }
        if (process.stdin.isPaused()) {
          process.stdin.resume();
        }
      };
    }

    await command();
  } catch (error) {
    // Restore terminal FIRST
    terminalCleanup?.();

    if (error instanceof DevDiffError) {
      console.error(error.toCLIOutput());
      process.exitCode = error.exitCode;
    } else if (error instanceof Error) {
      console.error("");
      console.error(`❌ Unexpected Error: ${error.message}`);
      console.error("");
      console.error(
        "   This is an unexpected error. DevDiff does NOT send crash reports.",
      );
      console.error("   To help fix this, report it at:");
      console.error("   https://github.com/eldrex/devdiff/issues/new");
      console.error("");
      console.error("   Include:");
      console.error("   • DevDiff version: devdiff --version");
      console.error("   • Node version: node --version");
      console.error("   • OS: " + process.platform);
      console.error("   • What you were doing when this happened");
      console.error("");

      if (process.env.DEVVIFF_DEBUG) {
        console.error("   Stack trace (DEVVIFF_DEBUG enabled):");
        console.error(error.stack);
      }

      process.exitCode = 1;
    }
  } finally {
    // ALWAYS restore terminal
    terminalCleanup?.();

    // Ensure process exits (don't hang)
    if (process.exitCode !== undefined) {
      // Give async operations a moment to clean up
      setTimeout(() => process.exit(process.exitCode), 100);
    }
  }
}
