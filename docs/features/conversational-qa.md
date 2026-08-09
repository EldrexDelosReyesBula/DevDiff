# Conversational Q&A Engine (v1.5.0)

DevDiff **v1.5.0** introduces the **Conversational Q&A Engine** (`ConversationalQA`), providing instant sub-50ms codebase queries with pronoun resolution (`it`, `this`, `that`, `them`, `those`) and multi-turn context memory across session turns.

---

## 🎯 Architecture & Performance

```mermaid
flowchart TD
    A["USER PROMPT: 'What depends on it?'"] --> B["PRONOUN & REFERENCE RESOLUTION ⚡ &lt; 5ms"]
    B --> C["Resolves 'it' → CountifyStorage<br/>Resolves 'them' → [js/app.js, js/storage.js]"]
    C --> D["INDEX FAST PATH ⚡ &lt; 50ms"]
    D --> E["Entity & AST Index<br/>Dependency Knowledge Graph<br/>Architectural Metadata"]
    E --> F{Match found?}
    F -->|Yes| G["✅ CONCISE RESPONSE<br/>+ Sources & Follow-ups"]
    F -->|No| H["AI ROUTER FALLBACK"]
    H --> I["Local LLM<br/>llama3.2:3b / Ollama"]
    I --> G

    style A fill:#6366f1,color:#fff,stroke:#4f46e5
    style B fill:#0ea5e9,color:#fff,stroke:#0284c7
    style D fill:#0ea5e9,color:#fff,stroke:#0284c7
    style F fill:#f59e0b,color:#fff,stroke:#d97706
    style G fill:#22c55e,color:#fff,stroke:#16a34a
    style H fill:#f43f5e,color:#fff,stroke:#e11d48
    style I fill:#8b5cf6,color:#fff,stroke:#7c3aed
```

---

## ⚡ Performance Breakdown

| Query Type                                     | Typical Response Time | Data Source          |
| :--------------------------------------------- | :-------------------- | :------------------- |
| **Entity Lookup** (`"What does X do?"`)        | `< 10ms`              | Codebase Index       |
| **Dependency Query** (`"What depends on X?"`)  | `< 15ms`              | Knowledge Graph      |
| **Count Queries** (`"How many functions?"`)    | `< 5ms`               | AST Statistics       |
| **Compliance Checks** (`"Is this GDPR safe?"`) | `< 20ms`              | Privacy Rules Engine |
| **Context Resolution** (`"Tell me about it"`)  | `< 5ms`               | Conversation State   |
| **AI Fallback** (`"Explain complex logic"`)    | `500ms - 2s`          | Ollama / Cloud LLM   |

---

## 💬 Question Patterns & Pronoun Resolution

The Q&A engine dynamically resolves pronouns based on conversation history:

1. **`"What does X do?"`**:
   Looks up `X` in indexed classes, interfaces, components, and functions. Sets `X` as the active topic.

2. **`"What depends on it?"` / `"What about it?"`**:
   Automatically substitutes `"it"` with the active topic (`X`).

3. **`"Where is X?"`**:
   Returns the relative file path and line number location.

4. **`"How many functions / classes / files?"`**:
   Returns exact numeric totals from the indexed codebase snapshot.

5. **`"Is this GDPR / HIPAA compliant?"`**:
   Executes quick compliance checks for hardcoded secrets, unencrypted localStorage usage, and PII patterns.

---

## 💻 CLI Usage & Examples

```bash
# Ask initial question
devdiff ask "What does CountifyStorage do?"

# Output:
# [lucide:message-square] DevDiff Conversational Memory (12ms from index):
# CountifyStorage in `js/storage.js` — IndexedDB wrapper providing async CRUD.
# [lucide:file-text] Sources: `js/storage.js`
# [lucide:lightbulb] Follow up:
#    • "What depends on CountifyStorage?"
#    • "Show me the code"

# Natural follow-up (uses pronoun context):
devdiff ask "What depends on it?"

# Output:
# CountifyStorage is used by 2 files: `js/app.js` and `js/analytics.js`.
```

---

## 🔧 Programmatic API (`@eldrex/core`)

```typescript
import { ConversationalQA } from "@eldrex/core";

const qa = new ConversationalQA(process.cwd());

// Turn 1
const res1 = await qa.ask("What does SkillManager do?");
console.log(res1.answer); // "SkillManager in packages/core/src/skill/skill-manager.ts..."

// Turn 2 (Pronoun resolution)
const res2 = await qa.ask("What depends on it?");
console.log(res2.answer); // "SkillManager is referenced in packages/cli/src/commands/skill.ts..."

// Clear conversation context
qa.reset();
```
