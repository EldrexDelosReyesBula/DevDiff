# Attack Surface Analysis

As a developer tool running on local workstations, DevDiff is built with a minimal attack surface to ensure security and privacy.

---

## 🔍 Threat Profile and Mitigations

### 1. File Reading Boundaries
- **Threat:** Malicious configurations could trigger reading sensitive files outside the workspace.
- **Mitigation:** Strict local path traversal checks (`InjectionGuardV2.validateFilePath`) ensure that only relative files inside the current working directory (project scope) can be resolved.

### 2. Execution Sandbox
- **Threat:** Arbitrary terminal commands injected via commit messages or filenames could run shell operations with system privileges.
- **Mitigation:** Command arguments are strictly passed as array values using standard process execution rather than raw shell interpretation, preventing operator concatenation (e.g. `; rm -rf`).

### 3. Local Gateway Isolation
- **Threat:** The event gateway port (`3737`/`3740`) might be accessed by unauthorized external services on the network.
- **Mitigation:** By default, DevDiff ports only bind to `localhost` / `127.0.0.1` interfaces, rejecting external network queries.
