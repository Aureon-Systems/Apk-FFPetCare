import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { styles } from './style-login';

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = () => {
    // Redireciona para a página principal após o login
    router.replace('/main/main-page');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>FFPetCare</Text>
        <Text style={styles.subtitle}>Faça login para continuar</Text>

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Entrar</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}