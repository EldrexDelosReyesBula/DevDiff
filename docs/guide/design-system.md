# Unified Design System v1.0

The single source of truth for the visual language, design tokens, layout primitives, and accessibility compliance across all DevDiff surfaces.

---

## Design Philosophy

> [!IMPORTANT]
> **DEVDIFF DESIGN PRINCIPLES**
>
> 1. **ZERO LEARNING CURVE** — A beginner commits in 3 taps.
> 2. **POWER USER READY** — Advanced devs never leave the keyboard.
> 3. **ONE DESIGN EVERYWHERE** — Docs = Playground = CLI output.
> 4. **ACCESSIBLE BY DEFAULT** — WCAG AAA, screen readers first.
> 5. **CROSS-PLATFORM NATIVE** — Feels at home on every OS.

---

## The 3-Tap Rule

| Tap 1: Install           | Tap 2: Initialize | Tap 3: Generate      |
| :----------------------- | :---------------- | :------------------- |
| **npm i -g @eldrex/cli** | **devdiff init**  | **devdiff generate** |
| ⏱️ 2 seconds             | ⏱️ 1 second       | 📝 Changelog appears |

---

## Complete Design Token System

```css
/* ═══════════════════════════════════════════════════════════
   DEVDIFF DESIGN TOKENS v1.0
   Single source of truth for ALL surfaces
   ═══════════════════════════════════════════════════════════ */

:root {
  /* ── TYPOGRAPHY ─────────────────────────────────────── */

  /* Font Stack — System fonts first, no external downloads */
  --font-sans:
    "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, sans-serif;
  --font-mono:
    "JetBrains Mono", "Fira Code", "Cascadia Code", "SF Mono", Consolas,
    "Liberation Mono", monospace;

  /* Type Scale — 1.25 ratio (Major Third) */
  --text-xs: 0.75rem; /* 12px — Badges */
  --text-sm: 0.875rem; /* 14px — Labels */
  --text-base: 1rem; /* 16px — Body */
  --text-lg: 1.125rem; /* 18px — Lead paragraphs */
  --text-xl: 1.25rem; /* 20px — Section titles */
  --text-2xl: 1.5rem; /* 24px — Card titles */
  --text-3xl: 1.875rem; /* 30px — Page titles */
  --text-4xl: 2.25rem; /* 36px — Hero headings */
  --text-5xl: 3rem; /* 48px — Landing only */

  /* Line Heights — Optimized for readability */
  --leading-tight: 1.25; /* Headings */
  --leading-snug: 1.375; /* Subheadings */
  --leading-normal: 1.6; /* Body text */
  --leading-relaxed: 1.75; /* Long-form content */

  /* Font Weights */
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;

  /* Letter Spacing */
  --tracking-tighter: -0.02em; /* Large headings */
  --tracking-tight: -0.01em; /* Subheadings */
  --tracking-normal: 0; /* Body */
  --tracking-wide: 0.02em; /* Labels, badges */
  --tracking-wider: 0.05em; /* Uppercase micro */

  /* ── SPACING — 4px base grid ────────────────────────── */

  --space-0: 0;
  --space-1: 0.25rem; /* 4px  — Micro spacing */
  --space-2: 0.5rem; /* 8px  — Inline spacing */
  --space-3: 0.75rem; /* 12px — Tight padding */
  --space-4: 1rem; /* 16px — Standard padding */
  --space-5: 1.25rem; /* 20px — Comfortable padding */
  --space-6: 1.5rem; /* 24px — Section padding */
  --space-8: 2rem; /* 32px — Block spacing */
  --space-10: 2.5rem; /* 40px — Large spacing */
  --space-12: 3rem; /* 48px — Section separation */
  --space-16: 4rem; /* 64px — Page separation */
  --space-20: 5rem; /* 80px — Hero spacing */
  --space-24: 6rem; /* 96px — Max spacing */

  /* ── BORDER RADIUS ──────────────────────────────────── */

  --radius-none: 0;
  --radius-sm: 0.25rem; /* 4px  — Badges */
  --radius-md: 0.5rem; /* 8px  — Buttons, inputs, cards */
  --radius-lg: 0.75rem; /* 12px — Modals, large cards */
  --radius-xl: 1rem; /* 16px — Dialogs */
  --radius-2xl: 1.5rem; /* 24px — Hero elements */
  --radius-full: 9999px; /* Pill buttons, avatars */

  /* ── SHADOWS — Layered elevation system ─────────────── */

  --shadow-none: 0 0 0 0 transparent;
  --shadow-xs: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg:
    0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --shadow-xl:
    0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
  --shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);

  /* Glow effects for focus states */
  --glow-primary: 0 0 0 3px rgb(99 102 241 / 0.3);
  --glow-success: 0 0 0 3px rgb(34 197 94 / 0.3);
  --glow-danger: 0 0 0 3px rgb(239 68 68 / 0.3);
  --glow-warning: 0 0 0 3px rgb(245 158 11 / 0.3);

  /* ── TRANSITIONS — Consistent animation tokens ──────── */

  --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-base: 200ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-slow: 300ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-spring: 400ms cubic-bezier(0.34, 1.56, 0.64, 1);

  /* ── Z-INDEX SCALE ──────────────────────────────────── */

  --z-base: 0;
  --z-above: 10;
  --z-sticky: 100;
  --z-overlay: 200;
  --z-modal: 300;
  --z-toast: 400;
  --z-tooltip: 500;
}

/* ═══════════════════════════════════════════════════════════
   LIGHT THEME
   ═══════════════════════════════════════════════════════════ */

[data-theme="light"] {
  /* Surfaces */
  --color-bg: #ffffff;
  --color-bg-secondary: #f8fafc;
  --color-bg-tertiary: #f1f5f9;
  --color-bg-elevated: #ffffff;
  --color-bg-overlay: rgb(15 23 42 / 0.5);

  /* Borders */
  --color-border: #e2e8f0;
  --color-border-light: #f1f5f9;
  --color-border-strong: #cbd5e1;

  /* Text */
  --color-text: #0f172a;
  --color-text-secondary: #475569;
  --color-text-tertiary: #94a3b8;
  --color-text-inverse: #ffffff;
  --color-text-link: #4f46e5;
  --color-text-link-hover: #4338ca;

  /* Brand */
  --color-primary: #6366f1;
  --color-primary-hover: #4f46e5;
  --color-primary-light: #eef2ff;
  --color-primary-text: #ffffff;

  /* Semantic */
  --color-success: #22c55e;
  --color-success-light: #f0fdf4;
  --color-success-text: #166534;
  --color-warning: #f59e0b;
  --color-warning-light: #fffbeb;
  --color-warning-text: #92400e;
  --color-danger: #ef4444;
  --color-danger-light: #fef2f2;
  --color-danger-text: #991b1b;
  --color-info: #3b82f6;
  --color-info-light: #eff6ff;
  --color-info-text: #1e40af;

  /* Code */
  --color-code-bg: #f8fafc;
  --color-code-border: #e2e8f0;
  --color-code-text: #0f172a;
  --color-code-comment: #64748b;
  --color-code-keyword: #7c3aed;
  --color-code-string: #059669;
  --color-code-function: #2563eb;
}

/* ═══════════════════════════════════════════════════════════
   DARK THEME
   ═══════════════════════════════════════════════════════════ */

[data-theme="dark"] {
  /* Surfaces */
  --color-bg: #0a0a0f;
  --color-bg-secondary: #131320;
  --color-bg-tertiary: #1a1a2e;
  --color-bg-elevated: #1e1e32;
  --color-bg-overlay: rgb(0 0 0 / 0.7);

  /* Borders */
  --color-border: #2a2a3e;
  --color-border-light: #1e1e32;
  --color-border-strong: #3a3a50;

  /* Text */
  --color-text: #f1f5f9;
  --color-text-secondary: #94a3b8;
  --color-text-tertiary: #64748b;
  --color-text-inverse: #0f172a;
  --color-text-link: #818cf8;
  --color-text-link-hover: #a5b4fc;

  /* Brand */
  --color-primary: #818cf8;
  --color-primary-hover: #6366f1;
  --color-primary-light: #1e1b4b;
  --color-primary-text: #ffffff;

  /* Semantic */
  --color-success: #34d399;
  --color-success-light: #064e3b;
  --color-success-text: #d1fae5;
  --color-warning: #fbbf24;
  --color-warning-light: #451a03;
  --color-warning-text: #fef3c7;
  --color-danger: #f87171;
  --color-danger-light: #450a0a;
  --color-danger-text: #fee2e2;
  --color-info: #60a5fa;
  --color-info-light: #1e3a5f;
  --color-info-text: #dbeafe;

  /* Code */
  --color-code-bg: #131320;
  --color-code-border: #2a2a3e;
  --color-code-text: #e2e8f0;
  --color-code-comment: #64748b;
  --color-code-keyword: #a78bfa;
  --color-code-string: #34d399;
  --color-code-function: #60a5fa;
}
```

