# @eldrex/vite

## 1.8.0

### Minor Changes

- **Vite 6 Compatibility**: Verified and tuned hot module replacement (HMR) changelog overlay for Vite 6 and Rollup 4 bundling pipelines.
- **Fast Build Mode**: Added `skipAIOnDev` config option for instant dev server startups.

---

## 1.7.0

### Minor Changes

- **Dynamic Security Build Gates**: Integrates `BehavioralEngine` scan during production builds.

---

## 1.6.0

### Major Changes

- **HMR Changelog Overlay v2**: Rebuilt the Hot Module Replacement changelog overlay with improved dismissal behavior, persona-aware rendering, and Mermaid diagram support inline in the overlay.
- **Build-Time Security Scan**: Vite plugin now optionally runs a `devdiff security-scan` pass during build, emitting warnings for detected credential leaks before the bundle is produced.
- **Provider Configuration in Vite Config**: Added `provider`, `model`, and `persona` options to plugin configuration — no longer requires a separate `.devdiff.config.js` when using the Vite plugin directly.
- Added `publishConfig.access: "public"` for npm scoped package publishing.

### Minor Changes

- Plugin now emits a VitePress-compatible structured log during documentation builds.
- Added `dryRun` option — skips AI generation but still parses and reports diff statistics.
- Changelog output is now written to `dist/CHANGELOG.md` during production builds when `writeToDist: true` is set.

### Patch Changes

- Fixed HMR overlay not dismissing correctly after changelog generation completion.
- Fixed `vite.config.ts` type inference — plugin options are now fully typed.

### Updated Dependencies

- `@eldrex/core@1.6.0`

---

## 1.0.4

### Patch Changes

- Release v1.0.4 - Unified Design System, dynamic Ollama model detection, security guards, and contact address updates.
- Updated dependencies
  - @eldrex/core@1.0.4
