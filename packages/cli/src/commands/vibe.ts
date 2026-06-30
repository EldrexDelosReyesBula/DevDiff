import pc from "picocolors";
import { VibeCoderGuardian } from "@eldrex/core";

export async function vibeStartCommand() {
  const guardian = new VibeCoderGuardian();
  await guardian.deleteSession(); // reset
  await guardian.saveSession(); // initialize a clean one

  console.log(pc.green("🚀 Vibe Session started"));
  console.log(pc.green("💾 Auto-checkpoint: every change saved locally"));
  console.log(pc.green("🤖 AI: ollama://llama3.2:3b (local, free)"));
}

export async function vibeStatusCommand() {
  const guardian = new VibeCoderGuardian();
  await guardian.loadSession();

  const report = guardian.generateReport();

  const durationMs = Date.now() - guardian.session.startedAt;
  const minutes = Math.floor(durationMs / 60000);
  const hours = Math.floor(minutes / 60);
  const durationStr = hours > 0 ? `${hours}h ${minutes % 60}m` : `${minutes}m`;

  const failedCalls = guardian.session.failures.length;
  const succeededCalls = guardian.session.aiCalls.filter(
    (c: any) => c.success,
  ).length;
  const recoveredCalls = guardian.session.aiCalls.filter(
    (c: any) =>
      c.success &&
      guardian.session.failures.some(
        (f: any) => f.checkpointId === c.checkpointId,
      ),
  ).length;

  console.log(pc.blue("📊 VIBE SESSION"));
  console.log(`├── Duration: ${durationStr}`);
  console.log(`├── Changes: ${guardian.session.changes.length}`);
  console.log(`├── Checkpoints: ${report.checkpointsCreated}`);
  console.log(
    `├── AI calls: ${succeededCalls} succeeded, ${failedCalls} failed, ${recoveredCalls} recovered`,
  );
  console.log(`├── Data loss: ${report.dataLossEvents} ✅`);
  console.log(`└── Recommendation: ${report.recommendations.join(", ")}`);
}

export async function vibeCommand(action: string) {
  if (action === "start") {
    await vibeStartCommand();
  } else if (action === "status") {
    await vibeStatusCommand();
  } else if (action === "stop") {
    const guardian = new VibeCoderGuardian();
    await guardian.deleteSession();
    console.log(pc.yellow("👋 Stopped vibe coding session."));
  } else {
    console.log(
      pc.red(`❌ Unknown action: ${action}. Use start, stop, or status.`),
    );
  }
}
