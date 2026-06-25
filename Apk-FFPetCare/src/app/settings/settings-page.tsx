import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Alert,
  Switch,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { styles, colors, radius } from "./style-settings";
import { clearSession } from "../_layout";

// ─── Constantes ──────────────────────────────────────────────────────────────

const SETTINGS_KEY = "ffpetcare_settings";

// ─── Tipos ───────────────────────────────────────────────────────────────────

interface AppSettings {
  ownerName: string;
  phone: string;
  pixKey: string;
  maxCapacity: number;
  dailyRateDefault: number;
  medicationFeeDefault: number;
  notificationsEnabled: boolean;
  walkReminderEnabled: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  ownerName: "Felipe",
  phone: "",
  pixKey: "",
  maxCapacity: 6,
  dailyRateDefault: 60,
  medicationFeeDefault: 10,
  notificationsEnabled: true,
  walkReminderEnabled: true,
};

// ─── Persistência ─────────────────────────────────────────────────────────────

async function loadSettings(): Promise<AppSettings> {
  try {
    const raw = await AsyncStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

async function saveSettings(settings: AppSettings): Promise<void> {
  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

interface SettingsRowProps {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  iconBg: string;
  iconColor: string;
  label: string;
  value?: string;
  isLast?: boolean;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  editable?: boolean;
  onChangeText?: (v: string) => void;
  keyboardType?: React.ComponentProps<typeof TextInput>["keyboardType"];
  placeholder?: string;
}

function SettingsRow({
  icon,
  iconBg,
  iconColor,
  label,
  value,
  isLast,
  onPress,
  rightElement,
  editable,
  onChangeText,
  keyboardType = "default",
  placeholder,
}: SettingsRowProps) {
  const [editing, setEditing] = useState(false);

  const handlePress = () => {
    if (editable) {
      setEditing(true);
    } else if (onPress) {
      onPress();
    }
  };

  return (
    <>
      <TouchableOpacity
        style={styles.row}
        onPress={handlePress}
        activeOpacity={editable || onPress ? 0.6 : 1}
      >
        {/* Ícone */}
        <View style={[styles.rowIconWrap, { backgroundColor: iconBg }]}>
          <Ionicons name={icon} size={16} color={iconColor} />
        </View>

        {/* Conteúdo */}
        <View style={styles.rowContent}>
          <Text style={styles.rowLabel}>{label}</Text>

          {editable ? (
            <TextInput
              style={[styles.inlineInput, editing && styles.inlineInputEditing]}
              value={value}
              onChangeText={onChangeText}
              onFocus={() => setEditing(true)}
              onBlur={() => setEditing(false)}
              keyboardType={keyboardType}
              placeholder={placeholder}
              placeholderTextColor={colors.textMuted}
              returnKeyType="done"
            />
          ) : value ? (
            <Text style={styles.rowValue}>{value}</Text>
          ) : null}
        </View>

        {/* Elemento direito */}
        {rightElement ?? (
          onPress && !editable ? (
            <Ionicons
              name="chevron-forward"
              size={16}
              color={colors.textMuted}
              style={styles.rowChevron}
            />
          ) : null
        )}
      </TouchableOpacity>

      {!isLast && <View style={styles.rowSeparator} />}
    </>
  );
}

// ─── Tela principal ───────────────────────────────────────────────────────────

export default function SettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [sessionDaysLeft, setSessionDaysLeft] = useState<number | null>(null);

  // Carrega configurações e calcula dias restantes de sessão
  useFocusEffect(
    useCallback(() => {
      loadSettings().then(setSettings);

      AsyncStorage.getItem("ffpetcare_session").then((raw) => {
        if (!raw) return;
        const { loggedInAt } = JSON.parse(raw);
        const elapsed = Date.now() - loggedInAt;
        const remaining = Math.ceil((15 * 86_400_000 - elapsed) / 86_400_000);
        setSessionDaysLeft(Math.max(0, remaining));
      });
    }, [])
  );

  // Atualiza um campo e persiste
  const update = useCallback(
    async <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
      const updated = { ...settings, [key]: value };
      setSettings(updated);
      await saveSettings(updated);
    },
    [settings]
  );

  const handleLogout = () => {
    Alert.alert(
      "Sair da conta",
      "Você será desconectado e precisará fazer login novamente.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sair",
          style: "destructive",
          onPress: async () => {
            await clearSession();
            router.replace("/login/login-page");
          },
        },
      ]
    );
  };

  const handleResetData = () => {
    Alert.alert(
      "Resetar dados",
      "Isso apagará todos os hóspedes cadastrados. Esta ação não pode ser desfeita.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Resetar",
          style: "destructive",
          onPress: async () => {
            await AsyncStorage.removeItem("ffpetcare_dogs");
            Alert.alert("Pronto", "Dados de hóspedes apagados.");
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Configurações</Text>
        <Text style={styles.headerSubtitle}>Personalize o FFPetCare</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>

        {/* ── Card de perfil ──────────────────────────────────────────────── */}
        <View style={styles.profileCard}>
          <View style={styles.profileAvatar}>
            <Ionicons name="person" size={26} color={colors.cyan} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{settings.ownerName || "Felipe"}</Text>
            <Text style={styles.profileRole}>Cuidador de cães · FFPetCare</Text>
          </View>
          {sessionDaysLeft !== null && (
            <View style={styles.sessionBadge}>
              <Text style={styles.sessionBadgeText}>{sessionDaysLeft}d</Text>
            </View>
          )}
        </View>

        {/* ── Dados pessoais ──────────────────────────────────────────────── */}
        <Text style={styles.sectionLabel}>Dados pessoais</Text>
        <View style={styles.group}>
          <SettingsRow
            icon="person-outline"
            iconBg={colors.cyanLight}
            iconColor={colors.cyan}
            label="Nome"
            value={settings.ownerName}
            editable
            onChangeText={(v) => update("ownerName", v)}
            placeholder="Seu nome"
          />
          <View style={styles.rowSeparator} />
          <SettingsRow
            icon="call-outline"
            iconBg="#E8F5E9"
            iconColor="#388E3C"
            label="Telefone / WhatsApp"
            value={settings.phone}
            editable
            onChangeText={(v) => update("phone", v)}
            keyboardType="phone-pad"
            placeholder="(79) 9 0000-0000"
          />
          <View style={styles.rowSeparator} />
          <SettingsRow
            icon="key-outline"
            iconBg="#FFF8E1"
            iconColor="#F9A825"
            label="Chave Pix"
            value={settings.pixKey}
            editable
            onChangeText={(v) => update("pixKey", v)}
            placeholder="CPF, e-mail ou telefone"
            isLast
          />
        </View>

        {/* ── Configurações do hotel ───────────────────────────────────────── */}
        <Text style={styles.sectionLabel}>Hotel</Text>
        <View style={styles.group}>
          <SettingsRow
            icon="home-outline"
            iconBg={colors.cyanLight}
            iconColor={colors.cyan}
            label="Capacidade máxima"
            value={String(settings.maxCapacity)}
            editable
            onChangeText={(v) => update("maxCapacity", parseInt(v) || 6)}
            keyboardType="number-pad"
            placeholder="6"
          />
          <View style={styles.rowSeparator} />
          <SettingsRow
            icon="cash-outline"
            iconBg="#E8F5E9"
            iconColor="#388E3C"
            label="Diária padrão (R$)"
            value={String(settings.dailyRateDefault)}
            editable
            onChangeText={(v) => update("dailyRateDefault", parseFloat(v) || 60)}
            keyboardType="decimal-pad"
            placeholder="60"
          />
          <View style={styles.rowSeparator} />
          <SettingsRow
            icon="medical-outline"
            iconBg="#F3E5F5"
            iconColor="#8E24AA"
            label="Taxa de medicação padrão (R$/dia)"
            value={String(settings.medicationFeeDefault)}
            editable
            onChangeText={(v) => update("medicationFeeDefault", parseFloat(v) || 10)}
            keyboardType="decimal-pad"
            placeholder="10"
            isLast
          />
        </View>

        {/* ── Notificações ────────────────────────────────────────────────── */}
        <Text style={styles.sectionLabel}>Notificações</Text>
        <View style={styles.group}>
          <SettingsRow
            icon="notifications-outline"
            iconBg={colors.cyanLight}
            iconColor={colors.cyan}
            label="Notificações ativas"
            value="Alertas de check-out e medicação"
            rightElement={
              <Switch
                value={settings.notificationsEnabled}
                onValueChange={(v) => update("notificationsEnabled", v)}
                trackColor={{ false: colors.border, true: colors.cyan }}
                thumbColor={colors.white}
              />
            }
          />
          <View style={styles.rowSeparator} />
          <SettingsRow
            icon="walk-outline"
            iconBg="#E8F5E9"
            iconColor="#388E3C"
            label="Lembrete de passeios"
            value="Notifica nos horários configurados"
            isLast
            rightElement={
              <Switch
                value={settings.walkReminderEnabled}
                onValueChange={(v) => update("walkReminderEnabled", v)}
                trackColor={{ false: colors.border, true: colors.cyan }}
                thumbColor={colors.white}
              />
            }
          />
        </View>

        {/* ── Sessão ─────────────────────────────────────────────────────── */}
        <Text style={styles.sectionLabel}>Sessão</Text>
        <View style={styles.group}>
          <SettingsRow
            icon="time-outline"
            iconBg={colors.cyanLight}
            iconColor={colors.cyan}
            label="Login expira em"
            isLast
            rightElement={
              <View style={styles.sessionBadge}>
                <Text style={styles.sessionBadgeText}>
                  {sessionDaysLeft !== null ? `${sessionDaysLeft} dias` : "—"}
                </Text>
              </View>
            }
          />
        </View>

        {/* ── Dados ──────────────────────────────────────────────────────── */}
        <Text style={styles.sectionLabel}>Dados</Text>
        <View style={styles.group}>
          <SettingsRow
            icon="trash-outline"
            iconBg={colors.dangerLight ?? "#FFEBEE"}
            iconColor={colors.danger}
            label="Resetar hóspedes"
            value="Apaga todos os registros de cães"
            isLast
            onPress={handleResetData}
          />
        </View>

        {/* ── Logout ─────────────────────────────────────────────────────── */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={20} color={colors.danger} />
          <Text style={styles.logoutText}>Sair da conta</Text>
        </TouchableOpacity>

        {/* ── Rodapé ─────────────────────────────────────────────────────── */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>FFPetCare</Text>
          <Text style={styles.footerText}>v1.0.0 · Uso pessoal</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}