import { StyleSheet, Platform } from "react-native";

// ─── Tokens ──────────────────────────────────────────────────────────────────

export const colors = {
  cyan: "#00E5FF",
  cyanLight: "#E0FBFF",
  cyanDim: "#B2EFF8",
  background: "#F5F7FA",
  surface: "#FFFFFF",
  surfaceAlt: "#F0F4F8",
  border: "#E8ECF0",
  textPrimary: "#1A2030",
  textSecondary: "#5A6478",
  textMuted: "#9BA3B0",
  success: "#00C853",
  successLight: "#E0F5EB",
  warning: "#FF9800",
  warningLight: "#FFF3E0",
  danger: "#F44336",
  dangerLight: "#FFEBEE",
  white: "#FFFFFF",
  black: "#000000",
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
} as const;

// ─── Estilos ─────────────────────────────────────────────────────────────────

export const styles = StyleSheet.create({
  // ── Estrutura ───────────────────────────────────────────────────────────────
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },

  // ── Header ──────────────────────────────────────────────────────────────────
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerLeft: {
    gap: 2,
  },
  headerGreeting: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: "400",
  },
  headerTitle: {
    fontSize: 22,
    color: colors.textPrimary,
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.cyanLight,
    alignItems: "center",
    justifyContent: "center",
  },

  // ── Seção de título ─────────────────────────────────────────────────────────
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 24,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  sectionAction: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.cyan,
  },

  // ── Card de capacidade (destaque principal) ──────────────────────────────────
  capacityCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 20,
    marginTop: 20,
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
  capacityRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  capacityLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  capacityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  capacityBadgeText: {
    fontSize: 12,
    fontWeight: "700",
  },
  capacityNumbers: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
    marginBottom: 12,
  },
  capacityCurrent: {
    fontSize: 48,
    fontWeight: "800",
    color: colors.textPrimary,
    lineHeight: 52,
    letterSpacing: -2,
  },
  capacityDivider: {
    fontSize: 28,
    color: colors.textMuted,
    fontWeight: "300",
  },
  capacityMax: {
    fontSize: 28,
    color: colors.textMuted,
    fontWeight: "500",
  },
  capacitySubtext: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 16,
  },

  // Barra de progresso
  progressTrack: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: radius.pill,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: radius.pill,
  },
  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  progressLabelText: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: "500",
  },

  // ── Cards de métricas (grid 2x2) ─────────────────────────────────────────────
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  metricCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
      },
      android: { elevation: 2 },
    }),
  },
  metricIconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  metricValue: {
    fontSize: 26,
    fontWeight: "800",
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  metricLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: "500",
    marginTop: 2,
  },

  // ── Card de faturamento ─────────────────────────────────────────────────────
  billingCard: {
    backgroundColor: colors.cyan,
    borderRadius: radius.lg,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    ...Platform.select({
      ios: {
        shadowColor: colors.cyan,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: { elevation: 6 },
    }),
  },
  billingLeft: {
    gap: 4,
  },
  billingLabel: {
    fontSize: 13,
    color: "rgba(0,0,0,0.5)",
    fontWeight: "600",
  },
  billingValue: {
    fontSize: 32,
    fontWeight: "800",
    color: colors.textPrimary,
    letterSpacing: -1,
  },
  billingSubtext: {
    fontSize: 12,
    color: "rgba(0,0,0,0.4)",
    fontWeight: "500",
  },
  billingIconWrap: {
    width: 52,
    height: 52,
    borderRadius: radius.pill,
    backgroundColor: "rgba(255,255,255,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },

  // ── Lista de cães ativos ─────────────────────────────────────────────────────
  dogCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
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
  dogAvatar: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.cyanLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  dogInfo: {
    flex: 1,
  },
  dogName: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  dogOwner: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1,
  },
  dogMeta: {
    flexDirection: "row",
    gap: 6,
    marginTop: 6,
    flexWrap: "wrap",
  },
  dogTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  dogTagText: {
    fontSize: 11,
    fontWeight: "600",
  },
  dogCheckout: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
    textAlign: "right",
  },

  // ── Estado vazio ─────────────────────────────────────────────────────────────
  emptyState: {
    alignItems: "center",
    paddingVertical: 32,
    gap: 8,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: "500",
  },

  // ── FAB (botão flutuante) ─────────────────────────────────────────────────────
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: radius.pill,
    backgroundColor: colors.cyan,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: colors.cyan,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
      },
      android: { elevation: 8 },
    }),
  },
});