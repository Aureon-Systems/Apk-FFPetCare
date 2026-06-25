import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { useColorScheme, Text } from 'react-native';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Text> 
        a 
      </Text>
    </ThemeProvider>
  );
}
