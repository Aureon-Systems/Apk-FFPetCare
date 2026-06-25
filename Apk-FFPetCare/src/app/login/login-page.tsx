import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { styles, colors } from "./style-login";
import { writeSession } from "../_layout";

// ─── Credenciais estáticas ────────────────────────────────────────────────────
// Altere aqui para as credenciais reais do Felipe.
// Como o app é compilado como APK direto, isso é suficientemente seguro
// para uso pessoal de operador único.

const VALID_EMAIL = "felipe@ffpetcare.com";
const VALID_PASSWORD = "PetCare@2025";

// ─── Componente ──────────────────────────────────────────────────────────────

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const passwordRef = useRef<TextInput>(null);

  const handleLogin = async () => {
    Keyboard.dismiss();
    setError(null);

    // Validação básica de campos vazios
    if (!email.trim() || !password) {
      setError("Preencha e-mail e senha para continuar.");
      return;
    }

    setLoading(true);

    // Simula um pequeno delay de autenticação (UX feedback)
    await new Promise((resolve) => setTimeout(resolve, 600));

    const emailNorm = email.trim().toLowerCase();

    if (emailNorm !== VALID_EMAIL || password !== VALID_PASSWORD) {
      setError("E-mail ou senha incorretos. Tente novamente.");
      setLoading(false);
      return;
    }

    // Grava a sessão com timestamp atual (expira em 15 dias — ver _layout.tsx)
    await writeSession();

    setLoading(false);
    router.replace("dashboard/dashboard-page");
  };

  const isFormFilled = email.trim().length > 0 && password.length > 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* ── Logo ───────────────────────────────────────────────────────── */}
        <View style={styles.logoWrap}>
          <View style={styles.logoCircle}>
            <Ionicons name="paw" size={34} color={colors.textPrimary} />
          </View>
          <Text style={styles.logoTitle}>FFPetCare</Text>
          <Text style={styles.logoSubtitle}>Área do cuidador</Text>
        </View>

        {/* ── Formulário ─────────────────────────────────────────────────── */}
        <View style={styles.form}>
          {/* E-mail */}
          <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>E-mail</Text>
            <View
              style={[
                styles.inputRow,
                emailFocused && styles.inputRowFocused,
                error && !emailFocused && styles.inputRowError,
              ]}
            >
              <Ionicons
                name="mail-outline"
                size={18}
                color={emailFocused ? colors.cyan : colors.textMuted}
              />
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={(v) => {
                  setEmail(v);
                  setError(null);
                }}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                placeholder="seu@email.com"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
                editable={!loading}
              />
            </View>
          </View>

          {/* Senha */}
          <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>Senha</Text>
            <View
              style={[
                styles.inputRow,
                passwordFocused && styles.inputRowFocused,
                error && !passwordFocused && styles.inputRowError,
              ]}
            >
              <Ionicons
                name="lock-closed-outline"
                size={18}
                color={passwordFocused ? colors.cyan : colors.textMuted}
              />
              <TextInput
                ref={passwordRef}
                style={styles.input}
                value={password}
                onChangeText={(v) => {
                  setPassword(v);
                  setError(null);
                }}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                placeholder="••••••••"
                placeholderTextColor={colors.textMuted}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
                editable={!loading}
              />
              <TouchableOpacity
                style={styles.eyeBtn}
                onPress={() => setShowPassword((prev) => !prev)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={18}
                  color={colors.textMuted}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Mensagem de erro */}
          {error && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle-outline" size={16} color={colors.danger} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Botão de entrar */}
          <TouchableOpacity
            style={[styles.loginBtn, (!isFormFilled || loading) && styles.loginBtnDisabled]}
            onPress={handleLogin}
            disabled={!isFormFilled || loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator size="small" color={colors.textPrimary} />
            ) : (
              <>
                <Text style={styles.loginBtnText}>Entrar</Text>
                <Ionicons name="arrow-forward" size={18} color={colors.textPrimary} />
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* ── Rodapé ─────────────────────────────────────────────────────── */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Acesso restrito ao operador</Text>
          <Text style={styles.footerText}>Sessão válida por 15 dias</Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}