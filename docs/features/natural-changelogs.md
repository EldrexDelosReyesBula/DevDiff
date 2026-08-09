# Natural Changelogs Engine (v1.6.0)

DevDiff's **Natural Changelog Generator** (`NaturalChangelogGenerator`) enforces authentic, developer-owned technical language, eliminating robotic AI-sounding hedging, disclaimers, and passive observations.

---

## 🎯 Direct Developer Voice vs. Hedged AI Output

```text
BEFORE (ROBOTIC / HEDGED AI OUTPUT):
──────────────────────────────────────────────
"This commit appears to modify the login handler.
It seems to update user validation against the database.
This change might potentially resolve security concerns."

AFTER (DEVDIFF NATURAL DEVELOPER VOICE):
──────────────────────────────────────────────
### Added
- Bcrypt password hashing for user login (`auth/login.ts`, `auth/session.ts`)
- Redis session store integration (`auth/session.ts`)

### Fixed
- Prevent SQL injection vulnerability by parameterizing user queries (`auth/db.ts`)
```

---

## 🛡️ Banned AI Hedging Phrases

DevDiff automatically strips hedging phrases from generated summaries before output is returned:

| Category              | Banned Hedging Phrases                                                       |
| --------------------- | ---------------------------------------------------------------------------- |
| **Speculative Words** | `appears to`, `seems to`, `could potentially`, `might be`, `it looks like`   |
| **Meta AI Filler**    | `in my analysis`, `as an AI`, `AI-generated summary`, `here is what changed` |
| **Passive Framing**   | `the developer added`, `this file was updated to`                            |

---

## 📋 Keep a Changelog Standard Formatting

All natural changelogs conform strictly to the [Keep a Changelog](https://keepachangelog.com) standard, organizing entries into clean, scannable categories:

- `Added`: New features and exported functions
- `Changed`: Modifications to existing functionality
- `Deprecated`: Soon-to-be removed features
- `Removed`: Deleted exports and removed dependencies
- `Fixed`: Bug fixes and patch resolutions
- `Security`: Vulnerability patches and security hardening
