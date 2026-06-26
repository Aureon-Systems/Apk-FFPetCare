import AsyncStorage from "@react-native-async-storage/async-storage";
import { Dog, AppSettings, DEFAULT_SETTINGS } from "./types";

// ─── Chaves ───────────────────────────────────────────────────────────────────

const KEYS = {
  SESSION: "ffpc_session",
  DOGS: "ffpc_dogs",
  SETTINGS: "ffpc_settings",
} as const;

const SESSION_TTL_MS = 15 * 24 * 60 * 60 * 1000; // 15 dias

// ─── Sessão ───────────────────────────────────────────────────────────────────

interface Session {
  loggedInAt: number;
}

export async function readSession(): Promise<boolean> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.SESSION);
    if (!raw) return false;
    const { loggedInAt } = JSON.parse(raw) as Session;
    if (Date.now() - loggedInAt >= SESSION_TTL_MS) {
      await AsyncStorage.removeItem(KEYS.SESSION);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export async function writeSession(): Promise<void> {
  const s: Session = { loggedInAt: Date.now() };
  await AsyncStorage.setItem(KEYS.SESSION, JSON.stringify(s));
}

export async function clearSession(): Promise<void> {
  await AsyncStorage.removeItem(KEYS.SESSION);
}

export async function sessionDaysLeft(): Promise<number> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.SESSION);
    if (!raw) return 0;
    const { loggedInAt } = JSON.parse(raw) as Session;
    const remaining = SESSION_TTL_MS - (Date.now() - loggedInAt);
    return Math.max(0, Math.ceil(remaining / 86_400_000));
  } catch {
    return 0;
  }
}

// ─── Cães ────────────────────────────────────────────────────────────────────

export async function loadDogs(): Promise<Dog[]> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.DOGS);
    return raw ? (JSON.parse(raw) as Dog[]) : [];
  } catch {
    return [];
  }
}

export async function saveDogs(dogs: Dog[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.DOGS, JSON.stringify(dogs));
}

// ─── Configurações ────────────────────────────────────────────────────────────

export async function loadSettings(): Promise<AppSettings> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(s: AppSettings): Promise<void> {
  await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(s));
}

// ─── Helpers de data e cálculo ────────────────────────────────────────────────

export function todayISO(): string {
  return new Date().toISOString().split("T")[0];
}

export function parseLocalDate(iso: string): Date {
  return new Date(iso + "T00:00:00");
}

export function isActiveToday(dog: Dog): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const ci = parseLocalDate(dog.checkIn);
  const co = parseLocalDate(dog.checkOut);
  return ci <= today && today <= co;
}

export function calcTotalValue(dog: Dog): number {
  const ci = parseLocalDate(dog.checkIn);
  const co = parseLocalDate(dog.checkOut);
  const days = Math.max(1, Math.round((co.getTime() - ci.getTime()) / 86_400_000));
  return days * dog.dailyRate;
}

export function monthRevenue(dogs: Dog[]): number {
  const now = new Date();
  return dogs
    .filter((d) => {
      const co = parseLocalDate(d.checkOut);
      return co.getMonth() === now.getMonth() && co.getFullYear() === now.getFullYear();
    })
    .reduce((sum, d) => sum + calcTotalValue(d), 0);
}

export function formatCurrency(v: number): string {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function fmtDate(iso: string): string {
  return parseLocalDate(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });
}

export function isTaskDoneToday(task: { doneOn: string[] }): boolean {
  return task.doneOn.includes(todayISO());
}