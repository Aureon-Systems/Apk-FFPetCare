import React, { useState, useCallback, useMemo } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  Modal, Alert, KeyboardAvoidingView, Platform, ActivityIndicator, Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
// npx expo install react-native-calendars
import { Calendar, DateData } from "react-native-calendars";
import {
  loadDogs, insertDog, updateDog, removeDog, uploadDogPhoto,
} from "../../lib/dogs-service";
import {
  parseLocalDate, todayISO, fmtDate, getServiceStatus, ageFromBirthDate, loadSettings,
} from "../../lib/storage";
import { Dog, DailyTask, Medication, DogSize, ServiceStatus, AppSettings, DEFAULT_SETTINGS } from "../../lib/types";
import { maskCPF, maskPhone, isoDateToBR, onlyDigits } from "../../lib/masks";
import { styles, colors } from "../../styles/style-routine";

// ─── Tipos de marcação do calendário ─────────────────────────────────────────

type MarkedDates = Record<string, {
  dots?: { key: string; color: string }[];
  selected?: boolean;
  selectedColor?: string;
  selectedTextColor?: string;
}>;

const STATUS_COLORS: Record<ServiceStatus, { color: string; bg: string }> = {
  Agendado: { color: colors.warning, bg: colors.warningLight },
  Hospedado: { color: colors.success, bg: colors.successLight },
  Concluído: { color: colors.textMuted, bg: colors.surfaceAlt },
};

const EMPTY_DOG = (): Dog => ({
  id: "",
  name: "",
  birthDate: undefined,
  breed: "",
  size: "Médio",
  food: "",
  belongings: "",
  healthNotes: "",
  medications: [],
  ownerName: "",
  ownerPhone: "",
  ownerCPF: "",
  ownerAddress: "",
  checkIn: todayISO(),
  checkInTime: "",
  checkOut: "",
  checkOutTime: "",
  dailyRate: 70,
  vetName: "",
  vetClinic: "",
  tasks: [],
  notes: "",
});

// ─── Helpers de calendário ────────────────────────────────────────────────────

function buildMarks(dogs: Dog[], selected: string): MarkedDates {
  const marks: MarkedDates = {};

  const addDot = (date: string, key: string, color: string) => {
    if (!marks[date]) marks[date] = { dots: [] };
    if (!marks[date].dots) marks[date].dots = [];
    if (!marks[date].dots!.find((d) => d.key === key)) {
      marks[date].dots!.push({ key, color });
    }
  };

  for (const d of dogs) {
    if (!d.checkIn || !d.checkOut) continue;
    addDot(d.checkIn, `in_${d.id}`, colors.success);
    addDot(d.checkOut, `out_${d.id}`, colors.danger);

    // dias de agendamento (entre entrada e saída, exclusive)
    const ci = parseLocalDate(d.checkIn);
    const co = parseLocalDate(d.checkOut);
    const cursor = new Date(ci);
    cursor.setDate(cursor.getDate() + 1);
    while (cursor < co) {
      const iso = cursor.toISOString().split("T")[0];
      addDot(iso, `stay_${d.id}_${iso}`, colors.cyan);
      cursor.setDate(cursor.getDate() + 1);
    }
  }

  marks[selected] = {
    ...(marks[selected] ?? {}),
    selected: true,
    selectedColor: colors.cyan,
    selectedTextColor: "#1A2030",
  };

  return marks;
}

function dogsOnDay(dogs: Dog[], iso: string): Dog[] {
  const day = parseLocalDate(iso);
  day.setHours(0, 0, 0, 0);
  return dogs.filter((d) => {
    if (!d.checkIn || !d.checkOut) return false;
    const ci = parseLocalDate(d.checkIn);
    const co = parseLocalDate(d.checkOut);
    return ci <= day && day <= co;
  });
}

function eventsOnDay(dogs: Dog[], iso: string) {
  const ins = dogs.filter((d) => d.checkIn === iso);
  const outs = dogs.filter((d) => d.checkOut === iso);
  return { ins, outs };
}

function taskLabel(task: DailyTask): string {
  if (task.type === "walk") return "🦮 Passeio";
  return `💊 ${task.label || "Medicação"}`;
}

