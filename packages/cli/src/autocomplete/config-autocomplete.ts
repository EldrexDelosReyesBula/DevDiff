import * as fs from 'fs';
import * as path from 'path';

export const CONFIG_SCHEMA = {
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "DevDiff Configuration",
  "description": "Configuration schema for DevDiff v1.0.5",
  "type": "object",
  "properties": {
    "version": {
      "type": "string",
      "description": "DevDiff version this config targets",
      "default": "1.0.5",
      "examples": ["1.0.0", "1.0.5"]
    },
    "ai": {
      "type": "object",
      "description": "AI provider configuration",
      "properties": {
        "providers": {
          "type": "array",
          "description": "AI providers in priority order",
          "items": {
            "type": "object",
            "properties": {
              "name": {
                "type": "string",
                "description": "Human-readable name for this provider"
              },
              "url": {
                "type": "string",
                "description": "Provider URL. Format: provider://model",
                "examples": [
                  "ollama://llama3.2:3b",
                  "ollama://qwen2.5-coder:7b",
                  "openai://gpt-4o-mini",
                  "anthropic://claude-3-haiku",
                  "gemini://gemini-1.5-flash"
                ]
              },
              "apiKey": {
                "type": "string",
                "description": "API key (use process.env.MY_KEY for security)",
                "examples": ["process.env.OPENAI_API_KEY"]
              },
              "priority": {
                "type": "number",
                "description": "Priority (1 = highest)",
                "minimum": 1,
                "default": 1
              },
              "maxTokens": {
                "type": "number",
                "description": "Maximum tokens per request",
                "minimum": 256,
                "maximum": 128000,
                "default": 4096
              },
              "timeout": {
                "type": "number",
                "description": "Timeout in milliseconds",
                "minimum": 5000,
                "maximum": 600000,
                "default": 30000
              }
            },
            "required": ["url"]
          }
        },
        "routing": {
          "type": "object",
          "description": "AI routing strategy",
          "properties": {
            "strategy": {
              "type": "string",
              "enum": ["priority", "cost-aware", "latency", "capability"],
              "description": "How to choose which provider to use"
            },
            "complexityThreshold": {
              "type": "number",
              "description": "Complexity score (0-1) above which to use better models",
              "minimum": 0,
              "maximum": 1,
              "default": 0.5
            },
            "localOnly": {
              "type": "boolean",
              "description": "Never use cloud providers",
              "default": false
            },
            "maxDailyCost": {
              "type": "number",
              "description": "Maximum daily spend on cloud AI (USD)",
              "default": 0.50
            }
          }
        }
      }
    },
    "security": {
      "type": "object",
      "description": "Security configuration",
      "properties": {
        "disableShellAccess": {
          "type": "boolean",
          "description": "Disable all shell command execution",
          "default": false
        },
        "disableNetworkAccess": {
          "type": "boolean",
          "description": "Disable all outbound network calls",
          "default": false
        },
        "allowedShellCommands": {
          "type": "array",
          "description": "Whitelist of allowed shell commands",
          "items": { "type": "string" },
          "default": ["git", "ollama", "which"]
        },
        "auditEncryption": {
          "type": "boolean",
          "description": "Encrypt audit logs at rest",
          "default": true
        },
        "fipsMode": {
          "type": "boolean",
          "description": "Use FIPS 140-2 validated cryptography",
          "default": false
        }
      }
    },
    "privacy": {
      "type": "object",
      "description": "Privacy configuration",
      "properties": {
        "auditLogRetention": {
          "type": "number",
          "description": "Days to retain audit logs",
          "minimum": 1,
          "maximum": 365,
          "default": 30
        },
        "autoDeleteAuditLogs": {
          "type": "boolean",
          "description": "Auto-delete old audit logs",
          "default": false
        },
        "dataMinimization": {
          "type": "string",
          "enum": ["strict", "moderate", "relaxed"],
          "description": "How aggressively to minimize data sent to AI",
          "default": "strict"
        },
        "blockExternal": {
          "type": "array",
          "description": "File patterns to NEVER send externally",
          "items": { "type": "string" },
          "default": ["**/.env", "**/secrets/**", "**/keys/**"]
        }
      }
    },
    "notifications": {
      "type": "object",
      "description": "Notification configuration",
      "properties": {
        "slack": {
          "type": "object",
          "properties": {
            "enabled": { "type": "boolean", "default": false },
            "webhookUrl": { "type": "string" },
            "channel": { "type": "string" }
          }
        },
        "discord": {
          "type": "object",
          "properties": {
            "enabled": { "type": "boolean", "default": false },
            "webhookUrl": { "type": "string" }
          }
        }
      }
    },
    "agentic": {
      "type": "object",
      "description": "Agentic workspace configuration",
      "properties": {
        "enabled": { "type": "boolean", "default": true },
        "autoStart": { "type": "boolean", "default": true },
        "autoAnalyzeOnCommit": { "type": "boolean", "default": false },
        "notificationMode": {
          "type": "string",
          "enum": ["silent", "minimal", "verbose"],
          "default": "minimal"
        },
        "maxAutoAnalysesPerHour": {
          "type": "number",
          "minimum": 1,
          "maximum": 100,
          "default": 20
        }
      }
    },
    "performance": {
      "type": "object",
      "description": "Performance configuration",
      "properties": {
        "maxMemoryMB": {
          "type": "number",
          "minimum": 128,
          "maximum": 4096,
          "default": 256
        },
        "maxFilesPerAnalysis": {
          "type": "number",
          "minimum": 10,
          "maximum": 10000,
          "default": 500
        },
        "useIncrementalDiffing": { "type": "boolean", "default": true },
        "cacheASTRuns": { "type": "boolean", "default": true }
      }
    },
    "context": {
      "type": "object",
      "description": "Context window configuration",
      "properties": {
        "maxContextTokens": {
          "type": "number",
          "minimum": 512,
          "maximum": 128000,
          "default": 4000,
          "description": "Maximum tokens in AI prompt context"
        },
        "overflowStrategy": {
          "type": "string",
          "enum": ["truncate", "summarize", "split", "mcp"],
          "default": "summarize",
          "description": "How to handle prompts that exceed maxContextTokens"
        }
      }
    }
  }
};

