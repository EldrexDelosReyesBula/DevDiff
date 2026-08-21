# Documentation Contribution Guidelines

The DevDiff documentation site is built using **VitePress 1.6.4** located in the `docs/` workspace package.

---

## Building & Previewing Documentation Locally

```bash
# Start VitePress dev server (http://localhost:5173)
pnpm --filter devdiff-docs dev

# Build documentation site static bundle
pnpm --filter devdiff-docs build

# Preview production build (specify custom port if needed)
pnpm --filter devdiff-docs preview --port 5000
```

---

## Markdown Formatting Rules

- **No Workstation `file:///` Links**: Never include absolute workstation filesystem paths (e.g. `file:///c:/Users/...`). Use clean relative links or GitHub repository URLs.
- **No Duplicated Docs**: Maintain single canonical documents for legal, privacy, and integration guides.
- **Mermaid Flowcharts**: Use standard mermaid fenced code blocks for architecture diagrams.