function progressText(dog: Dog, date: string): string {
  if (dog.tasks.length === 0) return "";
  const done = dog.tasks.filter((t) => t.doneOn.includes(date)).length;
  return `${done}/${dog.tasks.length}`;
}

function allDone(dog: Dog, date: string): boolean {
  return dog.tasks.length > 0 && dog.tasks.every((t) => t.doneOn.includes(date));
}

function sizeEmoji(s: string): string {
  return s === "Grande" ? "🐕‍🦺" : "🐕";
}

function fmtDayHeader(iso: string): string {
  const d = parseLocalDate(iso);
  const isToday = iso === todayISO();
  const weekday = d.toLocaleDateString("pt-BR", { weekday: "long" });
  const dateStr = d.toLocaleDateString("pt-BR", { day: "2-digit", month: "long" });
  return isToday ? `Hoje · ${dateStr}` : `${weekday.charAt(0).toUpperCase() + weekday.slice(1)} · ${dateStr}`;
}

// ─── Campo de horário (TimeField) ────────────────────────────────────────────

function InlineTimePicker({
  value, onChange, placeholder = "Selecionar horário", compact = false,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);

  const dateValue = useMemo(() => {
    const d = new Date();
    if (value) {
      const [h, m] = value.split(":").map(Number);
      if (!Number.isNaN(h)) d.setHours(h, m || 0, 0, 0);
    }
    return d;
  }, [open]);

  return (
    <>
      <TouchableOpacity style={styles.inputDisplay} onPress={() => setOpen(true)} activeOpacity={0.75}>
        <Ionicons name="time-outline" size={compact ? 16 : 18} color={colors.textMuted} />
        <Text style={[styles.inputDisplayText, !value && styles.inputDisplayPlaceholder]}>
          {value || placeholder}
        </Text>
      </TouchableOpacity>
      {open && (
        <DateTimePicker
          value={dateValue}
          mode="time"
          is24Hour
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(_, selected) => {
            setOpen(Platform.OS === "ios");
            if (selected) {
              const hh = String(selected.getHours()).padStart(2, "0");
              const mm = String(selected.getMinutes()).padStart(2, "0");
              onChange(`${hh}:${mm}`);
            }
            if (Platform.OS !== "ios") setOpen(false);
          }}
        />
      )}
    </>
  );
}

function InlineDatePicker({
  value, onChange, placeholder = "Selecionar data", maximumDate,
}: {
  value: string;
  onChange: (iso: string) => void;
  placeholder?: string;
  maximumDate?: Date;
}) {
  const [open, setOpen] = useState(false);
  const dateValue = value ? parseLocalDate(value) : new Date();

  return (
    <>
      <TouchableOpacity style={styles.inputDisplay} onPress={() => setOpen(true)} activeOpacity={0.75}>
        <Ionicons name="calendar-outline" size={18} color={colors.textMuted} />
        <Text style={[styles.inputDisplayText, !value && styles.inputDisplayPlaceholder]}>
          {value ? `${isoDateToBR(value)} · ${ageFromBirthDate(value)}` : placeholder}
        </Text>
      </TouchableOpacity>
      {open && (
        <DateTimePicker
          value={dateValue}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          maximumDate={maximumDate}
          onChange={(_, selected) => {
            setOpen(Platform.OS === "ios");
            if (selected) {
              const iso = selected.toISOString().split("T")[0];
              onChange(iso);
            }
            if (Platform.OS !== "ios") setOpen(false);
          }}
        />
      )}
    </>
  );
}

function TimeField({
  label, value, onChange, placeholder = "Selecionar horário",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <InlineTimePicker value={value} onChange={onChange} placeholder={placeholder} />
    </View>
  );
}

// ─── Seletor visual de período (Entrada / Saída) ─────────────────────────────

