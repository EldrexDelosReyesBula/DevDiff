# Universal Language & Project Detection

DevDiff **v1.5.0** introduces **Universal Project Detection** (`UniversalProjectDetector`). DevDiff can analyze any text-based repository, script, or workspace regardless of whether it uses `package.json`, frameworks, or standard directory conventions.

---

## 🎯 Supported Project Topologies

| Tier | Project Topology | Example Stack | DevDiff Action |
| :--- | :--- | :--- | :--- |
| **Tier 1** | Node.js / Monorepos | React, Vue, Next.js, Vite | Full AST & package manifest detection |
| **Tier 2** | Static Web & PWAs | HTML5, Vanilla JS, CSS, CDN libraries | Detects CDN scripts, PWAs, Web APIs, and Service Workers |
| **Tier 3** | Python Workspaces | Django, Flask, FastAPI, Scripts | Scans `.py` files, `requirements.txt`, and AST functions |
| **Tier 4** | Generic / Custom Languages | Go, Rust, C++, Ruby, PHP, Shell, SQL, Custom DSLs | Language-aware extension mapping and raw diff analysis |

---

## ⚡ Key Guarantees

- ✅ **No `package.json` required**: Works out-of-the-box on vanilla HTML/CSS/JS projects.
- ✅ **Single-file support**: Analyzes single `.html` or `.py` files without configuration.
- ✅ **60+ Languages**: Pre-mapped file extension registry for all popular programming languages.
- ✅ **Binary Skipping**: Automatically skips binary files (`.png`, `.exe`, `.pdf`) gracefully.
