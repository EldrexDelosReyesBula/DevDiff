export const DesignSystem = {
  colors: {
    primary: "#6366f1",
    primaryHover: "#4f46e5",
    primaryLight: "#eef2ff",
    primaryText: "#ffffff",

    success: "#22c55e",
    warning: "#f59e0b",
    danger: "#ef4444",
    info: "#3b82f6",

    // Adaptive to VS Code theme
    bg: "var(--vscode-editor-background)",
    bgSecondary: "var(--vscode-sideBar-background)",
    bgTertiary: "var(--vscode-editor-inactiveSelectionBackground)",
    bgElevated: "var(--vscode-editorWidget-background)",

    text: "var(--vscode-editor-foreground)",
    textSecondary: "var(--vscode-descriptionForeground)",
    textTertiary: "var(--vscode-disabledForeground)",

    border: "var(--vscode-sideBar-border)",
    borderStrong: "var(--vscode-focusBorder)",
  },

  typography: {
    fontFamily: {
      sans: "var(--vscode-font-family)",
      mono: "var(--vscode-editor-font-family)",
    },
    fontSize: {
      xs: "11px",
      sm: "12px",
      base: "13px",
      lg: "14px",
      xl: "16px",
      "2xl": "18px",
      "3xl": "22px",
    },
    fontWeight: {
      normal: "400",
      medium: "500",
      semibold: "600",
      bold: "700",
    },
  },

  spacing: {
    1: "4px",
    2: "8px",
    3: "12px",
    4: "16px",
    5: "20px",
    6: "24px",
    8: "32px",
    10: "40px",
  },

  radius: {
    none: "0",
    sm: "2px",
    md: "4px",
    lg: "6px",
    xl: "8px",
  },

  shadow: {
    none: "none",
    sm: "0 1px 2px rgba(0,0,0,0.1)",
    md: "0 2px 8px rgba(0,0,0,0.15)",
    lg: "0 4px 16px rgba(0,0,0,0.2)",
  },

  transition: {
    fast: "100ms ease",
    base: "200ms ease",
    slow: "300ms ease",
  },

  icons: {
    changelog: "book",
    security: "shield",
    compliance: "checklist",
    settings: "gear",
    chat: "comment-discussion",
    generate: "play",
    scan: "search",
    refresh: "refresh",
    check: "check",
    error: "error",
    warning: "warning",
    info: "info",
    folder: "folder",
    file: "file",
    git: "git-branch",
    ai: "symbol-misc",
  },
};
