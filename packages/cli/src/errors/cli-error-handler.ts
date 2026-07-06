import { COMMAND_REGISTRY } from '../registry/command-registry';

function findSimilarCommands(cmd: string): string[] {
  const normalized = cmd.toLowerCase().trim();
  return COMMAND_REGISTRY
    .map(c => c.name)
    .filter(name => name.includes(normalized) || normalized.includes(name));
}

function findSimilarFlags(flag: string, commandName?: string): string[] {
  const normalized = flag.toLowerCase().trim().replace(/^-+/, '');
  const cmdDef = COMMAND_REGISTRY.find(c => c.name === commandName);
  if (!cmdDef || !cmdDef.options) return [];
  return cmdDef.options
    .map(o => o.flags)
    .filter(flags => flags.toLowerCase().includes(normalized));
}

export class CLIErrorHandler {
  
  static handle(error: Error, command?: string): never {
    
    // ── Git Errors ──
    if (error.message.includes('not a git repository')) {
      console.log('');
      console.log('❌ Not a Git Repository');
      console.log('');
      console.log('   DevDiff requires a Git repository to track changes.');
      console.log('');
      console.log('   Quick fix:');
      console.log('   ┌─────────────────────────────────────────────┐');
      console.log('   │  git init                                    │');
      console.log('   │  git add .                                   │');
      console.log('   │  git commit -m "initial commit"              │');
      console.log('   │  devdiff init                                │');
      console.log('   │  devdiff generate                            │');
      console.log('   └─────────────────────────────────────────────┘');
      console.log('');
      process.exit(3);
    }
    
    // ── No Staged Changes ──
    if (error.message.includes('no staged changes') || error.message.includes('No changes detected')) {
      console.log('');
      console.log('ℹ️  No Staged Changes Detected');
      console.log('');
      console.log('   DevDiff analyzes files that have been staged with git add.');
      console.log('');
      console.log('   To stage changes:');
      console.log('   ┌─────────────────────────────────────────────┐');
      console.log('   │  git add .                    # Stage all    │');
      console.log('   │  git add src/auth.ts          # Stage one    │');
      console.log('   │  devdiff generate             # Analyze      │');
      console.log('   └─────────────────────────────────────────────┘');
      console.log('');
      console.log('   Or analyze past commits:');
      console.log('   ┌─────────────────────────────────────────────┐');
      console.log('   │  devdiff generate --since "24h"             │');
      console.log('   │  devdiff generate --since "HEAD~5..HEAD"    │');
      console.log('   └─────────────────────────────────────────────┘');
      console.log('');
      process.exit(0);
    }
    
    // ── AI Not Available ──
    if (error.message.includes('Ollama') && (error.message.includes('ECONNREFUSED') || error.message.includes('NotAvailable'))) {
      console.log('');
      console.log('❌ Ollama Not Running');
      console.log('');
      console.log('   DevDiff uses Ollama for local AI but it is not running.');
      console.log('');
      
      if (process.platform === 'win32') {
        console.log('   Windows:');
        console.log('   1. Open Start Menu → Search "Ollama" → Run the app');
        console.log('   2. Wait for the llama icon in the system tray');
        console.log('   3. Verify: ollama list');
      } else if (process.platform === 'darwin') {
        console.log('   macOS:');
        console.log('   1. Run: ollama serve');
        console.log('   2. Or: brew services start ollama');
      } else {
        console.log('   Linux:');
        console.log('   1. Run: sudo systemctl start ollama');
        console.log('   2. Or: ollama serve');
      }
      
      console.log('');
      console.log('   Or use template mode (no AI needed):');
      console.log('   devdiff generate --dry-run');
      console.log('');
      process.exit(4);
    }
    
    // ── Model Not Found ──
    if (error.message.includes('not found') && error.message.includes('model')) {
      const modelName = error.message.match(/model ['"]([^'"]+)['"]/)?.[1] || 'unknown';
      
      console.log('');
      console.log(`❌ Model Not Found: ${modelName}`);
      console.log('');
      console.log('   This model is not installed. Pull it first:');
      console.log(`   ollama pull ${modelName}`);
      console.log('');
      console.log('   Or see available models:');
      console.log('   ollama list');
      console.log('');
      console.log('   Recommended models for code analysis:');
      console.log('   • ollama pull llama3.2:3b    (fast, 2GB)');
      console.log('   • ollama pull qwen2.5-coder:7b  (better, 4GB)');
      console.log('   • ollama pull codellama:13b  (best, 7GB)');
      console.log('');
      process.exit(4);
    }
    
    // ── Timeout ──
    if (error.message.includes('timed out') || error.message.includes('timeout')) {
      console.log('');
      console.log('⏱️  AI Request Timed Out');
      console.log('');
      console.log('   The AI model took too long to respond.');
      console.log('');
      console.log('   Quick fixes:');
      console.log('   • Use --depth minimal for faster results');
      console.log('   • Stage fewer files: git add src/specific-dir/');
      console.log('   • Use a faster model: ollama pull llama3.2:1b');
      console.log('   • Increase timeout in .devdiff.config.js');
      console.log('');
      console.log('   Your changes are SAFE. Checkpoint was saved.');
      console.log('   Recover: devdiff recover --last');
      console.log('');
      process.exit(4);
    }
    
    // ── Invalid Flag ──
    if (error.message.includes('unknown option') || error.message.includes('unrecognized')) {
      const flag = error.message.match(/['"]([^'"]+)['"]/)?.[1] || '';
      
      console.log('');
      console.log(`❌ Unknown Option: ${flag}`);
      console.log('');
      console.log('   This flag is not recognized.');
      console.log('');
      console.log('   Check available options:');
      console.log(`   devdiff ${command || ''} --help`);
      console.log('');
      
      const similar = findSimilarFlags(flag, command);
      if (similar.length > 0) {
        console.log('   Did you mean?');
        for (const s of similar) {
          console.log(`   • ${s}`);
        }
        console.log('');
      }
      
      process.exit(2);
    }
    
    // ── Unknown Command ──
    if (error.message.includes('unknown command') || error.message.includes('not a command')) {
      const cmd = error.message.match(/['"]([^'"]+)['"]/)?.[1] || '';
      
      console.log('');
      console.log(`❌ Unknown Command: devdiff ${cmd}`);
      console.log('');
      console.log('   Available commands:');
      console.log('');
      
      for (const cat of ['core', 'ai', 'security', 'compliance', 'session', 'integration', 'utility']) {
        const commands = COMMAND_REGISTRY.filter(c => c.category === cat);
        if (commands.length > 0) {
          console.log(`   ${cat.toUpperCase()}:`);
          for (const c of commands) {
            console.log(`   • ${c.name.padEnd(20)} ${c.description}`);
          }
          console.log('');
        }
      }
      
      const similar = findSimilarCommands(cmd);
      if (similar.length > 0) {
        console.log('   Did you mean?');
        for (const s of similar) {
          console.log(`   • devdiff ${s}`);
        }
        console.log('');
      }
      
      process.exit(2);
    }
    
    // ── Fallback: Unknown Error ──
    console.log('');
    console.log('❌ Unexpected Error');
    console.log('');
    console.log(`   ${error.message}`);
    console.log('');
    console.log('   Run diagnostics: devdiff doctor');
    console.log('   Report issue: https://github.com/eldrex/devdiff/issues/new');
    console.log('');
    console.log('   Include:');
    console.log('   • devdiff version');
    console.log('   • node --version');
    console.log('   • ' + process.platform);
    console.log('   • The command you ran');
    console.log('');
    
    if (process.env.DEVDIFF_DEBUG) {
      console.log('   Stack trace (DEBUG mode):');
      console.log(error.stack);
    }
    
    process.exit(1);
  }
}
