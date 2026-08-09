# Keyboard Navigation & Shortcuts Guide (v1.6.0)

DevDiff (v1.6.0) is designed for 100% keyboard-navigable operation across all interface modalities: VS Code 4 sidebar panels, integrated terminal CLI, and SDK dashboards.

---

## 🎯 Keyboard Shortcuts & Navigation Matrix

| Environment | Action | Shortcut / Keyboard Pattern | Focus Behavior |
|---|---|---|---|
| **VS Code Extension** | Open DevDiff Chat Panel | `Ctrl+Shift+D` / `Cmd+Shift+D` | Focuses Q&A input field |
| **VS Code Extension** | Trigger Inline CodeLens | `Alt+F1` $\rightarrow$ Select CodeLens | Triggers `⚡ DevDiff: Explain` |
| **VS Code Extension** | Switch Sidebar View | `Tab` / `Shift+Tab` | Logical sequential focus trap |
| **Terminal CLI** | Interactive Selection | `Up` / `Down` Arrow keys | Highlight active persona/option |
| **Web Documentation** | Jump to Main Content | `Tab` (at page top) | Activates "Skip to content" link |

---

## 🔒 Focus Ring & Contrast Standards

- **High Contrast Focus Rings**: All interactive buttons, dropdowns, input fields, and tab triggers feature a 2px high-contrast outline (`#6366f1` / `#a5b4fc`).
- **Focus Restoration**: Closing modals or sidebar drawers automatically restores keyboard focus to the triggering element.
