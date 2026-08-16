# DevDiff Study Buddy Mode

DevDiff is your interactive codebase study buddy. Designed for students, beginners, and developers exploring new projects, **Study Buddy Mode** turns every code explanation into an educational experience.

---

## 🎓 Standalone Plugin (`@eldrex/plugin-study-buddy`)

Study Buddy operates as a standalone DevDiff plugin (`@eldrex/plugin-study-buddy`) supporting code explanations in **ANY language** across 5 progressive levels:

- **Beginner**: Line-by-line plain English analogies.
- **Student**: Core CS fundamentals, patterns, and data structures.
- **Developer**: Technical API usage and code execution flow.
- **Senior**: Concurrency, memory allocation, and edge cases.
- **Architect**: Coupling, module boundaries, and maintainability.

### Specialized Language Explainers
- **CSS / SCSS**: Selectors (`.class`, `#id`, `@media`) and property explanations (`display: flex/grid`, `padding`, `margin`, `z-index`) in plain English.
- **JavaScript / TypeScript**: Async/await, promises, closures.
- **Python**: PEP 484 type hints, list comprehensions.
- **HTML**: DOM structures, semantic HTML5.
- **Rust**: Ownership, borrowing, lifetimes.
- **Go**: Goroutines, channels, CSP concurrency.
- **Universal Fallback**: Automatic structural analysis for ANY programming language.


---

## 🛠️ CLI Study Commands

```bash
# Start Study Buddy Mode
devdiff study start

# Take a 5-minute newcomer tour of the codebase
devdiff study tour

# Generate a step-by-step learning path for a topic
devdiff study learn authentication

# Ask an educational question about the code
devdiff study ask "What is a Promise?"

# Run a self-quiz on a topic
devdiff study quiz authentication

# Exit Study Buddy Mode
devdiff study stop
```

---

## 🎭 `study-buddy` Persona

You can pass `--persona study-buddy` to any `devdiff generate` command to produce educational, patient changelogs:

```bash
devdiff generate --persona study-buddy
```
