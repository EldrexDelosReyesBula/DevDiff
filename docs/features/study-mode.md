# DevDiff Study Buddy Mode 

DevDiff is your interactive codebase study buddy. Designed for students, beginners, and developers exploring new projects, **Study Buddy Mode** turns every code explanation into an educational experience.

---

## 🎯 Core Features

### 1. Educational Line-by-Line Explanations
When you select code and ask DevDiff to explain, Study Buddy Mode provides:
- **Overview & Purpose**: Plain-English explanation of what the function or module accomplishes.
- **Line-by-Line Breakdown**: Detailed explanations with rationale for design decisions ("Why?").
- **Key Concepts Learned**: Essential computer science concepts (e.g. Salting, Hashing, Recursion, Promises).
- **Try It Yourself**: Safe, hands-on code experiments to deepen understanding.

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
