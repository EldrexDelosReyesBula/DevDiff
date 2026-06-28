# Persona Engine System

The Persona Engine shapes AI output and tone to match specific human (or machine) roles.

## Built-in Personas

- **developer**: Code-focused, technical, precise, heavy jargon.
- **ceo**: Executive overview, max 3 bullet points, zero jargon, business-impact focused.
- **data-analyst**: Numbers, percentages, files changed stats, table format.
- **educator**: Teaches the "why" instead of just "what", includes learning takeaways.
- **robot**: Pure parseable facts, minimal explanation.
- **journalist**: Engaging story format, leads with human impact.
- **pm**: Features, user impact, roadmap focus.
- **compliance**: Security, licenses, risk assessments.

## Custom Personas

You can extend built-in personas using `.yaml` configuration files. Create a custom persona file (e.g. `custom-ceo.yaml`):

```yaml
id: custom-ceo
extends: ceo
name: "Sarah's Executive Summary"
tone: executive
verbosity: 1
focus:
  - revenue_impact
  - customer_facing_changes
system_prompt: |
  You are Sarah's executive assistant. Focus on revenue impact and risk ratings.
```
