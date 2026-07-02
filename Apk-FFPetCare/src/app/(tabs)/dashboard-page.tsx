import React, { useState, useCallback } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, Alert, StyleSheet, Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { isActiveToday, calcTotalValue, formatCurrency, fmtDate, monthRevenue, parseLocalDate, loadSettings } from "../../lib/storage";
import { loadDogs, removeDog } from "../../lib/dogs-service";
import { styles, colors } from "../../styles/style-dashboard";
import { Dog, DogSize, DEFAULT_SETTINGS } from "../../lib/types";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function capStatus(n: number, maxCapacity: number) {
  const r = n / maxCapacity;
  if (r < 0.5) return { label: "Disponível", color: colors.success, bg: colors.successLight };
  if (r < 0.84) return { label: "Moderado", color: colors.warning, bg: colors.warningLight };
  return { label: "Lotado", color: colors.danger, bg: colors.dangerLight };
}

function sizeEmoji(s: DogSize) {
  return s === "Grande" ? "🐕‍🦺" : "🐕";
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [maxCapacity, setMaxCapacity] = useState(DEFAULT_SETTINGS.maxCapacity);
  const router = useRouter();

useFocusEffect(
  useCallback(() => {
    let ativo = true;
    loadDogs().then((data) => {
      if (ativo) setDogs(data);
    });
    loadSettings().then((s) => {
      if (ativo) setMaxCapacity(s.maxCapacity);
    });
    return () => { ativo = false; };
  }, [])
);

  const active = dogs.filter(isActiveToday);
  const cap = capStatus(active.length, maxCapacity);
  const fill = Math.min(active.length / maxCapacity, 1);
  const fillColor = fill < 0.5 ? colors.success : fill < 0.84 ? colors.warning : colors.danger;
  const revenue = monthRevenue(dogs);

  // Próximos eventos (7 dias)
  const upcoming = (() => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const limit = new Date(today); limit.setDate(limit.getDate() + 7);
    const evts: { dog: Dog; type: "in" | "out"; date: string }[] = [];
    dogs.forEach((d) => {
      const ci = parseLocalDate(d.checkIn);
      const co = parseLocalDate(d.checkOut);
      if (ci >= today && ci <= limit) evts.push({ dog: d, type: "in", date: d.checkIn });
      if (co >= today && co <= limit) evts.push({ dog: d, type: "out", date: d.checkOut });
    });
    return evts.sort((a, b) => a.date.localeCompare(b.date)).slice(0, 5);
  })();

