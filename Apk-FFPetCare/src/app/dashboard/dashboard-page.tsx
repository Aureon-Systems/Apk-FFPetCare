import React from 'react';
import { View, Text, SafeAreaView } from 'react-native';
import { styles } from './style-dashboard';

export default function DashboardPage() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Dashboard</Text>
        <Text style={styles.text}>Aqui vão os gráficos e relatórios de cuidados.</Text>
      </View>
    </SafeAreaView>
  );
}