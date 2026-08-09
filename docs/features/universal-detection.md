# Universal Language & Project Detection (v1.6.0)

DevDiff **v1.6.0** includes **Universal Project Detection** (`UniversalProjectDetector`). DevDiff can analyze any software repository, script folder, or workspace regardless of whether it uses `package.json`, build systems, or standard directory conventions.

---

## 🎯 Multi-Tier Project Topology Matrix

| Tier | Project Topology | Example Tech Stack | DevDiff Action & AST Capabilities |
| :--- | :--- | :--- | :--- |
| **Tier 1** | Node.js & Monorepos | React, Vue, Next.js, Vite, TypeScript | Full AST parsing, export extraction, & package manifest detection |
| **Tier 2** | Static Web & PWAs | HTML5, Vanilla JS, CSS3, Web APIs | Detects CDN scripts, Service Workers, DOM handlers, & PWA manifests |
| **Tier 3** | Python Workspaces | Django, Flask, FastAPI, Scripts | Scans `.py` files, `requirements.txt`, `pyproject.toml`, & AST functions |
| **Tier 4** | Multilingual Systems | Go, Rust, C++, Java, C#, Ruby, PHP, SQL, Shell | Extension mapping, AST scope trimming, & raw diff analysis |

---

## ⚡ Key Architectural Guarantees

- ✅ **No `package.json` required**: Operates out-of-the-box on single-file scripts or vanilla HTML/CSS/JS projects.
- ✅ **60+ Languages Supported**: Pre-mapped file extension registry covering all popular programming languages.
- ✅ **Automatic Binary Filtering**: Gracefully skips binary assets (`.png`, `.jpg`, `.pdf`, `.wasm`, `.exe`).
- ✅ **Monorepo Auto-Partitioning**: Automatically chunks multi-package diffs to fit model context bounds.
