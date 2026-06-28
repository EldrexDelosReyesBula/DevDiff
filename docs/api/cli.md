# CLI Reference

Detailed guide for `@eldrex/cli` commands and arguments.

- **`devdiff generate`**: Analyzes staged diffs and writes a changelog report.
  - `--persona [id]`: Persona choice (developer, compliance, ceo, pm, robot, etc.).
  - `--depth [level]`: Analysis depth (minimal, standard, deep, exhaustive).
  - `--dry-run`: Preview input without calling LLM providers.
- **`devdiff watch`**: Runs the repository commit watcher daemon.
- **`devdiff config`**: Generates and checks project configs.
- **`devdiff audit`**: Views historical AI token calls and requests.
