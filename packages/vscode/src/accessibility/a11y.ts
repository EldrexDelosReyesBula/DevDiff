export class Accessibility {
  /**
   * WCAG 2.1 AA compliance utilities & styles
   */

  /**
   * Ensure adequate color contrast (4.5:1 minimum for normal text)
   * High contrast mode overrides for high-contrast VS Code themes
   */
  static getHighContrastOverrides(): string {
    return `
      @media (prefers-contrast: high) {
        .status-item, .history-item {
          border: 1px solid var(--vscode-focusBorder) !important;
        }

        .primary-action {
          border: 2px solid var(--vscode-button-border, var(--vscode-button-background)) !important;
        }

        .section-header {
          color: var(--vscode-editor-foreground) !important;
        }
      }
    `;
  }

  /**
   * Screen reader announcements helper
   */
  static getARIALiveRegion(): string {
    return `
      <div role="status" aria-live="polite" aria-atomic="true" class="sr-only" style="position: absolute; width: 1px; height: 1px; overflow: hidden; opacity: 0;">
        <!-- Dynamic screen reader announcements -->
      </div>
    `;
  }

  /**
   * Keyboard navigation focus styles
   */
  static getKeyboardSupport(): string {
    return `
      .status-item:focus-visible,
      .history-item:focus-visible,
      .primary-action:focus-visible {
        outline: 1px solid var(--vscode-focusBorder) !important;
        outline-offset: -1px !important;
      }

      .section-header:focus-visible {
        outline: 1px solid var(--vscode-focusBorder) !important;
      }
    `;
  }

  /**
   * Reduced motion support
   */
  static getReducedMotion(): string {
    return `
      @media (prefers-reduced-motion: reduce) {
        *,
        *::before,
        *::after {
          animation-duration: 0.01ms !important;
          transition-duration: 0.01ms !important;
        }
      }
    `;
  }
}
