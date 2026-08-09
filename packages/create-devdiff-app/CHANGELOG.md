# create-devdiff-app

## 1.6.0

### Major Changes

- **Scaffold templates updated** to reflect v1.6.0 monorepo structure — generated projects now include `.devdiff/SKILL.md`, `.devdiff/memory/` placeholder, and `.devdiff.config.js` with Groq/Gemini/Ollama provider examples.
- **New `--template` flag**: Choose between `changelog-dashboard` (VitePress), `ci-integration` (GitHub Actions), and `minimal` scaffold templates.
- Added `publishConfig.access: "public"` for npm scoped package publishing.
- Added `files: ["dist"]` to restrict published package contents.
- Added `repository` field pointing to monorepo directory `packages/create-devdiff-app`.
- Added `author` field.
- Fixed `engines.node` from `>=18.0.0` to `>=20.0.0` to match monorepo minimum requirement.

### Patch Changes

- Fixed scaffold output directory creation on Windows when path contains spaces.
- Updated scaffolded `package.json` templates to use `@eldrex/cli@1.6.0`.

---

## 1.0.4

### Patch Changes

- Release v1.0.4 - Unified Design System, dynamic Ollama model detection, security guards, and contact address updates.
