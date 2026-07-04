# DevDiff Playground

Try DevDiff instantly in your browser — no installation required.

---

## Live Playground

🔗 **[devdiff.vercel.app/playground](https://devdiff.vercel.app/playground)**

The playground lets you:
- Paste any git diff and get an AI explanation
- Switch between all 8 personas in real time
- Try different output formats (Markdown, JSON, Mermaid)
- Use WebGPU inference — runs 100% in your browser, no server

---

## Local Dashboard

If you have DevDiff installed, you can run the interactive dashboard locally:

```bash
# Launch the web dashboard
devdiff report

# Opens at http://localhost:7654
```

The local dashboard shows:
- **Change history** — all past `devdiff generate` runs
- **Diff viewer** — side-by-side with the AI explanation
- **Persona switcher** — re-analyze with different personas
- **Export tools** — download as PDF, Markdown, or JSON
- **Provider stats** — which AI models you've used and their latency

---

## Dashboard Features

### Changelog History

Every time you run `devdiff generate`, the result is saved to `.devdiff/history/`. The dashboard renders all of these with search and filtering.

```bash
# View audit history
devdiff audit
```

### Live Diff Viewer

Paste or load a diff manually to get an on-demand analysis without staging changes:

```bash
# Analyze a specific commit
git diff HEAD~1 | devdiff generate --stdin

# Analyze a specific file's history
git diff main feature-branch -- src/auth.ts | devdiff generate --stdin
```

### Persona Comparison

The dashboard can show all 8 personas side by side for the same diff — useful for release note preparation.

---

## Sharing Reports

```bash
# Export a full report as HTML
devdiff generate --format html > report.html

# Serve it temporarily
npx serve . -p 8080
# Share: http://localhost:8080/report.html
```

---

## Public Playground

The public playground at [devdiff.vercel.app/playground](https://devdiff.vercel.app/playground) uses **WebGPU inference only** — your diff text is processed locally in your browser. Nothing is transmitted to any server.

> The public playground is best for trying DevDiff before installing. For daily use, the CLI + local dashboard is faster and more powerful.
