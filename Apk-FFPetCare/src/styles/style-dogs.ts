import { StyleSheet } from "react-native";

export const colors = {
  bg: "#F5F6FA",
  card: "#FFFFFF",
  cyan: "#00D4FF",
  cyanDim: "#00B8D9",
  cyanLight: "#E0FBFF",
  dark: "#1A2030",
  textSub: "#5A6478",
  textMuted: "#9BA3B0",
  border: "#E8ECF0",
  inputBg: "#F5F6FA",
  success: "#22C55E",
  successLight: "#DCFCE7",
  danger: "#EF4444",
  dangerLight: "#FEE2E2",
  warning: "#F59E0B",
  warningLight: "#FEF3C7",
  neutral: "#9BA3B0",
  neutralLight: "#F0F1F5",
};

export const styles = StyleSheet.create({
  // ── Layout ──────────────────────────────────────────────────────────────────
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingBottom: 100 },

  // ── Header ──────────────────────────────────────────────────────────────────
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.bg,
  },
  headerLeft: { gap: 2 },
  headerEyebrow: { fontSize: 11, fontWeight: "600", color: colors.cyan, letterSpacing: 1.2, textTransform: "uppercase" },
  headerTitle: { fontSize: 26, fontWeight: "800", color: colors.dark },

  headerIcon: {
    width: 42, height: 42, borderRadius: 999,
    backgroundColor: colors.cyanLight,
    alignItems: "center", justifyContent: "center",
  },

  // ── Search ──────────────────────────────────────────────────────────────────
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: 14,
    paddingHorizontal: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    height: 46,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: colors.dark,
  },

  // ── Filters ─────────────────────────────────────────────────────────────────
  filterRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 15,
    borderRadius: 999,
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.cyanLight,
    borderColor: colors.cyan,
  },
  filterChipText: { fontSize: 12, fontWeight: "600", color: colors.textSub },
  filterChipTextActive: { color: colors.cyanDim },

  // ── Summary strip ───────────────────────────────────────────────────────────
  summaryStrip: {
    flexDirection: "row",
    gap: 10,
    marginHorizontal: 16,
    marginBottom: 20,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  summaryValue: { fontSize: 22, fontWeight: "800", color: colors.dark },
  summaryLabel: { fontSize: 10, fontWeight: "600", color: colors.textMuted, marginTop: 2, textTransform: "uppercase", letterSpacing: 0.8 },

  // ── Dog Card ────────────────────────────────────────────────────────────────
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  dogCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  dogCardTop: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
  avatar: {
    width: 48, height: 48, borderRadius: 999,
    backgroundColor: colors.cyanLight,
    alignItems: "center", justifyContent: "center",
  },
  avatarText: { fontSize: 22 },
  dogInfo: { flex: 1 },
  dogName: { fontSize: 16, fontWeight: "700", color: colors.dark },
  dogOwner: { fontSize: 13, color: colors.textSub, marginTop: 1 },
  dogPhone: { fontSize: 12, color: colors.textMuted, marginTop: 1 },

  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  badgeText: { fontSize: 11, fontWeight: "700" },

  dogCardDivider: { height: 1, backgroundColor: colors.border, marginBottom: 12 },

  dogCardBottom: { flexDirection: "row", justifyContent: "space-between" },
  dogMeta: { gap: 3 },
  dogMetaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  dogMetaText: { fontSize: 12, color: colors.textSub },

  dogRateBlock: { alignItems: "flex-end", gap: 3 },
  dogRate: { fontSize: 18, fontWeight: "800", color: colors.dark },
  dogRateSub: { fontSize: 11, color: colors.textMuted },
  dogTotal: { fontSize: 12, fontWeight: "600", color: colors.cyan },

  // ── Empty ────────────────────────────────────────────────────────────────────
  empty: { alignItems: "center", paddingVertical: 48, gap: 10 },
  emptyTitle: { fontSize: 16, fontWeight: "700", color: colors.dark },
  emptyText: { fontSize: 13, color: colors.textMuted },

  // ── FAB ─────────────────────────────────────────────────────────────────────
  fab: {
    position: "absolute", bottom: 28, right: 20,
    width: 58, height: 58, borderRadius: 999,
    backgroundColor: colors.cyan,
    alignItems: "center", justifyContent: "center",
    shadowColor: colors.cyan,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 8,
  },

  // ── Modal ────────────────────────────────────────────────────────────────────
  modalContainer: { flex: 1, backgroundColor: colors.bg },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: { fontSize: 16, fontWeight: "700", color: colors.dark },
  modalCloseBtn: {
    width: 36, height: 36, borderRadius: 999,
    backgroundColor: colors.inputBg,
    alignItems: "center", justifyContent: "center",
  },
  modalSaveBtn: {
    paddingHorizontal: 18, paddingVertical: 8,
    backgroundColor: colors.cyan,
    borderRadius: 999,
  },
  modalSaveBtnText: { fontSize: 13, fontWeight: "700", color: colors.dark },
  modalScroll: { padding: 20, paddingBottom: 40 },

  // ── Form ─────────────────────────────────────────────────────────────────────
  fieldLabel: { fontSize: 12, fontWeight: "600", color: colors.textSub, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.6 },
  input: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: colors.dark,
  },
  inputFocused: { borderColor: colors.cyan },
  chips: { flexDirection: "row", gap: 8 },
  chip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.cyanLight, borderColor: colors.cyan },
  chipText: { fontSize: 13, fontWeight: "600", color: colors.textSub },
  chipTextActive: { color: colors.cyanDim },

  formHint: { fontSize: 11, color: colors.textMuted, marginTop: 4 },
});