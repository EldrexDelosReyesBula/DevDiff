# Multi-Agent Swarms

DevDiff v1.0.1 introduces local Multi-Agent Collaboration. Instead of relying on a single generalist LLM, DevDiff spawns a team of highly specialized local AI agents to analyze changes and build consensus.

## Specialized Agents

- **Architect Agent** (`ollama://llama3.1:8b`): Analyzes code changes for architectural impacts, patterns, and structure.
- **Security Auditor** (`ollama://codellama:13b`): Scans for security vulnerabilities, secrets leakage, and CWE matches.
- **Performance Engineer** (`ollama://llama3.2:3b`): Monitors performance complexity and estimates bundle impact.
- **Documentation Writer** (`ollama://llama3.2:3b`): Drafts changelog files and guides.

## Collaborative Process

1. **Independent Analysis**: Each agent reviews the diff and produces independent findings.
2. **Discussion**: Agents exchange messages to review and challenge each other's findings.
3. **Consensus Building**: Findings backed by more than 50% of the swarm are accepted into consensus.
4. **Final Report**: The documentation writer agent synthesizes the consensus findings into a final report.
