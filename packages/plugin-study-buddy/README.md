# @eldrex/plugin-study-buddy

## Standalone Study Buddy Plugin for DevDiff — Universal Code Explanation Engine

> **🎓 Patient Senior Developer in your Editor** — Explains ANY code in ANY language across 5 progressive levels.

[![npm version](https://img.shields.io/npm/v/@eldrex/plugin-study-buddy)](https://npmjs.com/package/@eldrex/plugin-study-buddy)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## Overview

`@eldrex/plugin-study-buddy` is a standalone DevDiff plugin that provides progressive educational explanations for any programming language. It uses language-specific explainers (CSS, JavaScript, TypeScript, Python, HTML, Rust, Go) and automatic universal fallback structural analysis for all other text-based languages.

---

## 🎯 5 Progressive Explanation Levels

1. **Beginner**: Line-by-line plain English analogies with minimal jargon.
2. **Student**: Focus on core CS fundamentals, algorithms, data structures, and patterns.
3. **Developer**: Technical summary focusing on control flow, data mutations, and public APIs.
4. **Senior**: Concurrency, memory allocations, runtime complexity, and edge cases.
5. **Architect**: System coupling, module boundaries, domain logic, and long-term maintainability.

---

## 🛠️ CLI Usage

```bash
# Explain selected code or file
devdiff study explain

# Explain code at a specific depth level
devdiff study explain --level beginner
devdiff study explain --level architect

# Ask a learning question about code
devdiff study ask "How does Flexbox handle layout in this stylesheet?"
```

---

## 🎨 CSS & Multi-Language Support

- **CSS & SCSS**: Breaks down selectors (`.class`, `#id`, `@media`, `:hover`) and explains CSS properties (`display: flex/grid`, `padding`, `margin`, `z-index`, `border-radius`, `gap`) in plain English.
- **JavaScript / TypeScript**: Async/await, Promises, closures, generics, interface declarations.
- **Python**: PEP 484 type hints, list comprehensions, decorators.
- **HTML**: DOM tree structure, semantic HTML5, accessibility.
- **Rust**: Ownership, borrowing (`&mut`), lifetimes, traits.
- **Go**: Goroutines, channels, CSP concurrency.
- **Universal Fallback**: Language-agnostic structural analysis for any other text-based language.

---

## 🤖 Smart AI Router (`StudyBuddyAIRouter`)

Automated priority AI routing:
1. **IDE Agent**: Uses active IDE environment tokens (fastest, zero setup).
2. **Local Ollama**: Uses local Ollama instance (free, private).
3. **Cloud AI**: Fallback to configured cloud provider API keys (OpenAI, Gemini, Anthropic).

---

## License

MIT © DevDiff Contributors
