# WCAG 2.2 Level AA Compliance Attestation

DevDiff aligns with the **Web Content Accessibility Guidelines (WCAG) 2.2 Level AA** standards across all documentation pages, VS Code extension webviews, and custom SDK component libraries.

---

## 🎯 WCAG 2.2 Level AA Success Criteria Alignment

| WCAG Criteria | Criterion Name         | DevDiff Technical Implementation                                                                             |
| ------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------ |
| **1.4.3**     | Contrast (Minimum)     | Enforces a minimum contrast ratio of **4.5:1** for standard text and **3:1** for large text/UI components    |
| **1.4.10**    | Reflow                 | Layouts reflow smoothly without horizontal scrolling at **200% text zoom** (up to 1280px viewport width)     |
| **2.1.1**     | Keyboard               | 100% of user interface features are operable through a keyboard interface without requiring specific timings |
| **2.2.2**     | Pause, Stop, Hide      | Background animations and live updates respect system `prefers-reduced-motion` settings                      |
| **2.4.7**     | Focus Visible          | Any keyboard operable user interface has an explicitly visible focus indicator ring                          |
| **3.3.2**     | Labels or Instructions | Input fields, search controls, and form elements include persistent descriptive labels                       |

---

## ⚙️ Reduced Motion Support

DevDiff respects operating system preferences for reduced motion (`prefers-reduced-motion: reduce`), automatically disabling non-essential transition animations.
