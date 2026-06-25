import { StyleSheet, Platform } from "react-native";

// ─── Tokens (espelha style-dashboard para consistência visual) ────────────────

export const colors = {
  cyan: "#00E5FF",
  cyanLight: "#E0FBFF",
  background: "#F5F7FA",
  surface: "#FFFFFF",
  surfaceAlt: "#F0F4F8",
  border: "#E8ECF0",
  textPrimary: "#1A2030",
  textSecondary: "#5A6478",
  textMuted: "#9BA3B0",
  danger: "#F44336",
  dangerLight: "#FFEBEE",
  white: "#FFFFFF",
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 999,
} as const;

// ─── Estilos ─────────────────────────────────────────────────────────────────

export const styles = StyleSheet.create({
  // ── Estrutura ────────────────────────────────────────────────────────────────
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 48,
  },

  // ── Header ───────────────────────────────────────────────────────────────────
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },

  // ── Card de perfil ────────────────────────────────────────────────────────────
  profileCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 20,
    marginTop: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: { elevation: 3 },
    }),
  },
  profileAvatar: {
    width: 56,
    height: 56,
    borderRadius: radius.pill,
    backgroundColor: colors.cyanLight,
    alignItems: "center",
    justifyContent: "center",
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  profileRole: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  profileEditBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },

  // ── Seção de grupo ────────────────────────────────────────────────────────────
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginTop: 28,
    marginBottom: 8,
    marginLeft: 4,
  },
  group: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
      },
      android: { elevation: 1 },
    }),
  },

  // ── Linha de configuração ─────────────────────────────────────────────────────
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  rowSeparator: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: 52, // alinha após o ícone
  },
  rowIconWrap: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  rowContent: {
    flex: 1,
  },
  rowLabel: {
    fontSize: 15,
    fontWeight: "500",
    color: colors.textPrimary,
  },
  rowValue: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 1,
  },
  rowChevron: {
    marginLeft: 4,
  },

  // ── Campo editável inline ─────────────────────────────────────────────────────
  inlineInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
    color: colors.textPrimary,
    padding: 0, // remove padding nativo do TextInput
  },
  inlineInputEditing: {
    borderBottomWidth: 1.5,
    borderBottomColor: colors.cyan,
  },

  // ── Badge de sessão ───────────────────────────────────────────────────────────
  sessionBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.cyanLight,
  },
  sessionBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.cyan,
  },

  // ── Botão de logout ───────────────────────────────────────────────────────────
  logoutBtn: {
    marginTop: 24,
    backgroundColor: colors.dangerLight,
    borderRadius: radius.md,
    paddingVertical: 15,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.danger,
  },

  // ── Rodapé ────────────────────────────────────────────────────────────────────
  footer: {
    alignItems: "center",
    marginTop: 32,
    gap: 4,
  },
  footerText: {
    fontSize: 12,
    color: colors.textMuted,
  },
});