import React, { useState, useRef } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ActivityIndicator, Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { writeSession } from "../lib/storage";
import { styles, colors } from "../styles/style-login";

// ─── Credenciais estáticas ────────────────────────────────────────────────────
const EMAIL = "felipe@ffpetcare.com";
const PASSWORD = "PetCare@2025";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [pwdFocused, setPwdFocused] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const pwdRef = useRef<TextInput>(null);

  const handleLogin = async () => {
    Keyboard.dismiss();
    setError(null);
    if (!email.trim() || !password) {
      setError("Preencha e-mail e senha.");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    if (email.trim().toLowerCase() !== EMAIL || password !== PASSWORD) {
      setError("E-mail ou senha incorretos.");
      setLoading(false);
      return;
    }
    await writeSession();
    router.replace("/dashboard-page");
  };

  const filled = email.trim().length > 0 && password.length > 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Logo */}
        <View style={styles.logoWrap}>
          <View style={styles.logoCircle}>
            <Ionicons name="paw" size={34} color="#1A2030" />
          </View>
          <Text style={styles.logoTitle}>FFPetCare</Text>
          <Text style={styles.logoSub}>Área do cuidador</Text>
        </View>

        {/* Formulário */}
        <View style={styles.form}>
          <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>E-mail</Text>
            <View style={[styles.inputRow, emailFocused && styles.inputRowFocused, !!error && styles.inputRowError]}>
              <Ionicons name="mail-outline" size={18} color={emailFocused ? colors.cyan : colors.textMuted} />
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={(v) => { setEmail(v); setError(null); }}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                placeholder="seu@email.com"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="none"
                keyboardType="email-address"
                returnKeyType="next"
                onSubmitEditing={() => pwdRef.current?.focus()}
                editable={!loading}
              />
            </View>
          </View>

          <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>Senha</Text>
            <View style={[styles.inputRow, pwdFocused && styles.inputRowFocused, !!error && styles.inputRowError]}>
              <Ionicons name="lock-closed-outline" size={18} color={pwdFocused ? colors.cyan : colors.textMuted} />
              <TextInput
                ref={pwdRef}
                style={styles.input}
                value={password}
                onChangeText={(v) => { setPassword(v); setError(null); }}
                onFocus={() => setPwdFocused(true)}
                onBlur={() => setPwdFocused(false)}
                placeholder="••••••••"
                placeholderTextColor={colors.textMuted}
                secureTextEntry={!showPwd}
                autoCapitalize="none"
                returnKeyType="done"
                onSubmitEditing={handleLogin}
                editable={!loading}
              />
              <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPwd((p) => !p)}>
                <Ionicons name={showPwd ? "eye-off-outline" : "eye-outline"} size={18} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
          </View>

          {error && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle-outline" size={16} color={colors.danger} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.loginBtn, (!filled || loading) && styles.loginBtnDisabled]}
            onPress={handleLogin}
            disabled={!filled || loading}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator size="small" color="#1A2030" />
              : <><Text style={styles.loginBtnText}>Entrar</Text><Ionicons name="arrow-forward" size={18} color="#1A2030" /></>
            }
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Acesso exclusivo do Felipe · Sessão de 15 dias</Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}