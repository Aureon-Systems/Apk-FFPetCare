import React, { useState, useCallback } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  Modal, TextInput, Alert, KeyboardAvoidingView,
  Platform, StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import {
  loadDogs, saveDogs, isActiveToday, calcTotalValue,
  formatCurrency, fmtDate, monthRevenue, parseLocalDate, todayISO,
} from "../../lib/storage";
import { styles, colors } from "../../styles/style-dashboard";
import { Dog, DailyTask, DogSize } from "../../lib/types";

// ─── Constantes ──────────────────────────────────────────────────────────────

const MAX_CAPACITY = 6;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function capStatus(n: number) {
  const r = n / MAX_CAPACITY;
  if (r < 0.5) return { label: "Disponível", color: colors.success, bg: colors.successLight };
  if (r < 0.84) return { label: "Moderado", color: colors.warning, bg: colors.warningLight };
  return { label: "Lotado", color: colors.danger, bg: colors.dangerLight };
}

function sizeEmoji(s: DogSize) {
  return s === "Grande" ? "🐕‍🦺" : "🐕";
}

function defaultRate(size: DogSize): string {
  return size === "Pequeno" ? "50" : size === "Médio" ? "70" : "90";
}

// ─── Modal de cadastro de hospedagem ─────────────────────────────────────────

const EMPTY = {
  name: "", ownerName: "", ownerPhone: "",
  size: "Médio" as DogSize,
  checkIn: todayISO(), checkOut: "",
  dailyRate: "70",
  walkTimes: "", medicationTimes: "", notes: "",
};

