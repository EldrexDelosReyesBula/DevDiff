# DevDiff Universal AI Prompt Export & Import Engine

The **Universal AI Prompt Export & Import Engine** (introduced in DevDiff v1.7.0) enables developers without local AI runtimes (e.g. Ollama) or cloud API keys to export copy-paste-ready prompts for any AI chat interface (**ChatGPT**, **Claude**, **Gemini**, **Copilot**, or generic web/desktop LLMs), and import the resulting changelogs back with automated quality validation.

---

## Vision & Concept

```
┌─────────────────────────────────────────────────────────────┐
│              PROMPT EXPORT — ANY AI, ANYWHERE                 │
│                                                              │
│  "Don't have Ollama? No cloud keys? Using ChatGPT web?       │
│   DevDiff prepares the perfect prompt. You paste it.         │
│   ChatGPT generates the changelog. You import it back.       │
│   Done."                                                     │
│                                                              │
│  Works with: ChatGPT, Claude, Gemini, Copilot, any LLM       │
│  Works via: Web, Desktop, Mobile, API                        │
│  Zero setup. Zero cost. Maximum flexibility.                 │
└─────────────────────────────────────────────────────────────┘
```

---

## How It Works

### 1. Prompt Assembly Engine (`PromptGenerator`)

The `PromptGenerator` gathers project intelligence and builds a structured, multi-section prompt containing:

1. **Instructions**: System instructions tailored to the target AI preset (`chatgpt`, `claude`, `gemini`, `copilot`) and chosen persona.
2. **Project Context**: Architecture, primary languages, tech stack, and framework signatures detected via `loadContext`.
3. **Project Conventions (`SKILL.md`)**: Rule sets, naming conventions, and anti-patterns extracted from `SKILL.md`.
4. **Recent Changes**: Historical activity summary from `PersistentMemory`.
5. **Git Diff**: Staged git diff and changed file summary.
6. **Output Requirements**: Exact Markdown, JSON, or Mermaid schema definitions.

### 2. Response Import Engine (`ImportEngine`)

When pasting back the AI response:

- **Preamble & Postscript Cleaning**: Automatically strips conversational headers (_"Sure, here is your changelog..."_) and footers (_"Let me know if you need anything else..."_).
- **Code Block Extraction**: Extracts raw content from markdown or JSON code fences.
- **Completeness & Quality Gates**: Validates that output is non-truncated and passes `OutputQualityGate` rules.
- **OS Clipboard Integration**: Reads directly from OS clipboard (`pbpaste`, `powershell Get-Clipboard`, `xclip`).

---

## CLI Commands

```bash
# ── Export Prompt ──

# Generate and copy a prompt for ChatGPT directly to clipboard
devdiff prompt export --target chatgpt --copy

# Generate a prompt for Claude and save to file
devdiff prompt export --target claude --output prompt.md

# Tailor prompt with persona and format
devdiff prompt export --persona ceo --format markdown

# Preview first 500 characters of prompt
devdiff prompt export --preview


# ── Import Response ──

# Import AI response from clipboard into CHANGELOG.md (prepending to top)
devdiff import changelog --paste --prepend

# Import AI response from file
devdiff import changelog response.md

# Import to custom release notes file
devdiff import changelog response.md --output docs/release-notes.md
```

Learn more on the official website: [https://devdiff.vercel.app/](https://devdiff.vercel.app/)
