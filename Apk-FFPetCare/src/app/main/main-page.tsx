import React from 'react';
import { View, Text, SafeAreaView } from 'react-native';
import { styles } from './style-main';

export default function MainPage() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Página Principal</Text>
        <Text style={styles.subtitle}>Bem-vindo ao FFPetCare!</Text>
      </View>
    </SafeAreaView>
  );
}