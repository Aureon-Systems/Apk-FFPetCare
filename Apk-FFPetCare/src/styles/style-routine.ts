import { StyleSheet, Platform } from "react-native";
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

  // ── FAB ───────────────────────────────────────────────────────────────────
  fab: {
    position: "absolute", bottom: 28, right: 20,
    width: 58, height: 58, borderRadius: R.pill,
    backgroundColor: C.cyan,
    alignItems: "center", justifyContent: "center",
    ...Platform.select({
      ios: { shadowColor: C.cyan, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.45, shadowRadius: 12 },
      android: { elevation: 8 },
    }),
  },

  // ── Seção "Todos os serviços" ────────────────────────────────────────────────
  allSection: { paddingHorizontal: 16, marginTop: 28 },
  allSectionTitle: {
    fontSize: 13, fontWeight: "700", color: C.textSub,
    textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 12,
  },
  serviceItem: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: C.surface, borderRadius: R.md, padding: 14, marginBottom: 8,
    ...shadow(1),
  },
  serviceAvatar: {
    width: 40, height: 40, borderRadius: R.pill, overflow: "hidden",
    backgroundColor: C.cyanLight, alignItems: "center", justifyContent: "center",
  },
  serviceAvatarImg: { width: "100%", height: "100%" },
  serviceAvatarText: { fontSize: 18 },
  serviceInfo: { flex: 1 },
  serviceName: { fontSize: 14, fontWeight: "700", color: C.text },
  serviceMeta: { fontSize: 12, color: C.textMuted, marginTop: 1 },
  serviceStatusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: R.pill },
  serviceStatusText: { fontSize: 11, fontWeight: "700" },

  // ── Modal de cadastro/edição ─────────────────────────────────────────────────
  modalContainer: { flex: 1, backgroundColor: C.bg },
  modalHeader: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingVertical: 14,
    backgroundColor: C.surface, borderBottomWidth: 1, borderBottomColor: C.border,
  },
  modalTitle: { fontSize: 16, fontWeight: "700", color: C.text },
  modalCloseBtn: {
    width: 36, height: 36, borderRadius: R.pill,
    backgroundColor: C.surfaceAlt, alignItems: "center", justifyContent: "center",
  },
  modalSaveBtn: { paddingHorizontal: 18, paddingVertical: 8, backgroundColor: C.cyan, borderRadius: R.pill },
  modalSaveBtnDisabled: { opacity: 0.5 },
  modalSaveBtnText: { fontSize: 13, fontWeight: "700", color: C.text },
  modalScroll: { padding: 20, paddingBottom: 40 },

  formGroupLabel: {
    fontSize: 12, fontWeight: "700", color: "#006064",
    textTransform: "uppercase", letterSpacing: 0.7, marginTop: 22, marginBottom: 12,
  },
  field: { marginBottom: 14 },
  fieldRow: { flexDirection: "row", gap: 10 },
  fieldLabel: { fontSize: 12, fontWeight: "600", color: C.textSub, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.6 },
  input: {
    backgroundColor: C.surface, borderRadius: R.md, borderWidth: 1.5, borderColor: C.border,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: C.text,
  },
  inputDisplay: {
    backgroundColor: C.surface, borderRadius: R.md, borderWidth: 1.5, borderColor: C.border,
    paddingHorizontal: 14, paddingVertical: 12, flexDirection: "row", alignItems: "center", gap: 8,
  },
  inputDisplayText: { fontSize: 14, color: C.text, flex: 1 },
  inputDisplayPlaceholder: { color: C.textMuted },

  chips: { flexDirection: "row", gap: 8 },
  chip: {
    flex: 1, paddingVertical: 10, borderRadius: R.md, alignItems: "center",
    backgroundColor: C.surface, borderWidth: 1.5, borderColor: C.border,
  },
  chipActive: { backgroundColor: C.cyanLight, borderColor: C.cyan },
  chipText: { fontSize: 13, fontWeight: "600", color: C.textSub },
  chipTextActive: { color: "#006064" },

  // ── Foto do cão ───────────────────────────────────────────────────────────────
  photoPicker: {
    width: 96, height: 96, borderRadius: R.pill, alignSelf: "center",
    backgroundColor: C.surfaceAlt, borderWidth: 1.5, borderColor: C.border, borderStyle: "dashed",
    alignItems: "center", justifyContent: "center", overflow: "hidden", marginBottom: 18,
  },
  photoPickerImg: { width: "100%", height: "100%" },
  photoPickerText: { fontSize: 11, color: C.textMuted, marginTop: 4, fontWeight: "600" },

  // ── Medicações (linhas repetíveis) ──────────────────────────────────────────
  medRow: { flexDirection: "row", gap: 8, alignItems: "center", marginBottom: 8 },
  medRemoveBtn: {
    width: 36, height: 36, borderRadius: R.sm, backgroundColor: C.dangerLight,
    alignItems: "center", justifyContent: "center",
  },
  addRowBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
    paddingVertical: 10, borderRadius: R.sm, borderWidth: 1.5, borderColor: C.cyan,
    borderStyle: "dashed", marginTop: 2,
  },
  addRowBtnText: { fontSize: 13, fontWeight: "700", color: "#006064" },

  deleteBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
    paddingVertical: 13, borderRadius: R.md, backgroundColor: C.dangerLight, marginTop: 28,
  },
  deleteBtnText: { fontSize: 14, fontWeight: "700", color: C.danger },

  // ── Modal de seleção de datas ───────────────────────────────────────────────
  pickerModalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  pickerModalSheet: { backgroundColor: C.surface, borderTopLeftRadius: R.xl, borderTopRightRadius: R.xl, paddingBottom: 24 },
  pickerModalHeader: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: C.border,
  },
  pickerModalTitle: { fontSize: 15, fontWeight: "700", color: C.text },
  pickerRangeHint: { paddingHorizontal: 20, paddingTop: 12, fontSize: 12, color: C.textSub },
  pickerConfirmBtn: {
    marginHorizontal: 20, marginTop: 16, backgroundColor: C.cyan,
    borderRadius: R.md, paddingVertical: 13, alignItems: "center",
  },
  pickerConfirmBtnDisabled: { opacity: 0.5 },
  pickerConfirmBtnText: { fontSize: 14, fontWeight: "700", color: C.text },
});