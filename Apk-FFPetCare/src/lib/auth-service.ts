import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "./supabase";

const SESSION_START_KEY = "ffpetcare_session_started_at";
const SESSION_MAX_MS    = 15 * 24 * 60 * 60 * 1000; // 15 dias em ms

// ─── Sign in ──────────────────────────────────────────────────────────────────

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;

  // Grava o momento exato do login para controlar o prazo de 15 dias
  await AsyncStorage.setItem(SESSION_START_KEY, Date.now().toString());
  return data.session;
}

// ─── Sign out ─────────────────────────────────────────────────────────────────

export async function signOut() {
  await supabase.auth.signOut();
  await AsyncStorage.removeItem(SESSION_START_KEY);
}

// ─── Verifica sessão válida (chamado no boot do app) ─────────────────────────
// Retorna a sessão se ainda for válida, ou null se expirou / não existe.

export async function getValidSession() {
  // 1. Verifica se o prazo de 15 dias foi atingido
  const raw = await AsyncStorage.getItem(SESSION_START_KEY);
  if (raw) {
    const elapsed = Date.now() - parseInt(raw, 10);
    if (elapsed > SESSION_MAX_MS) {
      // 15 dias passaram → desloga e limpa tudo
      await signOut();
      return null;
    }
  }

  // 2. Pede a sessão atual ao Supabase (usa o refresh token automaticamente)
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error || !session) return null;

  return session;
}

// ─── Dias restantes na sessão (útil para exibir na UI) ───────────────────────

export async function sessionDaysLeft(): Promise<number | null> {
  const raw = await AsyncStorage.getItem(SESSION_START_KEY);
  if (!raw) return null;
  const elapsed = Date.now() - parseInt(raw, 10);
  const daysLeft = Math.max(0, Math.ceil((SESSION_MAX_MS - elapsed) / (1000 * 60 * 60 * 24)));
  return daysLeft;
}