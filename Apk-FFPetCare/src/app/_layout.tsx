import React, { useEffect, useState, useCallback } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { Tabs, useRouter, useSegments } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

// ─── Constantes ──────────────────────────────────────────────────────────────

const SESSION_KEY = "ffpetcare_session";
const SESSION_TTL_MS = 15 * 24 * 60 * 60 * 1000; // 15 dias em ms

const CYAN = "#00E5FF";
const GRAY_MUTED = "#9E9E9E";
const WHITE = "#FFFFFF";

// ─── Tipos ───────────────────────────────────────────────────────────────────

interface Session {
  loggedInAt: number; // timestamp Unix em ms
}

// ─── Utilitários de sessão ───────────────────────────────────────────────────

async function readSession(): Promise<Session | null> {
  try {
    const raw = await AsyncStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}

export async function writeSession(): Promise<void> {
  const session: Session = { loggedInAt: Date.now() };
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export async function clearSession(): Promise<void> {
  await AsyncStorage.removeItem(SESSION_KEY);
}

function isSessionValid(session: Session): boolean {
  return Date.now() - session.loggedInAt < SESSION_TTL_MS;
}

// ─── Hook de autenticação ─────────────────────────────────────────────────────

function useAuth() {
  const [status, setStatus] = useState<"loading" | "authenticated" | "unauthenticated">("loading");
  const router = useRouter();
  const segments = useSegments();

  const checkSession = useCallback(async () => {
    const session = await readSession();

    if (session && isSessionValid(session)) {
      setStatus("authenticated");
    } else {
      await clearSession(); // limpa sessão expirada
      setStatus("unauthenticated");
    }
  }, []);

  // Verifica sessão ao montar
  useEffect(() => {
    checkSession();
  }, [checkSession]);

  // Redireciona conforme o estado de autenticação
  useEffect(() => {
    if (status === "loading") return;

    const inLoginRoute = segments[0] === "login";

    if (status === "unauthenticated" && !inLoginRoute) {
      router.replace("/login/login-page");
    } else if (status === "authenticated" && inLoginRoute) {
      router.replace("/dashboard/dashboard-page");
    }
  }, [status, segments, router]);

  return { status };
}

// ─── Root Layout ─────────────────────────────────────────────────────────────

export default function RootLayout() {
  const { status } = useAuth();

  if (status === "loading") {
    return (
      <View style={styles.splash}>
        <ActivityIndicator size="large" color={CYAN} />
      </View>
    );
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: CYAN,
        tabBarInactiveTintColor: GRAY_MUTED,
        tabBarStyle: {
          backgroundColor: WHITE,
          borderTopWidth: 0,
          elevation: 12,
          shadowColor: "#000",
          shadowOpacity: 0.06,
          shadowOffset: { width: 0, height: -2 },
          shadowRadius: 8,
          height: 64,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          letterSpacing: 0.3,
        },
      }}
    >
      {/* ── Dashboard ── */}
      <Tabs.Screen
        name="dashboard/dashboard-page"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid-outline" size={size} color={color} />
          ),
        }}
      />

      {/* ── Settings ── */}
      <Tabs.Screen
        name="settings/settings-page"
        options={{
          title: "Configurações",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />

      {/* ── Login (oculto das abas) ── */}
      <Tabs.Screen
        name="login/login-page"
        options={{
          href: null, // não aparece na tab bar
        }}
      />
    </Tabs>
  );
}

// ─── Estilos ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: WHITE,
    alignItems: "center",
    justifyContent: "center",
  },
});