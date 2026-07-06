# Injection Prevention

DevDiff parses untrusted source code and commit history before forwarding context to AI models. To secure local workflows, DevDiff implements strict input guards.

---

## 🛡️ Injection Guards (V2 Engine)

DevDiff utilizes `InjectionGuardV2` to intercept and analyze all structured payloads before dispatch:

- **Prompt Injection:** Scans for instructions that try to override the system prompt (e.g., `"ignore all previous rules"`, `"<|im_start|>"`, or `"[INST]"` tags).
- **Shell Injection:** Blocks command substitution (`$(...)`), backticks (`` `...` ``), and shell separators (`&&`, `||`, `;`) in file paths and commit parameters.
- **Path Traversal:** Blocks traversal sequences (`../`, `..\`) and URL-encoded traversal payloads.
- **SQL Injection:** Recognizes database administration commands in code blocks and ensures they are safely escaped.
- **Cross-Site Scripting (XSS):** Filters `<script>` tags, iframe declarations, and HTML event handlers (`onerror`, `onload`).
- **Prototype Pollution:** Blocks `__proto__` and `constructor.prototype` payloads from configuration files.
