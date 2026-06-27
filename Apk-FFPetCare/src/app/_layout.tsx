import React, {
  useEffect, useState, useCallback,
  createContext, useContext,
} from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { Tabs, useRouter, useSegments } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { readSession } from "../lib/storage";

// ─── Auth Context ─────────────────────────────────────────────────────────────
// Expõe `signIn()` para que login-page dispare a re-verificação sem router.replace

interface AuthCtx {
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthCtx>({
  signIn: async () => {},
  signOut: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

// ─── Layout ───────────────────────────────────────────────────────────────────

const CYAN = "#00E5FF";

export default function RootLayout() {
  // "loading" → ainda checando AsyncStorage
  // "authed"  → sessão válida, mostra tabs
  // "guest"   → sem sessão, mostra só login (sem tab bar)
  const [status, setStatus] = useState<"loading" | "authed" | "guest">("loading");
  const router = useRouter();
  const segments = useSegments();

  const checkSession = useCallback(async () => {
    const valid = await readSession();
    setStatus(valid ? "authed" : "guest");
  }, []);

  // Verifica ao montar
  useEffect(() => { checkSession(); }, [checkSession]);

  // Redireciona quando status muda — sem depender do router dentro do login
  useEffect(() => {
    if (status === "loading") return;
    const inLogin = segments[0] === "login-page";

    if (status === "guest" && !inLogin) {
      router.replace("/login-page");
    } else if (status === "authed" && inLogin) {
      router.replace("/dashboard-page");
    }
  }, [status, segments]); // router intencionalmente omitido para evitar loop

  // Funções expostas via context
  const signIn = useCallback(async () => {
    // Sessão já foi gravada pelo login-page antes de chamar signIn()
    setStatus("authed");
    // O useEffect acima vai redirecionar automaticamente
  }, []);

  const signOut = useCallback(async () => {
    setStatus("guest");
  }, []);

  // Splash enquanto carrega
  if (status === "loading") {
    return (
      <SafeAreaProvider>
        <View style={s.splash}>
          <ActivityIndicator size="large" color={CYAN} />
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <AuthContext.Provider value={{ signIn, signOut }}>
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: CYAN,
            tabBarInactiveTintColor: "#9BA3B0",
            tabBarStyle: {
              backgroundColor: "#FFFFFF",
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
            tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
          }}
        >
          {/* Ordem correta: Dashboard → Rotina → Ajustes */}
          <Tabs.Screen
            name="dashboard/dashboard-page"
            options={{
              title: "Painel",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="stats-chart-outline" size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="routine/routine-page"
            options={{
              title: "Rotina",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="calendar-outline" size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="settings/settings-page"
            options={{
              title: "Ajustes",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="settings-outline" size={size} color={color} />
              ),
            }}
          />
          {/* Login: href:null remove da tab bar + tabBarButton esconde qualquer resquício */}
          <Tabs.Screen
            name="login/login-page"
            options={{ href: null }}
          />
        </Tabs>
      </AuthContext.Provider>
    </SafeAreaProvider>
  );
}

const s = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
});