function DateRangePickerModal({
  visible, onClose, onConfirm, initialCheckIn, initialCheckOut, dogs, ignoreId,
}: {
  visible: boolean;
  onClose: () => void;
  onConfirm: (checkIn: string, checkOut: string) => void;
  initialCheckIn: string;
  initialCheckOut: string;
  dogs: Dog[];
  ignoreId?: string;
}) {
  const [checkIn, setCheckIn] = useState(initialCheckIn);
  const [checkOut, setCheckOut] = useState(initialCheckOut);

  const handleDayPress = (day: DateData) => {
    if (!checkIn || (checkIn && checkOut)) {
      setCheckIn(day.dateString);
      setCheckOut("");
    } else if (day.dateString < checkIn) {
      setCheckIn(day.dateString);
      setCheckOut("");
    } else {
      setCheckOut(day.dateString);
    }
  };

  const marks = useMemo(() => {
    const m = buildMarks(dogs.filter((d) => d.id !== ignoreId), "");
    delete (m as any)[""];
    if (checkIn) {
      m[checkIn] = { ...(m[checkIn] ?? {}), selected: true, selectedColor: colors.success, selectedTextColor: "#fff" };
    }
    if (checkOut) {
      m[checkOut] = { ...(m[checkOut] ?? {}), selected: true, selectedColor: colors.danger, selectedTextColor: "#fff" };
    }
    if (checkIn && checkOut) {
      const cursor = parseLocalDate(checkIn);
      const end = parseLocalDate(checkOut);
      cursor.setDate(cursor.getDate() + 1);
      while (cursor < end) {
        const iso = cursor.toISOString().split("T")[0];
        m[iso] = { ...(m[iso] ?? {}), selected: true, selectedColor: colors.cyanLight, selectedTextColor: "#1A2030" };
        cursor.setDate(cursor.getDate() + 1);
      }
    }
    return m;
  }, [checkIn, checkOut, dogs, ignoreId]);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.pickerModalBackdrop}>
        <View style={styles.pickerModalSheet}>
          <View style={styles.pickerModalHeader}>
            <Text style={styles.pickerModalTitle}>Selecionar período</Text>
            <TouchableOpacity style={styles.modalCloseBtn} onPress={onClose}>
              <Ionicons name="close" size={20} color={colors.textSub} />
            </TouchableOpacity>
          </View>

          <Text style={styles.pickerRangeHint}>
            {checkIn && checkOut
              ? `Entrada ${fmtDate(checkIn)} → Saída ${fmtDate(checkOut)}`
              : checkIn
                ? "Toque na data de saída"
                : "Toque na data de entrada"}
          </Text>

          <Calendar
            markingType="multi-dot"
            markedDates={marks}
            onDayPress={handleDayPress}
            minDate={todayISO()}
            theme={{
              backgroundColor: colors.surface,
              calendarBackground: colors.surface,
              arrowColor: colors.cyan,
              todayTextColor: colors.cyan,
              monthTextColor: colors.text,
              dayTextColor: colors.text,
              textDisabledColor: colors.textMuted,
              selectedDayTextColor: "#1A2030",
            }}
          />

          <TouchableOpacity
            style={[styles.pickerConfirmBtn, !(checkIn && checkOut) && styles.pickerConfirmBtnDisabled]}
            disabled={!(checkIn && checkOut)}
            onPress={() => onConfirm(checkIn, checkOut)}
          >
            <Text style={styles.pickerConfirmBtnText}>Confirmar período</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ─── Modal de cadastro / edição de serviço ───────────────────────────────────

