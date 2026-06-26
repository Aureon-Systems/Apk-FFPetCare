import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";

import { styles, colors, radius } from "../styles/style-dashboard";

// ─── Constantes ──────────────────────────────────────────────────────────────

const DOGS_KEY = "ffpetcare_dogs";
const MAX_CAPACITY = 6; // capacidade máxima do hotel do Felipe

// ─── Tipos ───────────────────────────────────────────────────────────────────

type DogSize = "Pequeno" | "Médio" | "Grande";
type ServiceType = "Hospedagem" | "Passeio" | "Medicamento";

export interface Dog {
  id: string;
  name: string;
  ownerName: string;
  size: DogSize;
  serviceType: ServiceType;
  checkIn: string;   // ISO date string
  checkOut: string;  // ISO date string
  medicationTimes: string[]; // ex: ["08:00", "20:00"]
  walkTimes: string[];       // ex: ["07:00", "17:00"]
  dailyRate: number;         // R$ por diária (Hospedagem)
  medicationFee: number;     // R$ por dia (Medicamento)
  notificationIds: string[]; // IDs das notificações agendadas
}

// ─── Utilitários ─────────────────────────────────────────────────────────────

async function loadDogs(): Promise<Dog[]> {
  try {
    const raw = await AsyncStorage.getItem(DOGS_KEY);
    return raw ? (JSON.parse(raw) as Dog[]) : [];
  } catch {
    return [];
  }
}

async function saveDogs(dogs: Dog[]): Promise<void> {
  await AsyncStorage.setItem(DOGS_KEY, JSON.stringify(dogs));
}

function isActiveToday(dog: Dog): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkIn = new Date(dog.checkIn);
  const checkOut = new Date(dog.checkOut);
  checkIn.setHours(0, 0, 0, 0);
  checkOut.setHours(0, 0, 0, 0);
  return checkIn <= today && today <= checkOut;
}

function calcTotalValue(dog: Dog): number {
  const checkIn = new Date(dog.checkIn);
  const checkOut = new Date(dog.checkOut);
  const msPerDay = 86_400_000;
  const days = Math.max(1, Math.round((checkOut.getTime() - checkIn.getTime()) / msPerDay));
  const hosting = dog.serviceType === "Hospedagem" ? days * dog.dailyRate : 0;
  const med = dog.medicationTimes.length > 0 ? days * dog.medicationFee : 0;
  return hosting + med;
}

function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

function monthRevenue(dogs: Dog[]): number {
  const now = new Date();
  return dogs
    .filter((d) => {
      const co = new Date(d.checkOut);
      return co.getMonth() === now.getMonth() && co.getFullYear() === now.getFullYear();
    })
    .reduce((sum, d) => sum + calcTotalValue(d), 0);
}

function capacityStatus(count: number): { label: string; color: string; bg: string } {
  const ratio = count / MAX_CAPACITY;
  if (ratio < 0.5) return { label: "Disponível", color: colors.success, bg: colors.successLight };
  if (ratio < 0.84) return { label: "Moderado", color: colors.warning, bg: colors.warningLight };
  return { label: "Lotado", color: colors.danger, bg: colors.dangerLight };
}

function serviceTag(type: ServiceType): { label: string; color: string; bg: string } {
  switch (type) {
    case "Hospedagem":
      return { label: "🏠 Hospedagem", color: "#1565C0", bg: "#E3F2FD" };
    case "Passeio":
      return { label: "🦮 Passeio", color: "#2E7D32", bg: "#E8F5E9" };
    case "Medicamento":
      return { label: "💊 Medicamento", color: "#6A1B9A", bg: "#F3E5F5" };
  }
}

function sizeEmoji(size: DogSize): string {
  return size === "Pequeno" ? "🐕" : size === "Médio" ? "🐕" : "🐕‍🦺";
}

// ─── Agendamento de notificações ──────────────────────────────────────────────

async function scheduleNotificationsForDog(dog: Dog): Promise<string[]> {
  const ids: string[] = [];

  await Notifications.requestPermissionsAsync();

  // Notificação de check-out (manhã do dia de saída)
  const checkOutDate = new Date(dog.checkOut);
  checkOutDate.setHours(8, 0, 0, 0);
  if (checkOutDate > new Date()) {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: "🐾 Check-out hoje",
        body: `${dog.name} (${dog.ownerName}) tem saída prevista para hoje.`,
        sound: true,
      },
      trigger: { 
        type: SchedulableTriggerInputTypes.DATE, // Ou use apenas a string 'date' se preferir
        date: checkOutDate 
      },
    });
    ids.push(id);
  }

  // Notificações de medicação
  for (const time of dog.medicationTimes) {
    const [hour, minute] = time.split(":").map(Number);
    const medDate = new Date();
    medDate.setHours(hour, minute, 0, 0);
    if (medDate < new Date()) medDate.setDate(medDate.getDate() + 1);

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: "💊 Medicação",
        body: `Hora de medicar ${dog.name} (${time}).`,
        sound: true,
      },
      trigger: {
        hour,
        minute,
        repeats: true,
      } as any,
    });
    ids.push(id);
  }

  return ids;
}

