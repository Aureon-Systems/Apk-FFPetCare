import { StyleSheet, Platform } from "react-native";
import { C, R, shadow } from "../lib/theme";

export { C as colors, R as radius };

export const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: C.bg },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 48 },

  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: C.surface,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  headerTitle: { fontSize: 22, fontWeight: "700", color: C.text, letterSpacing: -0.5 },
  headerSub: { fontSize: 13, color: C.textMuted, marginTop: 2 },

  // ── Logo ─────────────────────────────────────────────────────────────────────
  logoWrap: { alignItems: "center", marginBottom: 48 },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: R.pill,
    backgroundColor: C.white,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    ...Platform.select({
      ios: { shadowColor: C.white, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 14 },
      android: { elevation: 8 },
    }),
  },
    logoTitle: { fontSize: 28, fontWeight: "800", color: C.text, letterSpacing: -1 },
    logoImage: { width: 60, height: 60 },
    logoSub: { fontSize: 14, color: C.textMuted, marginTop: 4 },

  // ── Profile ──────────────────────────────────────────────────────────────────
  profileCard: {
    backgroundColor: C.surface,
    borderRadius: R.lg,
    padding: 20,
    marginTop: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    ...shadow(2),
  },
  profileAvatar: {
    width: 56,
    height: 56,
    borderRadius: R.pill,
    backgroundColor: C.white,
    alignItems: "center",
    justifyContent: "center",
  },
  profileName: { fontSize: 18, fontWeight: "700", color: C.text },
  profileRole: { fontSize: 13, color: C.textSub, marginTop: 2 },
  sessionBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: R.pill, backgroundColor: C.cyanLight, marginLeft: "auto" },
  sessionBadgeText: { fontSize: 12, fontWeight: "700", color: C.cyan },

  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: C.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginTop: 28,
    marginBottom: 8,
    marginLeft: 4,
  },
  group: {
    backgroundColor: C.surface,
    borderRadius: R.md,
    overflow: "hidden",
    ...shadow(1),
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  rowSep: { height: 1, backgroundColor: C.border, marginLeft: 52 },
  rowIcon: {
    width: 32,
    height: 32,
    borderRadius: R.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  rowLabel: { fontSize: 15, fontWeight: "500", color: C.text, flex: 1 },
  rowValue: { fontSize: 13, color: C.textMuted },

  inlineInput: { flex: 1, fontSize: 15, color: C.text, padding: 0 },
  inlineInputActive: { borderBottomWidth: 1.5, borderBottomColor: C.cyan },

  logoutBtn: {
    marginTop: 24,
    backgroundColor: C.dangerLight,
    borderRadius: R.md,
    paddingVertical: 15,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  logoutText: { fontSize: 15, fontWeight: "700", color: C.danger },

  footer: { alignItems: "center", marginTop: 32, gap: 4 },
  footerText: { fontSize: 12, color: C.textMuted },
});