---

## Layout System

```css
/* ═══════════════════════════════════════════════════════════
   LAYOUT PRIMITIVES
   ═══════════════════════════════════════════════════════════ */

.dev-container {
  width: 100%;
  max-width: 1200px;
  margin-inline: auto;
  padding-inline: var(--space-6);
}

.dev-container-narrow {
  max-width: 768px;
}

.dev-container-wide {
  max-width: 1440px;
}

.dev-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: var(--space-6);
}

.dev-stack {
  display: flex;
  flex-direction: column;
}

.dev-stack > * + * {
  margin-top: var(--space-4);
}

.dev-inline {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-3);
}

.dev-layout-sidebar {
  display: grid;
  grid-template-columns: 260px 1fr;
  min-height: 100vh;
}
```

---

## Component Library

```css
/* ═══════════════════════════════════════════════════════════
   COMPONENTS
   ═══════════════════════════════════════════════════════════ */

/* Buttons */
.dev-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  font-family: var(--font-sans);
  font-weight: var(--font-medium);
  font-size: var(--text-sm);
  padding: 0.625rem 1.25rem;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.dev-btn-primary {
  background: var(--color-primary);
  color: var(--color-primary-text);
}

/* Inputs */
.dev-input {
  width: 100%;
  padding: 0.625rem 0.875rem;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text);
  outline: none;
}

/* Cards */
.dev-card {
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
}

/* Badges */
.dev-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: 0.125rem 0.625rem;
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
}
```

