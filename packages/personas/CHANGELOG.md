# @eldrex/personas

## 1.8.0

### Minor Changes

- **Persona Output Optimization**: Reduced token verbosity across `developer`, `ceo`, and `educator` personas for faster local LLM generation.
- **Human-Craft Tone Refinement**: Standardized changelog phrasing to eliminate robotic filler sentences.

---

## 1.7.0

### Minor Changes

- **Universal Prompt Export Templates**: Added persona prompt formatting layers tailored for Claude, ChatGPT, Gemini, and Copilot.

---

## 1.6.0

### Major Changes

- **4 New Built-In Personas**:
  - `study-buddy` — Warm, encouraging senior developer persona explaining code for learners (Line-by-Line, Why?, Key Concepts, Try It Yourself).
  - `robot` — Machine-readable structured JSON output, zero prose.
  - `data-analyst` — Quantitative change metrics, file size deltas, complexity scores.
  - `journalist` — Narrative-style changelogs for release blog posts and product news.
- **Total persona count**: 9 built-in personas (Developer, CEO, Educator, PM, Compliance, Robot, Data Analyst, Journalist, Study Buddy).
- **`NaturalChangelogGenerator` integration**: Persona post-processing sanitizes AI hedging language into factual past-tense developer prose.
- Added `publishConfig.access: "public"` for npm scoped package publishing.
- Added `repository` field pointing to `packages/personas`.

### Patch Changes

- Persona YAML definitions are validated on load.
- Updated `developer` persona template with TypeScript-aware diff annotations.

---

## 1.0.4

### Patch Changes

- Release v1.0.4 - Unified Design System, dynamic Ollama model detection, security guards, and contact address updates.