async function cancelNotificationsForDog(dog: Dog): Promise<void> {
  for (const id of dog.notificationIds) {
    await Notifications.cancelScheduledNotificationAsync(id);
  }
}

// ─── Formulário de cadastro de cão ───────────────────────────────────────────

const EMPTY_FORM = {
  name: "",
  ownerName: "",
  size: "Médio" as DogSize,
  serviceType: "Hospedagem" as ServiceType,
  checkIn: new Date().toISOString().split("T")[0],
  checkOut: new Date(Date.now() + 86_400_000).toISOString().split("T")[0],
  medicationTimes: "",
  walkTimes: "",
  dailyRate: "60",
  medicationFee: "10",
};

interface AddDogModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (dog: Dog) => void;
}

function AddDogModal({ visible, onClose, onSave }: AddDogModalProps) {
  const [form, setForm] = useState(EMPTY_FORM);

  const handleSave = async () => {
    if (!form.name.trim() || !form.ownerName.trim()) {
      Alert.alert("Campos obrigatórios", "Informe o nome do cão e do dono.");
      return;
    }

    const dog: Dog = {
      id: `dog_${Date.now()}`,
      name: form.name.trim(),
      ownerName: form.ownerName.trim(),
      size: form.size,
      serviceType: form.serviceType,
      checkIn: form.checkIn,
      checkOut: form.checkOut,
      medicationTimes: form.medicationTimes
        ? form.medicationTimes.split(",").map((t) => t.trim()).filter(Boolean)
        : [],
      walkTimes: form.walkTimes
        ? form.walkTimes.split(",").map((t) => t.trim()).filter(Boolean)
        : [],
      dailyRate: parseFloat(form.dailyRate) || 60,
      medicationFee: parseFloat(form.medicationFee) || 0,
      notificationIds: [],
    };

    const nids = await scheduleNotificationsForDog(dog);
    dog.notificationIds = nids;

    onSave(dog);
    setForm(EMPTY_FORM);
    onClose();
  };

  const field = (
    label: string,
    key: keyof typeof EMPTY_FORM,
    props?: Partial<React.ComponentProps<typeof TextInput>>
  ) => (
    <View style={modalStyles.field}>
      <Text style={modalStyles.label}>{label}</Text>
      <TextInput
        style={modalStyles.input}
        value={String(form[key])}
        onChangeText={(v) => setForm((prev) => ({ ...prev, [key]: v }))}
        placeholderTextColor={colors.textMuted}
        {...props}
      />
    </View>
  );

  const selectorRow = <T extends string>(
    label: string,
    key: keyof typeof EMPTY_FORM,
    options: T[]
  ) => (
    <View style={modalStyles.field}>
      <Text style={modalStyles.label}>{label}</Text>
      <View style={modalStyles.selectorRow}>
        {options.map((opt) => (
          <TouchableOpacity
            key={opt}
            style={[
              modalStyles.selectorBtn,
              (form[key] as string) === opt && modalStyles.selectorBtnActive,
            ]}
            onPress={() => setForm((prev) => ({ ...prev, [key]: opt }))}
          >
            <Text
              style={[
                modalStyles.selectorText,
                (form[key] as string) === opt && modalStyles.selectorTextActive,
              ]}
            >
              {opt}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <SafeAreaView style={modalStyles.container}>
          {/* Header do modal */}
          <View style={modalStyles.modalHeader}>
            <TouchableOpacity onPress={onClose} style={modalStyles.closeBtn}>
              <Ionicons name="close" size={22} color={colors.textSecondary} />
            </TouchableOpacity>
            <Text style={modalStyles.modalTitle}>Novo Hóspede</Text>
            <TouchableOpacity onPress={handleSave} style={modalStyles.saveBtn}>
              <Text style={modalStyles.saveBtnText}>Salvar</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={modalStyles.scroll}>
            {field("Nome do cão", "name", { placeholder: "Ex: Thor" })}
            {field("Nome do dono", "ownerName", { placeholder: "Ex: João Silva" })}

            {selectorRow<DogSize>("Porte", "size", ["Pequeno", "Médio", "Grande"])}
            {selectorRow<ServiceType>("Tipo de serviço", "serviceType", [
              "Hospedagem",
              "Passeio",
              "Medicamento",
            ])}

            {field("Data de entrada (AAAA-MM-DD)", "checkIn", {
              placeholder: "2025-07-01",
              keyboardType: "numbers-and-punctuation",
            })}
            {field("Data de saída (AAAA-MM-DD)", "checkOut", {
              placeholder: "2025-07-05",
              keyboardType: "numbers-and-punctuation",
            })}

            {field("Diária R$ (Hospedagem)", "dailyRate", {
              placeholder: "60",
              keyboardType: "decimal-pad",
            })}
            {field("Taxa medicação R$/dia", "medicationFee", {
              placeholder: "10",
              keyboardType: "decimal-pad",
            })}
            {field("Horários de medicação (vírgula)", "medicationTimes", {
              placeholder: "08:00, 20:00",
            })}
            {field("Horários de passeio (vírgula)", "walkTimes", {
              placeholder: "07:00, 17:00",
            })}
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Componente principal: Dashboard ─────────────────────────────────────────

export default function DashboardPage() {
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [showModal, setShowModal] = useState(false);

  // Recarrega cães ao entrar na tela (foco)
  useFocusEffect(
    useCallback(() => {
      loadDogs().then(setDogs);
    }, [])
  );

  const activeDogs = dogs.filter(isActiveToday);
  const hostedCount = activeDogs.filter((d) => d.serviceType === "Hospedagem").length;
  const walkCount = activeDogs.filter((d) => d.serviceType === "Passeio").length;
  const medCount = activeDogs.filter((d) => d.serviceType === "Medicamento").length;
  const revenue = monthRevenue(dogs);
  const capacity = capacityStatus(hostedCount);
  const fillRatio = Math.min(hostedCount / MAX_CAPACITY, 1);

  const progressColor =
    fillRatio < 0.5 ? colors.success : fillRatio < 0.84 ? colors.warning : colors.danger;

  // Salva novo cão e atualiza state
  const handleSaveDog = useCallback(
    async (dog: Dog) => {
      const updated = [...dogs, dog];
      setDogs(updated);
      await saveDogs(updated);
    },
    [dogs]
  );

  // Remove cão com confirmação
  const handleRemoveDog = useCallback(
    (dog: Dog) => {
      Alert.alert(
        "Remover hóspede",
        `Deseja remover ${dog.name}? As notificações associadas serão canceladas.`,
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Remover",
            style: "destructive",
            onPress: async () => {
              await cancelNotificationsForDog(dog);
              const updated = dogs.filter((d) => d.id !== dog.id);
              setDogs(updated);
              await saveDogs(updated);
            },
          },
        ]
      );
    },
    [dogs]
  );

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Bom dia";
    if (h < 18) return "Boa tarde";
    return "Boa noite";
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerGreeting}>{greeting()}, Felipe 👋</Text>
          <Text style={styles.headerTitle}>FFPetCare</Text>
        </View>
        <View style={styles.headerAvatar}>
          <Ionicons name="paw" size={20} color={colors.cyan} />
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* ── Card de faturamento do mês ──────────────────────────────────── */}
        <View style={{ marginTop: 20 }}>
          <View style={styles.billingCard}>
            <View style={styles.billingLeft}>
              <Text style={styles.billingLabel}>FATURAMENTO DO MÊS</Text>
              <Text style={styles.billingValue}>{formatCurrency(revenue)}</Text>
              <Text style={styles.billingSubtext}>
                {new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
              </Text>
            </View>
            <View style={styles.billingIconWrap}>
              <Ionicons name="wallet-outline" size={26} color={colors.textPrimary} />
            </View>
          </View>
        </View>

        {/* ── Controle de capacidade ──────────────────────────────────────── */}
        <View style={styles.capacityCard}>
          <View style={styles.capacityRow}>
            <Text style={styles.capacityLabel}>Capacidade da hospedagem</Text>
            <View style={[styles.capacityBadge, { backgroundColor: capacity.bg }]}>
              <Text style={[styles.capacityBadgeText, { color: capacity.color }]}>
                {capacity.label}
              </Text>
            </View>
          </View>

          <View style={styles.capacityNumbers}>
            <Text style={styles.capacityCurrent}>{hostedCount}</Text>
            <Text style={styles.capacityDivider}>/</Text>
            <Text style={styles.capacityMax}>{MAX_CAPACITY}</Text>
          </View>
          <Text style={styles.capacitySubtext}>
            {MAX_CAPACITY - hostedCount > 0
              ? `${MAX_CAPACITY - hostedCount} vaga${MAX_CAPACITY - hostedCount > 1 ? "s" : ""} disponíve${MAX_CAPACITY - hostedCount > 1 ? "is" : "l"} hoje`
              : "Hotel completo hoje"}
          </Text>

          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${fillRatio * 100}%`, backgroundColor: progressColor },
              ]}
            />
          </View>
          <View style={styles.progressLabels}>
            <Text style={styles.progressLabelText}>0</Text>
            <Text style={styles.progressLabelText}>{MAX_CAPACITY}</Text>
          </View>
        </View>

        {/* ── Grid de métricas ────────────────────────────────────────────── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Hoje</Text>
        </View>

        <View style={styles.metricsGrid}>
          <MetricCard
            icon="home-outline"
            iconBg={colors.cyanLight}
            iconColor={colors.cyan}
            value={hostedCount}
            label="Hospedados"
          />
          <MetricCard
            icon="walk-outline"
            iconBg={colors.successLight}
            iconColor={colors.success}
            value={walkCount}
            label="Passeios"
          />
          <MetricCard
            icon="medical-outline"
            iconBg="#F3E5F5"
            iconColor="#8E24AA"
            value={medCount}
            label="Medicações"
          />
          <MetricCard
            icon="paw-outline"
            iconBg={colors.surfaceAlt}
            iconColor={colors.textSecondary}
            value={activeDogs.length}
            label="Total ativo"
          />
        </View>

        {/* ── Lista de cães ativos ─────────────────────────────────────────── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Hóspedes ativos</Text>
          <Text style={styles.sectionAction} onPress={() => setShowModal(true)}>
            + Adicionar
          </Text>
        </View>

        {activeDogs.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="paw-outline" size={40} color={colors.border} />
            <Text style={styles.emptyText}>Nenhum hóspede ativo hoje</Text>
          </View>
        ) : (
          activeDogs.map((dog) => {
            const tag = serviceTag(dog.serviceType);
            return (
              <TouchableOpacity
                key={dog.id}
                style={styles.dogCard}
                onLongPress={() => handleRemoveDog(dog)}
                activeOpacity={0.85}
              >
                {/* Avatar */}
                <View style={styles.dogAvatar}>
                  <Text style={{ fontSize: 22 }}>{sizeEmoji(dog.size)}</Text>
                </View>

                {/* Info */}
                <View style={styles.dogInfo}>
                  <Text style={styles.dogName}>{dog.name}</Text>
                  <Text style={styles.dogOwner}>Dono: {dog.ownerName}</Text>
                  <View style={styles.dogMeta}>
                    <View style={[styles.dogTag, { backgroundColor: tag.bg }]}>
                      <Text style={[styles.dogTagText, { color: tag.color }]}>{tag.label}</Text>
                    </View>
                    <View style={[styles.dogTag, { backgroundColor: colors.surfaceAlt }]}>
                      <Text style={[styles.dogTagText, { color: colors.textSecondary }]}>
                        {dog.size}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Datas e valor */}
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={{ fontSize: 15, fontWeight: "700", color: colors.textPrimary }}>
                    {formatCurrency(calcTotalValue(dog))}
                  </Text>
                  <Text style={styles.dogCheckout}>
                    Saída: {formatDate(dog.checkOut)}
                  </Text>
                  {dog.medicationTimes.length > 0 && (
                    <View style={{ marginTop: 4, flexDirection: "row", alignItems: "center", gap: 3 }}>
                      <Ionicons name="medical" size={11} color="#8E24AA" />
                      <Text style={{ fontSize: 10, color: "#8E24AA", fontWeight: "600" }}>
                        {dog.medicationTimes.join(" · ")}
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })
        )}

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* ── FAB ──────────────────────────────────────────────────────────── */}
      <TouchableOpacity style={styles.fab} onPress={() => setShowModal(true)} activeOpacity={0.85}>
        <Ionicons name="add" size={28} color={colors.textPrimary} />
      </TouchableOpacity>

      {/* ── Modal de cadastro ─────────────────────────────────────────────── */}
      <AddDogModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSaveDog}
      />
    </SafeAreaView>
  );
}

// ─── Sub-componente: Métrica ──────────────────────────────────────────────────

interface MetricCardProps {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  iconBg: string;
  iconColor: string;
  value: number;
  label: string;
}

function MetricCard({ icon, iconBg, iconColor, value, label }: MetricCardProps) {
  return (
    <View style={styles.metricCard}>
      <View style={[styles.metricIconWrap, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

// ─── Estilos do modal (locais) ────────────────────────────────────────────────

import { StyleSheet } from "react-native";
import { SchedulableTriggerInputTypes } from "expo-notifications";

const modalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  saveBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.cyan,
    borderRadius: radius.pill,
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    gap: 12,
  },
  field: {
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.textPrimary,
  },
  selectorRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  selectorBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  selectorBtnActive: {
    backgroundColor: colors.cyan,
    borderColor: colors.cyan,
  },
  selectorText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  selectorTextActive: {
    color: colors.textPrimary,
  },
});