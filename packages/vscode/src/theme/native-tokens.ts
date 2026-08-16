/**
 * DevDiff uses VS Code's native theme variables.
 * This ensures PERFECT integration with any VS Code theme
 * — light, dark, high contrast, custom themes — all work cleanly.
 */

export class NativeTheme {
  /**
   * All colors come from VS Code's theme API.
   * DevDiff defines NO hardcoded colors.
   * When the user switches themes, DevDiff adapts instantly.
   */
  static getTokens() {
    return {
      // Backgrounds
      background: "var(--vscode-editor-background)",
      sidebarBackground: "var(--vscode-sideBar-background)",
      activityBarBackground: "var(--vscode-activityBar-background)",
      editorWidgetBackground: "var(--vscode-editorWidget-background)",
      inputBackground: "var(--vscode-input-background)",
      dropdownBackground: "var(--vscode-dropdown-background)",

      // Text
      foreground: "var(--vscode-editor-foreground)",
      descriptionForeground: "var(--vscode-descriptionForeground)",
      disabledForeground: "var(--vscode-disabledForeground)",

      // Borders
      border: "var(--vscode-sideBar-border)",
      focusBorder: "var(--vscode-focusBorder)",
      separator: "var(--vscode-sideBarSectionHeader-border)",

      // Buttons
      buttonBackground: "var(--vscode-button-background)",
      buttonForeground: "var(--vscode-button-foreground)",
      buttonHoverBackground: "var(--vscode-button-hoverBackground)",
      buttonSecondaryBackground: "var(--vscode-button-secondaryBackground)",
      buttonSecondaryForeground: "var(--vscode-button-secondaryForeground)",
      buttonSecondaryHoverBackground:
        "var(--vscode-button-secondaryHoverBackground)",

      // Inputs
      inputForeground: "var(--vscode-input-foreground)",
      inputPlaceholderForeground: "var(--vscode-input-placeholderForeground)",
      inputBorder: "var(--vscode-input-border)",

      // Lists & Trees
      listHoverBackground: "var(--vscode-list-hoverBackground)",
      listActiveSelectionBackground:
        "var(--vscode-list-activeSelectionBackground)",
      listActiveSelectionForeground:
        "var(--vscode-list-activeSelectionForeground)",
      listInactiveSelectionBackground:
        "var(--vscode-list-inactiveSelectionBackground)",

      // Status Bar
      statusBarBackground: "var(--vscode-statusBar-background)",
      statusBarForeground: "var(--vscode-statusBar-foreground)",
      statusBarHoverBackground: "var(--vscode-statusBarItem-hoverBackground)",

      // Semantic
      errorForeground: "var(--vscode-errorForeground)",
      warningForeground: "var(--vscode-editorWarning-foreground)",
      infoForeground: "var(--vscode-editorInfo-foreground)",

      // Accent
      brandPrimary: "var(--vscode-button-background)",
      brandSubtle: "var(--vscode-textLink-foreground)",
      brandLink: "var(--vscode-textLink-foreground)",
      brandLinkHover: "var(--vscode-textLink-activeForeground)",

      // Code block
      codeBackground: "var(--vscode-textCodeBlock-background)",
      codeForeground: "var(--vscode-editor-foreground)",

      // Selection
      selectionBackground: "var(--vscode-editor-selectionBackground)",
      selectionHighlightBackground:
        "var(--vscode-editor-selectionHighlightBackground)",

      // Scrollbars
      scrollbarBackground: "var(--vscode-scrollbarSlider-background)",
      scrollbarHoverBackground: "var(--vscode-scrollbarSlider-hoverBackground)",
      scrollbarActiveBackground:
        "var(--vscode-scrollbarSlider-activeBackground)",
    };
  }
}
