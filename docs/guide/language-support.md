# DevDiff — Language & Framework Support Matrix (v1.5.0)

---

## HOW DEVDIFF HANDLES LANGUAGES

DevDiff operates at **three levels** of language support:

### DEVDIFF LANGUAGE SUPPORT LEVELS

| Feature                                        | Level 1: Full Support | Level 2: Partial Support | Level 3: Passthrough Support |
| ---------------------------------------------- | :-------------------: | :----------------------: | :--------------------------: |
| AST-aware parsing                              |          ✅           |            ❌            |              ❌              |
| Function/class/export detection                |          ✅           |            ❌            |              ❌              |
| Import resolution                              |          ✅           |            ❌            |              ❌              |
| Refactor & relationship detection              |          ✅           |            ❌            |              ❌              |
| Framework detection                            |          ✅           |            ❌            |              ❌              |
| Optimized AI prompts with language context     |          ✅           |            ❌            |              ❌              |
| Basic diff parsing (additions/deletions)       |          ✅           |            ✅            |              ❌              |
| Template-based changelog                       |          ❌           |            ✅            |              ✅              |
| Secret scanning                                |          ✅           |            ✅            |              ✅              |
| File relationship detection (basic heuristics) |          ✅           |            ✅            |              ❌              |
| AI can explain changes                         |    ✅ (optimized)     |        ✅ (basic)        |              ❌              |
| Raw diff output only                           |          ❌           |            ❌            |              ✅              |
| No AST parsing / refactor detection            |          ❌           |            ❌            |              ✅              |

---

## LEVEL 1: FULL SUPPORT

### JavaScript Ecosystem

| Language              | AST Parser     | Import Resolution | Framework Detection | Refactor Detection |
| --------------------- | -------------- | ----------------- | ------------------- | ------------------ |
| **JavaScript (ES6+)** | ✅ tree-sitter | ✅ ESM + CJS      | ✅                  | ✅                 |
| **TypeScript**        | ✅ tree-sitter | ✅ Path aliases   | ✅                  | ✅                 |
| **JSX**               | ✅ tree-sitter | ✅                | ✅ React            | ✅                 |
| **TSX**               | ✅ tree-sitter | ✅ Path aliases   | ✅ React            | ✅                 |
| **MJS (ES Modules)**  | ✅             | ✅                | ✅                  | ✅                 |
| **CJS (CommonJS)**    | ✅             | ✅ require()      | ✅                  | ✅                 |

**Frameworks detected:**

- React, Next.js, Remix, Gatsby
- Vue.js, Nuxt.js
- Svelte, SvelteKit
- Angular
- Express.js, Fastify, NestJS, Hono
- Astro, SolidJS, Qwik
- Vite, Webpack, Turbopack, esbuild
- Prisma, Drizzle ORM, TypeORM, Sequelize
- Jest, Vitest, Cypress, Playwright
- Tailwind CSS, styled-components, CSS Modules

### Python

| Language              | AST Parser     | Import Resolution | Framework Detection | Refactor Detection |
| --------------------- | -------------- | ----------------- | ------------------- | ------------------ |
| **Python 3.8+**       | ✅ tree-sitter | ✅                | ✅                  | ✅                 |
| **Python type hints** | ✅             | ✅                | ✅                  | ✅                 |

**Frameworks detected:**

- Django, Flask, FastAPI, Litestar
- SQLAlchemy, Django ORM, Peewee
- Pytest, unittest
- Pydantic, attrs, dataclasses
- Black, Ruff, isort (formatters noted, not executed)

### TypeScript-First Languages

| Language       | AST Parser     | Import Resolution | Framework Detection | Refactor Detection |
| -------------- | -------------- | ----------------- | ------------------- | ------------------ |
| **TypeScript** | ✅ tree-sitter | ✅                | ✅                  | ✅                 |
| **TSX**        | ✅ tree-sitter | ✅                | ✅ React            | ✅                 |

---

## LEVEL 2: PARTIAL SUPPORT

These languages get **basic diff parsing** + **AI explanations** but lack full AST optimization.

### Systems & Compiled Languages

