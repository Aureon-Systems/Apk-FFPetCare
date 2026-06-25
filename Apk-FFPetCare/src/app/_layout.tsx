import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons'; 

export default function Layout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#1E90FF',
        tabBarInactiveTintColor: '#888',   
        headerShown: false,               
      }}
    >
      {/* Oculta a tela de login do menu de baixo */}
      <Tabs.Screen
        name="login"
        options={{
          href: null, 
        }}
      />
      
      {/* Abas do Menu */}
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="stats-chart-outline" size={size} color={color} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Ajustes',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}