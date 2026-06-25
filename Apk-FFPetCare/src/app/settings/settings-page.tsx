import React from 'react';
import { View, Text, SafeAreaView } from 'react-native';
import { styles } from './style-settings';

export default function SettingsPage() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Configurações</Text>
        <Text style={styles.text}>Gerencie o perfil e preferências do app.</Text>
      </View>
    </SafeAreaView>
  );
}