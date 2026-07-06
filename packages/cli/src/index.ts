import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import { COMMAND_REGISTRY, CommandDefinition } from './registry/command-registry';
import { CLIErrorHandler } from './errors/cli-error-handler';
import { generateVSCodeSchema, generateShellCompletions } from './autocomplete/config-autocomplete';
import { getVersion } from './commands/version';

import { initCommand } from "./commands/init";
import { generateCommand } from "./commands/generate";
import { watchCommand } from "./commands/watch";
import { reportCommand } from "./commands/report";
import { configCommand } from "./commands/config";
import { auditCommand } from "./commands/audit";
import { complianceCommand } from "./commands/compliance";
import { vibeCommand } from "./commands/vibe";
import { recoverCommand } from "./commands/recover";
import { versionCommand } from "./commands/version";
import { playgroundCommand } from "./commands/playground";
import { contextCommand } from "./commands/context";
import { discloseCommand } from "./commands/disclose";
import { monitorCommand } from "./commands/monitor";
import { mvpCommand } from "./commands/mvp";
import {
  authAddCommand,
  authListCommand,
  authRemoveCommand,
  authTestCommand,
  authRotateCommand,
} from "./commands/auth";
import { doctorCommand } from "./commands/doctor";
import { checkForESMSyntax } from "./commands/doctor";

async function resolveModuleTypeWarning(): Promise<void> {
  const pkgPath = path.join(process.cwd(), 'package.json');
  if (!fs.existsSync(pkgPath)) return;
  
  try {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    if (!pkg.type) {
      const hasESMImports = await checkForESMSyntax(process.cwd());
      if (hasESMImports) {
        console.log('💡 Tip: Your project uses ES modules but package.json has no "type" field.');
        console.log('   This causes a Node.js warning on every DevDiff run.');
        console.log('');
        console.log('   Fix: Add "type": "module" to package.json');
        console.log('   Run: npm pkg set type=module');
        console.log('');
        console.log('   Or let DevDiff fix it: devdiff doctor --fix');
      }
    }
  } catch {}
}
resolveModuleTypeWarning();

const program = new Command();

program
  .name('devdiff')
  .description('Privacy-first, BYOAI changelog intelligence')
  .version(getVersion(), '-v, --version', 'Show version')
  .helpOption('-h, --help', 'Show help')
  .addHelpCommand('help [command]', 'Show help for a command')
  .configureHelp({
    sortSubcommands: true,
    sortOptions: true,
  });

async function executeCommand(fullPath: string, args: any[]) {
  const [parent, sub] = fullPath.split(' ');
  switch (parent) {
    case 'init':
      return initCommand(args[0]);
    case 'generate':
      return generateCommand(args[0]);
    case 'watch':
      return watchCommand(args[0]);
    case 'report':
      return reportCommand(args[0]);
    case 'config':
      return configCommand();
    case 'disclose':
      return discloseCommand();
    case 'monitor':
      return monitorCommand();
    case 'recover':
      return recoverCommand(args[0]);
    case 'vibe':
      return vibeCommand(sub as any, args[0]);
    case 'compliance':
      return complianceCommand(sub as any, args[0]);
    case 'audit':
      return auditCommand(sub, args[0]);
    case 'context':
      return contextCommand(sub as any);
    case 'playground':
      return playgroundCommand(args[0]);
    case 'doctor':
      return doctorCommand(args[0]);
    case 'version':
      return versionCommand(args[0]);
    case 'mvp':
      return mvpCommand(sub as any, args[0]);
    case 'auth':
      if (sub === 'list') {
        return authListCommand();
      } else if (sub === 'add') {
        return authAddCommand(args[0], args[1]);
      } else if (sub === 'remove') {
        return authRemoveCommand(args[0]);
      } else if (sub === 'test') {
        return authTestCommand(args[0]);
      } else if (sub === 'rotate') {
        return authRotateCommand(args[0]);
      }
      break;
    case 'agentic': {
      const { agenticCommand } = await import("./commands/agentic");
      return agenticCommand(sub, args[0]);
    }
    case 'mcp': {
      const { mcpCommand } = await import("./commands/mcp");
      return mcpCommand(sub || 'serve', args[0]);
    }
    case 'plugin':
      console.log('ℹ️  DevDiff plugins are managed programmatically via MCP server extensions.');
      console.log('   CLI plugin management commands will be released in v1.0.6.');
      return;
    default:
      throw new Error(`Unknown command: ${fullPath}`);
  }
}

