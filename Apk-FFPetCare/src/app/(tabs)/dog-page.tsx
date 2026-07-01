import React, { useState, useCallback, useMemo } from "react";
import {
  View, Text, FlatList, TouchableOpacity, TextInput,
  ScrollView, ActivityIndicator, Image, LayoutAnimation, Platform, UIManager,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";

import { loadDogs } from "@/lib/dogs-service";
import {
  fmtDate, formatCurrency, calcTotalValue, getServiceStatus, ageFromBirthDate,
} from "@/lib/storage";
import { isoDateToBR } from "@/lib/masks";
import { Dog, DogSize, ServiceStatus } from "@/lib/types";
import { styles, colors } from "@/styles/style-dogs";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sizeEmoji(s: DogSize) {
  return s === "Grande" ? "🐕‍🦺" : "🐕";
}

type FilterKey = "Todos" | ServiceStatus;

function getStatus(dog: Dog): { label: ServiceStatus; color: string; bg: string } {
  const label = getServiceStatus(dog);
  if (label === "Hospedado") return { label, color: colors.success, bg: colors.successLight };
  if (label === "Agendado") return { label, color: colors.warning, bg: colors.warningLight };
  return { label, color: colors.neutral, bg: colors.neutralLight };
}

function InfoRow({ icon, label, value }: { icon: React.ComponentProps<typeof Ionicons>["name"]; label: string; value?: string }) {
  if (!value) return null;
  return (
    <View style={{ flexDirection: "row", gap: 8, marginBottom: 8, alignItems: "flex-start" }}>
      <Ionicons name={icon} size={14} color={colors.textMuted} style={{ marginTop: 2 }} />
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 11, color: colors.textMuted, fontWeight: "600", textTransform: "uppercase" }}>{label}</Text>
        <Text style={{ fontSize: 13, color: colors.dark, marginTop: 1 }}>{value}</Text>
      </View>
    </View>
  );
}

// ─── Dog Card (expansível) ───────────────────────────────────────────────────

