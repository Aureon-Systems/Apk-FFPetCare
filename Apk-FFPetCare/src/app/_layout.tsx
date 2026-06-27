import React, {
  useEffect,
  useState,
  useCallback,
  createContext,
  useContext,
} from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import {
  Stack,
  useRouter,
  useSegments,
} from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { readSession } from "../lib/storage";

// ─────────────────────────────────────────────────────────────────────────────
// Auth Context
// ─────────────────────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────────────────────

const CYAN = "#00E5FF";

export default function RootLayout() {
  const [status, setStatus] = useState<
    "loading" | "authed" | "guest"
  >("loading");

  const router = useRouter();
  const segments = useSegments();

  const checkSession = useCallback(async () => {
    const valid = await readSession();
    setStatus(valid ? "authed" : "guest");
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  useEffect(() => {
    if (status === "loading") return;

    const group = segments[0];

    if (status === "guest" && group !== "(auth)") {
      router.replace("/(auth)/login-page");
    }

    if (status === "authed" && group !== "(tabs)") {
      router.replace("/(tabs)/dashboard-page");
    }
  }, [status, segments, router]);

  const signIn = useCallback(async () => {
    setStatus("authed");
    router.replace("/(tabs)/dashboard-page");
  }, [router]);

  const signOut = useCallback(async () => {
    setStatus("guest");
    router.replace("/(auth)/login-page");
  }, [router]);

  if (status === "loading") {
    return (
      <SafeAreaProvider>
        <View style={styles.splash}>
          <ActivityIndicator size="large" color={CYAN} />
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <AuthContext.Provider
        value={{
          signIn,
          signOut,
        }}
      >
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen
            name="(auth)"
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="(tabs)"
            options={{ headerShown: false }}
          />
        </Stack>
      </AuthContext.Provider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
});