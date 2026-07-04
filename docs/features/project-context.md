# Project Context for Accurate Explanations

By default, DevDiff only sees the raw diff. With Project Context, it also understands **what your project is** — its purpose, architecture, and domain — leading to explanations that are specific, accurate, and meaningful rather than generic or guessed.

---

## The Problem Without Context

```
Without context:
> "Added a new function `batch`. This might improve performance."

With context:
> "Added `batch()` to the reactivity system (packages/core/src/reactivity/signal.ts).
>  This groups multiple signal updates into a single re-render cycle, preventing
>  unnecessary DOM recalculations when several state values change together."
```

The diff is identical. The context makes the difference.

---

## How It Works

```
┌─────────────────────────────────────────────────────────────┐
│                  PROJECT CONTEXT PIPELINE                    │
│                                                             │
│  1. Auto-discovery: scans README.md, package.json,          │
│     tsconfig.json, directory structure, entry points        │
│                                                             │
│  2. User refinement: edit .devdiff/context.md to add        │
│     domain knowledge, naming conventions, architecture      │
│                                                             │
│  3. Secret scanning: context is redacted before any         │
│     cloud AI call (same engine as diff redaction)           │
│                                                             │
│  4. Injection: context is prepended to every AI prompt      │
│                                                             │
│  5. Verification: post-generation accuracy check flags      │
│     hallucinated file names and identifiers                 │
└─────────────────────────────────────────────────────────────┘
```

---

## Quick Start

```bash
# Step 1: Generate context for your project
devdiff context generate

# Step 2: (Optional) Add your own notes
devdiff context edit

# Step 3: Generate — context is injected automatically
devdiff generate
```

That's it. Context is loaded automatically on every `devdiff generate`.

---

## Commands

### `devdiff context generate`

Scans your project and creates `.devdiff/context.md`:

```bash
devdiff context generate
```

```
🔍 Scanning project...

✅ Project context generated!

   File: /your-project/.devdiff/context.md

   Project: my-api-service
   Purpose: REST API for managing user accounts and subscriptions
   Tech stack: TypeScript/JavaScript, Express, Prisma ORM
   Directories: 8 mapped

   💡 Edit .devdiff/context.md to add domain knowledge,
      naming conventions, or architecture notes.
      Run: devdiff context edit
```

### `devdiff context show`

Prints the current context (what's being injected into AI prompts):

```bash
devdiff context show
```

### `devdiff context validate`

Checks the context file for accidentally included secrets:

```bash
devdiff context validate
```

```
Validating .devdiff/context.md...

   File: /project/.devdiff/context.md
   Size: 847 characters (~211 tokens)
   ✅ Within token budget

✅ No secrets detected.
   Context is safe to use with cloud AI providers.
```

### `devdiff context edit`

Opens the context file in your `$EDITOR`:

```bash
devdiff context edit

# Set your preferred editor:
export EDITOR="code"    # VS Code
export EDITOR="vim"     # Vim
export EDITOR="nano"    # Nano
```

---

## The Context File: `.devdiff/context.md`

After running `devdiff context generate`, you'll find this file:

```markdown
# Project: my-api-service

## Purpose

REST API for managing user accounts and billing subscriptions.
Built on Express with PostgreSQL via Prisma ORM.

## Tech Stack

- TypeScript/JavaScript
- Express (Node.js HTTP server)
- Prisma ORM
- Vitest (testing)

## Architecture

- `src/` — main source code
- `src/api/` — HTTP route handlers
- `src/services/` — business logic layer
- `src/repositories/` — data access layer
- `src/middleware/` — Express middleware
- `tests/` — test suites

## Entry Points

- src/index.ts

## Custom Notes

<!-- Edit this section to add domain knowledge, naming conventions, or architecture notes -->
```

### What to add in Custom Notes

This is where context shines. Add:

```markdown
## Custom Notes

### Domain Terminology

- "Subscription" = a user's paid plan (see src/models/subscription.ts)
- "Entitlement" = a feature a user has access to based on their plan
- "Grace period" = 7-day window after subscription expires before access is revoked

### Naming Conventions

- `*Service.ts` files — pure business logic, no HTTP concerns
- `*Repository.ts` files — all database queries live here (Prisma calls)
- `*Controller.ts` files — HTTP layer only, delegates to services

### Architecture Notes

- We use CQRS: commands in `src/handlers/`, queries in `src/queries/`
- All external API calls go through `src/adapters/` (never called directly)
- Redis is used only for session storage, not general caching

### Known Technical Debt

- `src/legacy/payment.ts` is deprecated, being replaced by `src/services/stripe.ts`
```

With this context, DevDiff will use your terminology correctly in every explanation.

---

## Accuracy Verification

After every AI call, DevDiff runs an automatic accuracy check:

```
⚠️  Accuracy check: Explanation references `src/user-service.ts` but this file is not in the diff
⚠️  AI confidence: 42% — explanation may contain inaccuracies, review recommended.
```

**What it checks:**

| Check            | What it does                                                   |
| ---------------- | -------------------------------------------------------------- |
| File reference   | Ensures all mentioned file paths appear in the diff            |
| Identifier check | Flags `camelCase`/`PascalCase` names not found in diff content |
| Confidence score | Degrades by 20% per file warning, 5% per identifier mismatch   |

Verification is **warn-only** — the output is always shown. In CI, use `--strict-verify` (future flag) to fail on accuracy warnings.

---

## Token Budget

The context is automatically capped at **2000 characters (~500 tokens)**. Priority order for trimming:

1. Project name + purpose (always included)
2. Tech stack
3. Architecture directory map
4. Custom Notes (trimmed if over budget)

---

## Privacy & Security

- Context is scanned by the **same secret detection engine** as your diffs
- Secrets found in context are **automatically redacted** before any AI call
- A warning is shown if redaction occurred: `⚠️ DevDiff detected and redacted secrets in .devdiff/context.md`
- With **local AI (Ollama)**, the context never leaves your machine regardless
- With **cloud AI**, only the redacted context is transmitted

---

## Configuration

```javascript
// .devdiff.config.js
export default {
  context: {
    enabled: true, // Default: true
    filePath: ".devdiff/context.md", // Default location
    maxChars: 2000, // Token budget cap
  },
};
```

---

## Frequently Asked Questions

**Q: Does DevDiff generate context automatically on every run?**
A: No. You run `devdiff context generate` once (or when your project structure changes significantly). The context file is then auto-loaded on every `devdiff generate`.

**Q: What if I don't have a `.devdiff/context.md`?**
A: DevDiff silently falls back to auto-scanning on every run. It's slightly slower but works. Running `devdiff context generate` saves the result to disk for faster, better quality future runs.

**Q: Can I commit `.devdiff/context.md` to git?**
A: Yes — it's encouraged. It helps the whole team get consistent AI explanations. Just run `devdiff context validate` first to ensure no secrets are in the file.

**Q: Will context make my prompts bigger and cost more?**
A: Marginally. ~~500 tokens per call. At GPT-4o-mini rates (~~$0.00015/1k tokens), that's less than $0.0001 per generation — negligible.
