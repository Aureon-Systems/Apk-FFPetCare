import { StyleSheet, Platform } from "react-native";

export const colors = {
  cyan: "#00E5FF",
  cyanLight: "#E0FBFF",
  cyanDark: "#00B8D4",
  background: "#F5F7FA",
  surface: "#FFFFFF",
  border: "#E8ECF0",
  borderFocus: "#00E5FF",
  textPrimary: "#1A2030",
  textSecondary: "#5A6478",
  textMuted: "#9BA3B0",
  danger: "#F44336",
  white: "#FFFFFF",
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
} as const;

export const styles = StyleSheet.create({
  // ── Estrutura ────────────────────────────────────────────────────────────────
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 28,
  },

  // ── Logo / Identidade ─────────────────────────────────────────────────────────
  logoWrap: {
    alignItems: "center",
    marginBottom: 48,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: radius.pill,
    backgroundColor: colors.cyan,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: colors.cyan,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 14,
      },
      android: { elevation: 8 },
    }),
  },
  logoTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.textPrimary,
    letterSpacing: -1,
  },
  logoSubtitle: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 4,
    fontWeight: "400",
  },

  // ── Formulário ────────────────────────────────────────────────────────────────
  form: {
    gap: 14,
  },
  fieldWrap: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginLeft: 2,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    gap: 10,
  },
  inputRowFocused: {
    borderColor: colors.cyan,
  },
  inputRowError: {
    borderColor: colors.danger,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: colors.textPrimary,
    paddingVertical: 13,
  },
  eyeBtn: {
    padding: 4,
  },

  // ── Erro ──────────────────────────────────────────────────────────────────────
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FFEBEE",
    borderRadius: radius.sm,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  errorText: {
    fontSize: 13,
    color: colors.danger,
    fontWeight: "500",
    flex: 1,
  },

  // ── Botão de entrar ───────────────────────────────────────────────────────────
  loginBtn: {
    marginTop: 8,
    backgroundColor: colors.cyan,
    borderRadius: radius.md,
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    ...Platform.select({
      ios: {
        shadowColor: colors.cyan,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 10,
      },
      android: { elevation: 6 },
    }),
  },
  loginBtnDisabled: {
    opacity: 0.55,
  },
  loginBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textPrimary,
    letterSpacing: 0.2,
  },

  // ── Rodapé ────────────────────────────────────────────────────────────────────
  footer: {
    alignItems: "center",
    marginTop: 48,
    gap: 4,
  },
  footerText: {
    fontSize: 12,
    color: colors.textMuted,
  },
});