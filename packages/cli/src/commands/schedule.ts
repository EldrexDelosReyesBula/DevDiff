import { BackgroundScheduler } from "@eldrex/core";
import pc from "picocolors";

export async function scheduleCommand(subcommand: string = "list", options: any = {}) {
  const scheduler = new BackgroundScheduler(process.cwd());
  await scheduler.initialize();

  switch (subcommand) {
    case "list": {
      const schedules = scheduler.listSchedules();
      console.log(`\n${pc.cyan("[lucide:calendar]")} ${pc.bold("DevDiff Active Background Schedules")}`);
      console.log(pc.gray("──────────────────────────────────────────────"));
      if (schedules.length === 0) {
        console.log("No active schedules configured.");
        return;
      }

      schedules.forEach((s) => {
        const status = s.enabled ? pc.green("[ACTIVE]") : pc.gray("[DISABLED]");
        console.log(`${status} ${pc.bold(s.name)} (${pc.cyan(s.id)})`);
        console.log(`   Cron: ${pc.white(s.cron)} | Action: ${pc.white(s.action)}`);
        console.log(`   Next Run: ${pc.white(s.nextRun)}\n`);
      });
      break;
    }

    case "enable": {
      if (!options.id) {
        console.log(`${pc.red("[lucide:alert-circle]")} Please provide schedule ID using --id`);
        return;
      }
      scheduler.enableSchedule(options.id, true);
      console.log(`${pc.green("[lucide:check-circle]")} Schedule ${pc.cyan(options.id)} enabled.`);
      break;
    }

    case "disable": {
      if (!options.id) {
        console.log(`${pc.red("[lucide:alert-circle]")} Please provide schedule ID using --id`);
        return;
      }
      scheduler.enableSchedule(options.id, false);
      console.log(`${pc.gray("[lucide:pause]")} Schedule ${pc.cyan(options.id)} disabled.`);
      break;
    }

    default: {
      console.log(`${pc.red("[lucide:alert-circle]")} Unknown schedule subcommand: ${subcommand}`);
      console.log("Valid subcommands: list, enable, disable");
    }
  }
}