function Field({
  label, value, onChangeText, ...props
}: {
  label: string; value: string; onChangeText: (v: string) => void;
} & React.ComponentProps<typeof TextInput>) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.input, props.multiline && { height: 80, textAlignVertical: "top", paddingTop: 12 }]}
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
}: { label: string; value: string; onChange: (v: string) => void; opts: string[] }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.chips}>
        {opts.map((o) => (
          <TouchableOpacity
            key={o}
            style={[styles.chip, value === o && styles.chipActive]}
            onPress={() => onChange(o)}
          >
            <Text style={[styles.chipText, value === o && styles.chipTextActive]}>{o}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

function defaultRate(size: DogSize, settings: AppSettings): number {
  return size === "Pequeno" ? settings.rateSmall : size === "Médio" ? settings.rateMedium : settings.rateLarge;
}

function ServiceFormModal({
  visible, onClose, onSave, onDelete, editing, dogs, settings,
}: {
  visible: boolean;
  onClose: () => void;
  onSave: (dog: Dog, photoLocalUri?: string) => Promise<void>;
  onDelete?: (dog: Dog) => void;
  editing: Dog | null;
  dogs: Dog[];
  settings: AppSettings;
}) {
  const [f, setF] = useState<Dog>(editing ?? EMPTY_DOG());
  const [photoLocalUri, setPhotoLocalUri] = useState<string | undefined>(undefined);
  const [dateModalOpen, setDateModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    setF(editing ?? { ...EMPTY_DOG(), dailyRate: defaultRate("Médio", settings) });
    setPhotoLocalUri(undefined);
  }, [editing, visible]);

  const set = <K extends keyof Dog>(k: K, v: Dog[K]) => setF((prev) => ({ ...prev, [k]: v }));

  const pickPhoto = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permissão necessária", "Autorize o acesso às fotos para escolher uma imagem.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets?.[0]?.uri) {
      setPhotoLocalUri(result.assets[0].uri);
    }
  };

  const addMedication = () => {
    const med: Medication = { id: `med_${Date.now()}`, name: "", time: "" };
    set("medications", [...f.medications, med]);
  };
  const updateMedication = (id: string, patch: Partial<Medication>) => {
    set("medications", f.medications.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  };
  const removeMedication = (id: string) => {
    set("medications", f.medications.filter((m) => m.id !== id));
  };

  const handleSave = async () => {
    if (!f.name.trim()) return Alert.alert("Campo obrigatório", "Informe o nome do cão.");
    if (!f.ownerName.trim()) return Alert.alert("Campo obrigatório", "Informe o nome do responsável.");
    if (!f.checkIn || !f.checkOut) return Alert.alert("Campo obrigatório", "Selecione o período de entrada e saída.");
    if (f.ownerCPF && onlyDigits(f.ownerCPF).length > 0 && onlyDigits(f.ownerCPF).length < 11) {
      return Alert.alert("CPF inválido", "Verifique o CPF informado.");
    }

    setSaving(true);
    try {
      await onSave({ ...f, dailyRate: Number(f.dailyRate) || defaultRate(f.size, settings) }, photoLocalUri);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const isEditing = !!editing?.id;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity style={styles.modalCloseBtn} onPress={onClose}>
              <Ionicons name="close" size={20} color={colors.textSub} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{isEditing ? "Editar Hospedagem" : "Nova Hospedagem"}</Text>
            <TouchableOpacity
              style={[styles.modalSaveBtn, saving && styles.modalSaveBtnDisabled]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving
                ? <ActivityIndicator size="small" color={colors.text} />
                : <Text style={styles.modalSaveBtnText}>Salvar</Text>}
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.modalScroll} keyboardShouldPersistTaps="handled">

            {/* Foto */}
            <TouchableOpacity style={styles.photoPicker} onPress={pickPhoto} activeOpacity={0.8}>
              {photoLocalUri || f.photoUrl ? (
                <Image source={{ uri: photoLocalUri ?? f.photoUrl }} style={styles.photoPickerImg} />
              ) : (
                <>
                  <Ionicons name="camera-outline" size={26} color={colors.textMuted} />
                  <Text style={styles.photoPickerText}>Foto</Text>
                </>
              )}
            </TouchableOpacity>

            {/* ─── Cão ─── */}
            <Text style={styles.formGroupLabel}>Informações do cão</Text>
            <Field label="Nome do cão *" value={f.name} onChangeText={(v) => set("name", v)} placeholder="Ex: Thor" autoCapitalize="words" />

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Data de nascimento</Text>
              <InlineDatePicker
                value={f.birthDate ?? ""}
                onChange={(iso) => set("birthDate", iso)}
                maximumDate={new Date()}
              />
            </View>

            <Field label="Raça" value={f.breed ?? ""} onChangeText={(v) => set("breed", v)} placeholder="Ex: Vira-lata" autoCapitalize="words" />
            <Chips label="Porte *" value={f.size} onChange={(v) => { set("size", v as DogSize); if (!editing) set("dailyRate", defaultRate(v as DogSize, settings)); }} opts={["Pequeno", "Médio", "Grande"]} />
            <Field label="Alimentação" value={f.food ?? ""} onChangeText={(v) => set("food", v)} placeholder="Ração, horários, restrições..." multiline numberOfLines={2} />
            <Field label="Pertences trazidos de casa" value={f.belongings ?? ""} onChangeText={(v) => set("belongings", v)} placeholder="Caminha, brinquedo, coleira..." multiline numberOfLines={2} />
            <Field label="Comorbidades / observações de saúde" value={f.healthNotes ?? ""} onChangeText={(v) => set("healthNotes", v)} placeholder="Alergias, condições, cuidados especiais..." multiline numberOfLines={2} />

            {/* Medicações */}
            <Text style={styles.fieldLabel}>Medicações</Text>
            {f.medications.map((m) => (
              <View key={m.id} style={styles.medRow}>
                <View style={{ flex: 1.3 }}>
                  <TextInput
                    style={styles.input}
                    value={m.name}
                    onChangeText={(v) => updateMedication(m.id, { name: v })}
                    placeholder="Nome da medicação"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <InlineTimePicker
                    value={m.time}
                    onChange={(v) => updateMedication(m.id, { time: v })}
                    placeholder="Horário"
                    compact
                  />
                </View>
                <TouchableOpacity style={styles.medRemoveBtn} onPress={() => removeMedication(m.id)}>
                  <Ionicons name="trash-outline" size={16} color={colors.danger} />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity style={styles.addRowBtn} onPress={addMedication}>
              <Ionicons name="add" size={16} color="#006064" />
              <Text style={styles.addRowBtnText}>Adicionar medicação</Text>
            </TouchableOpacity>

            <View style={{ marginTop: 14 }}>
              <TimeField label="Horário de passeio (opcional)" value={f.tasks.find(t => t.type === "walk")?.time ?? ""} onChange={(time) => {
                const others = f.tasks.filter(t => t.type !== "walk");
                set("tasks", time ? [...others, { id: "walk", type: "walk", time, doneOn: [] }] : others);
              }} />
            </View>

            {/* ─── Responsável ─── */}
            <Text style={styles.formGroupLabel}>Informações do responsável</Text>
            <Field label="Nome do dono *" value={f.ownerName} onChangeText={(v) => set("ownerName", v)} placeholder="Ex: João Silva" autoCapitalize="words" />
            <Field label="Telefone" value={f.ownerPhone} onChangeText={(v) => set("ownerPhone", maskPhone(v))} placeholder="(79) 9 0000-0000" keyboardType="phone-pad" maxLength={16} />
            <Field label="CPF" value={f.ownerCPF ?? ""} onChangeText={(v) => set("ownerCPF", maskCPF(v))} placeholder="000.000.000-00" keyboardType="number-pad" maxLength={14} />
            <Field label="Endereço completo" value={f.ownerAddress ?? ""} onChangeText={(v) => set("ownerAddress", v)} placeholder="Rua, número, bairro, cidade" multiline numberOfLines={2} />

            {/* ─── Hospedagem ─── */}
            <Text style={styles.formGroupLabel}>Período de hospedagem</Text>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Entrada e saída *</Text>
              <TouchableOpacity style={styles.inputDisplay} onPress={() => setDateModalOpen(true)} activeOpacity={0.75}>
                <Ionicons name="calendar-outline" size={18} color={colors.textMuted} />
                <Text style={styles.inputDisplayText}>
                  {f.checkIn && f.checkOut
                    ? `${fmtDate(f.checkIn)} → ${fmtDate(f.checkOut)}`
                    : "Selecionar período no calendário"}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.fieldRow}>
              <View style={{ flex: 1 }}>
                <TimeField label="Hora de entrada" value={f.checkInTime ?? ""} onChange={(v) => set("checkInTime", v)} />
              </View>
              <View style={{ flex: 1 }}>
                <TimeField label="Hora de saída" value={f.checkOutTime ?? ""} onChange={(v) => set("checkOutTime", v)} />
              </View>
            </View>
            <Field label="Diária R$" value={String(f.dailyRate ?? "")} onChangeText={(v) => set("dailyRate", Number(v.replace(/[^0-9.,]/g, "").replace(",", ".")) || 0)} keyboardType="decimal-pad" placeholder="70,00" />

            {/* ─── Adicionais ─── */}
            <Text style={styles.formGroupLabel}>Informações adicionais</Text>
            <Field label="Veterinário responsável" value={f.vetName ?? ""} onChangeText={(v) => set("vetName", v)} placeholder="Nome do veterinário" autoCapitalize="words" />
            <Field label="Clínica veterinária" value={f.vetClinic ?? ""} onChangeText={(v) => set("vetClinic", v)} placeholder="Nome da clínica" autoCapitalize="words" />
            <Field label="Observações" value={f.notes} onChangeText={(v) => set("notes", v)} placeholder="Temperamento, cuidados gerais..." multiline numberOfLines={3} />

            {isEditing && onDelete && (
              <TouchableOpacity style={styles.deleteBtn} onPress={() => onDelete(f)}>
                <Ionicons name="trash-outline" size={18} color={colors.danger} />
                <Text style={styles.deleteBtnText}>Excluir hospedagem</Text>
              </TouchableOpacity>
            )}

          </ScrollView>

          <DateRangePickerModal
            visible={dateModalOpen}
            onClose={() => setDateModalOpen(false)}
            onConfirm={(ci, co) => { set("checkIn", ci); set("checkOut", co); setDateModalOpen(false); }}
            initialCheckIn={f.checkIn}
            initialCheckOut={f.checkOut}
            dogs={dogs}
            ignoreId={editing?.id}
          />
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function RoutinePage() {
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(todayISO());
  const [modalVisible, setModalVisible] = useState(false);
  const [editingDog, setEditingDog] = useState<Dog | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    const [data, s] = await Promise.all([loadDogs(), loadSettings()]);
    setDogs(data);
    setSettings(s);
    setLoading(false);
  }, []);

  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));

  const markedDates = buildMarks(dogs, selectedDay);
  const dayDogs = dogsOnDay(dogs, selectedDay);
  const { ins, outs } = eventsOnDay(dogs, selectedDay);

  // Lista de todos os serviços, em ordem cronológica (por data de entrada)
  const allServices = useMemo(
    () => [...dogs].sort((a, b) => a.checkIn.localeCompare(b.checkIn)),
    [dogs]
  );

  const handleToggle = useCallback(async (dogId: string, taskId: string) => {
    const date = selectedDay;
    const dog = dogs.find((d) => d.id === dogId);
    if (!dog) return;
    const updatedTasks = dog.tasks.map((task) => {
      if (task.id !== taskId) return task;
      const done = task.doneOn.includes(date);
      return { ...task, doneOn: done ? task.doneOn.filter((d) => d !== date) : [...task.doneOn, date] };
    });
    const updatedDog = { ...dog, tasks: updatedTasks };
    setDogs((prev) => prev.map((d) => (d.id === dogId ? updatedDog : d)));
    await updateDog(updatedDog);
  }, [dogs, selectedDay]);

  const openNew = () => { setEditingDog(null); setModalVisible(true); };
  const openEdit = (dog: Dog) => { setEditingDog(dog); setModalVisible(true); };

  const handleSave = useCallback(async (dog: Dog, photoLocalUri?: string) => {
    let photoUrl = dog.photoUrl;
    if (photoLocalUri) {
      const uploaded = await uploadDogPhoto(photoLocalUri);
      if (uploaded) photoUrl = uploaded;
    }
    const payload = { ...dog, photoUrl };

    if (dog.id) {
      const saved = await updateDog(payload);
      if (saved) {
        setDogs((prev) => prev.map((d) => (d.id === saved.id ? saved : d)));
      } else {
        Alert.alert("Erro", "Não foi possível atualizar a hospedagem.");
      }
    } else {
      const saved = await insertDog(payload);
      if (saved) {
        setDogs((prev) => [...prev, saved]);
      } else {
        Alert.alert("Erro", "Não foi possível salvar a hospedagem. Verifique sua conexão.");
      }
    }
  }, []);

  const handleDelete = useCallback((dog: Dog) => {
    Alert.alert("Remover hóspede", `Remover ${dog.name} permanentemente?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Remover", style: "destructive",
        onPress: async () => {
          const ok = await removeDog(dog.id);
          if (ok) {
            setDogs((prev) => prev.filter((d) => d.id !== dog.id));
            setModalVisible(false);
          } else {
            Alert.alert("Erro", "Não foi possível remover o registro.");
          }
        },
      },
    ]);
  }, []);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Rotina</Text>
        <Text style={styles.headerSub}>Calendário, hospedagens e tarefas diárias</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>

        {/* Calendário */}
        <View style={styles.calendarWrap}>
          <Calendar
            markingType="multi-dot"
            markedDates={markedDates}
            onDayPress={(day: DateData) => setSelectedDay(day.dateString)}
            theme={{
              backgroundColor: colors.surface,
              calendarBackground: colors.surface,
              arrowColor: colors.cyan,
              todayTextColor: colors.cyan,
              monthTextColor: colors.text,
              textMonthFontWeight: "700",
              textMonthFontSize: 15,
              textDayFontSize: 13,
              textDayHeaderFontSize: 12,
              dayTextColor: colors.text,
              textDisabledColor: colors.textMuted,
              selectedDayBackgroundColor: colors.cyan,
              selectedDayTextColor: "#1A2030",
              dotColor: colors.cyan,
            }}
          />
          <View style={styles.calendarLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.success }]} />
              <Text style={styles.legendText}>Entrada</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.danger }]} />
              <Text style={styles.legendText}>Saída</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.cyan }]} />
              <Text style={styles.legendText}>Hospedado</Text>
            </View>
          </View>
        </View>

        {/* Seção do dia selecionado */}
        <View style={styles.daySection}>
          <Text style={styles.daySectionTitle}>{fmtDayHeader(selectedDay)}</Text>

          {ins.map((d) => (
            <TouchableOpacity key={`in_${d.id}`} onPress={() => openEdit(d)} style={[styles.eventChip, { backgroundColor: colors.successLight }]}>
              <Ionicons name="arrow-down-circle-outline" size={16} color={colors.success} />
              <Text style={[styles.eventChipText, { color: colors.success }]}>Entrada: {d.name}</Text>
              <Text style={[styles.eventChipDate, { color: colors.success }]}>{d.ownerName}</Text>
            </TouchableOpacity>
          ))}
          {outs.map((d) => (
            <TouchableOpacity key={`out_${d.id}`} onPress={() => openEdit(d)} style={[styles.eventChip, { backgroundColor: colors.dangerLight }]}>
              <Ionicons name="arrow-up-circle-outline" size={16} color={colors.danger} />
              <Text style={[styles.eventChipText, { color: colors.danger }]}>Saída: {d.name}</Text>
              <Text style={[styles.eventChipDate, { color: colors.danger }]}>{d.ownerName}</Text>
            </TouchableOpacity>
          ))}

          {dayDogs.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="calendar-outline" size={40} color={colors.border} />
              <Text style={styles.emptyText}>Nenhum cão hospedado neste dia</Text>
              <Text style={styles.emptySub}>Selecione outro dia ou toque em "+" para cadastrar</Text>
            </View>
          ) : (
            dayDogs.map((dog) => {
              const done = allDone(dog, selectedDay);
              const prog = progressText(dog, selectedDay);

              return (
                <TouchableOpacity key={dog.id} style={styles.dogCard} activeOpacity={0.85} onPress={() => openEdit(dog)}>
                  <View style={styles.dogCardHeader}>
                    <View style={styles.dogAvatar}>
                      {dog.photoUrl
                        ? <Image source={{ uri: dog.photoUrl }} style={{ width: "100%", height: "100%", borderRadius: 999 }} />
                        : <Text style={styles.dogAvatarText}>{sizeEmoji(dog.size)}</Text>}
                    </View>
                    <View style={styles.dogInfo}>
                      <Text style={styles.dogName}>{dog.name}</Text>
                      <Text style={styles.dogOwner}>{dog.ownerName} · {dog.size}</Text>
                      <View style={styles.dogBadgeRow}>
                        <View style={[styles.dogBadge, { backgroundColor: colors.cyanLight }]}>
                          <Text style={[styles.dogBadgeText, { color: "#006064" }]}>🏠 Hotel</Text>
                        </View>
                        <View style={[styles.dogBadge, { backgroundColor: colors.surfaceAlt }]}>
                          <Text style={[styles.dogBadgeText, { color: colors.textSub }]}>
                            Saída {fmtDate(dog.checkOut)}
                          </Text>
                        </View>
                      </View>
                    </View>

                    {dog.tasks.length > 0 && (
                      <View style={styles.dogProgress}>
                        <Text style={[styles.dogProgressText, { color: done ? colors.success : colors.warning }]}>
                          {prog}
                        </Text>
                        <Text style={styles.dogProgressSub}>tarefas</Text>
                        {done && <Ionicons name="checkmark-circle" size={18} color={colors.success} style={{ marginTop: 2 }} />}
                      </View>
                    )}
                  </View>

                  {dog.tasks.length > 0 && (
                    <>
                      <View style={styles.tasksDivider} />
                      <Text style={styles.tasksLabel}>Tarefas do dia</Text>
                      {dog.tasks
                        .slice()
                        .sort((a, b) => a.time.localeCompare(b.time))
                        .map((task) => {
                          const isDone = task.doneOn.includes(selectedDay);
                          return (
                            <TouchableOpacity
                              key={task.id}
                              style={[styles.taskRow, isDone && styles.taskRowDone]}
                              onPress={(e) => { e.stopPropagation?.(); handleToggle(dog.id, task.id); }}
                              activeOpacity={0.75}
                            >
                              <View style={[styles.taskCheck, isDone && styles.taskCheckDone]}>
                                {isDone && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
                              </View>
                              <Text style={[styles.taskType, isDone && styles.taskTypeDone]}>{taskLabel(task)}</Text>
                              <View style={[styles.taskTime, isDone && styles.taskTimeDone]}>
                                <Text style={{ fontSize: 12, fontWeight: "700", color: isDone ? colors.success : colors.textMuted }}>
                                  {task.time}
                                </Text>
                              </View>
                            </TouchableOpacity>
                          );
                        })}
                    </>
                  )}

                  {dog.tasks.length === 0 && (
                    <View style={{ marginTop: 10, opacity: 0.5 }}>
                      <Text style={{ fontSize: 12, color: colors.textMuted, textAlign: "center" }}>
                        Sem tarefas agendadas para este cão
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {/* Todos os serviços (cronológico, alimentado pelo Supabase) */}
        <View style={styles.allSection}>
          <Text style={styles.allSectionTitle}>Todos os serviços</Text>
          {loading ? (
            <ActivityIndicator size="small" color={colors.cyan} style={{ marginTop: 12 }} />
          ) : allServices.length === 0 ? (
            <Text style={{ fontSize: 13, color: colors.textMuted }}>Nenhum serviço cadastrado ainda.</Text>
          ) : (
            allServices.map((dog) => {
              const status = getServiceStatus(dog);
              const st = STATUS_COLORS[status];
              return (
                <TouchableOpacity key={dog.id} style={styles.serviceItem} activeOpacity={0.8} onPress={() => openEdit(dog)}>
                  <View style={styles.serviceAvatar}>
                    {dog.photoUrl
                      ? <Image source={{ uri: dog.photoUrl }} style={styles.serviceAvatarImg} />
                      : <Text style={styles.serviceAvatarText}>{sizeEmoji(dog.size)}</Text>}
                  </View>
                  <View style={styles.serviceInfo}>
                    <Text style={styles.serviceName}>{dog.name}</Text>
                    <Text style={styles.serviceMeta}>{fmtDate(dog.checkIn)} → {fmtDate(dog.checkOut)} · {dog.ownerName}</Text>
                  </View>
                  <View style={[styles.serviceStatusBadge, { backgroundColor: st.bg }]}>
                    <Text style={[styles.serviceStatusText, { color: st.color }]}>{status}</Text>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={openNew} activeOpacity={0.85}>
        <Ionicons name="add" size={30} color={colors.text} />
      </TouchableOpacity>

      <ServiceFormModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleSave}
        onDelete={handleDelete}
        editing={editingDog}
        dogs={dogs}
        settings={settings}
      />
    </SafeAreaView>
  );
}