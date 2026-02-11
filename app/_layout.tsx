import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  MD3DarkTheme,
  MD3LightTheme,
  PaperProvider,
} from 'react-native-paper';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';

const customLightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#1a237e',
    primaryContainer: '#e8eaf6',
    secondary: '#4CAF50',
    secondaryContainer: '#c8e6c9',
    tertiary: '#673AB7',
    error: '#F44336',
    background: '#f5f5f5',
    surface: '#ffffff',
    surfaceVariant: '#f0f0f0',
  },
};

const customDarkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#7986cb',
    primaryContainer: '#1a237e',
    secondary: '#81c784',
    secondaryContainer: '#2e7d32',
    tertiary: '#b39ddb',
    error: '#ef5350',
    background: '#121212',
    surface: '#1e1e1e',
    surfaceVariant: '#2c2c2c',
  },
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    return null;
  }

  const isDark = colorScheme === 'dark';
  const paperTheme = isDark ? customDarkTheme : customLightTheme;
  const navTheme = isDark ? DarkTheme : DefaultTheme;

  return (
    <PaperProvider theme={paperTheme}>
      <ThemeProvider value={navTheme}>
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: paperTheme.colors.primary,
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="create-match" options={{ title: 'New Match' }} />
          <Stack.Screen name="add-players" options={{ title: 'Add Players' }} />
          <Stack.Screen name="match/index" options={{ title: 'Live Match' }} />
          <Stack.Screen name="history" options={{ title: 'Match History' }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </PaperProvider>
  );
}