export function generateVSCodeSchema(): void {
  const schemaPath = path.join(process.cwd(), '.vscode', 'devdiff-schema.json');
  
  if (!fs.existsSync(path.dirname(schemaPath))) {
    fs.mkdirSync(path.dirname(schemaPath), { recursive: true });
  }
  
  fs.writeFileSync(schemaPath, JSON.stringify(CONFIG_SCHEMA, null, 2));
  
  console.log('✅ VS Code schema generated: .vscode/devdiff-schema.json');
  console.log('   Add to .vscode/settings.json:');
  console.log('   "json.schemas": [{');
  console.log('     "fileMatch": [".devdiff.config.js"],');
  console.log('     "url": "./.vscode/devdiff-schema.json"');
  console.log('   }]');
}

export function generateShellCompletions(shell: 'bash' | 'zsh' | 'fish' | 'powershell'): string {
  if (shell === 'bash') {
    return `
# DevDiff Bash Completions
# Add to ~/.bashrc: source <(devdiff completions bash)

_devdiff_completions() {
  local cur prev words cword
  _init_completion || return
  
  case $prev in
    --persona|-p)
      COMPREPLY=($(compgen -W "developer ceo educator robot data-analyst journalist pm compliance" -- "$cur"))
      return
      ;;
    --format|-f)
      COMPREPLY=($(compgen -W "markdown json mermaid" -- "$cur"))
      return
      ;;
    --depth)
      COMPREPLY=($(compgen -W "minimal standard deep exhaustive" -- "$cur"))
      return
      ;;
    --framework)
      COMPREPLY=($(compgen -W "gdpr ccpa hipaa soc2 fedramp iso27001 pipeda lgpd pdpa australia_privacy" -- "$cur"))
      return
      ;;
    devdiff)
      COMPREPLY=($(compgen -W "init generate watch auth audit disclose monitor compliance vibe recover mvp doctor config version context playground agentic plugin help" -- "$cur"))
      return
      ;;
  esac
}

complete -F _devdiff_completions devdiff
`;
  }
  
  if (shell === 'powershell') {
    return `
# DevDiff PowerShell Completions
# Add to $PROFILE: devdiff completions powershell | Out-String | Invoke-Expression

Register-ArgumentCompleter -CommandName devdiff -ParameterName persona -ScriptBlock {
  param($wordToComplete)
  @('developer', 'ceo', 'educator', 'robot', 'data-analyst', 'journalist', 'pm', 'compliance') | Where-Object { $_ -like "$wordToComplete*" }
}

Register-ArgumentCompleter -CommandName devdiff -ParameterName format -ScriptBlock {
  param($wordToComplete)
  @('markdown', 'json', 'mermaid') | Where-Object { $_ -like "$wordToComplete*" }
}

Register-ArgumentCompleter -CommandName devdiff -ParameterName framework -ScriptBlock {
  param($wordToComplete)
  @('gdpr', 'ccpa', 'hipaa', 'soc2', 'fedramp', 'iso27001', 'pipeda', 'lgpd', 'pdpa', 'australia_privacy') | Where-Object { $_ -like "$wordToComplete*" }
}
`;
  }
  
  return '';
}
