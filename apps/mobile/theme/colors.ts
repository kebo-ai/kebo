
export const colors = {
  // Brand tokens (same in both modes)
  primary: "#6934D2",
  primaryBg: "rgba(105, 52, 210, 0.15)",
  secondary: "#260035",
  white: "#FFFFFF",
  black: "#000000",
  gray: "#747775",
  textGray: "#606A84",
  bgClear: "#F0EBFB",
  bgGray: "#B7BBC7",
  "border-gray": "#D8DADC",
  danger: "#EF4444",

  // Semantic tokens for dark mode
  light: {
    background: "#FAFAFA",
    surface: "#FFFFFF",
    surfaceSecondary: "#F5F5F7",
    textPrimary: "#110627",
    textSecondary: "#606A84",
    textTertiary: "rgba(96, 106, 132, 0.5)",
    border: "#EBEBEF",
    chevron: "#C8C8D0",
    navigationBar: "#FFFFFF",
    blurEffect: "extraLight" as const,
    headerTitle: "#110627",
  },
  dark: {
    background: "#000000",
    surface: "#1C1C1E",
    surfaceSecondary: "#2C2C2E",
    textPrimary: "#FFFFFF",
    textSecondary: "#ABABAB",
    textTertiary: "rgba(255, 255, 255, 0.35)",
    border: "#3A3A3C",
    chevron: "#636366",
    navigationBar: "#1C1C1E",
    blurEffect: "dark" as const,
    headerTitle: "#FFFFFF",
  },
} as const