---

## Responsive Breakpoints

```css
@media (min-width: 640px) {
  .dev-container {
    padding-inline: var(--space-8);
  }
}

@media (min-width: 1024px) {
  .dev-layout-sidebar {
    grid-template-columns: 280px 1fr;
  }
}

@media (pointer: coarse) {
  .dev-btn {
    min-height: 44px;
    min-width: 44px;
  }
}
```

---

## Accessibility

```css
.dev-sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border-width: 0;
}

*:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
```

---

## Cross-Platform Adaptation

```css
@media (prefers-os-platform: windows) {
  :root {
    --font-sans: "Segoe UI", system-ui, sans-serif;
    --font-mono: "Cascadia Code", "Consolas", monospace;
  }
}

@media (prefers-os-platform: macos) {
  :root {
    --font-sans: -apple-system, BlinkMacSystemFont, sans-serif;
    --font-mono: "SF Mono", "Menlo", monospace;
  }
}
```

---

## Unified Documentation Layout

```html
<template>
  <div class="dev-layout-sidebar" data-theme="dark">
    <aside class="dev-sidebar">
      <!-- Sidebar Content -->
    </aside>
    <main class="dev-main-content">
      <content />
    </main>
  </div>
</template>
```

---

## Playground Layout

```html
<div class="dev-layout-sidebar">
  <aside class="dev-sidebar">
    <!-- Playground Controls -->
  </aside>
  <main class="dev-main-content">
    <!-- Output -->
  </main>
</div>
```

---

## CLI Output Design

```typescript
export class CLIOutputFormatter {
  static section(title: string): string {
    const width = Math.min(process.stdout.columns || 80, 80);
    const dashes = "━".repeat(Math.max(0, width - title.length - 2));
    return `\n━ ${title} ${dashes}\n`;
  }
}
```

---

## Design Consistency Audit

### Spacing Checklist

- [ ] All spacing uses 4px grid (`--space-1` through `--space-24`)
- [ ] Card padding is set to `--space-6` (24px) consistently across all screens
- [ ] Section gaps are set to at least `--space-8` (32px)
- [ ] Button padding is identical across all workspace surfaces

### Typography Checklist

- [ ] Font stack matches exactly across docs, playground, and web dashboard
- [ ] Heading sizes are hierarchical (`h1` = `3xl`, `h2` = `2xl`, `h3` = `xl`, `h4` = `lg`)
- [ ] Body text uses `--text-base` (16px) consistently
