# Personas

DevDiff includes 8 built-in personas — different ways to explain the same code changes to different audiences. Same diff, completely different voice and perspective.

---

## Using Personas

```bash
devdiff generate --persona developer    # Default
devdiff generate --persona ceo
devdiff generate --persona educator
devdiff generate --persona robot
devdiff generate --persona data-analyst
devdiff generate --persona journalist
devdiff generate --persona pm
devdiff generate --persona compliance

# Short flag
devdiff generate -p ceo
```

---

## The 8 Personas

### 🧑‍💻 `developer` (Default)

**Audience:** Engineers, technical contributors

**Tone:** Precise, code-focused, references specific files and functions

**Example output:**
```
## Changes — July 1, 2026

### ✨ Added
- `src/auth/jwt.ts` — Added `refreshToken()` method with 7-day expiry
- `src/middleware/auth.ts` — New rate limiter: 100 req/min per IP

### 🔧 Changed
- `package.json` — Updated `jsonwebtoken` from 8.5.1 → 9.0.2 (security patch)
```

---

### 💼 `ceo`

**Audience:** Executives, non-technical stakeholders

**Tone:** Business-focused, impact-driven, no jargon

**Example output:**
```
## Product Update — July 1, 2026

### What Changed
User login sessions now last 7 days (previously expired daily), 
reducing re-login friction by ~85%.

### Business Impact
- Customer retention improvement expected
- Support tickets for "login expired" likely to drop

### Risk
Low. Security library updated to latest version.
```

---

### 📚 `educator`

**Audience:** Junior developers, bootcamp students, learners

**Tone:** Teaching-style, explains concepts, includes learning resources

**Example output:**
```
## What We Changed Today — July 1, 2026

### 🎓 Refresh Tokens (New Feature)

We added "refresh tokens" to our authentication system. 

**What's a refresh token?** When you log in, you get two things:
1. An access token (expires in 1 hour — keeps you logged in short-term)
2. A refresh token (lasts 7 days — automatically gets you a new access token)

Think of it like a hotel key card (access token) + reservation confirmation (refresh token).

**Learn more:** [JWT.io](https://jwt.io/introduction) — great visual explanation
```

---

### 🤖 `robot`

**Audience:** Automated systems, CI pipelines, other tools

**Tone:** Structured, machine-readable, minimal prose

**Example output:**
```json
{
  "timestamp": "2026-07-01T05:00:00Z",
  "version": "1.0.3",
  "changes": [
    {
      "type": "feat",
      "file": "src/auth/jwt.ts",
      "description": "Add refreshToken() with 7-day expiry",
      "breaking": false,
      "security": false
    }
  ],
  "files_changed": 3,
  "lines_added": 47,
  "lines_removed": 12
}
```

---

### 📊 `data-analyst`

**Audience:** Product analysts, data engineers, metrics-focused teams

**Tone:** Quantitative, risk-scored, impact-measured

**Example output:**
```
## Change Analysis — July 1, 2026

| Metric | Value |
|--------|-------|
| Files changed | 3 |
| Lines added | +47 |
| Lines removed | -12 |
| Complexity delta | +2 (cyclomatic) |
| Security surface change | Low |
| Test coverage impact | +4% |

### Risk Score: 2/10 (Low)
- Dependency update: minor version bump, no API changes
- Auth change: additive only, no breaking changes
```

---

### 📰 `journalist`

**Audience:** Blog posts, release announcements, product newsletters

**Tone:** Narrative, story-driven, written for a general technical audience

**Example output:**
```
## DevDiff v1.0.3: Staying Logged In Just Got Smarter

In this week's release, we tackled one of the most-requested pain points:
session timeouts. Users were getting logged out mid-work, losing their flow.

Starting today, sessions last 7 days. Under the hood, we've implemented 
refresh tokens — an industry-standard pattern that keeps sessions alive 
without sacrificing security.

We also quietly shipped a security library update. Nothing breaking, 
but keeping dependencies current is the kind of boring-important work 
that keeps projects healthy.
```

---

### 📋 `pm`

**Audience:** Product managers, project leads, sprint planners

**Tone:** User-story oriented, ticket-linkable, timeline-aware

**Example output:**
```
## Sprint Update — July 1, 2026

### ✅ Delivered
- **AUTH-247** — Extended session duration to 7 days (user story: "stay logged in")
- **SEC-14** — Dependency security update (JWT library)

### User Impact
- Login frequency reduced for returning users
- No breaking changes for existing integrations

### Definition of Done
- [ ] QA verified session persistence
- [ ] Security review completed
- [ ] Docs updated
```

---

### ⚖️ `compliance`

**Audience:** Legal, audit, security, regulatory teams

**Tone:** Formal, framework-aware, audit-ready

**Example output:**
```
## Change Control Record — July 1, 2026

### Classification: MINOR

### Changes Affecting Compliance

#### Authentication & Session Management
- Session duration extended: 24 hours → 7 days
- Mechanism: OAuth2 refresh token pattern (RFC 6749 §6)
- GDPR Impact: Session data retained longer — review data minimization policy
- SOC 2 CC6.1: Access control change — log for audit trail

#### Dependency Update
- `jsonwebtoken` 8.5.1 → 9.0.2
- CVE addressed: None (preventative update)
- SBOM updated: Yes

### Approval Required From: Security Team, Data Protection Officer
```

---

## Combining Personas with Output Formats

```bash
# Compliance persona as JSON
devdiff generate --persona compliance --format json

# CEO summary as markdown
devdiff generate --persona ceo --format markdown > RELEASE_NOTES.md

# Robot output piped to CI
devdiff generate --persona robot --format json | jq '.changes[].type'
```

---

## Custom Personas

Define your own persona in `.devdiff.config.js`:

```javascript
export default {
  personas: {
    'my-team': {
      systemPrompt: `You are writing a changelog for our internal engineering team.
Focus on: infrastructure changes, database migrations, API contract changes.
Format: bullet points, ordered by impact. Skip UI-only changes.`,
      tone: 'technical-internal',
      includeFiles: true,
    }
  }
}
```

```bash
devdiff generate --persona my-team
```
