import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { BudgetProvider } from '../../context/BudgetContext';
import { ThemeProvider } from '../../context/ThemeContext';
import SettingsScreen from '../../app/(tabs)/settings';

// Mock Alert.alert
jest.spyOn(Alert, 'alert');

const Providers = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>
    <BudgetProvider>{children}</BudgetProvider>
  </ThemeProvider>
);

const renderSettings = () =>
  render(
    <Providers>
      <SettingsScreen />
    </Providers>
  );

beforeEach(async () => {
  await AsyncStorage.clear();
  jest.clearAllMocks();
});

describe('Settings screen — rendering', () => {
  it('renders without crashing', async () => {
    const { findByText } = renderSettings();
    expect(await findByText('settings.title')).toBeTruthy();
  });
});
