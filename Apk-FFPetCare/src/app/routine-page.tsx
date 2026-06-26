import React, { useState, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
// npx expo install react-native-calendars
import { Calendar, DateData } from "react-native-calendars";
import {
  loadDogs, saveDogs, parseLocalDate, todayISO,
  isTaskDoneToday, fmtDate,
} from "../lib/storage";
import { Dog, DailyTask } from "../lib/types";
import { styles, colors } from "../styles/style-routine";

// ─── Tipos de marcação do calendário ─────────────────────────────────────────

type MarkedDates = Record<string, {
  dots?: { key: string; color: string }[];
  selected?: boolean;
  selectedColor?: string;
  selectedTextColor?: string;
}>;

// ─── Helpers ─────────────────────────────────────────────────────────────────

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
    addDot(d.checkIn, `in_${d.id}`, colors.success);
    addDot(d.checkOut, `out_${d.id}`, colors.danger);
  }

  // Dia selecionado
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
  return task.type === "walk" ? "🦮 Passeio" : "💊 Medicação";
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

// ─── Componente principal ─────────────────────────────────────────────────────

export default function RoutinePage() {
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [selectedDay, setSelectedDay] = useState(todayISO());

  useFocusEffect(useCallback(() => { loadDogs().then(setDogs); }, []));

  const markedDates = buildMarks(dogs, selectedDay);
  const dayDogs = dogsOnDay(dogs, selectedDay);
  const { ins, outs } = eventsOnDay(dogs, selectedDay);
  const hasTasks = dayDogs.some((d) => d.tasks.length > 0);

  // Toggle tarefa
  const handleToggle = useCallback(async (dogId: string, taskId: string) => {
    const date = selectedDay;
    const updated = dogs.map((dog) => {
      if (dog.id !== dogId) return dog;
      return {
        ...dog,
        tasks: dog.tasks.map((task) => {
          if (task.id !== taskId) return task;
          const done = task.doneOn.includes(date);
          return {
            ...task,
            doneOn: done ? task.doneOn.filter((d) => d !== date) : [...task.doneOn, date],
          };
        }),
      };
    });
    setDogs(updated);
    await saveDogs(updated);
  }, [dogs, selectedDay]);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Rotina</Text>
        <Text style={styles.headerSub}>Calendário e tarefas diárias</Text>
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
          {/* Legenda */}
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
              <Text style={styles.legendText}>Selecionado</Text>
            </View>
          </View>
        </View>

        {/* Seção do dia selecionado */}
        <View style={styles.daySection}>
          <Text style={styles.daySectionTitle}>{fmtDayHeader(selectedDay)}</Text>

          {/* Chips de entrada/saída */}
          {ins.map((d) => (
            <View key={`in_${d.id}`} style={[styles.eventChip, { backgroundColor: colors.successLight }]}>
              <Ionicons name="arrow-down-circle-outline" size={16} color={colors.success} />
              <Text style={[styles.eventChipText, { color: colors.success }]}>Entrada: {d.name}</Text>
              <Text style={[styles.eventChipDate, { color: colors.success }]}>{d.ownerName}</Text>
            </View>
          ))}
          {outs.map((d) => (
            <View key={`out_${d.id}`} style={[styles.eventChip, { backgroundColor: colors.dangerLight }]}>
              <Ionicons name="arrow-up-circle-outline" size={16} color={colors.danger} />
              <Text style={[styles.eventChipText, { color: colors.danger }]}>Saída: {d.name}</Text>
              <Text style={[styles.eventChipDate, { color: colors.danger }]}>{d.ownerName}</Text>
            </View>
          ))}

          {/* Lista de cães do dia */}
          {dayDogs.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="calendar-outline" size={40} color={colors.border} />
              <Text style={styles.emptyText}>Nenhum cão hospedado neste dia</Text>
              <Text style={styles.emptySub}>Selecione outro dia ou cadastre uma hospedagem</Text>
            </View>
          ) : (
            dayDogs.map((dog) => {
              const done = allDone(dog, selectedDay);
              const prog = progressText(dog, selectedDay);

              return (
                <View key={dog.id} style={styles.dogCard}>
                  {/* Cabeçalho do card */}
                  <View style={styles.dogCardHeader}>
                    <View style={styles.dogAvatar}>
                      <Text style={styles.dogAvatarText}>{sizeEmoji(dog.size)}</Text>
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

                    {/* Progresso de tarefas */}
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

                  {/* Tasks */}
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
                              onPress={() => handleToggle(dog.id, task.id)}
                              activeOpacity={0.75}
                            >
                              {/* Checkbox */}
                              <View style={[styles.taskCheck, isDone && styles.taskCheckDone]}>
                                {isDone && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
                              </View>

                              {/* Label */}
                              <Text style={[styles.taskType, isDone && styles.taskTypeDone]}>
                                {taskLabel(task)}
                              </Text>

                              {/* Horário */}
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

                  {/* Se não tem tasks */}
                  {dog.tasks.length === 0 && (
                    <View style={{ marginTop: 10, opacity: 0.5 }}>
                      <Text style={{ fontSize: 12, color: colors.textMuted, textAlign: "center" }}>
                        Sem tarefas agendadas para este cão
                      </Text>
                    </View>
                  )}
                </View>
              );
            })
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}