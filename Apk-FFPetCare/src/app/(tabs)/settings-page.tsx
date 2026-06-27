import React, { useState, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, Switch } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { loadSettings, saveSettings, sessionDaysLeft } from "../../lib/storage";
import { useAuth } from "../_layout";
import { AppSettings } from "../../lib/types";
import { styles, colors } from "../../styles/style-settings";

export default function SettingsPage() {
  const { signOut } = useAuth();
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [daysLeft, setDaysLeft] = useState(0);

  useFocusEffect(useCallback(() => {
    loadSettings().then(setSettings);
    sessionDaysLeft().then(setDaysLeft);
  }, []));

  const update = async <K extends keyof AppSettings>(k: K, v: AppSettings[K]) => {
    if (!settings) return;
    const next = { ...settings, [k]: v };
    setSettings(next);
    await saveSettings(next);
  };

  const handleLogout = () => {
    Alert.alert("Sair", "Você precisará fazer login novamente.", [
      { text: "Cancelar", style: "cancel" },
      { text: "Sair", style: "destructive", onPress: async () => {
        await signOut();
      }},
    ]);
  };

  if (!settings) return null;

  const Row = ({ icon, iconBg, iconColor, label, right, sep = true }: {
    icon: React.ComponentProps<typeof Ionicons>["name"];
    iconBg: string; iconColor: string; label: string;
    right?: React.ReactNode; sep?: boolean;
  }) => (
    <>
      <View style={styles.row}>
        <View style={[styles.rowIcon, { backgroundColor: iconBg }]}>
          <Ionicons name={icon} size={16} color={iconColor} />
        </View>
        <Text style={styles.rowLabel}>{label}</Text>
        {right}
      </View>
      {sep && <View style={styles.rowSep} />}
    </>
  );

  const EditRow = ({ icon, iconBg, iconColor, label, settingsKey, keyboard = "default", sep = true }: {
    icon: React.ComponentProps<typeof Ionicons>["name"];
    iconBg: string; iconColor: string; label: string;
    settingsKey: keyof AppSettings;
    keyboard?: React.ComponentProps<typeof TextInput>["keyboardType"];
    sep?: boolean;
  }) => {
    const [active, setActive] = useState(false);
    return (
      <>
        <View style={styles.row}>
          <View style={[styles.rowIcon, { backgroundColor: iconBg }]}>
            <Ionicons name={icon} size={16} color={iconColor} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 11, color: colors.textMuted, marginBottom: 1 }}>{label}</Text>
            <TextInput
              style={[styles.inlineInput, active && styles.inlineInputActive]}
              value={String(settings[settingsKey])}
              onChangeText={(v) => update(settingsKey, (keyboard === "number-pad" ? parseInt(v) || 0 : keyboard === "decimal-pad" ? parseFloat(v) || 0 : v) as any)}
              onFocus={() => setActive(true)}
              onBlur={() => setActive(false)}
              keyboardType={keyboard}
              placeholderTextColor={colors.textMuted}
            />
          </View>
        </View>
        {sep && <View style={styles.rowSep} />}
      </>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Configurações</Text>
        <Text style={styles.headerSub}>Preferências do FFPetCare</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Perfil */}
        <View style={styles.profileCard}>
          <View style={styles.profileAvatar}>
            <Ionicons name="person" size={26} color={colors.cyan} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.profileName}>Felipe</Text>
            <Text style={styles.profileRole}>Cuidador · FFPetCare</Text>
          </View>
          <View style={styles.sessionBadge}>
            <Text style={styles.sessionBadgeText}>{daysLeft}d</Text>
          </View>
        </View>

        {/* Hotel */}
        <Text style={styles.sectionLabel}>Hotel</Text>
        <View style={styles.group}>
          <EditRow icon="home-outline" iconBg={colors.cyanLight} iconColor={colors.cyan} label="Capacidade máxima" settingsKey="maxCapacity" keyboard="number-pad" />
          <EditRow icon="paw-outline" iconBg="#E8F5E9" iconColor="#388E3C" label="Diária — Porte Pequeno (R$)" settingsKey="rateSmall" keyboard="decimal-pad" />
          <EditRow icon="paw-outline" iconBg={colors.cyanLight} iconColor={colors.cyan} label="Diária — Porte Médio (R$)" settingsKey="rateMedium" keyboard="decimal-pad" />
          <EditRow icon="paw-outline" iconBg="#F3E5F5" iconColor={colors.purple} label="Diária — Porte Grande (R$)" settingsKey="rateLarge" keyboard="decimal-pad" sep={false} />
        </View>

        {/* Contato */}
        <Text style={styles.sectionLabel}>Contato</Text>
        <View style={styles.group}>
          <EditRow icon="call-outline" iconBg="#E8F5E9" iconColor="#388E3C" label="Telefone / WhatsApp" settingsKey="phone" keyboard="phone-pad" />
          <EditRow icon="key-outline" iconBg="#FFF8E1" iconColor="#F9A825" label="Chave Pix" settingsKey="pixKey" sep={false} />
        </View>

        {/* Sessão */}
        <Text style={styles.sectionLabel}>Sessão</Text>
        <View style={styles.group}>
          <Row
            icon="time-outline" iconBg={colors.cyanLight} iconColor={colors.cyan}
            label="Login expira em"
            sep={false}
            right={
              <View style={styles.sessionBadge}>
                <Text style={styles.sessionBadgeText}>{daysLeft} dias</Text>
              </View>
            }
          />
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={20} color={colors.danger} />
          <Text style={styles.logoutText}>Sair da conta</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>FFPetCare · v1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}