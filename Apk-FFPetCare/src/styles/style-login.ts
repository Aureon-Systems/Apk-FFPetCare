import { StyleSheet, Platform } from "react-native";
import { C, R } from "../lib/theme";

export { C as colors, R as radius };

export const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: C.bg },
  container: { flex: 1, justifyContent: "center", paddingHorizontal: 28 },

  logoWrap: { alignItems: "center", marginBottom: 48 },
  logoCircle: {
    width: 140,
    height: 140,
    borderRadius: R.pill,
    backgroundColor: C.white,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    ...Platform.select({
      ios: { shadowColor: C.cyan, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 14 },
      android: { elevation: 8 },
    }),
  },
  logoTitle: { fontSize: 28, fontWeight: "800", color: C.text, letterSpacing: -1 },
  logoImage: { width: 100, height: 100 },
  logoSub: { fontSize: 14, color: C.textMuted, marginTop: 4 },

  form: { gap: 14 },
  fieldWrap: { gap: 6 },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: C.textSub,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginLeft: 2,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.surface,
    borderWidth: 1.5,
    borderColor: C.border,
    borderRadius: R.md,
    paddingHorizontal: 14,
    gap: 10,
  },
  inputRowFocused: { borderColor: C.cyan },
  inputRowError: { borderColor: C.danger },
  input: { flex: 1, fontSize: 15, color: C.text, paddingVertical: 13 },
  eyeBtn: { padding: 4 },

  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: C.dangerLight,
    borderRadius: R.sm,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  errorText: { fontSize: 13, color: C.danger, fontWeight: "500", flex: 1 },

  loginBtn: {
    marginTop: 8,
    backgroundColor: C.cyan,
    borderRadius: R.md,
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    ...Platform.select({
      ios: { shadowColor: C.cyan, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 10 },
      android: { elevation: 6 },
    }),
  },
  loginBtnDisabled: { opacity: 0.5 },
  loginBtnText: { fontSize: 16, fontWeight: "700", color: C.text },

  footer: { alignItems: "center", marginTop: 48, gap: 4 },
  footerText: { fontSize: 12, color: C.textMuted },
});