| Language      | Diff Parsing | Secret Scanning | AI Can Explain | AST          | Refactor Detection |
| ------------- | ------------ | --------------- | -------------- | ------------ | ------------------ |
| **Go**        | ✅           | ✅              | ✅             | ❌ (planned) | ⚠️ Basic           |
| **Rust**      | ✅           | ✅              | ✅             | ❌ (planned) | ⚠️ Basic           |
| **C**         | ✅           | ✅              | ✅             | ❌           | ❌                 |
| **C++**       | ✅           | ✅              | ✅             | ❌           | ❌                 |
| **C# (.NET)** | ✅           | ✅              | ✅             | ❌           | ❌                 |
| **Zig**       | ✅           | ✅              | ✅             | ❌           | ❌                 |
| **Odin**      | ✅           | ✅              | ✅             | ❌           | ❌                 |
| **Nim**       | ✅           | ✅              | ✅             | ❌           | ❌                 |
| **Carbon**    | ✅           | ✅              | ✅             | ❌           | ❌                 |

### JVM Languages

| Language    | Diff Parsing | Secret Scanning | AI Can Explain | AST          | Refactor Detection |
| ----------- | ------------ | --------------- | -------------- | ------------ | ------------------ |
| **Java**    | ✅           | ✅              | ✅             | ❌ (planned) | ⚠️ Basic           |
| **Kotlin**  | ✅           | ✅              | ✅             | ❌           | ❌                 |
| **Scala**   | ✅           | ✅              | ✅             | ❌           | ❌                 |
| **Groovy**  | ✅           | ✅              | ✅             | ❌           | ❌                 |
| **Clojure** | ✅           | ✅              | ✅             | ❌           | ❌                 |

### .NET Languages

| Language   | Diff Parsing | Secret Scanning | AI Can Explain | AST | Refactor Detection |
| ---------- | ------------ | --------------- | -------------- | --- | ------------------ |
| **C#**     | ✅           | ✅              | ✅             | ❌  | ❌                 |
| **F#**     | ✅           | ✅              | ✅             | ❌  | ❌                 |
| **VB.NET** | ✅           | ✅              | ✅             | ❌  | ❌                 |

### Mobile Languages

| Language               | Diff Parsing | Secret Scanning | AI Can Explain | AST          | Refactor Detection |
| ---------------------- | ------------ | --------------- | -------------- | ------------ | ------------------ |
| **Swift**              | ✅           | ✅              | ✅             | ❌           | ❌                 |
| **Kotlin (Android)**   | ✅           | ✅              | ✅             | ❌           | ❌                 |
| **Dart**               | ✅           | ✅              | ✅             | ❌ (planned) | ❌                 |
| **Objective-C**        | ✅           | ✅              | ✅             | ❌           | ❌                 |
| **React Native (JSX)** | ✅           | ✅              | ✅             | ✅           | ✅                 |

### Scripting Languages

| Language             | Diff Parsing | Secret Scanning | AI Can Explain | AST | Refactor Detection |
| -------------------- | ------------ | --------------- | -------------- | --- | ------------------ |
| **Ruby**             | ✅           | ✅              | ✅             | ❌  | ⚠️ Basic           |
| **PHP**              | ✅           | ✅              | ✅             | ❌  | ❌                 |
| **Perl**             | ✅           | ✅              | ✅             | ❌  | ❌                 |
| **Lua**              | ✅           | ✅              | ✅             | ❌  | ❌                 |
| **Shell (Bash/Zsh)** | ✅           | ✅              | ✅             | ❌  | ❌                 |
| **PowerShell**       | ✅           | ✅              | ✅             | ❌  | ❌                 |

### Web & Styling

| Language      | Diff Parsing | Secret Scanning | AI Can Explain | AST | Refactor Detection |
| ------------- | ------------ | --------------- | -------------- | --- | ------------------ |
| **HTML**      | ✅           | ✅              | ✅             | ❌  | ❌                 |
| **CSS**       | ✅           | ✅              | ✅             | ❌  | ❌                 |
| **SCSS/SASS** | ✅           | ✅              | ✅             | ❌  | ❌                 |
| **Less**      | ✅           | ✅              | ✅             | ❌  | ❌                 |
| **PostCSS**   | ✅           | ✅              | ✅             | ❌  | ❌                 |
| **SVG**       | ✅           | ✅              | ✅             | ❌  | ❌                 |
| **GraphQL**   | ✅           | ✅              | ✅             | ❌  | ❌                 |
| **MDX**       | ✅           | ✅              | ✅             | ❌  | ❌                 |