const handleRemove = useCallback((dog: Dog) => {
  Alert.alert("Remover hóspede", `Remover ${dog.name}?`, [
    { text: "Cancelar", style: "cancel" },
    {
      text: "Remover", style: "destructive",
      onPress: async () => {
        const ok = await removeDog(dog.id);
        if (ok) {
          setDogs((prev) => prev.filter((d) => d.id !== dog.id));
        } else {
          Alert.alert("Erro", "Não foi possível remover a hospedagem.");
        }
      },
    },
  ]);
}, []);

  const greeting = () => {
    const h = new Date().getHours();
    return h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite";
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerGreeting}>{greeting()}, Filipe 👋</Text>
          <Text style={styles.headerTitle}>Painel</Text>
        </View>
        <View style={styles.headerAvatar}>
          <Image
              source={require("../../../assets/images/logo.png")}
              style={styles.logoImage}
              resizeMode="contain"
            />
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>

        {/* Faturamento */}
        <View style={styles.billingCard}>
          <View>
            <Text style={styles.billingLabel}>FATURAMENTO DO MÊS</Text>
            <Text style={styles.billingValue}>{formatCurrency(revenue)}</Text>
            <Text style={styles.billingPeriod}>
              {new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
            </Text>
          </View>
          <View style={styles.billingIcon}>
            <Ionicons name="wallet-outline" size={26} color="#1A2030" />
          </View>
        </View>

        {/* Capacidade */}
        <View style={styles.capacityCard}>
          <View style={styles.capacityRow}>
            <Text style={styles.capacityLabel}>Capacidade do hotel</Text>
            <View style={[styles.badge, { backgroundColor: cap.bg }]}>
              <Text style={[styles.badgeText, { color: cap.color }]}>{cap.label}</Text>
            </View>
          </View>
          <View style={styles.capacityNumbers}>
            <Text style={styles.capacityCurrent}>{active.length}</Text>
            <Text style={styles.capacitySlash}>/</Text>
            <Text style={styles.capacityMax}>{maxCapacity}</Text>
          </View>
          <Text style={styles.capacitySub}>
            {maxCapacity - active.length > 0
              ? `${maxCapacity - active.length} vaga${maxCapacity - active.length > 1 ? "s" : ""} disponíve${maxCapacity - active.length > 1 ? "is" : "l"}`
              : "Hotel lotado hoje"}
          </Text>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${fill * 100}%`, backgroundColor: fillColor }]} />
          </View>
          <View style={styles.trackLabels}>
            <Text style={styles.trackLabel}>0</Text>
            <Text style={styles.trackLabel}>{maxCapacity}</Text>
          </View>
        </View>

        {/* Métricas */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Hoje</Text>
          <Text style={styles.sectionAction} onPress={() => router.push("/routine-page")}>
            Ver rotina →
          </Text>
        </View>
        <View style={styles.metricsGrid}>
          <Metric icon="home-outline" bg={colors.cyanLight} color={colors.cyan} v={active.length} label="Hospedados" />
          <Metric
            icon="walk-outline" bg={colors.successLight} color={colors.success}
            v={active.filter((d) => d.tasks.some((t) => t.type === "walk")).length}
            label="Com passeio"
          />
          <Metric
            icon="medical-outline" bg={colors.purpleLight} color={colors.purple}
            v={active.filter((d) => d.tasks.some((t) => t.type === "medication")).length}
            label="Com medicação"
          />
          <Metric
            icon="cash-outline" bg={colors.successLight} color={colors.success}
            v={active.length}
            label="Diárias hoje"
            currency={formatCurrency(active.reduce((s, d) => s + d.dailyRate, 0))}
          />
        </View>

        {/* Próximos eventos */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Próximos 7 dias</Text>
        </View>
        {upcoming.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="calendar-outline" size={36} color={colors.border} />
            <Text style={styles.emptyText}>Nenhum evento próximo</Text>
          </View>
        ) : (
          upcoming.map((e, i) => (
            <View key={i} style={styles.eventRow}>
              <View style={[styles.eventDot, { backgroundColor: e.type === "in" ? colors.success : colors.danger }]} />
              <Text style={styles.eventName}>{e.dog.name}</Text>
              <Text style={styles.eventDate}>
                {e.type === "in" ? "Entrada" : "Saída"} · {fmtDate(e.date)}
              </Text>
            </View>
          ))
        )}

        {/* Lista de hospedados */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Hospedados agora</Text>
          <Text style={styles.sectionAction} onPress={() => router.push("/routine-page")}>Ver tudo →</Text>
        </View>
        {active.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="paw-outline" size={36} color={colors.border} />
            <Text style={styles.emptyText}>Nenhum hóspede ativo</Text>
            <Text style={styles.emptySub}>Cadastre uma hospedagem na aba Rotina</Text>
          </View>
        ) : (
          active.map((dog) => (
            <TouchableOpacity
              key={dog.id}
              style={ms.dogRow}
              onLongPress={() => handleRemove(dog)}
              activeOpacity={0.85}
            >
              <View style={ms.dogAvatar}>
                {dog.photoUrl
                  ? <Image source={{ uri: dog.photoUrl }} style={{ width: "100%", height: "100%", borderRadius: 999 }} />
                  : <Text style={{ fontSize: 20 }}>{sizeEmoji(dog.size)}</Text>}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={ms.dogName}>{dog.name}</Text>
                <Text style={ms.dogOwner}>{dog.ownerName} · {dog.size}</Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={ms.dogValue}>{formatCurrency(calcTotalValue(dog))}</Text>
                <Text style={ms.dogDate}>Saída: {fmtDate(dog.checkOut)}</Text>
              </View>
            </TouchableOpacity>
          ))
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function Metric({ icon, bg, color, v, label, currency }: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  bg: string; color: string; v: number; label: string; currency?: string;
}) {
  return (
    <View style={styles.metricCard}>
      <View style={[styles.metricIcon, { backgroundColor: bg }]}>
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <Text style={styles.metricValue}>{currency ?? v}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

const ms = StyleSheet.create({
  field: { marginBottom: 14 },
  dogRow: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 10,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },
  dogAvatar: {
    width: 44, height: 44, borderRadius: 999,
    backgroundColor: "#E0FBFF",
    alignItems: "center", justifyContent: "center",
    overflow: "hidden",
  },
  dogName: { fontSize: 15, fontWeight: "700", color: "#1A2030" },
  dogOwner: { fontSize: 12, color: "#5A6478", marginTop: 1 },
  dogValue: { fontSize: 14, fontWeight: "700", color: "#1A2030" },
  dogDate: { fontSize: 11, color: "#9BA3B0", marginTop: 2 },
});