function AddDogModal({ visible, onClose, onSave }: {
  visible: boolean;
  onClose: () => void;
  onSave: (d: Dog) => void;
}) {
  const [f, setF] = useState(EMPTY);
  const set = (k: keyof typeof EMPTY, v: string) => setF((p) => ({ ...p, [k]: v }));

  const handleSave = () => {
    if (!f.name.trim() || !f.ownerName.trim() || !f.checkOut.trim()) {
      Alert.alert("Campos obrigatórios", "Nome do cão, dono e data de saída são necessários.");
      return;
    }
    const tasks: DailyTask[] = [];
    f.walkTimes.split(",").map((t) => t.trim()).filter(Boolean).forEach((time, i) =>
      tasks.push({ id: `w${i}_${Date.now()}`, type: "walk", time, doneOn: [] })
    );
    f.medicationTimes.split(",").map((t) => t.trim()).filter(Boolean).forEach((time, i) =>
      tasks.push({ id: `m${i}_${Date.now()}`, type: "medication", time, doneOn: [] })
    );
    const dog: Dog = {
      id: `dog_${Date.now()}`,
      name: f.name.trim(), ownerName: f.ownerName.trim(), ownerPhone: f.ownerPhone.trim(),
      size: f.size, checkIn: f.checkIn, checkOut: f.checkOut,
      dailyRate: parseFloat(f.dailyRate) || 70,
      tasks, notes: f.notes.trim(),
    };
    onSave(dog);
    setF(EMPTY);
    onClose();
  };

  const Field = ({ label, fk, ...p }: { label: string; fk: keyof typeof EMPTY } & Partial<React.ComponentProps<typeof TextInput>>) => (
    <View style={ms.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput style={styles.input} value={String(f[fk])} onChangeText={(v) => set(fk, v)} placeholderTextColor={colors.textMuted} {...p} />
    </View>
  );

  const Chips = ({ label, fk, opts }: { label: string; fk: keyof typeof EMPTY; opts: string[] }) => (
    <View style={ms.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.chips}>
        {opts.map((o) => (
          <TouchableOpacity
            key={o}
            style={[styles.chip, f[fk] === o && styles.chipActive]}
            onPress={() => {
              set(fk, o);
              if (fk === "size") set("dailyRate", defaultRate(o as DogSize));
            }}
          >
            <Text style={[styles.chipText, f[fk] === o && styles.chipTextActive]}>{o}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity style={styles.modalCloseBtn} onPress={onClose}>
              <Ionicons name="close" size={22} color={colors.textSub} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Nova Hospedagem</Text>
            <TouchableOpacity style={styles.modalSaveBtn} onPress={handleSave}>
              <Text style={styles.modalSaveBtnText}>Salvar</Text>
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.modalScroll}>
            <Field label="Nome do cão *" fk="name" placeholder="Ex: Thor" />
            <Field label="Dono *" fk="ownerName" placeholder="Ex: João Silva" />
            <Field label="Telefone do dono" fk="ownerPhone" placeholder="(79) 9 0000-0000" keyboardType="phone-pad" />
            <Chips label="Porte" fk="size" opts={["Pequeno", "Médio", "Grande"]} />
            <Field label="Entrada (AAAA-MM-DD) *" fk="checkIn" placeholder={todayISO()} keyboardType="numbers-and-punctuation" />
            <Field label="Saída (AAAA-MM-DD) *" fk="checkOut" placeholder="2025-07-05" keyboardType="numbers-and-punctuation" />
            <Field label="Diária R$" fk="dailyRate" keyboardType="decimal-pad" />
            <Field label="Horários de passeio (sep. vírgula)" fk="walkTimes" placeholder="07:00, 17:00" />
            <Field label="Horários de medicação (sep. vírgula)" fk="medicationTimes" placeholder="08:00, 20:00" />
            <Field label="Observações" fk="notes" placeholder="Alimentação especial, temperamento..." multiline numberOfLines={3} />
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [modal, setModal] = useState(false);
  const router = useRouter();

  useFocusEffect(useCallback(() => { loadDogs().then(setDogs); }, []));

  const active = dogs.filter(isActiveToday);
  const cap = capStatus(active.length);
  const fill = Math.min(active.length / MAX_CAPACITY, 1);
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

  const handleSave = useCallback(async (dog: Dog) => {
    const updated = [...dogs, dog];
    setDogs(updated);
    await saveDogs(updated);
  }, [dogs]);

  const handleRemove = useCallback((dog: Dog) => {
    Alert.alert("Remover hóspede", `Remover ${dog.name}?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Remover", style: "destructive",
        onPress: async () => {
          const updated = dogs.filter((d) => d.id !== dog.id);
          setDogs(updated); await saveDogs(updated);
        },
      },
    ]);
  }, [dogs]);

  const greeting = () => {
    const h = new Date().getHours();
    return h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite";
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerGreeting}>{greeting()}, Felipe 👋</Text>
          <Text style={styles.headerTitle}>Painel</Text>
        </View>
        <View style={styles.headerAvatar}>
          <Ionicons name="paw" size={20} color={colors.cyan} />
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
            <Text style={styles.capacityMax}>{MAX_CAPACITY}</Text>
          </View>
          <Text style={styles.capacitySub}>
            {MAX_CAPACITY - active.length > 0
              ? `${MAX_CAPACITY - active.length} vaga${MAX_CAPACITY - active.length > 1 ? "s" : ""} disponíve${MAX_CAPACITY - active.length > 1 ? "is" : "l"}`
              : "Hotel lotado hoje"}
          </Text>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${fill * 100}%`, backgroundColor: fillColor }]} />
          </View>
          <View style={styles.trackLabels}>
            <Text style={styles.trackLabel}>0</Text>
            <Text style={styles.trackLabel}>{MAX_CAPACITY}</Text>
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
          <Text style={styles.sectionAction} onPress={() => setModal(true)}>+ Novo</Text>
        </View>
        {active.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="paw-outline" size={36} color={colors.border} />
            <Text style={styles.emptyText}>Nenhum hóspede ativo</Text>
            <Text style={styles.emptySub}>Toque em "+ Novo" para cadastrar</Text>
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
                <Text style={{ fontSize: 20 }}>{sizeEmoji(dog.size)}</Text>
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

      <TouchableOpacity style={styles.fab} onPress={() => setModal(true)} activeOpacity={0.85}>
        <Ionicons name="add" size={28} color="#1A2030" />
      </TouchableOpacity>

      <AddDogModal visible={modal} onClose={() => setModal(false)} onSave={handleSave} />
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
  },
  dogName: { fontSize: 15, fontWeight: "700", color: "#1A2030" },
  dogOwner: { fontSize: 12, color: "#5A6478", marginTop: 1 },
  dogValue: { fontSize: 14, fontWeight: "700", color: "#1A2030" },
  dogDate: { fontSize: 11, color: "#9BA3B0", marginTop: 2 },
});