### Functional Languages

| Language     | Diff Parsing | Secret Scanning | AI Can Explain | AST | Refactor Detection |
| ------------ | ------------ | --------------- | -------------- | --- | ------------------ |
| **Elixir**   | ✅           | ✅              | ✅             | ❌  | ❌                 |
| **Erlang**   | ✅           | ✅              | ✅             | ❌  | ❌                 |
| **Haskell**  | ✅           | ✅              | ✅             | ❌  | ❌                 |
| **OCaml**    | ✅           | ✅              | ✅             | ❌  | ❌                 |
| **ReasonML** | ✅           | ✅              | ✅             | ❌  | ❌                 |
| **F#**       | ✅           | ✅              | ✅             | ❌  | ❌                 |

### Database & Query

| Language            | Diff Parsing | Secret Scanning | AI Can Explain | AST | Refactor Detection |
| ------------------- | ------------ | --------------- | -------------- | --- | ------------------ |
| **SQL**             | ✅           | ✅              | ✅             | ❌  | ❌                 |
| **PL/pgSQL**        | ✅           | ✅              | ✅             | ❌  | ❌                 |
| **MongoDB queries** | ✅           | ✅              | ✅             | ❌  | ❌                 |
| **Prisma Schema**   | ✅           | ✅              | ✅             | ❌  | ❌                 |
| **Drizzle Schema**  | ✅           | ✅              | ✅             | ❌  | ❌                 |

### Infrastructure & Config

| Language                | Diff Parsing | Secret Scanning | AI Can Explain | AST | Refactor Detection |
| ----------------------- | ------------ | --------------- | -------------- | --- | ------------------ |
| **YAML**                | ✅           | ✅              | ✅             | ❌  | ❌                 |
| **TOML**                | ✅           | ✅              | ✅             | ❌  | ❌                 |
| **JSON**                | ✅           | ✅              | ✅             | ❌  | ❌                 |
| **HCL (Terraform)**     | ✅           | ✅              | ✅             | ❌  | ❌                 |
| **Dockerfile**          | ✅           | ✅              | ✅             | ❌  | ❌                 |
| **Makefile**            | ✅           | ✅              | ✅             | ❌  | ❌                 |
| **INI/Env files**       | ✅           | ✅ (critical)   | ✅             | ❌  | ❌                 |
| **Nginx config**        | ✅           | ✅              | ✅             | ❌  | ❌                 |
| **GitHub Actions YAML** | ✅           | ✅              | ✅             | ❌  | ❌                 |
| **GitLab CI YAML**      | ✅           | ✅              | ✅             | ❌  | ❌                 |

---

## LEVEL 3: PASSTHROUGH SUPPORT

These languages get **raw diff** + **template changelog** only. The AI can still attempt to explain, but without any language-specific optimization.

### Everything Else

| Language/Format                | Notes                                          |
| ------------------------------ | ---------------------------------------------- |
| **R**                          | Template only                                  |
| **MATLAB**                     | Template only                                  |
| **Julia**                      | Template only                                  |
| **Fortran**                    | Template only                                  |
| **COBOL**                      | Template only                                  |
| **Ada**                        | Template only                                  |
| **VHDL/Verilog**               | Template only                                  |
| **Assembly**                   | Template only                                  |
| **LaTeX**                      | Template only                                  |
| **Markdown**                   | Template only (already well-supported as text) |
| **reStructuredText**           | Template only                                  |
| **Protocol Buffers (.proto)**  | Template only                                  |
| **Thrift**                     | Template only                                  |
| **Avro IDL**                   | Template only                                  |
| **Lex/Yacc**                   | Template only                                  |
| **ANTLR grammars**             | Template only                                  |
| **CUDA**                       | Template only                                  |
| **Solidity (smart contracts)** | Template only                                  |
| **Move (Aptos/Sui)**           | Template only                                  |
| **Cairo (StarkNet)**           | Template only                                  |

