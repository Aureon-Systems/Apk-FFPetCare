import { Platform } from "react-native";

export const C = {
  cyan: "#00E5FF",
  cyanLight: "#E0FBFF",
  bg: "#F5F7FA",
  surface: "#FFFFFF",
  surfaceAlt: "#F0F4F8",
  border: "#E8ECF0",
  text: "#1A2030",
  textSub: "#5A6478",
  textMuted: "#9BA3B0",
  success: "#00C853",
  successLight: "#E0F5EB",
  warning: "#FF9800",
  warningLight: "#FFF3E0",
  danger: "#F44336",
  dangerLight: "#FFEBEE",
  purple: "#8E24AA",
  purpleLight: "#F3E5F5",
  white: "#FFFFFF",
} as const;

export const R = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
} as const;

export const shadow = (level: 1 | 2 | 3 = 2) =>
  Platform.select({
    ios: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: level },
      shadowOpacity: level === 1 ? 0.04 : level === 2 ? 0.06 : 0.09,
      shadowRadius: level === 1 ? 4 : level === 2 ? 8 : 12,
    },
    android: { elevation: level * 2 },
  }) ?? {};