# Documentation Contribution Guidelines

The DevDiff documentation site is powered by **VitePress 1.6.4** located in the `docs/` workspace root directory.

---

## Building & Previewing Documentation Locally

```bash
# Start VitePress local development server (http://localhost:5173)
pnpm docs:dev

# Build the static documentation production bundle
pnpm docs:build

# Preview the built documentation site locally
pnpm docs:preview
```

---

## Documentation Style & Engineering Standards

1. **Human-Craft Language**:
   - Write clear, concise, and professional developer documentation.
   - Avoid marketing fluff, robotic jargon, and excessive emoji clutter. Focus on actionable commands, exact parameters, and clear code snippets.
2. **Standard Markdown Links**:
   - Use clean relative paths (e.g. `[Development Guide](./development.md)`) or official GitHub repository links.
   - Never embed workstation filesystem URIs (e.g. `file:///c:/...`).
3. **Mermaid Diagrams**:
   - Use fenced code blocks with the `mermaid` language identifier for all architecture flows and dependency graphs.
   - Ensure diagrams use clear labels without raw HTML tags.
4. **Code & Command Snippets**:
   - Explicitly specify syntax highlighters (`bash`, `typescript`, `json`, `yaml`, `diff`).
   - Keep command examples self-contained and reproducible.
