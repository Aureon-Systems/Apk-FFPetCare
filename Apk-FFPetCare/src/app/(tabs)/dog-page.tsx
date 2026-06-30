import React, { useState, useCallback, useMemo } from "react";
import {
  View, Text, FlatList, TouchableOpacity, TextInput,
  Modal, ScrollView, Alert, KeyboardAvoidingView,
  Platform, ActivityIndicator, StyleSheet
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";

import { loadDogs, insertDog, removeDog } from "@/lib/dogs-service";
import {
  fmtDate, todayISO, calcTotalValue, formatCurrency, isActiveToday,
} from "@/lib/storage";
import { Dog, DailyTask, DogSize } from "@/lib/types";
import { styles, colors } from "@/styles/style-dogs";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sizeEmoji(s: DogSize) {
  return s === "Grande" ? "🐕‍🦺" : "🐕";
}

function defaultRate(size: DogSize): string {
  return size === "Pequeno" ? "50" : size === "Médio" ? "70" : "90";
}

type FilterKey = "Todos" | "Hospedado" | "Agendado" | "Concluído";

function getStatus(dog: Dog): { label: FilterKey; color: string; bg: string } {
  const today = todayISO();
  if (isActiveToday(dog))    return { label: "Hospedado", color: colors.success, bg: colors.successLight };
  if (dog.checkIn > today)   return { label: "Agendado",  color: colors.warning, bg: colors.warningLight };
  return                            { label: "Concluído",  color: colors.neutral, bg: colors.neutralLight };
}

// ─── Form Modal ───────────────────────────────────────────────────────────────

const EMPTY_FORM = {
  name: "", ownerName: "", ownerPhone: "",
  size: "Médio" as DogSize,
  checkIn: todayISO(), checkOut: "",
  dailyRate: "70",
  walkTimes: "", medicationTimes: "", notes: "",
};

function AddDogModal({
  visible, onClose, onSave,
}: {
  visible: boolean;
  onClose: () => void;
  onSave: (dog: Dog) => void;
}) {
  const [f, setF] = useState(EMPTY_FORM);
  const set = (k: keyof typeof EMPTY_FORM, v: string) =>
    setF((prev) => ({ ...prev, [k]: v }));

  const handleSave = () => {
    if (!f.name.trim() || !f.ownerName.trim() || !f.checkOut.trim()) {
      Alert.alert("Campos obrigatórios", "Preencha nome do cão, dono e data de saída.");
      return;
    }
    const tasks: DailyTask[] = [];
    f.walkTimes.split(",").map(t => t.trim()).filter(Boolean).forEach((time, i) =>
      tasks.push({ id: `w${i}_${Date.now()}`, type: "walk", time, doneOn: [] })
    );
    f.medicationTimes.split(",").map(t => t.trim()).filter(Boolean).forEach((time, i) =>
      tasks.push({ id: `m${i}_${Date.now()}`, type: "medication", time, doneOn: [] })
    );
    const dog: Dog = {
      id: `dog_${Date.now()}`,
      name: f.name.trim(),
      ownerName: f.ownerName.trim(),
      ownerPhone: f.ownerPhone.trim(),
      size: f.size,
      checkIn: f.checkIn,
      checkOut: f.checkOut,
      dailyRate: parseFloat(f.dailyRate) || 70,
      tasks,
      notes: f.notes.trim(),
    };
    onSave(dog);
    setF(EMPTY_FORM);
    onClose();
  };

  type FieldProps = Omit<
    React.ComponentProps<typeof TextInput>,
    "onChangeText"
  > & {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
  };

  function Field({ label, value, onChangeText, ...props }: FieldProps) {
    return (
      <View style={ms.field}>
        <Text style={styles.fieldLabel}>{label}</Text>

        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholderTextColor={colors.textMuted}
          {...props}
        />
      </View>
    );
  }

  function Chips({
    label, value, onChange, opts,
  }: {
    label: string; value: string; onChange: (v: string) => void; opts: string[];
  }) {
    return (
      <View style={{ marginBottom: 16 }}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <View style={styles.chips}>
          {opts.map((o) => (
            <TouchableOpacity
              key={o}
              style={[styles.chip, value === o && styles.chipActive]}
              onPress={() => {
                onChange(o);
                if (label === "Porte") set("dailyRate", defaultRate(o as DogSize));
              }}
            >
              <Text style={[styles.chipText, value === o && styles.chipTextActive]}>{o}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <SafeAreaView style={styles.modalContainer}>

          {/* Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity style={styles.modalCloseBtn} onPress={onClose}>
              <Ionicons name="close" size={20} color={colors.textSub} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Nova Hospedagem</Text>
            <TouchableOpacity style={styles.modalSaveBtn} onPress={handleSave}>
              <Text style={styles.modalSaveBtnText}>Salvar</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.modalScroll} keyboardShouldPersistTaps="handled">
            <Field
              label="Nome do cão *"
              value={f.name}
              onChangeText={(v) => set("name", v)}
              placeholder="Ex: Thor"
              autoCapitalize="words"
            />
            <Field
              label="Dono *"
              value={f.ownerName}
              onChangeText={(v) => set("ownerName", v)}
              placeholder="Ex: João Silva"
              autoCapitalize="words"
            />
            <Field
              label="Telefone do dono"
              value={f.ownerPhone}
              onChangeText={(v) => set("ownerPhone", v)}
              placeholder="(79) 9 0000-0000"
              keyboardType="phone-pad"
            />
            <Chips
              label="Porte"
              value={f.size}
              onChange={(v) => set("size", v)}
              opts={["Pequeno", "Médio", "Grande"]}
            />
            <Field
              label="Entrada *"
              value={f.checkIn}
              onChangeText={(v) => set("checkIn", v)}
              placeholder="AAAA-MM-DD"
              keyboardType="numbers-and-punctuation"
            />
            <Field
              label="Saída *"
              value={f.checkOut}
              onChangeText={(v) => set("checkOut", v)}
              placeholder="AAAA-MM-DD"
              keyboardType="numbers-and-punctuation"
            />
            <Field
              label="Diária R$"
              value={f.dailyRate}
              onChangeText={(v) => set("dailyRate", v)}
              keyboardType="decimal-pad"
              placeholder="70,00"
            />
            <Field
              label="Horários de passeio"
              value={f.walkTimes}
              onChangeText={(v) => set("walkTimes", v)}
              placeholder="07:00, 17:00"
            />
            <Field
              label="Horários de medicação"
              value={f.medicationTimes}
              onChangeText={(v) => set("medicationTimes", v)}
              placeholder="08:00, 20:00"
            />
            <Field
              label="Observações"
              value={f.notes}
              onChangeText={(v) => set("notes", v)}
              placeholder="Alimentação especial, temperamento..."
              multiline
              numberOfLines={3}
              style={[styles.input, { height: 80, textAlignVertical: "top", paddingTop: 12 }]}
            />
          </ScrollView>

        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Dog Card ─────────────────────────────────────────────────────────────────

function DogCard({ dog, onLongPress }: { dog: Dog; onLongPress: () => void }) {
  const status = getStatus(dog);
  const totalDays = (() => {
    const ci = new Date(dog.checkIn);
    const co = new Date(dog.checkOut);
    const diff = Math.ceil((co.getTime() - ci.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  })();
  const walk = dog.tasks.find(t => t.type === "walk");
  const med  = dog.tasks.find(t => t.type === "medication");

  return (
    <TouchableOpacity style={styles.dogCard} onLongPress={onLongPress} activeOpacity={0.85}>
      {/* Top row */}
      <View style={styles.dogCardTop}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{sizeEmoji(dog.size)}</Text>
        </View>
        <View style={styles.dogInfo}>
          <Text style={styles.dogName}>{dog.name}</Text>
          <Text style={styles.dogOwner}>{dog.ownerName} · {dog.size}</Text>
          {dog.ownerPhone ? (
            <Text style={styles.dogPhone}>{dog.ownerPhone}</Text>
          ) : null}
        </View>
        <View style={[styles.badge, { backgroundColor: status.bg }]}>
          <Text style={[styles.badgeText, { color: status.color }]}>{status.label}</Text>
        </View>
      </View>

      <View style={styles.dogCardDivider} />

      {/* Bottom row */}
      <View style={styles.dogCardBottom}>
        <View style={styles.dogMeta}>
          <View style={styles.dogMetaItem}>
            <Ionicons name="enter-outline" size={13} color={colors.success} />
            <Text style={styles.dogMetaText}>{fmtDate(dog.checkIn)}</Text>
          </View>
          <View style={styles.dogMetaItem}>
            <Ionicons name="exit-outline" size={13} color={colors.danger} />
            <Text style={styles.dogMetaText}>{fmtDate(dog.checkOut)}</Text>
          </View>
          {walk ? (
            <View style={styles.dogMetaItem}>
              <Ionicons name="walk-outline" size={13} color={colors.textMuted} />
              <Text style={styles.dogMetaText}>{walk.time}</Text>
            </View>
          ) : null}
          {med ? (
            <View style={styles.dogMetaItem}>
              <Ionicons name="medical-outline" size={13} color={colors.textMuted} />
              <Text style={styles.dogMetaText}>{med.time}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.dogRateBlock}>
          <Text style={styles.dogRate}>{formatCurrency(dog.dailyRate)}</Text>
          <Text style={styles.dogRateSub}>/ dia</Text>
          {totalDays > 0 ? (
            <Text style={styles.dogTotal}>
              {totalDays}d · {formatCurrency(dog.dailyRate * totalDays)}
            </Text>
          ) : null}
        </View>
      </View>

      {/* Notas */}
      {dog.notes ? (
        <View style={{ marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.border }}>
          <Text style={{ fontSize: 12, color: colors.textMuted, fontStyle: "italic" }}>
            💬 {dog.notes}
          </Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );
}

// ─── Tela principal ───────────────────────────────────────────────────────────

const FILTERS: FilterKey[] = ["Todos", "Hospedado", "Agendado", "Concluído"];

export default function DogsPage() {
  const [dogs, setDogs]         = useState<Dog[]>([]);
  const [loading, setLoading]   = useState(true);
  const [modal, setModal]       = useState(false);
  const [search, setSearch]     = useState("");
  const [filter, setFilter]     = useState<FilterKey>("Todos");

  // Carrega ao entrar na tela
  useFocusEffect(
    useCallback(() => {
      let ativo = true;
      setLoading(true);
      loadDogs().then((data) => {
        if (ativo) { setDogs(data); setLoading(false); }
      });
      return () => { ativo = false; };
    }, [])
  );

  // Lista filtrada
  const filtered = useMemo(() => {
    let list = dogs;
    if (filter !== "Todos") list = list.filter(d => getStatus(d).label === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(d =>
        d.name.toLowerCase().includes(q) ||
        d.ownerName.toLowerCase().includes(q) ||
        d.ownerPhone.includes(q)
      );
    }
    return list;
  }, [dogs, filter, search]);

  // Contadores para o summary strip
  const counts = useMemo(() => ({
    total:     dogs.length,
    hospedado: dogs.filter(d => getStatus(d).label === "Hospedado").length,
    agendado:  dogs.filter(d => getStatus(d).label === "Agendado").length,
  }), [dogs]);

  const handleSave = useCallback(async (dog: Dog) => {
    const novo = await insertDog(dog);
    if (novo) {
      setDogs((prev) => [novo, ...prev]);
    } else {
      Alert.alert("Erro", "Não foi possível salvar a hospedagem. Verifique sua conexão.");
    }
  }, []);

  const handleRemove = useCallback((dog: Dog) => {
    Alert.alert("Remover hóspede", `Remover ${dog.name} permanentemente?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Remover", style: "destructive",
        onPress: async () => {
          const ok = await removeDog(dog.id);
          if (ok) {
            setDogs((prev) => prev.filter(d => d.id !== dog.id));
          } else {
            Alert.alert("Erro", "Não foi possível remover o registro.");
          }
        },
      },
    ]);
  }, []);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerEyebrow}>Hotel Pet</Text>
          <Text style={styles.headerTitle}>Hóspedes</Text>
        </View>
        <View style={styles.headerIcon}>
          <Ionicons name="paw" size={20} color={colors.cyan} />
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <Ionicons name="search-outline" size={18} color={colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Buscar por nome, dono ou telefone..."
          placeholderTextColor={colors.textMuted}
          clearButtonMode="while-editing"
        />
        {search.length > 0 ? (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Ionicons name="close-circle" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Filter chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterChip, filter === f && styles.filterChipActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterChipText, filter === f && styles.filterChipTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Summary strip */}
      <View style={styles.summaryStrip}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{counts.total}</Text>
          <Text style={styles.summaryLabel}>Total</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={[styles.summaryValue, { color: colors.success }]}>{counts.hospedado}</Text>
          <Text style={styles.summaryLabel}>Hoje</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={[styles.summaryValue, { color: colors.warning }]}>{counts.agendado}</Text>
          <Text style={styles.summaryLabel}>Agendados</Text>
        </View>
      </View>

      {/* Lista */}
      {loading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" color={colors.cyan} />
          <Text style={{ color: colors.textMuted, marginTop: 12 }}>Carregando hóspedes...</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.content, filtered.length === 0 && { flex: 1 }]}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            filtered.length > 0 ? (
              <Text style={styles.sectionLabel}>
                {filtered.length} registro{filtered.length !== 1 ? "s" : ""}
              </Text>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="paw-outline" size={48} color={colors.border} />
              <Text style={styles.emptyTitle}>
                {search ? "Nenhum resultado" : "Nenhum hóspede cadastrado"}
              </Text>
              <Text style={styles.emptyText}>
                {search
                  ? `Nenhum registro encontrado para "${search}"`
                  : 'Toque em "+" para adicionar o primeiro'}
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <DogCard dog={item} onLongPress={() => handleRemove(item)} />
          )}
        />
      )}

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => setModal(true)} activeOpacity={0.85}>
        <Ionicons name="add" size={30} color={colors.dark} />
      </TouchableOpacity>

      {/* Modal de cadastro */}
      <AddDogModal
        visible={modal}
        onClose={() => setModal(false)}
        onSave={handleSave}
      />

    </SafeAreaView>
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