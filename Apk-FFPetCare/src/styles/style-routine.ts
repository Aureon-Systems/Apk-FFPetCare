import { StyleSheet } from "react-native";
import { C, R, shadow } from "../lib/theme";

export { C as colors, R as radius };

export const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: C.bg },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 60 },

  // ── Header ───────────────────────────────────────────────────────────────────
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
    backgroundColor: C.surface,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  headerTitle: { fontSize: 22, fontWeight: "700", color: C.text, letterSpacing: -0.5 },
  headerSub: { fontSize: 13, color: C.textMuted, marginTop: 2 },

  // ── Calendário ───────────────────────────────────────────────────────────────
  calendarWrap: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: R.lg,
    overflow: "hidden",
    backgroundColor: C.surface,
    ...shadow(2),
  },
  calendarLegend: {
    flexDirection: "row",
    gap: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: R.pill },
  legendText: { fontSize: 12, color: C.textSub, fontWeight: "500" },

  // ── Seção de dia selecionado ──────────────────────────────────────────────────
  daySection: { paddingHorizontal: 16, marginTop: 20 },
  daySectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: C.textSub,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 12,
  },

  // ── Card de cão na rotina ─────────────────────────────────────────────────────
  dogCard: {
    backgroundColor: C.surface,
    borderRadius: R.md,
    padding: 16,
    marginBottom: 12,
    ...shadow(1),
  },
  dogCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  dogAvatar: {
    width: 44,
    height: 44,
    borderRadius: R.pill,
    backgroundColor: C.cyanLight,
    alignItems: "center",
    justifyContent: "center",
  },
  dogAvatarText: { fontSize: 22 },
  dogInfo: { flex: 1 },
  dogName: { fontSize: 15, fontWeight: "700", color: C.text },
  dogOwner: { fontSize: 12, color: C.textSub, marginTop: 1 },
  dogBadgeRow: { flexDirection: "row", gap: 6, marginTop: 5, flexWrap: "wrap" },
  dogBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: R.pill },
  dogBadgeText: { fontSize: 11, fontWeight: "600" },
  dogProgress: { alignItems: "flex-end" },
  dogProgressText: { fontSize: 13, fontWeight: "700" },
  dogProgressSub: { fontSize: 11, color: C.textMuted, marginTop: 1 },

  // ── Divider antes das tasks ───────────────────────────────────────────────────
  tasksDivider: {
    height: 1,
    backgroundColor: C.border,
    marginTop: 14,
    marginBottom: 12,
  },
  tasksLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: C.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 8,
  },

  // ── Linha de task ─────────────────────────────────────────────────────────────
  taskRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: R.sm,
    backgroundColor: C.surfaceAlt,
    marginBottom: 6,
  },
  taskRowDone: { backgroundColor: C.successLight },
  taskCheck: {
    width: 26,
    height: 26,
    borderRadius: R.pill,
    borderWidth: 2,
    borderColor: C.border,
    alignItems: "center",
    justifyContent: "center",
  },
  taskCheckDone: { backgroundColor: C.success, borderColor: C.success },
  taskType: { fontSize: 13, fontWeight: "600", color: C.textSub, flex: 1 },
  taskTypeDone: { color: C.success, textDecorationLine: "line-through" },
  taskTime: {
    fontSize: 12,
    fontWeight: "700",
    color: C.textMuted,
    backgroundColor: C.border,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: R.pill,
  },
  taskTimeDone: { backgroundColor: C.successLight, color: C.success },

  // ── Empty state ───────────────────────────────────────────────────────────────
  empty: { alignItems: "center", paddingVertical: 40, gap: 8 },
  emptyText: { fontSize: 14, color: C.textMuted, fontWeight: "500" },
  emptySub: { fontSize: 12, color: C.textMuted, textAlign: "center" },

  // ── Chip de evento do dia (check-in / check-out) ──────────────────────────────
  eventChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: R.sm,
    marginBottom: 6,
  },
  eventChipText: { fontSize: 13, fontWeight: "600", flex: 1 },
  eventChipDate: { fontSize: 11, fontWeight: "500" },
});