function registerCommands(commands: CommandDefinition[], parent: Command, pathPrefix = '') {
  for (const cmd of commands) {
    const command = parent
      .command(cmd.name)
      .description(cmd.description)
      .aliases(cmd.aliases || []);
    
    if (cmd.longDescription) {
      command.helpInformation = () => {
        return `${cmd.description}\n\n${cmd.longDescription}\n`;
      };
    }
    
    if (cmd.examples) {
      for (const example of cmd.examples) {
        command.addHelpText('after', `\nExample:\n  $ ${example}\n`);
      }
    }
    
    if (cmd.options) {
      for (const opt of cmd.options) {
        command.option(opt.flags, opt.description, opt.defaultValue);
      }
    }

    if (cmd.args) {
      for (const arg of cmd.args) {
        const argStr = arg.required ? `<${arg.name}>` : `[${arg.name}]`;
        command.argument(argStr, arg.description);
      }
    }
    
    const fullPathName = (pathPrefix + cmd.name).trim();

    if (cmd.validate) {
      command.hook('preAction', (thisCommand) => {
        const opts = thisCommand.opts();
        const result = cmd.validate!(opts);
        
        if (result.warnings.length > 0) {
          for (const warning of result.warnings) {
            console.log(`⚠️  ${warning}`);
          }
        }
        
        if (!result.valid) {
          console.log('');
          console.log('❌ Validation failed:');
          for (const error of result.errors) {
            console.log(`   • ${error}`);
          }
          if (result.suggestions.length > 0) {
            console.log('');
            console.log('   Suggestions:');
            for (const suggestion of result.suggestions) {
              console.log(`   • ${suggestion}`);
            }
          }
          console.log('');
          process.exit(2);
        }
      });
    }
    
    command.action(async (...actionArgs) => {
      try {
        let opts = command.opts();
        let parentCmd = command.parent;
        while (parentCmd) {
          opts = { ...parentCmd.opts(), ...opts };
          parentCmd = parentCmd.parent;
        }
        
        const argsForExecute = actionArgs
          .filter(arg => !(arg instanceof Command))
          .map(arg => {
            if (arg && typeof arg === 'object') {
              return { ...opts, ...arg };
            }
            return arg;
          });
        
        if (argsForExecute.length === 0 || typeof argsForExecute[argsForExecute.length - 1] !== 'object') {
          argsForExecute.push(opts);
        }

        await executeCommand(fullPathName, argsForExecute);
      } catch (error) {
        CLIErrorHandler.handle(error as Error, cmd.name);
      }
    });
    
    if (cmd.subcommands) {
      registerCommands(cmd.subcommands, command, fullPathName + ' ');
    }
  }
}

registerCommands(COMMAND_REGISTRY, program);

// ── Completions Command ──
program
  .command('completions <shell>')
  .description('Generate shell completion script')
  .action((shell: string) => {
    const valid = ['bash', 'zsh', 'fish', 'powershell'];
    if (!valid.includes(shell)) {
      console.log(`Invalid shell: ${shell}. Valid: ${valid.join(', ')}`);
      process.exit(1);
    }
    console.log(generateShellCompletions(shell as any));
  });

// ── Schema Command ──
program
  .command('schema')
  .description('Generate VS Code json settings schema for config')
  .action(() => {
    generateVSCodeSchema();
  });

async function main() {
  try {
    await program.parseAsync(process.argv);
  } catch (error) {
    CLIErrorHandler.handle(error as Error);
  }
}

main();

export { CLIOutputFormatter } from "./ui/output-formatter";
