import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ActivityIndicator, View } from 'react-native';
import { I18nextProvider } from 'react-i18next';
import { BudgetProvider, useBudget } from '../context/BudgetContext';
import { ThemeProvider, useTheme } from '../context/ThemeContext';
import { LIGHT_COLORS } from '../constants/theme';
import i18n, { initI18n } from '../i18n';
import '../i18n/types';
import { useSegments, useRouter } from 'expo-router';

function AppContent() {
  const { state } = useBudget();
  const { colors, isDark } = useTheme();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (state.isLoading) return;

    const inOnboardingGroup = segments[0] === 'onboarding';

    if (!state.onboardingCompleted && !inOnboardingGroup) {
      // If we're not onboarded and not on the onboarding screen, go there
      router.replace('/onboarding');
    } else if (state.onboardingCompleted && inOnboardingGroup) {
      // If we're onboarded but still on onboarding screen, go home
      router.replace('/');
    }
  }, [state.onboardingCompleted, state.isLoading, segments]);

  if (state.isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator size="large" color={colors.needs} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="add-expense"
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const [isI18nInitialized, setIsI18nInitialized] = useState(false);

  useEffect(() => {
    initI18n().then(() => {
      setIsI18nInitialized(true);
    });
  }, []);

  if (!isI18nInitialized) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: LIGHT_COLORS.background,
        }}
      >
        <ActivityIndicator size="large" color={LIGHT_COLORS.needs} />
      </View>
    );
  }

  return (
    <I18nextProvider i18n={i18n}>
      <ThemeProvider>
        <SafeAreaProvider>
          <BudgetProvider>
            <AppContent />
          </BudgetProvider>
        </SafeAreaProvider>
      </ThemeProvider>
    </I18nextProvider>
  );
}