---

## FULL LANGUAGE COUNT

```text
┌─────────────────────────────────────────────────────────────┐
│              DEVDIFF LANGUAGE SUPPORT SUMMARY                │
│                                                              │
│  LEVEL 1 (Full Support):           3 languages              │
│    • JavaScript/TypeScript/TSX ecosystem                     │
│    • Python                                                   │
│    • All their frameworks & dialects                         │
│                                                              │
│  LEVEL 2 (Partial Support):        40+ languages            │
│    • Go, Rust, Java, Kotlin, Swift, Dart                     │
│    • Ruby, PHP, Lua, Shell, PowerShell                       │
│    • C, C++, C#, F#, Zig, Nim, Carbon                        │
│    • HTML, CSS, SCSS, SQL, YAML, JSON                        │
│    • Elixir, Haskell, OCaml, Clojure, Scala                  │
│    • Terraform, Dockerfile, Makefile, GitHub Actions         │
│    • Prisma, GraphQL, MDX, and more                          │
│                                                              │
│  LEVEL 3 (Passthrough):            15+ languages            │
│    • R, MATLAB, Julia, Fortran, COBOL, Ada                   │
│    • VHDL, Verilog, Assembly, LaTeX                          │
│    • Solidity, Move, Cairo, and more                         │
│                                                              │
│  TOTAL SUPPORTED:                   60+ languages            │
│  SECRET SCANNING WORKS ON:          ALL text-based files     │
│  AI CAN ATTEMPT EXPLANATIONS ON:    ALL text-based files     │
└─────────────────────────────────────────────────────────────┘
```

---

## PLANNED FULL SUPPORT (Next 6 Months)

```text
v1.6.0:
[ ] Go — Full tree-sitter AST support
[ ] Rust — Full tree-sitter AST support
[ ] Java — Full tree-sitter AST support

v1.7.0:
[ ] Dart/Flutter — Full AST support
[ ] Ruby — Full AST support
[ ] C# — Full AST support

v1.8.0:
[ ] Kotlin — Full AST support
[ ] Swift — Full AST support
[ ] PHP — Full AST support
```

---

## FRAMEWORK DETECTION — COMPLETE LIST

### JavaScript/TypeScript Frameworks (Level 1 Detection)

```text
Frontend:
✅ React (with Next.js, Remix, Gatsby, React Router variants)
✅ Vue.js (with Nuxt, Vue Router, Pinia variants)
✅ Svelte (with SvelteKit)
✅ Angular (with Angular Universal)
✅ Astro
✅ SolidJS
✅ Qwik
✅ Preact
✅ Lit
✅ Alpine.js
✅ HTMX

Backend:
✅ Express.js
✅ Fastify
✅ NestJS
✅ Hono
✅ Koa
✅ Next.js API Routes
✅ Nuxt API Routes
✅ SvelteKit Endpoints
✅ Remix Loaders/Actions
✅ tRPC
✅ GraphQL Yoga / Apollo Server

Full-Stack:
✅ Next.js
✅ Nuxt.js
✅ Remix
✅ SvelteKit
✅ RedwoodJS
✅ Blitz.js
✅ T3 Stack

Build Tools:
✅ Vite
✅ Webpack
✅ Turbopack
✅ esbuild
✅ Rollup
✅ Parcel
✅ SWC

Testing:
✅ Jest
✅ Vitest
✅ Cypress
✅ Playwright
✅ Testing Library
✅ Storybook

Database/ORM:
✅ Prisma
✅ Drizzle ORM
✅ TypeORM
✅ Sequelize
✅ Knex.js
✅ Mongoose
✅ Kysely

Styling:
✅ Tailwind CSS
✅ styled-components
✅ CSS Modules
✅ Emotion
✅ Vanilla Extract
✅ Panda CSS
✅ UnoCSS

State Management:
✅ Redux / Redux Toolkit
✅ Zustand
✅ Jotai
✅ Recoil
✅ MobX
✅ Pinia
✅ Vuex
✅ XState

Monorepo Tools:
✅ Turborepo
✅ Nx
✅ Lerna
✅ pnpm Workspaces
✅ Yarn Workspaces
✅ Rush
✅ Bazel
```

