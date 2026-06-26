import React, { useEffect, useState, useCallback } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { Tabs, useRouter, useSegments } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { readSession } from "../lib/storage";

const CYAN = "#00E5FF";

export default function RootLayout() {
  const [status, setStatus] = useState<"loading" | "ok" | "out">("loading");
  const router = useRouter();
  const segments = useSegments();

  const check = useCallback(async () => {
    const valid = await readSession();
    setStatus(valid ? "ok" : "out");
  }, []);

  useEffect(() => { check(); }, [check]);

  useEffect(() => {
    if (status === "loading") return;
    const inLogin = segments[0] === "login-page";
    if (status === "out" && !inLogin) router.replace("/login-page");
    else if (status === "ok" && inLogin) router.replace("/dashboard-page");
  }, [status, segments, router]);

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
        <Tabs.Screen name="login/login-page" options={{ href: null }} />
      </Tabs>
    </SafeAreaProvider>
  );
}

const s = StyleSheet.create({
  splash: { flex: 1, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center" },
});