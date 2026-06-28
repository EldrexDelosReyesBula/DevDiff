import pc from "picocolors";
import { VibeCoderGuardian } from "@eldrex/core";

export async function recoverCommand(options: { checkpoint: string }) {
  try {
    const guardian = new VibeCoderGuardian();
    await guardian.loadSession();
    await guardian.restoreCheckpoint(options.checkpoint);
  } catch (error: any) {
    console.error(pc.red(`\n❌ Error restoring checkpoint: ${error.message}`));
    process.exit(1);
  }
}