### Python Frameworks (Level 1 Detection)

```text
Web:
✅ Django
✅ Flask
✅ FastAPI
✅ Litestar
✅ Pyramid
✅ Tornado
✅ Sanic

Data/ML:
✅ Pandas
✅ NumPy
✅ PyTorch
✅ TensorFlow
✅ JAX
✅ Scikit-learn
✅ Polars

ORM/Database:
✅ SQLAlchemy
✅ Django ORM
✅ Peewee
✅ Tortoise ORM
✅ Piccolo

Testing:
✅ Pytest
✅ unittest
✅ Hypothesis

Validation:
✅ Pydantic
✅ attrs
✅ dataclasses

Async:
✅ asyncio
✅ Trio
✅ AnyIO

Package Management:
✅ pip
✅ Poetry
✅ PDM
✅ uv
✅ Conda
```

### Go Frameworks (Level 2 — Full AST coming v1.6.0)

```text
Web:
✅ Gin
✅ Echo
✅ Fiber
✅ Chi
✅ Gorilla Mux
✅ net/http

Database:
✅ GORM
✅ sqlx
✅ Ent
✅ Bun

Testing:
✅ testing (stdlib)
✅ Testify
✅ Ginkgo

Build:
✅ Go Modules
✅ Make
✅ Task
```

### Rust Frameworks (Level 2 — Full AST coming v1.6.0)

```text
Web:
✅ Actix Web
✅ Axum
✅ Rocket
✅ Warp
✅ Tide

Database:
✅ Diesel
✅ SQLx
✅ SeaORM

Testing:
✅ cargo test
✅ proptest

Build:
✅ Cargo
✅ build.rs
```

---

## HOW TO VERIFY LANGUAGE SUPPORT

```bash
# Check what DevDiff detects in your project
devdiff context generate
devdiff context show

# Output includes:
# Detected languages: TypeScript (450 files), Python (120 files), Go (45 files)
# Detected frameworks: Next.js 14, Prisma, Tailwind CSS, Jest

# Force a specific language for a file type
# .devdiff.config.js
export default {
  languageOverrides: {
    '*.sol': 'solidity',
    '*.cairo': 'cairo',
    '*.move': 'move'
  }
}
```

---

## WHAT DEVDIFF CANNOT ANALYZE

```text
❌ Binary files (.exe, .dll, .so, .dylib, .wasm)
❌ Compiled assets (.class, .pyc, .o, .obj)
❌ Media files (.mp4, .mp3, .png, .jpg, .gif, .svg as image)
❌ Archive files (.zip, .tar, .gz, .rar, .7z)
❌ Encrypted files (.gpg, .enc)
❌ Proprietary binary formats (.psd, .sketch, .fig, .ai)
❌ Virtual machine images (.vmdk, .qcow2, .iso)
❌ Database binary files (.db, .sqlite as binary, .mdb)
❌ Font files (.ttf, .otf, .woff, .woff2)
❌ Certificate files (.p12, .pfx, .jks as binary)

These are auto-detected and skipped.
Add to .devdiffignore to ensure they're never processed.
```

---

## ADDING CUSTOM LANGUAGE SUPPORT

```typescript
// For teams with proprietary languages or DSLs
// .devdiff.config.js

export default {
  customLanguages: {
    // Your internal DSL
    ".myco": {
      name: "MyCo DSL",
      commentPattern: "//",
      importPattern: /import\s+['"]([^'"]+)['"]/g,
      functionPattern: /def\s+(\w+)/g,
      classPattern: /entity\s+(\w+)/g,
    },
    // GraphQL in .graphql files
    ".graphql": {
      name: "GraphQL",
      commentPattern: "#",
      importPattern: /#import\s+['"]([^'"]+)['"]/g,
    },
  },
};
```

---

**DevDiff supports 60+ languages across 3 support levels. JavaScript/TypeScript and Python get full AST-optimized analysis. 40+ languages get AI-powered explanations with basic diff parsing. Everything text-based gets secret scanning. Binary files are auto-skipped. Custom languages can be added via configuration.**
