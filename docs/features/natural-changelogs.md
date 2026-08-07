# Natural Changelogs Engine

DevDiff's **Natural Changelog Generator** (`NaturalChangelogGenerator`) enforces developer-owned language, stripping out robotic AI-sounding hedging, disclaimers, and passive observations.

---

## 🎯 Direct Developer Language vs. Hedged AI Output

```text
BEFORE (AI-SOUNDING / HEDGED):
──────────────────────────────────────────────
"This change appears to add a new authentication function.
It seems to validate user credentials against the database.
This could potentially improve security."

AFTER (DEVELOPER LANGUAGE):
──────────────────────────────────────────────
### Added
- User authentication with bcrypt password hashing (`auth/login.ts`, `auth/session.ts`)
- Session management with Redis store (`auth/session.ts`)
- Request authentication middleware (`auth/middleware.ts`)

### Changed
- Protected routes now require authentication (`api/routes.ts`)
```

---

## 🛡️ Banned AI Phrases

DevDiff automatically strips hedging phrases from generated summaries:
- `appears to`
- `seems to`
- `could potentially`
- `might be`
- `it looks like`
- `in my analysis`
- `AI-generated summary`