function DogCard({ dog }: { dog: Dog }) {
  const [expanded, setExpanded] = useState(false);
  const status = getStatus(dog);
  const totalDays = (() => {
    const ci = new Date(dog.checkIn);
    const co = new Date(dog.checkOut);
    const diff = Math.ceil((co.getTime() - ci.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  })();

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((e) => !e);
  };

  return (
    <TouchableOpacity style={styles.dogCard} onPress={toggle} activeOpacity={0.85}>
      {/* Top row — informações resumidas */}
      <View style={styles.dogCardTop}>
        <View style={styles.avatar}>
          {dog.photoUrl
            ? <Image source={{ uri: dog.photoUrl }} style={{ width: "100%", height: "100%", borderRadius: 999 }} />
            : <Text style={styles.avatarText}>{sizeEmoji(dog.size)}</Text>}
        </View>
        <View style={styles.dogInfo}>
          <Text style={styles.dogName}>{dog.name}</Text>
          <Text style={styles.dogOwner}>{dog.ownerName} · {dog.size}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: status.bg }]}>
          <Text style={[styles.badgeText, { color: status.color }]}>{status.label}</Text>
        </View>
        <Ionicons
          name={expanded ? "chevron-up" : "chevron-down"}
          size={18} color={colors.textMuted} style={{ marginLeft: 6 }}
        />
      </View>

      {!expanded && (
        <>
          <View style={styles.dogCardDivider} />
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
            </View>
            <View style={styles.dogRateBlock}>
              <Text style={styles.dogRate}>{formatCurrency(dog.dailyRate)}</Text>
              <Text style={styles.dogRateSub}>/ dia</Text>
              {totalDays > 0 ? (
                <Text style={styles.dogTotal}>{totalDays}d · {formatCurrency(dog.dailyRate * totalDays)}</Text>
              ) : null}
            </View>
          </View>
        </>
      )}

      {/* Conteúdo expandido — todas as informações cadastradas */}
      {expanded && (
        <View style={{ marginTop: 14 }}>
          <View style={styles.dogCardDivider} />

          <Text style={styles.expandSectionTitle}>🐶 Cão</Text>
          <InfoRow icon="calendar-outline" label="Idade" value={dog.birthDate ? `${isoDateToBR(dog.birthDate)} · ${ageFromBirthDate(dog.birthDate)}` : undefined} />
          <InfoRow icon="paw-outline" label="Raça" value={dog.breed} />
          <InfoRow icon="restaurant-outline" label="Alimentação" value={dog.food} />
          <InfoRow icon="bag-handle-outline" label="Pertences" value={dog.belongings} />
          <InfoRow icon="medkit-outline" label="Comorbidades / Observações de saúde" value={dog.healthNotes} />
          {dog.medications.length > 0 && (
            <View style={{ marginBottom: 8 }}>
              <Text style={{ fontSize: 11, color: colors.textMuted, fontWeight: "600", textTransform: "uppercase", marginBottom: 4 }}>
                Medicações
              </Text>
              {dog.medications.map((m) => (
                <Text key={m.id} style={{ fontSize: 13, color: colors.dark, marginBottom: 2 }}>
                  💊 {m.name || "Sem nome"} · {m.time || "—"}
                </Text>
              ))}
            </View>
          )}

          <View style={[styles.dogCardDivider, { marginTop: 6 }]} />
          <Text style={styles.expandSectionTitle}>👤 Dono</Text>
          <InfoRow icon="call-outline" label="Telefone" value={dog.ownerPhone} />
          <InfoRow icon="card-outline" label="CPF" value={dog.ownerCPF} />
          <InfoRow icon="home-outline" label="Endereço" value={dog.ownerAddress} />

          <View style={[styles.dogCardDivider, { marginTop: 6 }]} />
          <Text style={styles.expandSectionTitle}>ℹ️ Informações adicionais</Text>
          <InfoRow icon="medical-outline" label="Veterinário" value={dog.vetName} />
          <InfoRow icon="business-outline" label="Clínica veterinária" value={dog.vetClinic} />
          <InfoRow icon="enter-outline" label="Entrada" value={`${fmtDate(dog.checkIn)}${dog.checkInTime ? ` · ${dog.checkInTime}` : ""}`} />
          <InfoRow icon="exit-outline" label="Saída" value={`${fmtDate(dog.checkOut)}${dog.checkOutTime ? ` · ${dog.checkOutTime}` : ""}`} />
          <InfoRow icon="cash-outline" label="Diária" value={`${formatCurrency(dog.dailyRate)}${totalDays > 0 ? ` · ${totalDays}d · ${formatCurrency(calcTotalValue(dog))}` : ""}`} />
          <InfoRow icon="chatbubble-ellipses-outline" label="Observações" value={dog.notes} />
        </View>
      )}
    </TouchableOpacity>
  );
}

// ─── Tela principal ───────────────────────────────────────────────────────────

const FILTERS: FilterKey[] = ["Todos", "Hospedado", "Agendado", "Concluído"];

export default function DogsPage() {
  const [dogs, setDogs]         = useState<Dog[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [filter, setFilter]     = useState<FilterKey>("Todos");

  // Carrega ao entrar na tela — sempre direto do Supabase, alimentado pela Routine Page
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

  const filtered = useMemo(() => {
    let list = dogs;
    if (filter !== "Todos") list = list.filter((d) => getStatus(d).label === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((d) =>
        d.name.toLowerCase().includes(q) ||
        d.ownerName.toLowerCase().includes(q) ||
        d.ownerPhone.includes(q)
      );
    }
    return list;
  }, [dogs, filter, search]);

  const counts = useMemo(() => ({
    total:     dogs.length,
    hospedado: dogs.filter((d) => getStatus(d).label === "Hospedado").length,
    agendado:  dogs.filter((d) => getStatus(d).label === "Agendado").length,
  }), [dogs]);

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
                  : "Cadastre uma hospedagem na aba Rotina"}
              </Text>
            </View>
          }
          renderItem={({ item }) => <DogCard dog={item} />}
        />
      )}
    </SafeAreaView>
  );
}