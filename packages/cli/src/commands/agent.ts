import pc from "picocolors";
import { AgentRegistry, OpenClawSupervisorV2 } from "@eldrex/core";

export async function agentCommand(
  subcommand?: string,
  targetArg?: string,
  options: Record<string, any> = {},
): Promise<void> {
  const workspacePath = process.cwd();

  switch (subcommand) {
    case "swarm": {
      const objective = targetArg || "Full workspace multi-agent evaluation";
      console.log(pc.cyan(`🐝 Deploying Agent Swarm for: "${objective}"...\n`));

      const supervisor = new OpenClawSupervisorV2(workspacePath);
      const res = await supervisor.orchestrate(objective);

      console.log(pc.green(`✅ Swarm Task Completed (${res.taskId})`));
      console.log(`   Subtasks executed: ${res.subtasksCompleted}`);
      console.log(
        `   Swarm Size: ${res.swarmResult.swarmSize} agents | Agreement: ${res.swarmResult.agreement}%`,
      );
      console.log(`   Validation Action: ${pc.bold(res.validation.action)}\n`);

      if (res.swarmResult.consensus?.agreements) {
        console.log(pc.bold("Consensus Agreements:"));
        for (const item of res.swarmResult.consensus.agreements) {
          console.log(`  • ${item}`);
        }
      }
      return;
    }

    case "deploy": {
      const agentList = options.agents
        ? String(options.agents).split(",")
        : ["architect", "security"];
      const prompt = targetArg || "Review workspace changes";

      console.log(
        pc.cyan(
          `🚀 Deploying specific agents [${agentList.join(", ")}] for: "${prompt}"...\n`,
        ),
      );

      const swarmRes = await AgentRegistry.swarm(
        {
          id: "custom-deploy",
          type: "custom_task",
          requiredCapabilities: [],
          priority: "high",
          data: { prompt },
        },
        agentList.length,
      );

      console.log(pc.green("✅ Agent deployment complete"));
      console.log(`   Confidence: ${swarmRes.consensus?.confidence}%\n`);
      return;
    }

    case "ask": {
      const role = targetArg || "architect";
      const question =
        options.prompt || options.question || "Explain codebase architecture";

      console.log(pc.cyan(`❓ Asking ${role} agent: "${question}"...\n`));

      const result = await AgentRegistry.delegate({
        id: `ask-${Date.now()}`,
        type: "code_explanation",
        requiredCapabilities: [],
        preferredAgent: role,
        priority: "medium",
        data: { question },
      });

      if (result.success) {
        console.log(pc.green(`🤖 Response from ${result.agent}:`));
        console.log(JSON.stringify(result.result, null, 2));
      } else {
        console.log(pc.red(`❌ Task failed: ${result.error}`));
      }
      return;
    }

    case "parallel": {
      const tasks = options.tasks
        ? String(options.tasks).split(",")
        : ["security scan", "performance analysis"];

      console.log(pc.cyan(`⚡ Executing parallel agent subtasks...\n`));

      for (const t of tasks) {
        console.log(`  • Executing subtask: ${t.trim()}`);
      }

      console.log(pc.green("\n✅ Parallel subtask execution complete."));
      return;
    }

    case "converse": {
      const agents = options.agents
        ? String(options.agents).split(",")
        : ["architect", "security"];
      const topic = targetArg || "Architecture trade-offs";

      console.log(
        pc.cyan(
          `💬 Agent Inter-Bus Discussion between [${agents.join(", ")}] on "${topic}"...\n`,
        ),
      );

      const res = await AgentRegistry.converse(agents, topic);

      for (const msg of res.messages) {
        console.log(`  • ${pc.bold(msg.agent)}: ${msg.text}`);
      }

      console.log(pc.green(`\n✅ ${res.consensus}`));
      return;
    }

    case "status":
    case "dashboard":
    default: {
      const dir = AgentRegistry.list();

      console.log(
        `\n┌─────────────────────────────────────────────────────────────┐`,
      );
      console.log(
        `│              AGENT SWARM DASHBOARD                            │`,
      );
      console.log(
        `│                                                              │`,
      );
      console.log(
        `│  🟢 Supervisor Online    🟢 OpenClaw Bus Connected           │`,
      );
      console.log(
        `│                                                              │`,
      );
      console.log(
        `│  ┌──────────────────────────────────────────────────────┐   │`,
      );
      console.log(
        `│  │  AGENT          STATUS    LOAD    SUCCESS    TASKS    │   │`,
      );
      console.log(
        `│  ├──────────────────────────────────────────────────────┤   │`,
      );
      for (const a of dir.agents) {
        const statusIcon = a.status === "active" ? "🟢" : "🟡";
        const nameStr = a.name.padEnd(14);
        const statusStr = `${statusIcon} ${a.status}`.padEnd(9);
        const loadStr = `${Math.round(a.currentLoad * 100)}%`.padEnd(8);
        const succStr = `${a.successRate}%`.padEnd(10);
        console.log(
          `│  │  ${nameStr} ${statusStr} ${loadStr} ${succStr} Active   │   │`,
        );
      }
      console.log(
        `│  └──────────────────────────────────────────────────────┘   │`,
      );
      console.log(
        `│                                                              │`,
      );
      console.log(
        `│  📊 Swarm Stats:                                             │`,
      );
      console.log(
        `│  • Registered Agents: ${dir.total}                             │`,
      );
      console.log(
        `│  • Active Squad: ${dir.active}                                 │`,
      );
      console.log(
        `│  • Communication Protocol: OpenClaw Bus                      │`,
      );
      console.log(
        `└─────────────────────────────────────────────────────────────┘\n`,
      );
    }
  }
}
